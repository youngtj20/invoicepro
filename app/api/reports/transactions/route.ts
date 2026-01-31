import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { requireTenant } from '@/middleware/tenant';

// GET /api/reports/transactions - Get detailed transaction history
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenant = await requireTenant();
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';
    const type = searchParams.get('type') || ''; // invoice, payment, receipt
    const status = searchParams.get('status') || '';
    const customerId = searchParams.get('customerId') || '';

    const skip = (page - 1) * limit;

    // Build date filter
    const dateFilter: any = {};
    if (startDate) {
      dateFilter.gte = new Date(startDate);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      dateFilter.lte = end;
    }

    // Fetch invoices
    const invoiceWhere: any = {
      tenantId: tenant.id,
    };
    if (Object.keys(dateFilter).length > 0) {
      invoiceWhere.issueDate = dateFilter;
    }
    if (status && ['DRAFT', 'SENT', 'VIEWED', 'OVERDUE', 'CANCELED'].includes(status)) {
      invoiceWhere.status = status;
    }
    if (customerId) {
      invoiceWhere.customerId = customerId;
    }

    const [invoices, payments, receipts] = await Promise.all([
      // Fetch invoices
      (!type || type === 'invoice') ? prisma.invoice.findMany({
        where: invoiceWhere,
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          items: true,
          invoiceTaxes: {
            include: {
              tax: true,
            },
          },
        },
        orderBy: { issueDate: 'desc' },
      }) : [],

      // Fetch payments
      (!type || type === 'payment') ? prisma.payment.findMany({
        where: {
          tenantId: tenant.id,
          ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
        },
        include: {
          invoice: {
            include: {
              customer: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }) : [],

      // Fetch receipts
      (!type || type === 'receipt') ? prisma.receipt.findMany({
        where: {
          tenantId: tenant.id,
          ...(Object.keys(dateFilter).length > 0 && { issueDate: dateFilter }),
          ...(customerId && { customerId }),
        },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { issueDate: 'desc' },
      }) : [],
    ]);

    // Transform data into unified transaction format
    const transactions: any[] = [];

    // Add invoices
    invoices.forEach((invoice) => {
      transactions.push({
        id: invoice.id,
        type: 'invoice',
        date: invoice.issueDate,
        reference: invoice.invoiceNumber,
        customer: invoice.customer,
        description: `Invoice for ${invoice.items.length} item(s)`,
        amount: invoice.total,
        status: invoice.status,
        paymentStatus: invoice.paymentStatus,
        currency: invoice.currency,
        metadata: {
          dueDate: invoice.dueDate,
          subtotal: invoice.subtotal,
          taxAmount: invoice.taxAmount,
          itemCount: invoice.items.length,
          taxes: invoice.invoiceTaxes.map(it => ({
            name: it.tax.name,
            rate: it.tax.rate,
            amount: it.taxAmount,
          })),
        },
      });
    });

    // Add payments
    payments.forEach((payment) => {
      transactions.push({
        id: payment.id,
        type: 'payment',
        date: payment.paidAt || payment.createdAt,
        reference: payment.reference,
        customer: payment.invoice?.customer || null,
        description: payment.invoice 
          ? `Payment for Invoice ${payment.invoice.invoiceNumber}`
          : 'Payment received',
        amount: payment.amount,
        status: payment.status,
        paymentStatus: 'PAID',
        currency: payment.currency,
        metadata: {
          paymentMethod: payment.paymentMethod,
          paystackReference: payment.paystackReference,
          invoiceId: payment.invoiceId,
        },
      });
    });

    // Add receipts (only standalone receipts, not those linked to invoices)
    receipts.forEach((receipt) => {
      // Skip receipts that are auto-generated from invoices to avoid duplication
      // Auto-generated receipts have receipt numbers that match invoice numbers
      // e.g., INV-001 generates REC-001
      const receiptNumberBase = receipt.receiptNumber.replace(/^REC-?/, '');
      const isAutoGenerated = invoices.some(inv => {
        const invoiceNumberBase = inv.invoiceNumber.replace(/^INV-?/, '');
        return invoiceNumberBase === receiptNumberBase;
      });
      
      // Only add standalone receipts (not auto-generated from invoices)
      if (!isAutoGenerated) {
        transactions.push({
          id: receipt.id,
          type: 'receipt',
          date: receipt.issueDate,
          reference: receipt.receiptNumber,
          customer: receipt.customer,
          description: `Receipt - ${receipt.paymentMethod || 'Payment received'}`,
          amount: receipt.amount,
          status: 'COMPLETED',
          paymentStatus: 'PAID',
          currency: receipt.currency,
          metadata: {
            paymentMethod: receipt.paymentMethod,
            reference: receipt.reference,
          },
        });
      }
    });

    // Sort all transactions by date (newest first)
    transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Apply pagination
    const total = transactions.length;
    const paginatedTransactions = transactions.slice(skip, skip + limit);

    // Calculate summary statistics
    // Count standalone receipts only (not auto-generated from invoices)
    const standaloneReceipts = receipts.filter(receipt => {
      const receiptNumberBase = receipt.receiptNumber.replace(/^REC-?/, '');
      const isAutoGenerated = invoices.some(inv => {
        const invoiceNumberBase = inv.invoiceNumber.replace(/^INV-?/, '');
        return invoiceNumberBase === receiptNumberBase;
      });
      return !isAutoGenerated;
    });

    const summary = {
      totalTransactions: total,
      totalInvoices: invoices.length,
      totalPayments: payments.length,
      totalReceipts: standaloneReceipts.length,
      totalRevenue: invoices
        .filter(i => i.paymentStatus === 'PAID')
        .reduce((sum, i) => sum + i.total, 0),
      totalPending: invoices
        .filter(i => i.paymentStatus === 'UNPAID' || i.paymentStatus === 'PARTIALLY_PAID')
        .reduce((sum, i) => sum + i.total, 0),
      totalPaid: invoices
        .filter(i => i.paymentStatus === 'PAID')
        .reduce((sum, i) => sum + i.total, 0),
    };

    return NextResponse.json({
      transactions: paginatedTransactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      summary,
    });
  } catch (error: any) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}
