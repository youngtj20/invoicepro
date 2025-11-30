import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image,
} from '@react-pdf/renderer';

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
}

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 30,
    borderBottom: '2 solid #2563EB',
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563EB',
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
    color: '#2563EB',
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
    backgroundColor: '#EFF6FF',
    padding: 15,
    borderRadius: 4,
    width: '48%',
  },
  billToTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#2563EB',
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
    backgroundColor: '#2563EB',
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
    backgroundColor: '#2563EB',
    color: '#fff',
    padding: 12,
    marginTop: 8,
    fontWeight: 'bold',
    fontSize: 14,
  },
  notesSection: {
    marginTop: 30,
    paddingTop: 20,
    borderTop: '1 solid #E5E7EB',
  },
  notesTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#2563EB',
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
    borderTop: '2 solid #2563EB',
    textAlign: 'center',
    fontSize: 9,
    color: '#666',
  },
  paidStamp: {
    position: 'absolute',
    top: 120,
    right: 80,
    transform: 'rotate(12deg)',
    border: '4 solid #059669',
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
    border: '4 solid #DC2626',
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
    border: '4 solid #F59E0B',
    color: '#F59E0B',
    fontSize: 32,
    fontWeight: 'bold',
    padding: '12 24',
    opacity: 0.5,
    zIndex: 10,
  },
  logo: {
    width: 60,
    height: 60,
    objectFit: 'contain',
    marginBottom: 8,
  },
  bankDetailsSection: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
  },
  bankDetailsTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#2563EB',
    marginBottom: 6,
  },
  bankDetailsText: {
    fontSize: 9,
    color: '#666',
    lineHeight: 1.4,
  },
});

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
const formatCurrency = (amount: number, currency: string = 'NGN') => {
  return `${currency} ${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

// Get stamp style based on payment status
const getStampStyle = (paymentStatus?: string) => {
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

// PDF Document Component
export const InvoicePDF = ({ invoice }: { invoice: InvoiceData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Payment Status Stamp */}
      <View style={getStampStyle(invoice.paymentStatus)}>
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

export default InvoicePDF;

// Receipt PDF Component
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
}

export const ReceiptPDF = ({ receipt }: { receipt: ReceiptData }) => (
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
                style={styles.logo}
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
            <Text style={styles.dateValue}>
              {new Date(receipt.issueDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
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
          <View style={styles.colDescription}>
            <Text>Description</Text>
          </View>
          <View style={styles.colTotal}>
            <Text style={{ textAlign: 'right' }}>Amount</Text>
          </View>
        </View>

        <View style={[styles.tableRow]}>
          <View style={styles.colDescription}>
            <Text>Payment Received</Text>
          </View>
          <View style={styles.colTotal}>
            <Text style={{ textAlign: 'right', fontWeight: 'bold' }}>
              {receipt.currency || 'NGN'} {receipt.amount.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
          </View>
        </View>
      </View>

      {/* Total */}
      <View style={[styles.section, { alignItems: 'flex-end' }]}>
        <View style={{ width: '40%' }}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TOTAL PAID:</Text>
            <Text style={styles.totalValue}>
              {receipt.currency || 'NGN'} {receipt.amount.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
          </View>
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
        <View style={styles.section}>
          <View style={styles.notesSection}>
            <Text style={styles.notesTitle}>Notes:</Text>
            <Text style={styles.notesText}>{receipt.notes}</Text>
          </View>
        </View>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <Text>Thank you for your payment!</Text>
      </View>
    </Page>
  </Document>
);
