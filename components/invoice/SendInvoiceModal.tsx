'use client';

import { useState } from 'react';
import { X, Send, Mail, MessageSquare, AlertCircle, MessageCircle, Phone } from 'lucide-react';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';

interface SendInvoiceModalProps {
  invoiceId: string;
  invoiceNumber: string;
  customerEmail: string | null;
  customerPhone: string | null;
  customerName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function SendInvoiceModal({
  invoiceId,
  invoiceNumber,
  customerEmail,
  customerPhone,
  customerName,
  isOpen,
  onClose,
  onSuccess,
}: SendInvoiceModalProps) {
  const [activeTab, setActiveTab] = useState<'email' | 'sms' | 'whatsapp'>('email');
  const [email, setEmail] = useState(customerEmail || '');
  const [phone, setPhone] = useState(customerPhone || '');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [whatsappLink, setWhatsappLink] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setWhatsappLink('');

    // Validate based on method
    if (activeTab === 'email' && !email) {
      setError('Email address is required');
      return;
    }
    if ((activeTab === 'sms' || activeTab === 'whatsapp') && !phone) {
      setError('Phone number is required');
      return;
    }

    try {
      setIsSending(true);

      const response = await fetch(`/api/invoices/${invoiceId}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          method: activeTab,
          to: activeTab === 'email' ? email : phone,
          subject: activeTab === 'email' ? (subject || undefined) : undefined,
          message: message || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send invoice');
      }

      // Handle WhatsApp link generation
      if (activeTab === 'whatsapp' && data.whatsappLink) {
        setWhatsappLink(data.whatsappLink);
        setSuccess('WhatsApp link generated! Click the button below to send.');
        // Don't auto-close for WhatsApp
        return;
      }

      setSuccess(data.message || 'Invoice sent successfully!');

      // Call success callback after a short delay to show success message
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        }
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSending(false);
    }
  };

  const handleClose = () => {
    if (!isSending) {
      setError('');
      setSuccess('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <Send className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Send Invoice</h2>
              <p className="text-sm text-gray-600">Invoice {invoiceNumber}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isSending}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex gap-2 px-6">
            <button
              type="button"
              onClick={() => setActiveTab('email')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === 'email'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Mail className="w-4 h-4" />
              Email
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('sms')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === 'sms'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              SMS
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('whatsapp')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === 'whatsapp'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Error Alert */}
          {error && (
            <Alert variant="error" className="mb-4">
              {error}
            </Alert>
          )}

          {/* Success Alert */}
          {success && (
            <Alert variant="success" className="mb-4">
              {success}
            </Alert>
          )}

          {/* WhatsApp Link Button */}
          {whatsappLink && (
            <div className="mb-4">
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                Open WhatsApp to Send
              </a>
            </div>
          )}

          {/* Email Tab Content */}
          {activeTab === 'email' && (
            <>
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Recipient Email
                  </div>
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="customer@example.com"
                  required
                  disabled={isSending}
                />
                {customerEmail && email === customerEmail && (
                  <p className="text-xs text-gray-500 mt-1">
                    Sending to customer's email address
                  </p>
                )}
              </div>

              <div className="mb-4">
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  Subject (Optional)
                </label>
                <input
                  type="text"
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder={`Invoice ${invoiceNumber} from [Your Company]`}
                  disabled={isSending}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave blank to use default subject line
                </p>
              </div>
            </>
          )}

          {/* SMS Tab Content */}
          {activeTab === 'sms' && (
            <div className="mb-4">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Recipient Phone Number
                </div>
              </label>
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="+234 XXX XXX XXXX"
                required
                disabled={isSending}
              />
              {customerPhone && phone === customerPhone && (
                <p className="text-xs text-gray-500 mt-1">
                  Sending to customer's phone number
                </p>
              )}
            </div>
          )}

          {/* WhatsApp Tab Content */}
          {activeTab === 'whatsapp' && (
            <div className="mb-4">
              <label htmlFor="whatsapp-phone" className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Recipient Phone Number
                </div>
              </label>
              <input
                type="tel"
                id="whatsapp-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="+234 XXX XXX XXXX"
                required
                disabled={isSending}
              />
              {customerPhone && phone === customerPhone && (
                <p className="text-xs text-gray-500 mt-1">
                  Sending to customer's WhatsApp number
                </p>
              )}
            </div>
          )}

          {/* Message Field */}
          <div className="mb-6">
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Custom Message (Optional)
              </div>
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              placeholder="Add a personal message to include in the email..."
              disabled={isSending}
            />
            <p className="text-xs text-gray-500 mt-1">
              This message will be included in the email body
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">What will be sent:</p>
                <ul className="list-disc list-inside space-y-1 text-blue-700">
                  <li>Professional email with invoice details</li>
                  <li>PDF attachment of the invoice</li>
                  <li>Your custom message (if provided)</li>
                  <li>Status will be updated to "Sent"</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Preview Email Recipients */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm font-medium text-gray-700 mb-2">Email Preview:</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">To:</span>
                <span className="font-medium text-gray-900">{email || 'Not specified'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Subject:</span>
                <span className="font-medium text-gray-900">
                  {subject || `Invoice ${invoiceNumber} from [Your Company]`}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Attachment:</span>
                <span className="font-medium text-gray-900">{invoiceNumber}.pdf</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSending}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSending}>
              <Send className="w-4 h-4 mr-2" />
              {isSending ? 'Sending...' : 'Send Invoice'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
