import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { requireTenant } from '@/middleware/tenant';
import { z } from 'zod';

const updateTemplateSchema = z.object({
  templateId: z.string().min(1, 'Template ID is required'),
});

// PUT /api/settings/template - Update default template
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenant = await requireTenant();

    const body = await request.json();
    const { templateId } = updateTemplateSchema.parse(body);

    // Verify template exists
    const template = await prisma.template.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    if (!template.isActive) {
      return NextResponse.json(
        { error: 'Template is not active' },
        { status: 400 }
      );
    }

    // Update tenant's default template
    await prisma.tenant.update({
      where: { id: tenant.id },
      data: {
        defaultTemplateId: templateId,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        tenantId: tenant.id,
        action: 'TEMPLATE_CHANGED',
        entityType: 'TENANT',
        entityId: tenant.id,
        metadata: {
          templateId,
          templateName: template.name,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Default template updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating template:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update template' },
      { status: 500 }
    );
  }
}
