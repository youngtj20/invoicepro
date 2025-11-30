import axios from 'axios';

export interface SendWhatsAppParams {
  to: string;
  message: string;
  documentUrl?: string;
  documentFilename?: string;
  documentBase64?: string; // NEW: Support for base64 encoded documents
}

export interface WhatsAppAPIResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export class WhatsAppService {
  // Primary method: Generate wa.me link
  static generateWhatsAppLink(params: SendWhatsAppParams): string {
    // Remove any non-digit characters from phone number
    const phone = params.to.replace(/\D/g, '');

    // Ensure phone number starts with country code (assume Nigeria +234 if not present)
    const phoneWithCountryCode = phone.startsWith('234') ? phone : `234${phone.replace(/^0/, '')}`;

    // URL encode the message
    const encodedMessage = encodeURIComponent(params.message);

    return `https://wa.me/${phoneWithCountryCode}?text=${encodedMessage}`;
  }

  /**
   * Check if WhatsApp Business Cloud API is configured
   */
  static isAPIConfigured(): boolean {
    return (
      process.env.WHATSAPP_API_ENABLED === 'true' &&
      !!process.env.WHATSAPP_PHONE_NUMBER_ID &&
      !!process.env.WHATSAPP_ACCESS_TOKEN
    );
  }

  /**
   * Upload media (PDF/Image) to WhatsApp servers and get media ID
   */
  static async uploadMedia(base64Data: string, mimeType: string, filename: string): Promise<string> {
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const apiVersion = process.env.WHATSAPP_API_VERSION || 'v18.0';

    // Convert base64 to buffer
    const buffer = Buffer.from(base64Data, 'base64');

    // Create form data
    const FormData = require('form-data');
    const formData = new FormData();
    formData.append('file', buffer, {
      filename,
      contentType: mimeType,
    });
    formData.append('messaging_product', 'whatsapp');
    formData.append('type', mimeType);

    try {
      const response = await axios.post(
        `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/media`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      return response.data.id; // Returns media ID
    } catch (error: any) {
      console.error('WhatsApp media upload error:', error.response?.data || error.message);
      throw new Error(`Failed to upload media to WhatsApp: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Send document (PDF) via WhatsApp Business Cloud API
   */
  static async sendDocument(params: {
    to: string;
    documentBase64: string;
    filename: string;
    caption?: string;
  }): Promise<WhatsAppAPIResponse> {
    if (!this.isAPIConfigured()) {
      throw new Error('WhatsApp Business API is not configured');
    }

    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const apiVersion = process.env.WHATSAPP_API_VERSION || 'v18.0';

    try {
      // Step 1: Upload the document and get media ID
      console.log('Uploading document to WhatsApp...');
      const mediaId = await this.uploadMedia(
        params.documentBase64,
        'application/pdf',
        params.filename
      );

      console.log('Media uploaded, ID:', mediaId);

      // Step 2: Format phone number (remove + and spaces)
      const to = params.to.replace(/[\s\+\-\(\)]/g, '');

      // Step 3: Send the document via WhatsApp
      const payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'document',
        document: {
          id: mediaId,
          filename: params.filename,
          caption: params.caption || '',
        },
      };

      console.log('Sending document via WhatsApp to:', to);

      const response = await axios.post(
        `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      console.log('WhatsApp send success:', response.data);

      return {
        success: true,
        messageId: response.data.messages?.[0]?.id,
      };
    } catch (error: any) {
      console.error('WhatsApp send document error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message,
      };
    }
  }

  // Advanced method: Send via WhatsApp Business API (if configured)
  static async sendViaAPI(params: SendWhatsAppParams): Promise<boolean> {
    if (!this.isAPIConfigured()) {
      console.warn('WhatsApp Business API is not enabled or configured');
      return false;
    }

    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const apiVersion = process.env.WHATSAPP_API_VERSION || 'v18.0';

    try {
      // Format phone number
      const to = params.to.replace(/[\s\+\-\(\)]/g, '');

      // If base64 document is provided, use the new sendDocument method
      if (params.documentBase64 && params.documentFilename) {
        const result = await this.sendDocument({
          to: params.to,
          documentBase64: params.documentBase64,
          filename: params.documentFilename,
          caption: params.message,
        });
        return result.success;
      }

      // If document URL is provided, send as document message
      if (params.documentUrl && params.documentFilename) {
        const response = await axios.post(
          `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`,
          {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to,
            type: 'document',
            document: {
              link: params.documentUrl,
              caption: params.message,
              filename: params.documentFilename,
            },
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          }
        );
        return response.status === 200;
      }

      // Otherwise, send as text message
      const response = await axios.post(
        `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to,
          type: 'text',
          text: {
            body: params.message,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.status === 200;
    } catch (error) {
      console.error('WhatsApp API sending error:', error);
      return false;
    }
  }

  static generateInvoiceMessage(params: {
    customerName: string;
    invoiceNumber: string;
    amount: string;
    viewLink: string;
    companyName: string;
  }): string {
    return `Hi ${params.customerName},

You have received a new invoice from *${params.companyName}*.

📄 Invoice: #${params.invoiceNumber}
💰 Amount: ${params.amount}

View your invoice here: ${params.viewLink}

Thank you for your business!`;
  }
}

export default WhatsAppService;
