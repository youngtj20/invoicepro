import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { PaystackService } from '@/lib/paystack';
import { EmailService } from '@/lib/email';

// POST /api/webhooks/paystack - Handle Paystack webhook events
export async function POST(request: NextRequest) {
  try {
    // Get the raw body as string
    const body = await request.text();

    // Get Paystack signature from headers
    const signature = request.headers.get('x-paystack-signature');

    if (!signature) {
      console.error('No signature found in webhook request');
      return NextResponse.json(
        { error: 'No signature found' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const isValid = PaystackService.verifyWebhookSignature(body, signature);

    if (!isValid) {
      console.error('Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Parse the webhook payload
    const payload = JSON.parse(body);
    const event = payload.event;
    const data = payload.data;

    console.log('Paystack webhook received:', event);

    // Handle different webhook events
    switch (event) {
      case 'charge.success':
        await handlePaymentSuccess(data);
        break;

      case 'charge.failed':
        await handlePaymentFailed(data);
        break;

      default:
        console.log('Unhandled webhook event:', event);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handlePaymentSuccess(data: any) {
  try {
    const reference = data.reference;
    const amount = PaystackService.fromKobo(data.amount);
    const paidAt = new Date(data.paid_at);
    const metadata = data.metadata;

    console.log('Processing successful payment:', reference);

    // Find the payment record
    const payment = await prisma.payment.findUnique({
      where: { reference },
      include: {
        invoice: {
          include: {
            customer: true,
            tenant: true,
            items: true,
          },
        },
      },
    });

    if (!payment) {
      console.error('Payment not found:', reference);
      return;
    }

    // Update payment status
    await prisma.payment.update({
      where: { reference },
      data: {
        status: 'success',
        paystackStatus: data.status,
        paidAt,
        metadata: {
          ...(payment.metadata as any || {}),
          gateway_response: data.gateway_response,
          channel: data.channel,
          fees: PaystackService.fromKobo(data.fees || 0),
          customer: data.customer,
          authorization: data.authorization,
        },
      },
    });

    if (!payment.invoice) {
      console.error('Invoice not found for payment:', reference);
      return;
    }

    // Update invoice payment status
    await prisma.invoice.update({
      where: { id: payment.invoiceId! },
      data: {
        paymentStatus: 'PAID',
        status: payment.invoice.status === 'DRAFT' ? 'SENT' : payment.invoice.status,
        paidAt,
        updatedAt: new Date(),
      },
    });

    // Generate receipt number
    const receiptCount = await prisma.receipt.count({
      where: { tenantId: payment.tenantId },
    });
    const receiptNumber = `REC-${String(receiptCount + 1).padStart(4, '0')}`;

    // Create receipt
    const receipt = await prisma.receipt.create({
      data: {
        tenantId: payment.tenantId,
        receiptNumber,
        customerId: payment.invoice.customerId,
        issueDate: paidAt,
        amount,
        currency: payment.currency,
        paymentMethod: 'Paystack',
        reference,
        notes: `Payment received for Invoice ${payment.invoice.invoiceNumber}`,
      },
    });

    // Log in audit log
    await prisma.auditLog.create({
      data: {
        tenantId: payment.tenantId,
        action: 'PAYMENT_RECEIVED',
        entityType: 'INVOICE',
        entityId: payment.invoiceId!,
        metadata: {
          invoiceNumber: payment.invoice.invoiceNumber,
          amount,
          reference,
          receiptNumber,
          paymentMethod: 'Paystack',
        },
      },
    });

    // Send payment confirmation email
    if (payment.invoice.customer.email) {
      const emailHtml = generatePaymentConfirmationEmail({
        customerName: payment.invoice.customer.name,
        invoiceNumber: payment.invoice.invoiceNumber,
        amount: PaystackService.formatAmount(amount, payment.currency),
        receiptNumber,
        paidAt: paidAt.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        companyName: payment.invoice.tenant.companyName,
        viewLink: `${process.env.NEXTAUTH_URL}/invoices/${payment.invoice.id}`,
      });

      await EmailService.sendEmail({
        to: payment.invoice.customer.email,
        subject: `Payment Confirmation - ${payment.invoice.invoiceNumber}`,
        html: emailHtml,
      });
    }

    console.log('Payment processed successfully:', reference);
  } catch (error) {
    console.error('Error processing payment success:', error);
    throw error;
  }
}

async function handlePaymentFailed(data: any) {
  try {
    const reference = data.reference;

    console.log('Processing failed payment:', reference);

    // Find and update payment record
    const payment = await prisma.payment.findUnique({
      where: { reference },
    });

    if (!payment) {
      console.error('Payment not found:', reference);
      return;
    }

    await prisma.payment.update({
      where: { reference },
      data: {
        status: 'failed',
        paystackStatus: data.status,
        metadata: {
          ...(payment.metadata as any || {}),
          gateway_response: data.gateway_response,
        },
      },
    });

    // Log in audit log
    await prisma.auditLog.create({
      data: {
        tenantId: payment.tenantId,
        action: 'PAYMENT_FAILED',
        entityType: 'INVOICE',
        entityId: payment.invoiceId!,
        metadata: {
          reference,
          reason: data.gateway_response,
        },
      },
    });

    console.log('Failed payment recorded:', reference);
  } catch (error) {
    console.error('Error processing payment failure:', error);
    throw error;
  }
}

function generatePaymentConfirmationEmail(params: {
  customerName: string;
  invoiceNumber: string;
  amount: string;
  receiptNumber: string;
  paidAt: string;
  companyName: string;
  viewLink: string;
}): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10b981; color: white; padding: 20px; text-align: center; }
          .content { background: #f9fafb; padding: 30px; }
          .success-badge {
            background: #10b981;
            color: white;
            padding: 10px 20px;
            border-radius: 20px;
            display: inline-block;
            margin: 20px 0;
          }
          .payment-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
          .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
          .detail-row:last-child { border-bottom: none; }
          .button {
            display: inline-block;
            background: #0ea5e9;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
          }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1> Payment Received</h1>
          </div>
          <div class="content">
            <p>Dear ${params.customerName},</p>
            <p>Thank you for your payment! We have successfully received your payment for Invoice ${params.invoiceNumber}.</p>

            <center>
              <div class="success-badge">
                <strong>PAID</strong>
              </div>
            </center>

            <div class="payment-details">
              <div class="detail-row">
                <strong>Invoice Number:</strong>
                <span>${params.invoiceNumber}</span>
              </div>
              <div class="detail-row">
                <strong>Receipt Number:</strong>
                <span>${params.receiptNumber}</span>
              </div>
              <div class="detail-row">
                <strong>Amount Paid:</strong>
                <span>${params.amount}</span>
              </div>
              <div class="detail-row">
                <strong>Payment Date:</strong>
                <span>${params.paidAt}</span>
              </div>
              <div class="detail-row">
                <strong>Payment Method:</strong>
                <span>Paystack</span>
              </div>
            </div>

            <center>
              <a href="${params.viewLink}" class="button">View Receipt</a>
            </center>

            <p>If you have any questions about this payment, please contact ${params.companyName}.</p>
            <p>Thank you for your business!</p>
          </div>
          <div class="footer">
            <p>This email was sent by ${params.companyName}</p>
            <p>&copy; ${new Date().getFullYear()} ${params.companyName}. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}
