import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from '@react-pdf/renderer';

// Template color schemes
export const TEMPLATE_COLORS = {
  'modern-blue': {
    primary: '#2563EB',
    secondary: '#1E40AF',
    accent: '#3B82F6',
    background: '#EFF6FF',
  },
  'classic-green': {
    primary: '#15803D',
    secondary: '#166534',
    accent: '#22C55E',
    background: '#DCFCE7',
  },
  'elegant-purple': {
    primary: '#9333EA',
    secondary: '#7E22CE',
    accent: '#A855F7',
    background: '#F3E8FF',
  },
  'bold-red': {
    primary: '#DC2626',
    secondary: '#B91C1C',
    accent: '#EF4444',
    background: '#FEE2E2',
  },
  'minimalist-gray': {
    primary: '#4B5563',
    secondary: '#374151',
    accent: '#6B7280',
    background: '#F3F4F6',
  },
  'corporate-navy': {
    primary: '#1E3A8A',
    secondary: '#1E40AF',
    accent: '#3B82F6',
    background: '#EFF6FF',
  },
  'fresh-orange': {
    primary: '#EA580C',
    secondary: '#C2410C',
    accent: '#FB923C',
    background: '#FFEDD5',
  },
  'professional-black': {
    primary: '#111827',
    secondary: '#1F2937',
    accent: '#374151',
    background: '#F9FAFB',
  },
  'friendly-yellow': {
    primary: '#CA8A04',
    secondary: '#A16207',
    accent: '#FBBF24',
    background: '#FEFCE8',
  },
  'tech-teal': {
    primary: '#0891B2',
    secondary: '#0E7490',
    accent: '#06B6D4',
    background: '#CCFBF1',
  },
  // Fallback colors
  classic: {
    primary: '#2563EB',
    secondary: '#1E40AF',
    accent: '#3B82F6',
    background: '#EFF6FF',
  },
  modern: {
    primary: '#059669',
    secondary: '#047857',
    accent: '#10B981',
    background: '#ECFDF5',
  },
  elegant: {
    primary: '#7C3AED',
    secondary: '#6D28D9',
    accent: '#8B5CF6',
    background: '#F5F3FF',
  },
  professional: {
    primary: '#DC2626',
    secondary: '#B91C1C',
    accent: '#EF4444',
    background: '#FEF2F2',
  },
  minimal: {
    primary: '#374151',
    secondary: '#1F2937',
    accent: '#4B5563',
    background: '#F9FAFB',
  },
};

