import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { PaystackService } from '@/lib/paystack';

// GET /api/invoices/[id]/verify-payment?reference=xxx - Verify invoice payment
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get('reference');
    const { id: invoiceId } = await params;

    if (!reference) {
      return NextResponse.json(
        { error: 'Payment reference is required' },
        { status: 400 }
      );
    }

    // Find the invoice
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        customer: true,
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Check if invoice is already paid
    if (invoice.paymentStatus === 'PAID') {
      return NextResponse.json({
        success: true,
        message: 'Invoice is already paid',
        invoice,
      });
    }

    // Find the payment record
    const payment = await prisma.payment.findFirst({
      where: {
        reference,
        invoiceId,
      },
    });

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment record not found' },
        { status: 404 }
      );
    }

    // If payment is already successful, return success
    if (payment.status === 'success') {
      return NextResponse.json({
        success: true,
        message: 'Payment already verified',
        invoice,
        payment,
      });
    }

    // Verify payment with Paystack
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecretKey) {
      return NextResponse.json(
        { error: 'Payment service not configured' },
        { status: 500 }
      );
    }

    const paystackResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
        },
      }
    );

    if (!paystackResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to verify payment with Paystack' },
        { status: 500 }
      );
    }

    const paystackData = await paystackResponse.json();

    if (!paystackData.data || paystackData.data.status !== 'success') {
      // Update payment status to failed
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'failed',
          paystackStatus: paystackData.data?.status || 'failed',
          metadata: {
            ...(payment.metadata as any || {}),
            paystackResponse: paystackData.data,
          },
        },
      });

      return NextResponse.json(
        { error: 'Payment was not successful' },
        { status: 400 }
      );
    }

    // Payment is successful - update payment record
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'success',
        paystackStatus: 'success',
        paidAt: new Date(),
        metadata: {
          ...(payment.metadata as any || {}),
          paystackResponse: paystackData.data,
        },
      },
    });

    // Update invoice to PAID
    const updatedInvoice = await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        paymentStatus: 'PAID',
        paidAt: new Date(),
      },
      include: {
        customer: true,
      },
    });

    // Create audit log (without userId since this is a public payment callback)
    await prisma.auditLog.create({
      data: {
        tenantId: invoice.tenantId,
        action: 'INVOICE_PAID',
        entityType: 'INVOICE',
        entityId: invoiceId,
        metadata: {
          invoiceNumber: invoice.invoiceNumber,
          amount: invoice.total,
          reference,
          paymentMethod: 'paystack',
          customerName: invoice.customer.name,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      invoice: updatedInvoice,
      payment,
    });
  } catch (error: any) {
    console.error('Error verifying invoice payment:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to verify payment' },
      { status: 500 }
    );
  }
}
