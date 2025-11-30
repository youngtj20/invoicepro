import axios from 'axios';

const PAYSTACK_API_BASE = 'https://api.paystack.co';

const paystackClient = axios.create({
  baseURL: PAYSTACK_API_BASE,
  headers: {
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    'Content-Type': 'application/json',
  },
});

export interface PaystackInitializeResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
    status: string;
    reference: string;
    amount: number;
    currency: string;
    customer: {
      email: string;
      customer_code: string;
    };
    metadata: any;
  };
}

export class PaystackService {
  // Initialize a payment transaction
  static async initializeTransaction(params: {
    email: string;
    amount: number; // Amount in kobo (smallest currency unit)
    reference?: string;
    metadata?: any;
    callback_url?: string;
  }): Promise<PaystackInitializeResponse> {
    try {
      const response = await paystackClient.post('/transaction/initialize', params);
      return response.data;
    } catch (error: any) {
      console.error('Paystack initialization error:', error.response?.data || error.message);
      throw new Error('Failed to initialize payment');
    }
  }

  // Verify a transaction
  static async verifyTransaction(reference: string): Promise<PaystackVerifyResponse> {
    try {
      const response = await paystackClient.get(`/transaction/verify/${reference}`);
      return response.data;
    } catch (error: any) {
      console.error('Paystack verification error:', error.response?.data || error.message);
      throw new Error('Failed to verify payment');
    }
  }

  // Create a payment link for invoices
  static async createPaymentPage(params: {
    name: string;
    description: string;
    amount: number;
    metadata?: any;
  }): Promise<{ url: string; reference: string }> {
    try {
      const response = await paystackClient.post('/page', params);
      return {
        url: response.data.data.slug,
        reference: response.data.data.slug,
      };
    } catch (error: any) {
      console.error('Paystack page creation error:', error.response?.data || error.message);
      throw new Error('Failed to create payment page');
    }
  }

  // Convert amount to kobo (smallest currency unit for NGN)
  static toKobo(amount: number): number {
    return Math.round(amount * 100);
  }

  // Convert kobo to naira
  static fromKobo(kobo: number): number {
    return kobo / 100;
  }

  // Verify webhook signature
  static verifyWebhookSignature(payload: string, signature: string): boolean {
    const crypto = require('crypto');
    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)
      .update(payload)
      .digest('hex');
    return hash === signature;
  }

  // Generate a unique payment reference
  static generateReference(prefix: string = 'PAY'): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}-${timestamp}-${random}`;
  }

  // Format currency amount
  static formatAmount(amount: number, currency: string = 'NGN'): string {
    return `${currency} ${amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
}

export default PaystackService;
