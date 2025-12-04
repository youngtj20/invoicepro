/** @jsxImportSource react */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { requireTenant } from '@/middleware/tenant';
import { renderToBuffer } from '@react-pdf/renderer';
import { TemplatedReceiptPDF } from '@/lib/pdf-templates';
import React from 'react';
import { readFileSync } from 'fs';
import { join } from 'path';

// GET /api/receipts/[id]/pdf - Generate and download receipt PDF
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
    const { id: receiptId } = await params;

    // Fetch receipt with all related data including template
    const receipt = await prisma.receipt.findFirst({
      where: {
        id: receiptId,
        tenantId: tenant.id,
      },
      include: {
        customer: true,
        template: true,
      },
    });

    if (!receipt) {
      return NextResponse.json({ error: 'Receipt not found' }, { status: 404 });
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

    // Determine template slug - use receipt template or fall back to tenant default
    let templateSlug = 'classic';
    if (receipt.template?.slug) {
      templateSlug = receipt.template.slug;
    } else if (tenant.defaultTemplateId) {
      // If receipt doesn't have a template, fetch the tenant's default template
      const defaultTemplate = await prisma.template.findUnique({
        where: { id: tenant.defaultTemplateId },
        select: { slug: true },
      });
      if (defaultTemplate?.slug) {
        templateSlug = defaultTemplate.slug;
      }
    }

    // Prepare receipt data for PDF
    const pdfData = {
      receiptNumber: receipt.receiptNumber,
      issueDate: receipt.issueDate.toISOString(),
      companyName: tenant.companyName,
      companyEmail: tenant.email || undefined,
      companyPhone: tenant.phone || undefined,
      companyAddress: tenant.address || undefined,
      companyLogo: logoBase64,
      bankName: tenant.bankName || undefined,
      accountNumber: tenant.accountNumber || undefined,
      accountName: tenant.accountName || undefined,
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
      template: templateSlug,
    };

    // Generate PDF with template support
    const pdfBuffer = await renderToBuffer(React.createElement(TemplatedReceiptPDF, { receipt: pdfData }) as any);

    // Return PDF as response
    return new NextResponse(pdfBuffer as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${receipt.receiptNumber}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error('Error generating receipt PDF:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}
