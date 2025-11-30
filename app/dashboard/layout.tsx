import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import DashboardSidebar from '@/components/DashboardSidebar';
import DashboardHeader from '@/components/DashboardHeader';

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
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu overlay - controlled by client component */}
      <div className="lg:hidden">
        <DashboardSidebar tenant={tenant} userRole={user.role} isMobile />
      </div>

      {/* Desktop layout */}
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar - hidden on mobile, shown on lg+ */}
        <aside className="hidden lg:flex lg:flex-shrink-0">
          <DashboardSidebar tenant={tenant} userRole={user.role} />
        </aside>

        {/* Main content area */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Top header */}
          <DashboardHeader user={user} tenant={tenant} />

          {/* Main content */}
          <main className="flex-1 overflow-y-auto bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
