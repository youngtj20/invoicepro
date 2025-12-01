/** @jsxImportSource react */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { requireTenant } from '@/middleware/tenant';
import { renderToBuffer } from '@react-pdf/renderer';
import { TemplatedInvoicePDF } from '@/lib/pdf-templates';
import React from 'react';
import { readFileSync } from 'fs';
import { join } from 'path';

// POST /api/invoices/[id]/whatsapp - Send invoice via WhatsApp
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

    // Get phone number from request body
    const body = await request.json();
    const { phoneNumber } = body;

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Fetch invoice with all related data including template
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
        template: true,
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Convert logo to base64 if exists
    let logoBase64: string | undefined;
    if (tenant.logo) {
      try {
        const logoPath = join(process.cwd(), 'public', tenant.logo);
        const logoBuffer = readFileSync(logoPath);
        const ext = tenant.logo.split('.').pop()?.toLowerCase();
        const mimeType = ext === 'png' ? 'image/png' : ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'image/png';
        logoBase64 = `data:${mimeType};base64,${logoBuffer.toString('base64')}`;
      } catch (error) {
        console.error('Error reading logo file:', error);
      }
    }

    // Determine template slug - use invoice template or fall back to tenant default
    let templateSlug = 'classic';
    if (invoice.template?.slug) {
      templateSlug = invoice.template.slug;
    } else if (tenant.defaultTemplateId) {
      // If invoice doesn't have a template, fetch the tenant's default template
      const defaultTemplate = await prisma.template.findUnique({
        where: { id: tenant.defaultTemplateId },
        select: { slug: true },
      });
      if (defaultTemplate?.slug) {
        templateSlug = defaultTemplate.slug;
      }
    }

    // Prepare invoice data for PDF
    const pdfData = {
      invoiceNumber: invoice.invoiceNumber,
      invoiceDate: invoice.issueDate.toISOString(),
      dueDate: invoice.dueDate?.toISOString() || '',
      status: invoice.status,
      paymentStatus: invoice.paymentStatus,
      companyName: tenant.companyName,
      companyEmail: tenant.email || undefined,
      companyPhone: tenant.phone || undefined,
      companyAddress: tenant.address || undefined,
      companyLogo: logoBase64,
      logoSize: tenant.logoSize || 50,
      bankName: tenant.bankName || undefined,
      accountNumber: tenant.accountNumber || undefined,
      accountName: tenant.accountName || undefined,
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
      items: invoice.items.map((item: any) => ({
        description: item.item?.name || item.description || 'Item',
        quantity: item.quantity || 0,
        unitPrice: item.price || 0,
        total: item.amount || 0,
      })),
      subtotal: invoice.subtotal,
      taxAmount: invoice.taxAmount,
      total: invoice.total,
      notes: invoice.notes,
      terms: invoice.terms,
      currency: tenant.currency,
      template: templateSlug,
    };

    // Generate PDF
    const pdfBuffer = await renderToBuffer(React.createElement(TemplatedInvoicePDF, { invoice: pdfData }) as any);

    // Convert PDF buffer to base64
    const pdfBase64 = pdfBuffer.toString('base64');

    // Format phone number (remove spaces, dashes, etc.)
    const formattedPhone = phoneNumber.replace(/[\s\-\(\)]/g, '');

    // Create WhatsApp message (caption for the PDF)
    const message = `Hi ${invoice.customer.name},\n\nYour invoice ${invoice.invoiceNumber} from ${tenant.companyName}.\n\n💰 Amount: ${tenant.currency} ${invoice.total.toLocaleString()}\n📅 Due Date: ${new Date(invoice.dueDate || '').toLocaleDateString()}\n\nThank you for your business!`;

    // Try to send via WhatsApp Business API first
    const { WhatsAppService } = await import('@/lib/whatsapp');

    if (WhatsAppService.isAPIConfigured()) {
      // Send PDF directly via WhatsApp Business Cloud API
      console.log('Sending invoice via WhatsApp Business API...');

      const result = await WhatsAppService.sendDocument({
        to: formattedPhone,
        documentBase64: pdfBase64,
        filename: `${invoice.invoiceNumber}.pdf`,
        caption: message,
      });

      if (result.success) {
        // Update invoice status to SENT if it was DRAFT
        if (invoice.status === 'DRAFT') {
          await prisma.invoice.update({
            where: { id: invoiceId },
            data: { status: 'SENT' },
          });
        }

        // Log in audit log
        await prisma.auditLog.create({
          data: {
            tenantId: tenant.id,
            userId: session.user.id,
            action: 'SEND_INVOICE_WHATSAPP',
            entityType: 'INVOICE',
            entityId: invoiceId,
            metadata: {
              invoiceNumber: invoice.invoiceNumber,
              phoneNumber: formattedPhone,
              customerName: invoice.customer.name,
              method: 'whatsapp_business_api',
              messageId: result.messageId,
            },
          },
        });

        return NextResponse.json({
          success: true,
          message: 'Invoice sent successfully via WhatsApp',
          method: 'api',
          messageId: result.messageId,
        });
      } else {
        // API failed, fall back to share method
        console.warn('WhatsApp API failed:', result.error);
      }
    }

    // Fallback: Return PDF for sharing
    // Log in audit log (share method)
    await prisma.auditLog.create({
      data: {
        tenantId: tenant.id,
        userId: session.user.id,
        action: 'SEND_INVOICE_WHATSAPP',
        entityType: 'INVOICE',
        entityId: invoiceId,
        metadata: {
          invoiceNumber: invoice.invoiceNumber,
          phoneNumber: formattedPhone,
          customerName: invoice.customer.name,
          method: 'share',
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Invoice ready to share',
      method: 'share',
      pdfBase64,
      fileName: `${invoice.invoiceNumber}.pdf`,
      phoneNumber: formattedPhone,
      shareMessage: message,
    });
  } catch (error: any) {
    console.error('Error preparing WhatsApp message:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to prepare WhatsApp message' },
      { status: 500 }
    );
  }
}
