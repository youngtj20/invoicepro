import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import DashboardLayoutClient from '@/components/DashboardLayoutClient';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

  // Get user with tenant info
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      tenant: {
        include: {
          subscription: {
            include: {
              plan: true,
            },
          },
        },
      },
    },
  });

  // If user doesn't have a tenant, redirect to onboarding
  if (!user?.tenantId) {
    redirect('/onboarding');
  }

  const tenant = user.tenant!;

  return (
    <DashboardLayoutClient user={user} tenant={tenant}>
      {children}
    </DashboardLayoutClient>
  );
}
