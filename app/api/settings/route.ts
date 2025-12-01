import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { requireTenant } from '@/middleware/tenant';
import { z } from 'zod';

// Validation schema
const settingsSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  taxId: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  currency: z.string().optional(),
  dateFormat: z.string().optional(),
  numberFormat: z.string().optional(),
  language: z.string().optional(),
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
  accountName: z.string().optional(),
});

// GET /api/settings - Get tenant settings
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenant = await requireTenant();

    // Return tenant settings
    return NextResponse.json({
      companyName: tenant.companyName,
      email: tenant.email || '',
      phone: tenant.phone || '',
      website: tenant.website || '',
      taxId: tenant.taxId || '',
      address: tenant.address || '',
      city: tenant.city || '',
      state: tenant.state || '',
      country: tenant.country || 'Nigeria',
      postalCode: tenant.postalCode || '',
      currency: tenant.currency || 'NGN',
      dateFormat: tenant.dateFormat || 'DD/MM/YYYY',
      numberFormat: tenant.numberFormat || '1,234.56',
      language: tenant.language || 'en',
      logo: tenant.logo || null,
      bankName: tenant.bankName || '',
      accountNumber: tenant.accountNumber || '',
      accountName: tenant.accountName || '',
      defaultTemplateId: tenant.defaultTemplateId || null,
    });
  } catch (error: any) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

// PUT /api/settings - Update tenant settings
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenant = await requireTenant();

    // Parse and validate request body
    const body = await request.json();
    const validatedData = settingsSchema.parse(body);

    // Update tenant settings
    const updatedTenant = await prisma.tenant.update({
      where: { id: tenant.id },
      data: {
        companyName: validatedData.companyName,
        email: validatedData.email || null,
        phone: validatedData.phone || null,
        website: validatedData.website || null,
        taxId: validatedData.taxId || null,
        address: validatedData.address || null,
        city: validatedData.city || null,
        state: validatedData.state || null,
        country: validatedData.country || 'Nigeria',
        postalCode: validatedData.postalCode || null,
        currency: validatedData.currency || 'NGN',
        dateFormat: validatedData.dateFormat || 'DD/MM/YYYY',
        numberFormat: validatedData.numberFormat || '1,234.56',
        language: validatedData.language || 'en',
        bankName: validatedData.bankName || null,
        accountNumber: validatedData.accountNumber || null,
        accountName: validatedData.accountName || null,
      },
    });

    // Log in audit log
    await prisma.auditLog.create({
      data: {
        tenantId: tenant.id,
        userId: session.user.id,
        action: 'SETTINGS_UPDATED',
        entityType: 'TENANT',
        entityId: tenant.id,
        metadata: {
          companyName: validatedData.companyName,
        },
      },
    });

    return NextResponse.json({
      message: 'Settings updated successfully',
      tenant: updatedTenant,
    });
  } catch (error: any) {
    console.error('Error updating settings:', error);

    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to update settings' },
      { status: 500 }
    );
  }
}
