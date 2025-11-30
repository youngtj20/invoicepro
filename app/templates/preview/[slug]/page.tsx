'use client';

export const dynamic = 'force-dynamic';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import ModernBlue from '@/components/templates/ModernBlue';
import ClassicGreen from '@/components/templates/ClassicGreen';
import ElegantPurple from '@/components/templates/ElegantPurple';
import BoldRed from '@/components/templates/BoldRed';
import MinimalistGray from '@/components/templates/MinimalistGray';
import CorporateNavy from '@/components/templates/CorporateNavy';
import FreshOrange from '@/components/templates/FreshOrange';
import ProfessionalBlack from '@/components/templates/ProfessionalBlack';
import FriendlyYellow from '@/components/templates/FriendlyYellow';
import TechTeal from '@/components/templates/TechTeal';

// Sample invoice data for preview
const sampleInvoice = {
  id: 'sample-1',
  invoiceNumber: 'INV-0001',
  invoiceDate: new Date().toISOString(),
  dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  status: 'SENT',
  paymentStatus: 'UNPAID',
  subtotal: 15000,
  taxAmount: 1125,
  total: 16125,
  currency: 'NGN',
  notes: 'Thank you for your business! Payment is due within 30 days.',
  terms: 'Payment is due within 30 days. Late payments may incur additional charges.',
  customer: {
    id: 'customer-1',
    name: 'Acme Corporation',
    email: 'accounts@acmecorp.com',
    phone: '+234 800 123 4567',
    company: 'Acme Corporation',
    address: '123 Business Avenue',
    city: 'Lagos',
    state: 'Lagos State',
    country: 'Nigeria',
    postalCode: '100001',
  },
  tenant: {
    id: 'tenant-1',
    companyName: 'Your Company Name',
    email: 'hello@yourcompany.com',
    phone: '+234 800 987 6543',
    website: 'www.yourcompany.com',
    address: '456 Office Street',
    city: 'Abuja',
    state: 'FCT',
    country: 'Nigeria',
    postalCode: '900001',
    logo: null,
    bankName: 'First Bank of Nigeria',
    accountNumber: '1234567890',
    accountName: 'Your Company Name Ltd',
  },
  items: [
    {
      id: 'item-1',
      description: 'Web Development Services',
      quantity: 40,
      unitPrice: 250,
      taxRate: 7.5,
      taxAmount: 750,
      total: 10750,
    },
    {
      id: 'item-2',
      description: 'UI/UX Design Consultation',
      quantity: 10,
      unitPrice: 300,
      taxRate: 7.5,
      taxAmount: 225,
      total: 3225,
    },
    {
      id: 'item-3',
      description: 'Cloud Hosting (Annual)',
      quantity: 1,
      unitPrice: 2000,
      taxRate: 7.5,
      taxAmount: 150,
      total: 2150,
    },
  ],
};

const templates: Record<string, React.ComponentType<any>> = {
  'modern-blue': ModernBlue,
  'classic-green': ClassicGreen,
  'elegant-purple': ElegantPurple,
  'bold-red': BoldRed,
  'minimalist-gray': MinimalistGray,
  'corporate-navy': CorporateNavy,
  'fresh-orange': FreshOrange,
  'professional-black': ProfessionalBlack,
  'friendly-yellow': FriendlyYellow,
  'tech-teal': TechTeal,
};

export default function TemplatePreviewPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setIsLoading(false), 300);
  }, []);

  const TemplateComponent = templates[slug];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!TemplateComponent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Template Not Found</h1>
          <p className="text-gray-600">The template &quot;{slug}&quot; does not exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden mb-4">
          <div className="bg-primary-600 text-white px-6 py-3 text-center">
            <p className="text-sm font-medium">Preview Mode - Sample Data</p>
          </div>
          <div className="p-0">
            <TemplateComponent invoice={sampleInvoice} />
          </div>
        </div>
        <div className="text-center">
          <button
            onClick={() => window.close()}
            className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
}
