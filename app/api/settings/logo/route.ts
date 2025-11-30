import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { requireTenant } from '@/middleware/tenant';
import { writeFile, unlink, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// POST /api/settings/logo - Upload company logo
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenant = await requireTenant();

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('logo') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Only image files are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'logos');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Delete old logo if exists
    if (tenant.logo) {
      try {
        const oldLogoPath = join(process.cwd(), 'public', tenant.logo);
        if (existsSync(oldLogoPath)) {
          await unlink(oldLogoPath);
        }
      } catch (error) {
        console.error('Error deleting old logo:', error);
        // Continue even if deletion fails
      }
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const filename = `${tenant.slug}-${timestamp}.${fileExtension}`;
    const filepath = join(uploadsDir, filename);

    // Convert file to buffer and write to disk
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Update tenant with new logo path
    const logoUrl = `/uploads/logos/${filename}`;
    await prisma.tenant.update({
      where: { id: tenant.id },
      data: { logo: logoUrl },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        tenantId: tenant.id,
        userId: session.user.id,
        action: 'LOGO_UPLOADED',
        entityType: 'TENANT',
        entityId: tenant.id,
        metadata: {
          filename,
          size: file.size,
        },
      },
    });

    return NextResponse.json({
      message: 'Logo uploaded successfully',
      logoUrl,
    });
  } catch (error: any) {
    console.error('Error uploading logo:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload logo' },
      { status: 500 }
    );
  }
}

// DELETE /api/settings/logo - Remove company logo
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenant = await requireTenant();

    if (!tenant.logo) {
      return NextResponse.json(
        { error: 'No logo to remove' },
        { status: 400 }
      );
    }

    // Delete logo file
    try {
      const logoPath = join(process.cwd(), 'public', tenant.logo);
      if (existsSync(logoPath)) {
        await unlink(logoPath);
      }
    } catch (error) {
      console.error('Error deleting logo file:', error);
      // Continue even if deletion fails
    }

    // Update tenant to remove logo
    await prisma.tenant.update({
      where: { id: tenant.id },
      data: { logo: null },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        tenantId: tenant.id,
        userId: session.user.id,
        action: 'LOGO_REMOVED',
        entityType: 'TENANT',
        entityId: tenant.id,
        metadata: {},
      },
    });

    return NextResponse.json({
      message: 'Logo removed successfully',
    });
  } catch (error: any) {
    console.error('Error removing logo:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to remove logo' },
      { status: 500 }
    );
  }
}
