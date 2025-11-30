import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { requireTenant } from '@/middleware/tenant';

// GET /api/invoices/generate-number - Generate unique invoice number
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenant = await requireTenant();

    // Get the count of invoices for this tenant
    const count = await prisma.invoice.count({
      where: { tenantId: tenant.id },
    });

    // Generate invoice number: INV-YYYY-XXXX
    const year = new Date().getFullYear();
    const number = (count + 1).toString().padStart(4, '0');
    const invoiceNumber = `INV-${year}-${number}`;

    // Check if this number already exists (race condition protection)
    const existing = await prisma.invoice.findFirst({
      where: {
        tenantId: tenant.id,
        invoiceNumber,
      },
    });

    if (existing) {
      // If it exists, append a random suffix
      const randomSuffix = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, '0');
      return NextResponse.json({
        invoiceNumber: `${invoiceNumber}-${randomSuffix}`,
      });
    }

    return NextResponse.json({ invoiceNumber });
  } catch (error: any) {
    console.error('Error generating invoice number:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate invoice number' },
      { status: 500 }
    );
  }
}
