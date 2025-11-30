'use client';

import { useState } from 'react';
import { X, Send, MessageCircle, Download } from 'lucide-react';
import Button from '@/components/ui/Button';

interface SendWhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceId: string;
  invoiceNumber: string;
  customerName: string;
  customerPhone?: string | null;
}

export default function SendWhatsAppModal({
  isOpen,
  onClose,
  invoiceId,
  invoiceNumber,
  customerName,
  customerPhone,
}: SendWhatsAppModalProps) {
  const [phoneNumber, setPhoneNumber] = useState(customerPhone || '');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!phoneNumber.trim()) {
      setError('Phone number is required');
      return;
    }

    try {
      setIsSending(true);
      setError('');
      setSuccess('');

      const response = await fetch(`/api/invoices/${invoiceId}/whatsapp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send via WhatsApp');
      }

      // Check if sent via API or manual method
      if (data.method === 'api') {
        // Successfully sent via WhatsApp Business API
        setSuccess('✅ Invoice sent successfully! The PDF has been delivered to the customer on WhatsApp.');

        // Close modal after showing success
        setTimeout(() => {
          onClose();
        }, 3000);
      } else {
        // Manual method - download PDF and open WhatsApp
        if (data.pdfBase64) {
          const pdfBlob = base64toBlob(data.pdfBase64, 'application/pdf');
          const pdfUrl = URL.createObjectURL(pdfBlob);
          const downloadLink = document.createElement('a');
          downloadLink.href = pdfUrl;
          downloadLink.download = data.fileName;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
          URL.revokeObjectURL(pdfUrl);

          // Small delay to ensure download starts
          await new Promise(resolve => setTimeout(resolve, 500));

          // Open WhatsApp
          if (data.whatsappUrl) {
            window.open(data.whatsappUrl, '_blank');
          }

          setSuccess('PDF downloaded! WhatsApp opened. Please attach the downloaded PDF manually.');

          // Close modal after a short delay
          setTimeout(() => {
            onClose();
          }, 3000);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send via WhatsApp');
    } finally {
      setIsSending(false);
    }
  };

  // Helper function to convert base64 to blob
  const base64toBlob = (base64: string, type: string) => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type });
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                Send via WhatsApp
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                {success}
              </div>
            )}

            <div>
              <p className="text-sm text-gray-600 mb-4">
                Send invoice <strong>{invoiceNumber}</strong> to{' '}
                <strong>{customerName}</strong> via WhatsApp.
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <div className="flex gap-2">
                  <Download className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">How it works:</p>
                    <ol className="list-decimal list-inside space-y-1 text-xs">
                      <li>Invoice PDF will be downloaded to your device</li>
                      <li>WhatsApp will open with a pre-filled message</li>
                      <li>Attach the downloaded PDF to the WhatsApp chat</li>
                      <li>Send the message to your customer</li>
                    </ol>
                  </div>
                </div>
              </div>

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer Phone Number
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="e.g., +2348012345678"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Include country code (e.g., +234 for Nigeria)
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
            <Button variant="outline" onClick={onClose} disabled={isSending}>
              Cancel
            </Button>
            <Button
              onClick={handleSend}
              isLoading={isSending}
              className="bg-green-600 hover:bg-green-700"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Open WhatsApp
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