// Create dynamic styles based on template
export const createTemplateStyles = (colors: typeof TEMPLATE_COLORS.classic) => StyleSheet.create({
  page: {
    padding: 25,
    fontSize: 9,
    fontFamily: 'Helvetica',
    backgroundColor: '#FFFFFF',
  },
  header: {
    marginBottom: 15,
    borderBottom: `2 solid ${colors.primary}`,
    paddingBottom: 12,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  logo: {
    width: 50,
    height: 50,
    objectFit: 'contain',
    marginBottom: 5,
  },
  companyName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  companyInfo: {
    fontSize: 8,
    color: '#666',
    lineHeight: 1.3,
  },
  invoiceTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 5,
    textAlign: 'right',
  },
  invoiceNumber: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  section: {
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  billToBox: {
    backgroundColor: colors.background,
    padding: 10,
    borderRadius: 4,
    width: '48%',
  },
  billToTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  billToName: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  billToInfo: {
    fontSize: 8,
    color: '#666',
    lineHeight: 1.3,
  },
  datesBox: {
    width: '48%',
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  dateLabel: {
    fontSize: 8,
    color: '#666',
  },
  dateValue: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  table: {
    marginTop: 12,
    marginBottom: 12,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    color: '#fff',
    padding: 6,
    fontWeight: 'bold',
    fontSize: 8,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1 solid #E5E7EB',
    padding: 6,
    fontSize: 8,
  },
  tableRowAlt: {
    backgroundColor: '#F9FAFB',
  },
  colDescription: {
    width: '50%',
  },
  colQty: {
    width: '15%',
    textAlign: 'center',
  },
  colPrice: {
    width: '17.5%',
    textAlign: 'right',
  },
  colTotal: {
    width: '17.5%',
    textAlign: 'right',
  },
  totalsBox: {
    marginLeft: 'auto',
    width: '50%',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  totalLabel: {
    fontSize: 8,
  },
  totalValue: {
    fontSize: 8,
    fontWeight: 'bold',
  },
  grandTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.primary,
    color: '#fff',
    padding: 8,
    marginTop: 4,
    fontWeight: 'bold',
    fontSize: 11,
  },
  bankDetailsSection: {
    marginTop: 10,
    padding: 8,
    backgroundColor: colors.background,
    borderRadius: 4,
    borderLeft: `4 solid ${colors.primary}`,
  },
  bankDetailsTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 3,
  },
  bankDetailsText: {
    fontSize: 8,
    color: '#666',
    lineHeight: 1.3,
  },
  notesSection: {
    marginTop: 12,
    paddingTop: 10,
    borderTop: '1 solid #E5E7EB',
  },
  notesTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 3,
  },
  notesText: {
    fontSize: 8,
    color: '#666',
    lineHeight: 1.3,
  },
  footer: {
    marginTop: 15,
    paddingTop: 10,
    borderTop: `2 solid ${colors.primary}`,
    textAlign: 'center',
    fontSize: 8,
    color: '#666',
  },
  paidStamp: {
    position: 'absolute',
    top: 120,
    right: 80,
    transform: 'rotate(12deg)',
    border: `4 solid #059669`,
    color: '#059669',
    fontSize: 32,
    fontWeight: 'bold',
    padding: '12 24',
    opacity: 0.5,
    zIndex: 10,
  },
  unpaidStamp: {
    position: 'absolute',
    top: 120,
    right: 80,
    transform: 'rotate(12deg)',
    border: `4 solid #DC2626`,
    color: '#DC2626',
    fontSize: 32,
    fontWeight: 'bold',
    padding: '12 24',
    opacity: 0.5,
    zIndex: 10,
  },
  partiallyPaidStamp: {
    position: 'absolute',
    top: 120,
    right: 80,
    transform: 'rotate(12deg)',
    border: `4 solid #F59E0B`,
    color: '#F59E0B',
    fontSize: 32,
    fontWeight: 'bold',
    padding: '12 24',
    opacity: 0.5,
    zIndex: 10,
  },
});

interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  status: string;
  paymentStatus?: 'UNPAID' | 'PARTIALLY_PAID' | 'PAID';
  companyName: string;
  companyEmail?: string;
  companyPhone?: string;
  companyAddress?: string;
  companyLogo?: string | null;
  logoSize: number; // Logo size in pixels (default: 50)
  bankName?: string | null;
  accountNumber?: string | null;
  accountName?: string | null;
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
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  subtotal: number;
  taxAmount: number;
  total: number;
  taxes?: Array<{
    name: string;
    rate: number;
    amount: number;
  }>;
  notes?: string | null;
  terms?: string | null;
  currency?: string;
  template?: string; // Template slug
}

