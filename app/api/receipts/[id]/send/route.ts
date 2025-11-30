/** @jsxImportSource react */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { requireTenant } from '@/middleware/tenant';
import { z } from 'zod';
import { EmailService } from '@/lib/email';
import { WhatsAppService } from '@/lib/whatsapp';
import { renderToBuffer } from '@react-pdf/renderer';
import { ReceiptPDF } from '@/lib/pdf-generator';
import React from 'react';

// Validation schema
const sendReceiptSchema = z.object({
  method: z.enum(['email', 'whatsapp']).default('email'),
  to: z.string().min(1, 'Recipient is required'),
  subject: z.string().min(1, 'Subject is required').optional(),
  message: z.string().optional(),
});

// POST /api/receipts/[id]/send - Send receipt via email or WhatsApp
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
    const { id: receiptId } = await params;

    // Parse and validate request body
    const body = await request.json();
    const validatedData = sendReceiptSchema.parse(body);

    // Fetch receipt with all related data
    const receipt = await prisma.receipt.findFirst({
      where: {
        id: receiptId,
        tenantId: tenant.id,
      },
      include: {
        customer: true,
      },
    });

    if (!receipt) {
      return NextResponse.json({ error: 'Receipt not found' }, { status: 404 });
    }

    // Format currency
    const formatCurrency = (amount: number) => {
      return `${receipt.currency || 'NGN'} ${amount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    };

    // Format date
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    };

    // Generate receipt view link
    const viewLink = `${process.env.NEXTAUTH_URL}/receipts/${receipt.id}`;

    let sent = false;
    let sentMethod = '';
    let sentTo = '';

    // Handle different sending methods
    if (validatedData.method === 'email') {
      // Validate email
      const customerEmail = validatedData.to || receipt.customer.email;
      if (!customerEmail) {
        return NextResponse.json(
          { error: 'Customer email not found. Please provide an email address.' },
          { status: 400 }
        );
      }

      // Prepare receipt data for PDF
      const pdfData = {
        receiptNumber: receipt.receiptNumber,
        issueDate: receipt.issueDate.toISOString(),
        companyName: tenant.companyName,
        companyEmail: tenant.email || undefined,
        companyPhone: tenant.phone || undefined,
        companyAddress: tenant.address || undefined,
        customer: {
          name: receipt.customer.name,
          email: receipt.customer.email,
          company: receipt.customer.company,
          address: receipt.customer.address,
          city: receipt.customer.city,
          state: receipt.customer.state,
          country: receipt.customer.country,
          postalCode: receipt.customer.postalCode,
        },
        amount: receipt.amount,
        paymentMethod: receipt.paymentMethod || undefined,
        reference: receipt.reference || undefined,
        notes: receipt.notes || undefined,
        currency: receipt.currency,
      };

      // Generate PDF
      const pdfBuffer = await renderToBuffer(React.createElement(ReceiptPDF, { receipt: pdfData }) as any);

      // Generate email HTML
      const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #2563EB; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
    .detail-row:last-child { border-bottom: none; }
    .label { color: #6b7280; font-weight: 500; }
    .value { font-weight: 600; color: #111827; }
    .button { display: inline-block; background: #2563EB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">Payment Receipt</h1>
      <p style="margin: 10px 0 0 0;">Thank you for your payment!</p>
    </div>
    <div class="content">
      <p>Dear ${receipt.customer.name},</p>
      <p>This is to confirm that we have received your payment. Please find the details below:</p>

      ${validatedData.message ? `
      <div style="background: #e0f2fe; padding: 15px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #0ea5e9;">
        <p style="margin: 0;"><strong>Message from ${tenant.companyName}:</strong></p>
        <p style="margin: 10px 0 0 0;">${validatedData.message}</p>
      </div>
      ` : ''}

      <div class="details">
        <div class="detail-row">
          <span class="label">Receipt Number:</span>
          <span class="value">${receipt.receiptNumber}</span>
        </div>
        <div class="detail-row">
          <span class="label">Date:</span>
          <span class="value">${formatDate(receipt.issueDate)}</span>
        </div>
        <div class="detail-row">
          <span class="label">Payment Method:</span>
          <span class="value">${receipt.paymentMethod}</span>
        </div>
        ${receipt.reference ? `
        <div class="detail-row">
          <span class="label">Reference:</span>
          <span class="value">${receipt.reference}</span>
        </div>
        ` : ''}
        <div class="detail-row">
          <span class="label">Amount Paid:</span>
          <span class="value" style="color: #059669; font-size: 18px;">${formatCurrency(receipt.amount)}</span>
        </div>
      </div>

      <p>The receipt is attached to this email as a PDF file.</p>

      <p>If you have any questions about this payment, please don't hesitate to contact us.</p>

      <p>Best regards,<br>${tenant.companyName}</p>
    </div>
    <div class="footer">
      <p>This is an automated email from ${tenant.companyName}</p>
      ${tenant.email ? `<p>${tenant.email}</p>` : ''}
      ${tenant.phone ? `<p>${tenant.phone}</p>` : ''}
    </div>
  </div>
</body>
</html>
      `.trim();

      // Prepare email subject
      const emailSubject =
        validatedData.subject ||
        `Payment Receipt ${receipt.receiptNumber} from ${tenant.companyName}`;

      // Send email with PDF attachment
      const emailSent = await EmailService.sendEmail({
        to: customerEmail,
        subject: emailSubject,
        html: emailHtml,
        attachments: [
          {
            filename: `${receipt.receiptNumber}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf',
          },
        ],
      });

      if (!emailSent) {
        return NextResponse.json(
          { error: 'Failed to send email. Please check your email configuration.' },
          { status: 500 }
        );
      }

      sent = true;
      sentMethod = 'email';
      sentTo = customerEmail;
    } else if (validatedData.method === 'whatsapp') {
      // Validate phone number
      const customerPhone = validatedData.to || receipt.customer.phone;
      if (!customerPhone) {
        return NextResponse.json(
          { error: 'Customer phone number not found. Please provide a phone number.' },
          { status: 400 }
        );
      }

      // Prepare receipt data for PDF
      const pdfData = {
        receiptNumber: receipt.receiptNumber,
        issueDate: receipt.issueDate.toISOString(),
        companyName: tenant.companyName,
        companyEmail: tenant.email || undefined,
        companyPhone: tenant.phone || undefined,
        companyAddress: tenant.address || undefined,
        customer: {
          name: receipt.customer.name,
          email: receipt.customer.email,
          company: receipt.customer.company,
          address: receipt.customer.address,
          city: receipt.customer.city,
          state: receipt.customer.state,
          country: receipt.customer.country,
          postalCode: receipt.customer.postalCode,
        },
        amount: receipt.amount,
        paymentMethod: receipt.paymentMethod || undefined,
        reference: receipt.reference || undefined,
        notes: receipt.notes || undefined,
        currency: receipt.currency,
      };

      // Generate PDF
      const pdfBuffer = await renderToBuffer(React.createElement(ReceiptPDF, { receipt: pdfData }) as any);

      // Generate WhatsApp message
      const whatsappMessage = validatedData.message || `Hi ${receipt.customer.name},

Thank you for your payment! 🎉

📄 Receipt: #${receipt.receiptNumber}
💰 Amount: ${formatCurrency(receipt.amount)}
💳 Payment Method: ${receipt.paymentMethod}
📅 Date: ${formatDate(receipt.issueDate)}

Your payment has been successfully received and processed.

Thank you for your business!

*${tenant.companyName}*`;

      // Check if WhatsApp Business API is enabled
      const whatsappApiEnabled = process.env.WHATSAPP_API_ENABLED === 'true';

      if (whatsappApiEnabled) {
        // Generate a publicly accessible URL for the PDF
        const pdfUrl = `${process.env.NEXTAUTH_URL}/api/receipts/${receipt.id}/pdf`;

        // Send via WhatsApp Business API with document
        const whatsappSent = await WhatsAppService.sendViaAPI({
          to: customerPhone,
          message: whatsappMessage,
          documentUrl: pdfUrl,
          documentFilename: `${receipt.receiptNumber}.pdf`,
        });

        if (!whatsappSent) {
          return NextResponse.json(
            { error: 'Failed to send via WhatsApp. Please check your WhatsApp API configuration.' },
            { status: 500 }
          );
        }

        sent = true;
        sentMethod = 'whatsapp';
        sentTo = customerPhone;
      } else {
        // Generate WhatsApp link (for wa.me) with PDF download link
        const pdfDownloadLink = `${process.env.NEXTAUTH_URL}/api/receipts/${receipt.id}/pdf`;
        const messageWithPdf = `${whatsappMessage}\n\n📎 Download PDF: ${pdfDownloadLink}`;

        const whatsappLink = WhatsAppService.generateWhatsAppLink({
          to: customerPhone,
          message: messageWithPdf,
        });

        // Return WhatsApp link for user to open
        sent = true;
        sentMethod = 'whatsapp';
        sentTo = customerPhone;

        // Return early with WhatsApp link
        return NextResponse.json({
          success: true,
          method: 'whatsapp',
          message: 'WhatsApp link generated successfully',
          whatsappLink,
          sentTo: customerPhone,
          pdfUrl: pdfDownloadLink,
        });
      }
    }

    // Log in audit log
    await prisma.auditLog.create({
      data: {
        tenantId: tenant.id,
        userId: session.user.id,
        action: 'RECEIPT_SENT',
        entityType: 'RECEIPT',
        entityId: receiptId,
        metadata: {
          receiptNumber: receipt.receiptNumber,
          method: sentMethod,
          sentTo,
        },
      },
    });

    return NextResponse.json({
      success: true,
      method: sentMethod,
      message: `Receipt sent successfully via ${sentMethod} to ${sentTo}`,
      sentTo,
    });
  } catch (error: any) {
    console.error('Error sending receipt:', error);

    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to send receipt' },
      { status: 500 }
    );
  }
}
