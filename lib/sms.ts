import axios from 'axios';

const TERMII_API_BASE = 'https://api.ng.termii.com/api';

export interface SendSMSParams {
  to: string;
  message: string;
}

export class SMSService {
  static async sendSMS(params: SendSMSParams): Promise<boolean> {
    const provider = process.env.SMS_PROVIDER || 'termii';

    if (provider === 'termii') {
      return this.sendViaTermii(params);
    }

    throw new Error(`Unsupported SMS provider: ${provider}`);
  }

  private static async sendViaTermii(params: SendSMSParams): Promise<boolean> {
    try {
      const response = await axios.post(`${TERMII_API_BASE}/sms/send`, {
        to: params.to,
        from: process.env.TERMII_SENDER_ID,
        sms: params.message,
        type: 'plain',
        channel: 'generic',
        api_key: process.env.TERMII_API_KEY,
      });

      return response.data.message_id ? true : false;
    } catch (error) {
      console.error('SMS sending error:', error);
      return false;
    }
  }

  static generateInvoiceSMS(params: {
    customerName: string;
    invoiceNumber: string;
    amount: string;
    viewLink: string;
    companyName: string;
  }): string {
    return `Hi ${params.customerName}, you have a new invoice #${params.invoiceNumber} for ${params.amount} from ${params.companyName}. View: ${params.viewLink}`;
  }
}

export default SMSService;
