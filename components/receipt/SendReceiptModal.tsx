'use client';

import { useState } from 'react';
import { X, Mail, MessageCircle, ExternalLink } from 'lucide-react';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';

interface SendReceiptModalProps {
  isOpen: boolean;
  receiptId: string;
  receiptNumber: string;
  customerEmail: string | null;
  customerPhone: string | null;
  customerName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function SendReceiptModal({
  isOpen,
  receiptId,
  receiptNumber,
  customerEmail,
  customerPhone,
  customerName,
  onClose,
  onSuccess,
}: SendReceiptModalProps) {
  const [method, setMethod] = useState<'email' | 'whatsapp'>('email');
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [whatsappLink, setWhatsappLink] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setWhatsappLink(null);

    const recipient = to || (method === 'email' ? customerEmail : customerPhone);

    if (!recipient) {
      setError(`${method === 'email' ? 'Email' : 'Phone number'} is required`);
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch(`/api/receipts/${receiptId}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          method,
          to: recipient,
          subject: subject || undefined,
          message: message || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send receipt');
      }

      // If WhatsApp link mode, show the link
      if (data.whatsappLink) {
        setWhatsappLink(data.whatsappLink);
        onSuccess();
      } else {
        // Email or WhatsApp API sent successfully
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWhatsAppLinkClick = () => {
    if (whatsappLink) {
      window.open(whatsappLink, '_blank');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Send Receipt</h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Receipt Summary */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Receipt:</span>
            <span className="font-semibold text-gray-900">{receiptNumber}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Customer:</span>
            <span className="font-semibold text-gray-900">{customerName}</span>
          </div>
        </div>

        {whatsappLink ? (
          // WhatsApp link generated - show link
          <div className="space-y-4">
            <Alert variant="success">
              WhatsApp link generated successfully! Click the button below to open WhatsApp and send the receipt.
            </Alert>
            <Button
              onClick={handleWhatsAppLinkClick}
              className="w-full"
              variant="primary"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open WhatsApp
            </Button>
            <Button
              onClick={onClose}
              className="w-full"
              variant="outline"
            >
              Close
            </Button>
          </div>
        ) : (
          // Send form
          <>
            {error && (
              <Alert variant="error" className="mb-4">
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Send Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Send via
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setMethod('email')}
                    disabled={isLoading}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors ${
                      method === 'email'
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-300 hover:border-gray-400'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <Mail className="w-5 h-5" />
                    <span className="font-medium">Email</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMethod('whatsapp')}
                    disabled={isLoading}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors ${
                      method === 'whatsapp'
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-300 hover:border-gray-400'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span className="font-medium">WhatsApp</span>
                  </button>
                </div>
              </div>

              {/* Recipient */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {method === 'email' ? 'Email Address' : 'Phone Number'}
                </label>
                <input
                  type={method === 'email' ? 'email' : 'tel'}
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  placeholder={
                    method === 'email'
                      ? customerEmail || 'Enter email address'
                      : customerPhone || 'Enter phone number'
                  }
                  disabled={isLoading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                {method === 'email' && customerEmail && (
                  <p className="text-xs text-gray-500 mt-1">
                    Default: {customerEmail}
                  </p>
                )}
                {method === 'whatsapp' && customerPhone && (
                  <p className="text-xs text-gray-500 mt-1">
                    Default: {customerPhone}
                  </p>
                )}
              </div>

              {/* Subject (Email only) */}
              {method === 'email' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject (Optional)
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Leave empty for default subject"
                    disabled={isLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>
              )}

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message (Optional)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Add a custom message"
                  disabled={isLoading}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isLoading}
                >
                  {method === 'email' ? (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Send Email
                    </>
                  ) : (
                    <>
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Send WhatsApp
                    </>
                  )}
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
