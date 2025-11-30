import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/invoices/[id]/public - Get invoice details without authentication
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: invoiceId } = await params;

    const invoice = await prisma.invoice.findUnique({
      where: {
        id: invoiceId,
      },
      include: {
        customer: true,
        tenant: true,
        items: true,
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Track that invoice was viewed
    if (!invoice.viewedAt) {
      await prisma.invoice.update({
        where: { id: invoiceId },
        data: {
          viewedAt: new Date(),
          status: invoice.status === 'SENT' ? 'VIEWED' : invoice.status,
        },
      });
    }

    return NextResponse.json(invoice);
  } catch (error: any) {
    console.error('Error fetching public invoice:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch invoice' },
      { status: 500 }
    );
  }
}
