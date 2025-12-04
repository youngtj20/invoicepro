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

// GET /api/invoices/[id]/pdf - Generate and download PDF
export async function GET(
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

    // Fetch invoice with all related data including template and taxes
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
        invoiceTaxes: {
          include: {
            tax: true,
          },
        },
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
        // Continue without logo if file read fails
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

    console.log('DEBUG PDF Generation:', {
      invoiceId,
      invoiceTemplateId: invoice.templateId,
      invoiceTemplateSlug: invoice.template?.slug,
      tenantDefaultTemplateId: tenant.defaultTemplateId,
      resolvedTemplateSlug: templateSlug,
    });

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
      items: invoice.items.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.price,
        total: item.amount,
      })),
      subtotal: invoice.subtotal,
      taxAmount: invoice.taxAmount,
      total: invoice.total,
      taxes: invoice.invoiceTaxes?.map((invoiceTax) => ({
        name: invoiceTax.tax.name,
        rate: invoiceTax.tax.rate,
        amount: invoiceTax.taxAmount,
      })) || [],
      notes: invoice.notes,
      terms: invoice.terms,
      currency: tenant.currency,
      template: templateSlug,
    };

    // Generate PDF with template support
    const pdfBuffer = await renderToBuffer(
      React.createElement(TemplatedInvoicePDF, { invoice: pdfData }) as any
    );

    // Return PDF as download
    return new NextResponse(pdfBuffer as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${invoice.invoiceNumber}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}
