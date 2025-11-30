import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { ArrowRight, FileText, Users, TrendingUp } from 'lucide-react';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

  // Get user with tenant and subscription
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

  if (!user?.tenantId) {
    redirect('/onboarding');
  }

  const tenant = user.tenant!;
  const subscription = tenant.subscription;

  // Calculate days remaining in trial
  let trialDaysRemaining = 0;
  if (subscription?.status === 'TRIALING' && subscription.trialEndsAt) {
    const now = new Date();
    const trialEnd = new Date(subscription.trialEndsAt);
    const diffTime = trialEnd.getTime() - now.getTime();
    trialDaysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Get counts for stats
  const [invoiceCount, customerCount, itemCount] = await Promise.all([
    prisma.invoice.count({ where: { tenantId: tenant.id } }),
    prisma.customer.count({ where: { tenantId: tenant.id } }),
    prisma.item.count({ where: { tenantId: tenant.id } }),
  ]);

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user.name}!
        </h1>
        <p className="text-gray-600 mt-1">
          Here's what's happening with {tenant.companyName} today
        </p>
      </div>

      {/* Trial Banner */}
      {subscription?.status === 'TRIALING' && trialDaysRemaining > 0 && (
        <div className="bg-gradient-to-r from-primary-50 to-indigo-50 border border-primary-200 rounded-lg p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="text-lg font-semibold text-primary-900 mb-1">
                🎉 You're on a Pro trial
              </h3>
              <p className="text-primary-700">
                {trialDaysRemaining} {trialDaysRemaining === 1 ? 'day' : 'days'} remaining to enjoy all Pro features
              </p>
            </div>
            <Link
              href="/dashboard/subscription"
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold"
            >
              Upgrade Now
            </Link>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/dashboard/invoices"
          className="bg-white rounded-lg shadow hover:shadow-md transition p-6 group"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Total Invoices</h3>
            <FileText className="w-8 h-8 text-primary-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{invoiceCount}</p>
          <p className="text-sm text-gray-500 mt-1">
            {invoiceCount === 0 ? 'Create your first invoice' : 'View all invoices'}
          </p>
          <div className="mt-4 flex items-center text-primary-600 text-sm font-medium group-hover:text-primary-700">
            View <ArrowRight className="w-4 h-4 ml-1" />
          </div>
        </Link>

        <Link
          href="/dashboard/customers"
          className="bg-white rounded-lg shadow hover:shadow-md transition p-6 group"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Total Customers</h3>
            <Users className="w-8 h-8 text-primary-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{customerCount}</p>
          <p className="text-sm text-gray-500 mt-1">
            {customerCount === 0 ? 'Add your first customer' : 'Manage customers'}
          </p>
          <div className="mt-4 flex items-center text-primary-600 text-sm font-medium group-hover:text-primary-700">
            View <ArrowRight className="w-4 h-4 ml-1" />
          </div>
        </Link>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Revenue</h3>
            <TrendingUp className="w-8 h-8 text-primary-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{tenant.currency} 0</p>
          <p className="text-sm text-gray-500 mt-1">All time</p>
        </div>
      </div>

      {/* Getting Started Section */}
      {(invoiceCount === 0 || customerCount === 0) && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Getting Started</h2>
          <div className="space-y-4">
            {customerCount === 0 && (
              <div className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition">
                <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-semibold">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">Add your first customer</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Build your customer database to start creating invoices
                  </p>
                  <Link
                    href="/dashboard/customers/new"
                    className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1"
                  >
                    Add Customer <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )}

            {itemCount === 0 && (
              <div className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition">
                <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-semibold">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">Create products/services</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Add items to your catalog for quick invoice creation
                  </p>
                  <Link
                    href="/dashboard/items"
                    className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1"
                  >
                    Add Items <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )}

            {invoiceCount === 0 && customerCount > 0 && (
              <div className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition">
                <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-semibold">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">Create your first invoice</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Choose from 10 professional templates and send invoices in minutes
                  </p>
                  <Link
                    href="/dashboard/invoices/new"
                    className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1"
                  >
                    Create Invoice <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Subscription Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Subscription</h2>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-gray-600">Current Plan</p>
            <p className="text-2xl font-bold text-gray-900">{subscription?.plan.name}</p>
            <p className="text-sm text-gray-500 mt-1">
              Status: <span className="capitalize font-medium">{subscription?.status.toLowerCase()}</span>
            </p>
          </div>
          {subscription?.status !== 'ACTIVE' && (
            <Link
              href="/dashboard/subscription"
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold"
            >
              Upgrade to Pro
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
