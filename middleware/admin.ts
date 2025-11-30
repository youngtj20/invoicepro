import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

/**
 * Check if user is a super admin
 */
export async function requireAdmin() {
  const session = await getServerSession(authOptions);

  if (!session) {
    throw new Error('Unauthorized');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user || user.role !== 'SUPER_ADMIN') {
    throw new Error('Access denied. Admin privileges required.');
  }

  return user;
}

/**
 * Check if user has admin role (non-throwing version)
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return false;
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    return user?.role === 'SUPER_ADMIN';
  } catch (error) {
    return false;
  }
}

export default requireAdmin;
