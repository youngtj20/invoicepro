import Link from 'next/link';
import { ArrowRight, CheckCircle, FileText, Users, Zap } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="text-2xl font-bold text-primary-600">InvoicePro</div>
          <div className="flex gap-4">
            <Link
              href="/auth/signin"
              className="px-4 py-2 text-gray-700 hover:text-primary-600 transition"
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
            >
              Start Free Trial
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          Professional Invoicing
          <br />
          Made Simple
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Create, manage, and send beautiful invoices in minutes. Start with a 7-day free trial,
          no credit card required.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/auth/signup"
            className="px-8 py-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition flex items-center gap-2 text-lg font-semibold"
          >
            Start Free Trial
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="#features"
            className="px-8 py-4 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition text-lg font-semibold"
          >
            Learn More
          </Link>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">
          Everything You Need to Manage Invoices
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <FileText className="w-12 h-12 text-primary-600 mb-4" />
            <h3 className="text-2xl font-bold mb-4">Beautiful Templates</h3>
            <p className="text-gray-600">
              Choose from 10+ professional invoice templates. Customize colors and fonts to match
              your brand.
            </p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <Users className="w-12 h-12 text-primary-600 mb-4" />
            <h3 className="text-2xl font-bold mb-4">Customer Management</h3>
            <p className="text-gray-600">
              Keep track of all your customers in one place. Add unlimited customers and items.
            </p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <Zap className="w-12 h-12 text-primary-600 mb-4" />
            <h3 className="text-2xl font-bold mb-4">Instant Delivery</h3>
            <p className="text-gray-600">
              Send invoices via Email, WhatsApp, or SMS. Your customers receive them instantly.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">
          Simple, Transparent Pricing
        </h2>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <div className="bg-white p-8 rounded-xl shadow-lg border-2 border-gray-200">
            <h3 className="text-2xl font-bold mb-2">Free</h3>
            <p className="text-gray-600 mb-6">Perfect for getting started</p>
            <div className="text-4xl font-bold mb-6">₦0</div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>3 invoices per month</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Basic templates</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Email delivery</span>
              </li>
            </ul>
            <Link
              href="/auth/signup"
              className="block text-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-semibold"
            >
              Get Started
            </Link>
          </div>

          {/* Pro Plan */}
          <div className="bg-primary-600 text-white p-8 rounded-xl shadow-xl border-2 border-primary-700 relative">
            <div className="absolute top-0 right-6 -mt-3 bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-sm font-bold">
              Popular
            </div>
            <h3 className="text-2xl font-bold mb-2">Pro</h3>
            <p className="text-blue-100 mb-6">For growing businesses</p>
            <div className="text-4xl font-bold mb-6">₦1,000/mo</div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-300" />
                <span>Unlimited invoices</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-300" />
                <span>Premium templates</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-300" />
                <span>Email, SMS & WhatsApp</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-300" />
                <span>Advanced reporting</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-300" />
                <span>Custom branding</span>
              </li>
            </ul>
            <Link
              href="/auth/signup"
              className="block text-center px-6 py-3 bg-white text-primary-600 rounded-lg hover:bg-gray-50 transition font-semibold"
            >
              Start 7-Day Free Trial
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="text-2xl font-bold mb-4">InvoicePro</div>
          <p className="text-gray-400 mb-4">Professional invoicing for Nigerian businesses</p>
          <p className="text-gray-500 text-sm">© 2025 InvoicePro. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
