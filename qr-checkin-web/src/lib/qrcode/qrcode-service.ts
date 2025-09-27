import { QRCode } from '../db/types';
import QRCodeGenerator from 'qrcode';

/**
 * Generates a unique QR code value for a customer
 * @returns A unique string to be used as QR code value
 */
export async function generateUniqueQRCodeValue(): Promise<string> {
  // Generate a random string with timestamp to ensure uniqueness
  const timestamp = new Date().getTime();
  const randomPart = Math.random().toString(36).substring(2, 15);
  return `QR-${timestamp}-${randomPart}`;
}

/**
 * Generates a QR code image as a data URL
 * @param codeValue The value to encode in the QR code
 * @returns Promise resolving to a data URL containing the QR code image
 */
export async function generateQRCodeImage(codeValue: string): Promise<string> {
  try {
    const qrCodeDataUrl = await QRCodeGenerator.toDataURL(codeValue, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    });
    return qrCodeDataUrl;
  } catch (error) {
    console.error('Error generating QR code image:', error);
    throw new Error('Failed to generate QR code image');
  }
}

/**
 * Creates a new QR code for a customer
 * @param customerId The ID of the customer
 * @param db Database context
 * @returns The created QR code object
 */
export async function createQRCodeForCustomer(
  customerId: number,
  db: any
): Promise<QRCode> {
  try {
    // Generate a unique code value
    const codeValue = await generateUniqueQRCodeValue();
    
    // Check if customer already has a QR code
    const existingQRCode = await db.prepare(
      'SELECT * FROM qr_codes WHERE customer_id = ?'
    ).bind(customerId).first();
    
    if (existingQRCode) {
      // Update existing QR code
      await db.prepare(
        'UPDATE qr_codes SET code_value = ?, is_active = TRUE, updated_at = CURRENT_TIMESTAMP WHERE customer_id = ?'
      ).bind(codeValue, customerId).run();
    } else {
      // Create new QR code
      await db.prepare(
        'INSERT INTO qr_codes (customer_id, code_value) VALUES (?, ?)'
      ).bind(customerId, codeValue).run();
    }
    
    // Retrieve the created/updated QR code
    const qrCode = await db.prepare(
      'SELECT * FROM qr_codes WHERE customer_id = ?'
    ).bind(customerId).first();
    
    return qrCode as QRCode;
  } catch (error) {
    console.error('Error creating QR code for customer:', error);
    throw new Error('Failed to create QR code for customer');
  }
}

/**
 * Validates a QR code value
 * @param codeValue The QR code value to validate
 * @param db Database context
 * @returns The customer ID associated with the QR code if valid, null otherwise
 */
export async function validateQRCode(
  codeValue: string,
  db: any
): Promise<number | null> {
  try {
    const qrCode = await db.prepare(
      'SELECT * FROM qr_codes WHERE code_value = ? AND is_active = TRUE'
    ).bind(codeValue).first();
    
    if (!qrCode) {
      return null;
    }
    
    // Update last used timestamp
    await db.prepare(
      'UPDATE qr_codes SET last_used = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(qrCode.id).run();
    
    return qrCode.customer_id;
  } catch (error) {
    console.error('Error validating QR code:', error);
    throw new Error('Failed to validate QR code');
  }
}
