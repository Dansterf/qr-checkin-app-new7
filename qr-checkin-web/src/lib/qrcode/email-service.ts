import nodemailer from 'nodemailer';
import { QRCode } from '../db/types';

// Configure email transport
// Note: For production, you would use actual SMTP credentials
const transporter = nodemailer.createTransport({
  host: 'smtp.example.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: 'user@example.com',
    pass: 'password',
  },
  // For development/testing, uncomment this to prevent actual email sending
  tls: {
    rejectUnauthorized: false
  }
});

/**
 * Sends a QR code to a customer via email
 * @param customerEmail The email address of the customer
 * @param customerName The name of the customer
 * @param qrCodeDataUrl The QR code image as a data URL
 * @param qrCodeValue The value encoded in the QR code
 * @returns Promise resolving when email is sent
 */
export async function sendQRCodeEmail(
  customerEmail: string,
  customerName: string,
  qrCodeDataUrl: string,
  qrCodeValue: string
): Promise<void> {
  try {
    // Create email content with embedded QR code
    const mailOptions = {
      from: '"Tutoring Program" <noreply@tutoringprogram.com>',
      to: customerEmail,
      subject: 'Your Tutoring Program QR Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Your Tutoring Program QR Code</h2>
          <p>Dear ${customerName},</p>
          <p>Thank you for registering with our tutoring program. Please find your unique QR code below.</p>
          <p>Present this QR code when you bring your child to their tutoring session.</p>
          <div style="text-align: center; margin: 30px 0;">
            <img src="${qrCodeDataUrl}" alt="QR Code" style="max-width: 300px; height: auto;" />
          </div>
          <p>Your unique code: <strong>${qrCodeValue}</strong></p>
          <p>You can either print this email or show it on your mobile device when you arrive.</p>
          <p>If you have any questions, please contact our support team.</p>
          <p>Best regards,<br>Tutoring Program Team</p>
        </div>
      `,
      attachments: [
        {
          filename: 'qrcode.png',
          content: qrCodeDataUrl.split(';base64,').pop(),
          encoding: 'base64',
        },
      ],
    };

    // Send the email
    await transporter.sendMail(mailOptions);
    console.log(`QR code email sent to ${customerEmail}`);
  } catch (error) {
    console.error('Error sending QR code email:', error);
    throw new Error('Failed to send QR code email');
  }
}

/**
 * Processes QR code distribution for a customer
 * @param customerId The ID of the customer
 * @param customerEmail The email address of the customer
 * @param customerName The name of the customer
 * @param qrCode The QR code object
 * @returns Promise resolving when QR code is distributed
 */
export async function distributeQRCode(
  customerId: number,
  customerEmail: string,
  customerName: string,
  qrCode: QRCode
): Promise<void> {
  try {
    // Import the QR code generation function
    const { generateQRCodeImage } = await import('./qrcode-service');
    
    // Generate QR code image
    const qrCodeDataUrl = await generateQRCodeImage(qrCode.code_value);
    
    // Send QR code via email
    await sendQRCodeEmail(customerEmail, customerName, qrCodeDataUrl, qrCode.code_value);
    
    console.log(`QR code distributed to customer ${customerId}`);
  } catch (error) {
    console.error('Error distributing QR code:', error);
    throw new Error('Failed to distribute QR code');
  }
}
