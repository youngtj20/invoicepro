/** @jsxImportSource react */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { requireTenant } from '@/middleware/tenant';
import { z } from 'zod';
import { EmailService } from '@/lib/email';
import { SMSService } from '@/lib/sms';
import { WhatsAppService } from '@/lib/whatsapp';
import { renderToBuffer } from '@react-pdf/renderer';
import { InvoicePDF } from '@/lib/pdf-generator';
import React from 'react';

// Validation schema
const sendInvoiceSchema = z.object({
  method: z.enum(['email', 'sms', 'whatsapp']).default('email'),
  to: z.string().min(1, 'Recipient is required'),
  subject: z.string().min(1, 'Subject is required').optional(),
  message: z.string().optional(),
  ccEmails: z.array(z.string().email()).optional(),
});

// POST /api/invoices/[id]/send - Send invoice via email
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

    // Parse and validate request body
    const body = await request.json();
    const validatedData = sendInvoiceSchema.parse(body);

    // Fetch invoice with all related data
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        tenantId: tenant.id,
      },
      include: {
        customer: true,
        items: {
          include: {
            item: true,
          },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Format currency
    const formatCurrency = (amount: number) => {
      return `${tenant.currency || 'NGN'} ${amount.toLocaleString('en-US', {
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

    // Generate invoice view link (public link)
    const viewLink = `${process.env.NEXTAUTH_URL}/invoices/${invoice.id}`;

    let sent = false;
    let sentMethod = '';
    let sentTo = '';

    // Handle different sending methods
    if (validatedData.method === 'email') {
      // Validate email
      const customerEmail = validatedData.to || invoice.customer.email;
      if (!customerEmail) {
        return NextResponse.json(
          { error: 'Customer email not found. Please provide an email address.' },
          { status: 400 }
        );
      }

      // Prepare invoice data for PDF
      const pdfData = {
      invoiceNumber: invoice.invoiceNumber,
      invoiceDate: invoice.issueDate.toISOString(),
      dueDate: invoice.dueDate?.toISOString() || '',
      status: invoice.status,
      companyName: tenant.companyName,
      companyEmail: tenant.email || undefined,
      companyPhone: tenant.phone || undefined,
      companyAddress: tenant.address || undefined,
      customer: {
        name: invoice.customer.name,
        email: invoice.customer.email,
        company: invoice.customer.company,
        address: invoice.customer.address,
        city: invoice.customer.city,
        state: invoice.customer.state,
        country: invoice.customer.country,
        postalCode: invoice.customer.postalCode,
      },
      items: invoice.items.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.price,
        total: item.amount,
      })),
      subtotal: invoice.subtotal,
      taxAmount: invoice.taxAmount,
      total: invoice.total,
      notes: invoice.notes,
      terms: invoice.terms,
        currency: tenant.currency,
      };

      // Generate PDF
      const pdfBuffer = await renderToBuffer(React.createElement(InvoicePDF, { invoice: pdfData }) as any);

      // Generate email HTML
      const emailHtml = EmailService.generateInvoiceEmail({
        customerName: invoice.customer.name,
        invoiceNumber: invoice.invoiceNumber,
        amount: formatCurrency(invoice.total),
        dueDate: invoice.dueDate ? formatDate(invoice.dueDate) : 'Not specified',
        viewLink,
        companyName: tenant.companyName,
      });

      // Prepare custom message if provided
      let finalEmailHtml = emailHtml;
      if (validatedData.message) {
        finalEmailHtml = emailHtml.replace(
          `<p>You have received a new invoice from ${tenant.companyName}.</p>`,
          `<p>You have received a new invoice from ${tenant.companyName}.</p>
           <div style="background: #e0f2fe; padding: 15px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #0ea5e9;">
             <p style="margin: 0;"><strong>Message from ${tenant.companyName}:</strong></p>
             <p style="margin: 10px 0 0 0;">${validatedData.message}</p>
           </div>`
        );
      }

      // Prepare email subject
      const emailSubject =
        validatedData.subject ||
        `Invoice ${invoice.invoiceNumber} from ${tenant.companyName}`;

      // Send email with PDF attachment
      const emailSent = await EmailService.sendEmail({
        to: customerEmail,
        subject: emailSubject,
        html: finalEmailHtml,
        attachments: [
          {
            filename: `${invoice.invoiceNumber}.pdf`,
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
    } else if (validatedData.method === 'sms') {
      // Validate phone number
      const customerPhone = validatedData.to || invoice.customer.phone;
      if (!customerPhone) {
        return NextResponse.json(
          { error: 'Customer phone number not found. Please provide a phone number.' },
          { status: 400 }
        );
      }

      // Generate SMS message
      const smsMessage = validatedData.message || SMSService.generateInvoiceSMS({
        customerName: invoice.customer.name,
        invoiceNumber: invoice.invoiceNumber,
        amount: formatCurrency(invoice.total),
        viewLink,
        companyName: tenant.companyName,
      });

      // Send SMS
      const smsSent = await SMSService.sendSMS({
        to: customerPhone,
        message: smsMessage,
      });

      if (!smsSent) {
        return NextResponse.json(
          { error: 'Failed to send SMS. Please check your SMS configuration.' },
          { status: 500 }
        );
      }

      sent = true;
      sentMethod = 'sms';
      sentTo = customerPhone;
    } else if (validatedData.method === 'whatsapp') {
      // Validate phone number
      const customerPhone = validatedData.to || invoice.customer.phone;
      if (!customerPhone) {
        return NextResponse.json(
          { error: 'Customer phone number not found. Please provide a phone number.' },
          { status: 400 }
        );
      }

      // Prepare invoice data for PDF (reusing the same structure as email)
      const pdfData = {
      invoiceNumber: invoice.invoiceNumber,
      invoiceDate: invoice.issueDate.toISOString(),
      dueDate: invoice.dueDate?.toISOString() || '',
      status: invoice.status,
      companyName: tenant.companyName,
      companyEmail: tenant.email || undefined,
      companyPhone: tenant.phone || undefined,
      companyAddress: tenant.address || undefined,
      customer: {
        name: invoice.customer.name,
        email: invoice.customer.email,
        company: invoice.customer.company,
        address: invoice.customer.address,
        city: invoice.customer.city,
        state: invoice.customer.state,
        country: invoice.customer.country,
        postalCode: invoice.customer.postalCode,
      },
      items: invoice.items.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.price,
        total: item.amount,
      })),
      subtotal: invoice.subtotal,
      taxAmount: invoice.taxAmount,
      total: invoice.total,
      notes: invoice.notes,
      terms: invoice.terms,
        currency: tenant.currency,
      };

      // Generate PDF
      const pdfBuffer = await renderToBuffer(React.createElement(InvoicePDF, { invoice: pdfData }) as any);

      // Generate WhatsApp message
      const whatsappMessage = validatedData.message || WhatsAppService.generateInvoiceMessage({
        customerName: invoice.customer.name,
        invoiceNumber: invoice.invoiceNumber,
        amount: formatCurrency(invoice.total),
        viewLink,
        companyName: tenant.companyName,
      });

      // Check if WhatsApp Business API is enabled
      const whatsappApiEnabled = process.env.WHATSAPP_API_ENABLED === 'true';

      if (whatsappApiEnabled) {
        // Generate a publicly accessible URL for the PDF
        // Note: In production, you should upload the PDF to cloud storage (S3, etc.)
        // and provide that URL. For now, we'll use the API endpoint
        const pdfUrl = `${process.env.NEXTAUTH_URL}/api/invoices/${invoice.id}/pdf`;

        // Send via WhatsApp Business API with document
        const whatsappSent = await WhatsAppService.sendViaAPI({
          to: customerPhone,
          message: whatsappMessage,
          documentUrl: pdfUrl,
          documentFilename: `${invoice.invoiceNumber}.pdf`,
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
        const pdfDownloadLink = `${process.env.NEXTAUTH_URL}/api/invoices/${invoice.id}/pdf`;
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

    // Update invoice status to SENT if it was DRAFT
    if (invoice.status === 'DRAFT') {
      await prisma.invoice.update({
        where: { id: invoiceId },
        data: {
          status: 'SENT',
          updatedAt: new Date(),
        },
      });
    }

    // Log in audit log
    await prisma.auditLog.create({
      data: {
        tenantId: tenant.id,
        userId: session.user.id,
        action: 'INVOICE_SENT',
        entityType: 'INVOICE',
        entityId: invoiceId,
        metadata: {
          invoiceNumber: invoice.invoiceNumber,
          method: sentMethod,
          sentTo,
        },
      },
    });

    return NextResponse.json({
      success: true,
      method: sentMethod,
      message: `Invoice sent successfully via ${sentMethod} to ${sentTo}`,
      sentTo,
    });
  } catch (error: any) {
    console.error('Error sending invoice:', error);

    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to send invoice' },
      { status: 500 }
    );
  }
}