// Format date helper
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Format currency helper
const formatCurrency = (amount: number | undefined | null, currency: string = 'NGN') => {
  const validAmount = amount ?? 0;
  return `${currency} ${validAmount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

// Get stamp style based on payment status
const getStampStyle = (paymentStatus: string | undefined, styles: any) => {
  switch (paymentStatus) {
    case 'PAID':
      return styles.paidStamp;
    case 'PARTIALLY_PAID':
      return styles.partiallyPaidStamp;
    case 'UNPAID':
    default:
      return styles.unpaidStamp;
  }
};

// Get stamp text based on payment status
const getStampText = (paymentStatus?: string) => {
  switch (paymentStatus) {
    case 'PAID':
      return 'PAID';
    case 'PARTIALLY_PAID':
      return 'PARTIALLY PAID';
    case 'UNPAID':
    default:
      return 'UNPAID';
  }
};

// Get template colors by slug
const getTemplateColors = (template?: string) => {
  if (!template) return TEMPLATE_COLORS.classic;
  
  const slug = template.toLowerCase();
  
  // Direct lookup for full slugs from database
  if (TEMPLATE_COLORS[slug as keyof typeof TEMPLATE_COLORS]) {
    return TEMPLATE_COLORS[slug as keyof typeof TEMPLATE_COLORS];
  }
  
  // Fallback for partial matches
  if (slug.includes('modern')) return TEMPLATE_COLORS['modern-blue'];
  if (slug.includes('classic')) return TEMPLATE_COLORS['classic-green'];
  if (slug.includes('elegant')) return TEMPLATE_COLORS['elegant-purple'];
  if (slug.includes('bold')) return TEMPLATE_COLORS['bold-red'];
  if (slug.includes('minimal')) return TEMPLATE_COLORS['minimalist-gray'];
  if (slug.includes('corporate')) return TEMPLATE_COLORS['corporate-navy'];
  if (slug.includes('fresh')) return TEMPLATE_COLORS['fresh-orange'];
  if (slug.includes('professional')) return TEMPLATE_COLORS['professional-black'];
  if (slug.includes('friendly')) return TEMPLATE_COLORS['friendly-yellow'];
  if (slug.includes('tech')) return TEMPLATE_COLORS['tech-teal'];
  
  return TEMPLATE_COLORS.classic;
};

// Main Invoice PDF Component with Template Support
export const TemplatedInvoicePDF = ({ invoice }: { invoice: InvoiceData }) => {
  const colors = getTemplateColors(invoice.template);
  const styles = createTemplateStyles(colors);
  
  // Use provided logo size or default to 50
  const logoSize = invoice.logoSize || 50;
  const logoStyle = {
    width: logoSize,
    height: logoSize,
    objectFit: 'contain' as const,
    marginBottom: 5,
  };

  console.log('DEBUG TemplatedInvoicePDF:', {
    templateProp: invoice.template,
    resolvedColors: colors,
    logoSize: logoSize,
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Payment Status Stamp */}
        <View style={getStampStyle(invoice.paymentStatus, styles)}>
          <Text>{getStampText(invoice.paymentStatus)}</Text>
        </View>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              {invoice.companyLogo && (
                <Image
                  src={invoice.companyLogo}
                  style={logoStyle}
                />
              )}
              <Text style={styles.companyName}>{invoice.companyName}</Text>
              <View style={styles.companyInfo}>
                {invoice.companyEmail && <Text>{invoice.companyEmail}</Text>}
                {invoice.companyPhone && <Text>{invoice.companyPhone}</Text>}
                {invoice.companyAddress && <Text>{invoice.companyAddress}</Text>}
              </View>
            </View>
            <View>
              <Text style={styles.invoiceTitle}>INVOICE</Text>
              <Text style={styles.invoiceNumber}>{invoice.invoiceNumber}</Text>
            </View>
          </View>
        </View>

        {/* Bill To & Dates */}
        <View style={[styles.section, styles.row]}>
          <View style={styles.billToBox}>
            <Text style={styles.billToTitle}>BILL TO:</Text>
            <Text style={styles.billToName}>{invoice.customer.name}</Text>
            {invoice.customer.company && (
              <Text style={styles.billToInfo}>{invoice.customer.company}</Text>
            )}
            {invoice.customer.email && (
              <Text style={styles.billToInfo}>{invoice.customer.email}</Text>
            )}
            {invoice.customer.address && (
              <View style={styles.billToInfo}>
                <Text>{invoice.customer.address}</Text>
                <Text>
                  {[
                    invoice.customer.city,
                    invoice.customer.state,
                    invoice.customer.postalCode,
                  ]
                    .filter(Boolean)
                    .join(', ')}
                </Text>
                {invoice.customer.country && <Text>{invoice.customer.country}</Text>}
              </View>
            )}
          </View>

          <View style={styles.datesBox}>
            <View style={styles.dateRow}>
              <Text style={styles.dateLabel}>Invoice Date:</Text>
              <Text style={styles.dateValue}>{formatDate(invoice.invoiceDate)}</Text>
            </View>
            <View style={styles.dateRow}>
              <Text style={styles.dateLabel}>Due Date:</Text>
              <Text style={styles.dateValue}>{formatDate(invoice.dueDate)}</Text>
            </View>
            <View style={styles.dateRow}>
              <Text style={styles.dateLabel}>Status:</Text>
              <Text style={styles.dateValue}>{invoice.status}</Text>
            </View>
          </View>
        </View>

        {/* Line Items Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={styles.colDescription}>Description</Text>
            <Text style={styles.colQty}>Qty</Text>
            <Text style={styles.colPrice}>Unit Price</Text>
            <Text style={styles.colTotal}>Amount</Text>
          </View>

          {/* Table Rows */}
          {invoice.items.map((item, index) => (
            <View
              key={index}
              style={[styles.tableRow, ...(index % 2 === 1 ? [styles.tableRowAlt] : [])]}
            >
              <Text style={styles.colDescription}>{item.description}</Text>
              <Text style={styles.colQty}>{item.quantity}</Text>
              <Text style={styles.colPrice}>
                {formatCurrency(item.unitPrice, invoice.currency)}
              </Text>
              <Text style={styles.colTotal}>
                {formatCurrency(item.total, invoice.currency)}
              </Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsBox}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>
              {formatCurrency(invoice.subtotal, invoice.currency)}
            </Text>
          </View>
          
          {/* Display individual taxes */}
          {invoice.taxes && invoice.taxes.length > 0 ? (
            <>
              {invoice.taxes.map((tax, index) => (
                <View key={index} style={styles.totalRow}>
                  <Text style={styles.totalLabel}>{tax.name} ({tax.rate}%):</Text>
                  <Text style={styles.totalValue}>
                    {formatCurrency(tax.amount, invoice.currency)}
                  </Text>
                </View>
              ))}
            </>
          ) : invoice.taxAmount > 0 ? (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tax:</Text>
              <Text style={styles.totalValue}>
                {formatCurrency(invoice.taxAmount, invoice.currency)}
              </Text>
            </View>
          ) : null}
          
          <View style={styles.grandTotal}>
            <Text>TOTAL:</Text>
            <Text>{formatCurrency(invoice.total, invoice.currency)}</Text>
          </View>
        </View>

        {/* Bank Details */}
        {(invoice.bankName || invoice.accountNumber || invoice.accountName) && (
          <View style={styles.bankDetailsSection}>
            <Text style={styles.bankDetailsTitle}>PAYMENT DETAILS:</Text>
            <View style={styles.bankDetailsText}>
              {invoice.bankName && <Text>Bank: {invoice.bankName}</Text>}
              {invoice.accountNumber && <Text>Account Number: {invoice.accountNumber}</Text>}
              {invoice.accountName && <Text>Account Name: {invoice.accountName}</Text>}
            </View>
          </View>
        )}

        {/* Notes & Terms */}
        {(invoice.notes || invoice.terms) && (
          <View style={styles.notesSection}>
            {invoice.notes && (
              <View style={{ marginBottom: 15 }}>
                <Text style={styles.notesTitle}>NOTES:</Text>
                <Text style={styles.notesText}>{invoice.notes}</Text>
              </View>
            )}
            {invoice.terms && (
              <View>
                <Text style={styles.notesTitle}>TERMS & CONDITIONS:</Text>
                <Text style={styles.notesText}>{invoice.terms}</Text>
              </View>
            )}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Thank you for your business!</Text>
        </View>
      </Page>
    </Document>
  );
};

export default TemplatedInvoicePDF;

// Receipt Data Interface
interface ReceiptData {
  receiptNumber: string;
  issueDate: string;
  companyName: string;
  companyEmail?: string;
  companyPhone?: string;
  companyAddress?: string;
  companyLogo?: string | null;
  bankName?: string | null;
  accountNumber?: string | null;
  accountName?: string | null;
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
  amount: number;
  paymentMethod?: string;
  reference?: string | null;
  notes?: string | null;
  currency?: string;
  template?: string; // Template slug
}

// Templated Receipt PDF Component
export const TemplatedReceiptPDF = ({ receipt }: { receipt: ReceiptData }) => {
  const colors = getTemplateColors(receipt.template);
  const styles = createTemplateStyles(colors);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Paid Stamp */}
        <View style={styles.paidStamp}>
          <Text>PAID</Text>
        </View>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              {receipt.companyLogo && (
                <Image
                  src={receipt.companyLogo}
                  style={{ width: 50, height: 50, objectFit: 'contain' as const, marginBottom: 5 }}
                />
              )}
              <Text style={styles.companyName}>{receipt.companyName}</Text>
              <View style={styles.companyInfo}>
                {receipt.companyEmail && <Text>{receipt.companyEmail}</Text>}
                {receipt.companyPhone && <Text>{receipt.companyPhone}</Text>}
                {receipt.companyAddress && <Text>{receipt.companyAddress}</Text>}
              </View>
            </View>
            <View>
              <Text style={styles.invoiceTitle}>RECEIPT</Text>
              <Text style={styles.invoiceNumber}>{receipt.receiptNumber}</Text>
            </View>
          </View>
        </View>

        {/* Customer & Date Info */}
        <View style={[styles.section, styles.row]}>
          <View style={styles.billToBox}>
            <Text style={styles.billToTitle}>RECEIVED FROM:</Text>
            <Text style={styles.billToName}>{receipt.customer.name}</Text>
            {receipt.customer.company && (
              <Text style={styles.billToInfo}>{receipt.customer.company}</Text>
            )}
            {receipt.customer.email && (
              <Text style={styles.billToInfo}>{receipt.customer.email}</Text>
            )}
            {receipt.customer.address && (
              <View style={styles.billToInfo}>
                <Text>{receipt.customer.address}</Text>
                <Text>
                  {[
                    receipt.customer.city,
                    receipt.customer.state,
                    receipt.customer.postalCode,
                  ]
                    .filter(Boolean)
                    .join(', ')}
                </Text>
                {receipt.customer.country && <Text>{receipt.customer.country}</Text>}
              </View>
            )}
          </View>

          <View style={styles.datesBox}>
            <View style={styles.dateRow}>
              <Text style={styles.dateLabel}>Receipt Date:</Text>
              <Text style={styles.dateValue}>{formatDate(receipt.issueDate)}</Text>
            </View>
            {receipt.paymentMethod && (
              <View style={styles.dateRow}>
                <Text style={styles.dateLabel}>Payment Method:</Text>
                <Text style={styles.dateValue}>{receipt.paymentMethod}</Text>
              </View>
            )}
            {receipt.reference && (
              <View style={styles.dateRow}>
                <Text style={styles.dateLabel}>Reference:</Text>
                <Text style={styles.dateValue}>{receipt.reference}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Amount Section */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colDescription}>Description</Text>
            <Text style={styles.colTotal}>Amount</Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.colDescription}>Payment Received</Text>
            <Text style={styles.colTotal}>
              {formatCurrency(receipt.amount, receipt.currency)}
            </Text>
          </View>
        </View>

        {/* Total */}
        <View style={styles.totalsBox}>
          <View style={styles.grandTotal}>
            <Text>TOTAL PAID:</Text>
            <Text>{formatCurrency(receipt.amount, receipt.currency)}</Text>
          </View>
        </View>

        {/* Bank Details */}
        {(receipt.bankName || receipt.accountNumber || receipt.accountName) && (
          <View style={styles.bankDetailsSection}>
            <Text style={styles.bankDetailsTitle}>PAYMENT DETAILS:</Text>
            <View style={styles.bankDetailsText}>
              {receipt.bankName && <Text>Bank: {receipt.bankName}</Text>}
              {receipt.accountNumber && <Text>Account Number: {receipt.accountNumber}</Text>}
              {receipt.accountName && <Text>Account Name: {receipt.accountName}</Text>}
            </View>
          </View>
        )}

        {/* Notes */}
        {receipt.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.notesTitle}>NOTES:</Text>
            <Text style={styles.notesText}>{receipt.notes}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Thank you for your payment!</Text>
        </View>
      </Page>
    </Document>
  );
};
