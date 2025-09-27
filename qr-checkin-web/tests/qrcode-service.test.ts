import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateUniqueQRCodeValue, generateQRCodeImage, validateQRCode } from '../src/lib/qrcode/qrcode-service';

// Mock QRCode library
vi.mock('qrcode', () => ({
  default: {
    toDataURL: vi.fn().mockResolvedValue('data:image/png;base64,mockedQRCodeImage')
  }
}));

describe('QR Code Service', () => {
  describe('generateUniqueQRCodeValue', () => {
    it('should generate a unique QR code value', async () => {
      const value = await generateUniqueQRCodeValue();
      expect(value).toBeDefined();
      expect(value.startsWith('QR-')).toBe(true);
      expect(value.length).toBeGreaterThan(10);
    });

    it('should generate different values on subsequent calls', async () => {
      const value1 = await generateUniqueQRCodeValue();
      const value2 = await generateUniqueQRCodeValue();
      expect(value1).not.toEqual(value2);
    });
  });

  describe('generateQRCodeImage', () => {
    it('should generate a QR code image as data URL', async () => {
      const qrCodeValue = 'test-qr-code';
      const dataUrl = await generateQRCodeImage(qrCodeValue);
      expect(dataUrl).toBe('data:image/png;base64,mockedQRCodeImage');
    });
  });

  describe('validateQRCode', () => {
    let mockDb;

    beforeEach(() => {
      // Mock database with prepare method
      mockDb = {
        prepare: vi.fn().mockReturnThis(),
        bind: vi.fn().mockReturnThis(),
        first: vi.fn(),
        run: vi.fn()
      };
    });

    it('should return customer ID when QR code is valid', async () => {
      // Mock a valid QR code in the database
      mockDb.first.mockResolvedValueOnce({ id: 1, customer_id: 123 });
      
      const customerId = await validateQRCode('valid-qr-code', mockDb);
      
      expect(mockDb.prepare).toHaveBeenCalledWith(
        'SELECT * FROM qr_codes WHERE code_value = ? AND is_active = TRUE'
      );
      expect(mockDb.bind).toHaveBeenCalledWith('valid-qr-code');
      expect(customerId).toBe(123);
    });

    it('should return null when QR code is invalid', async () => {
      // Mock no QR code found in the database
      mockDb.first.mockResolvedValueOnce(null);
      
      const customerId = await validateQRCode('invalid-qr-code', mockDb);
      
      expect(mockDb.prepare).toHaveBeenCalledWith(
        'SELECT * FROM qr_codes WHERE code_value = ? AND is_active = TRUE'
      );
      expect(mockDb.bind).toHaveBeenCalledWith('invalid-qr-code');
      expect(customerId).toBeNull();
    });

    it('should update last_used timestamp when QR code is valid', async () => {
      // Mock a valid QR code in the database
      mockDb.first.mockResolvedValueOnce({ id: 1, customer_id: 123 });
      
      await validateQRCode('valid-qr-code', mockDb);
      
      expect(mockDb.prepare).toHaveBeenCalledWith(
        'UPDATE qr_codes SET last_used = CURRENT_TIMESTAMP WHERE id = ?'
      );
      expect(mockDb.bind).toHaveBeenCalledWith(1);
      expect(mockDb.run).toHaveBeenCalled();
    });
  });
});
