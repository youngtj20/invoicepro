import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import crypto from 'crypto';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = forgotPasswordSchema.parse(body);

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Don't reveal if user exists or not for security reasons
    // Always return success even if user doesn't exist
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'If an account exists with that email, a reset link has been sent.',
      });
    }

    // Generate password reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Hash the token before storing
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Store the hashed token in the database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: hashedToken,
        resetTokenExpiry,
      },
    });

    // Create reset URL
    const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`;

    // TODO: Send email with reset link
    // For now, we'll just log it (in production, use a proper email service)
    console.log('Password reset link:', resetUrl);
    console.log('User:', user.email);

    // In a real application, you would send an email here
    // Example:
    // await sendEmail({
    //   to: user.email,
    //   subject: 'Password Reset Request',
    //   html: `
    //     <p>You requested a password reset.</p>
    //     <p>Click this link to reset your password:</p>
    //     <a href="${resetUrl}">${resetUrl}</a>
    //     <p>This link will expire in 1 hour.</p>
    //     <p>If you didn't request this, please ignore this email.</p>
    //   `,
    // });

    return NextResponse.json({
      success: true,
      message: 'If an account exists with that email, a reset link has been sent.',
    });
  } catch (error: any) {
    console.error('Error in forgot password:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to process password reset request' },
      { status: 500 }
    );
  }
}
