import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { requireTenant } from '@/middleware/tenant';
import { PaystackService } from '@/lib/paystack';

// POST /api/invoices/[id]/payment-link - Generate payment link for invoice
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenant = await requireTenant();
    const { id: invoiceId } = await params;

    // Fetch invoice with customer data
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        tenantId: tenant.id,
      },
      include: {
        customer: true,
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Check if invoice is already paid
    if (invoice.paymentStatus === 'PAID') {
      return NextResponse.json(
        { error: 'Invoice is already paid' },
        { status: 400 }
      );
    }

    // Validate customer email
    if (!invoice.customer.email) {
      return NextResponse.json(
        { error: 'Customer email is required for payment processing' },
        { status: 400 }
      );
    }

    // Generate unique payment reference
    const reference = PaystackService.generateReference('INV');

    // Convert amount to kobo (Paystack uses kobo)
    const amountInKobo = PaystackService.toKobo(invoice.total);

    // Generate callback URL
    const callbackUrl = `${process.env.NEXTAUTH_URL}/invoices/${invoice.id}/payment/callback`;

    // Initialize Paystack transaction
    const paystackResponse = await PaystackService.initializeTransaction({
      email: invoice.customer.email,
      amount: amountInKobo,
      reference,
      metadata: {
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        customerId: invoice.customer.id,
        customerName: invoice.customer.name,
        tenantId: tenant.id,
        companyName: tenant.companyName,
      },
      callback_url: callbackUrl,
    });

    if (!paystackResponse.status) {
      return NextResponse.json(
        { error: 'Failed to generate payment link' },
        { status: 500 }
      );
    }

    // Create payment record
    await prisma.payment.create({
      data: {
        tenantId: tenant.id,
        invoiceId: invoice.id,
        amount: invoice.total,
        currency: invoice.currency,
        paymentMethod: 'paystack',
        reference,
        paystackReference: paystackResponse.data.reference,
        paystackStatus: 'pending',
        status: 'pending',
        metadata: {
          access_code: paystackResponse.data.access_code,
        },
      },
    });

    // Update invoice with payment link
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        paymentLink: paystackResponse.data.authorization_url,
        updatedAt: new Date(),
      },
    });

    // Log in audit log
    await prisma.auditLog.create({
      data: {
        tenantId: tenant.id,
        userId: session.user.id,
        action: 'PAYMENT_LINK_GENERATED',
        entityType: 'INVOICE',
        entityId: invoiceId,
        metadata: {
          invoiceNumber: invoice.invoiceNumber,
          amount: invoice.total,
          reference,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Payment link generated successfully',
      paymentLink: paystackResponse.data.authorization_url,
      reference,
      amount: invoice.total,
    });
  } catch (error: any) {
    console.error('Error generating payment link:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate payment link' },
      { status: 500 }
    );
  }
}
