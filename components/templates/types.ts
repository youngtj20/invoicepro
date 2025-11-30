export interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED';

  // Company info
  companyName: string;
  companyEmail?: string;
  companyPhone?: string;
  companyAddress?: string;
  companyCity?: string;
  companyState?: string;
  companyCountry?: string;
  companyPostalCode?: string;
  companyLogo?: string;

  // Customer info
  customer: {
    name: string;
    email?: string | null;
    company?: string | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    country?: string | null;
    postalCode?: string | null;
  };

  // Line items
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;

  // Totals
  subtotal: number;
  taxAmount: number;
  total: number;

  // Additional
  notes?: string | null;
  terms?: string | null;
  currency?: string;
}

export interface TemplateProps {
  invoice: InvoiceData;
}
