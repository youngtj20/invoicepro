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
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    backgroundColor: '#FFFFFF',
  },
  header: {
    marginBottom: 30,
    borderBottom: `2 solid ${colors.primary}`,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  logo: {
    width: 80,
    height: 80,
    objectFit: 'contain',
    marginBottom: 10,
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
  },
  companyInfo: {
    fontSize: 9,
    color: '#666',
    lineHeight: 1.4,
  },
  invoiceTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 10,
    textAlign: 'right',
  },
  invoiceNumber: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  section: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  billToBox: {
    backgroundColor: colors.background,
    padding: 15,
    borderRadius: 4,
    width: '48%',
  },
  billToTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
  },
  billToName: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  billToInfo: {
    fontSize: 9,
    color: '#666',
    lineHeight: 1.4,
  },
  datesBox: {
    width: '48%',
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dateLabel: {
    fontSize: 9,
    color: '#666',
  },
  dateValue: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  table: {
    marginTop: 20,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    color: '#fff',
    padding: 10,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1 solid #E5E7EB',
    padding: 10,
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
    paddingVertical: 6,
  },
  totalLabel: {
    fontSize: 10,
  },
  totalValue: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  grandTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.primary,
    color: '#fff',
    padding: 12,
    marginTop: 8,
    fontWeight: 'bold',
    fontSize: 14,
  },
  bankDetailsSection: {
    marginTop: 20,
    padding: 12,
    backgroundColor: colors.background,
    borderRadius: 4,
    borderLeft: `4 solid ${colors.primary}`,
  },
  bankDetailsTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 6,
  },
  bankDetailsText: {
    fontSize: 9,
    color: '#666',
    lineHeight: 1.4,
  },
  notesSection: {
    marginTop: 30,
    paddingTop: 20,
    borderTop: '1 solid #E5E7EB',
  },
  notesTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 6,
  },
  notesText: {
    fontSize: 9,
    color: '#666',
    lineHeight: 1.4,
  },
  footer: {
    marginTop: 40,
    paddingTop: 20,
    borderTop: `2 solid ${colors.primary}`,
    textAlign: 'center',
    fontSize: 9,
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
  switch (template) {
    case 'modern':
      return TEMPLATE_COLORS.modern;
    case 'elegant':
      return TEMPLATE_COLORS.elegant;
    case 'professional':
      return TEMPLATE_COLORS.professional;
    case 'minimal':
      return TEMPLATE_COLORS.minimal;
    case 'classic':
    default:
      return TEMPLATE_COLORS.classic;
  }
};

// Main Invoice PDF Component with Template Support
export const TemplatedInvoicePDF = ({ invoice }: { invoice: InvoiceData }) => {
  const colors = getTemplateColors(invoice.template);
  const styles = createTemplateStyles(colors);

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
                  style={styles.logo}
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
          {invoice.taxAmount > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tax:</Text>
              <Text style={styles.totalValue}>
                {formatCurrency(invoice.taxAmount, invoice.currency)}
              </Text>
            </View>
          )}
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
