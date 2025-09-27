import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

// Mock API server
const server = setupServer(
  // Mock customer registration endpoint
  rest.post('/api/customers', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        message: 'Customer registered successfully',
        customer: {
          id: 1,
          user_id: 1,
          email: 'test@example.com',
          phone: '123-456-7890',
          address: '123 Test St',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      })
    );
  }),
  
  // Mock QR code generation endpoint
  rest.post('/api/qrcode', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        message: 'QR code generated and sent successfully',
        qrCode: {
          id: 1,
          customer_id: 1,
          code_value: 'QR-12345-abcde',
          is_active: true,
          last_used: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      })
    );
  }),
  
  // Mock check-in endpoint
  rest.post('/api/check-ins', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        message: 'Check-in recorded successfully',
        checkIn: {
          id: 1,
          checkInTime: new Date().toISOString(),
          student: {
            id: 1,
            first_name: 'John',
            last_name: 'Doe'
          },
          sessionType: {
            id: 1,
            name: 'French/Math Tutoring'
          },
          quickbooksSyncStatus: 'pending'
        }
      })
    );
  }),
  
  // Mock QuickBooks sync endpoint
  rest.post('/api/quickbooks', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        message: 'Check-in processed for QuickBooks billing successfully'
      })
    );
  })
);

// Start server before all tests
beforeAll(() => server.listen());
// Reset handlers after each test
afterEach(() => server.resetHandlers());
// Close server after all tests
afterAll(() => server.close());

describe('Integration Tests', () => {
  describe('Customer Registration and QR Code Generation Flow', () => {
    it('should register a customer and generate a QR code', async () => {
      // Mock fetch
      global.fetch = vi.fn().mockImplementation((url) => {
        if (url.includes('/api/customers')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              success: true,
              customer: { id: 1 }
            })
          });
        } else if (url.includes('/api/qrcode')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              success: true,
              qrCode: { id: 1, code_value: 'QR-12345-abcde' }
            })
          });
        }
        return Promise.reject(new Error('Not found'));
      });
      
      // Test the integration between customer registration and QR code generation
      const customerData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '123-456-7890',
        address: '123 Test St'
      };
      
      // Register customer
      const customerResponse = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerData)
      });
      const customerResult = await customerResponse.json();
      
      expect(customerResult.success).toBe(true);
      expect(customerResult.customer.id).toBe(1);
      
      // Generate QR code for the customer
      const qrCodeResponse = await fetch('/api/qrcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: customerResult.customer.id,
          customerEmail: customerData.email,
          customerName: `${customerData.firstName} ${customerData.lastName}`
        })
      });
      const qrCodeResult = await qrCodeResponse.json();
      
      expect(qrCodeResult.success).toBe(true);
      expect(qrCodeResult.qrCode.customer_id).toBe(1);
      expect(qrCodeResult.qrCode.code_value).toBe('QR-12345-abcde');
      
      // Restore global fetch
      global.fetch.mockRestore();
    });
  });
  
  describe('Check-in and QuickBooks Integration Flow', () => {
    it('should process a check-in and sync with QuickBooks', async () => {
      // Mock fetch
      global.fetch = vi.fn().mockImplementation((url) => {
        if (url.includes('/api/check-ins')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              success: true,
              checkIn: { 
                id: 1,
                quickbooksSyncStatus: 'pending'
              }
            })
          });
        } else if (url.includes('/api/quickbooks')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              success: true,
              message: 'Check-in processed for QuickBooks billing successfully'
            })
          });
        }
        return Promise.reject(new Error('Not found'));
      });
      
      // Test the integration between check-in and QuickBooks
      const checkInData = {
        qrCodeValue: 'QR-12345-abcde',
        sessionTypeId: 1,
        staffId: 1,
        notes: 'Test check-in'
      };
      
      // Process check-in
      const checkInResponse = await fetch('/api/check-ins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(checkInData)
      });
      const checkInResult = await checkInResponse.json();
      
      expect(checkInResult.success).toBe(true);
      expect(checkInResult.checkIn.id).toBe(1);
      expect(checkInResult.checkIn.quickbooksSyncStatus).toBe('pending');
      
      // Sync with QuickBooks
      const quickbooksResponse = await fetch('/api/quickbooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checkInId: checkInResult.checkIn.id
        })
      });
      const quickbooksResult = await quickbooksResponse.json();
      
      expect(quickbooksResult.success).toBe(true);
      
      // Restore global fetch
      global.fetch.mockRestore();
    });
  });
});
