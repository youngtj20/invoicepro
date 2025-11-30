import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

export class EmailService {
  static async sendEmail(params: SendEmailParams): Promise<boolean> {
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: params.to,
        subject: params.subject,
        html: params.html,
        text: params.text || params.html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
        attachments: params.attachments,
      });
      return true;
    } catch (error) {
      console.error('Email sending error:', error);
      return false;
    }
  }

  static generateInvoiceEmail(params: {
    customerName: string;
    invoiceNumber: string;
    amount: string;
    dueDate: string;
    viewLink: string;
    companyName: string;
  }): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #0ea5e9; color: white; padding: 20px; text-align: center; }
            .content { background: #f9fafb; padding: 30px; }
            .invoice-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
            .detail-row { display: flex; justify-content: space-between; margin: 10px 0; }
            .button {
              display: inline-block;
              background: #0ea5e9;
              color: white;
              padding: 12px 30px;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
            }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>New Invoice from ${params.companyName}</h1>
            </div>
            <div class="content">
              <p>Dear ${params.customerName},</p>
              <p>You have received a new invoice from ${params.companyName}.</p>

              <div class="invoice-details">
                <div class="detail-row">
                  <strong>Invoice Number:</strong>
                  <span>${params.invoiceNumber}</span>
                </div>
                <div class="detail-row">
                  <strong>Amount:</strong>
                  <span>${params.amount}</span>
                </div>
                <div class="detail-row">
                  <strong>Due Date:</strong>
                  <span>${params.dueDate}</span>
                </div>
              </div>

              <center>
                <a href="${params.viewLink}" class="button">View Invoice</a>
              </center>

              <p>If you have any questions about this invoice, please contact ${params.companyName}.</p>
            </div>
            <div class="footer">
              <p>This email was sent by ${params.companyName} using InvoicePro.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}

export default EmailService;
