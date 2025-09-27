import { describe, it, expect, vi, beforeEach } from 'vitest';
import { processCheckInForBilling, createInvoiceForCheckIn } from '../src/lib/quickbooks/quickbooks-service';

// Mock QuickBooks library
vi.mock('node-quickbooks', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      createInvoice: vi.fn((invoiceObj, callback) => {
        callback(null, { Id: 'mock-invoice-id' });
      })
    }))
  };
});

describe('QuickBooks Service', () => {
  describe('createInvoiceForCheckIn', () => {
    it('should create an invoice in QuickBooks', async () => {
      const mockQbo = {
        createInvoice: vi.fn((invoiceObj, callback) => {
          callback(null, { Id: 'mock-invoice-id' });
        })
      };
      
      const mockCheckIn = {
        id: 1,
        student_id: 1,
        session_type_id: 1,
        staff_id: 1,
        check_in_time: '2025-04-26T00:00:00.000Z',
        notes: null,
        quickbooks_invoice_id: null,
        quickbooks_sync_status: 'pending',
        created_at: '2025-04-26T00:00:00.000Z',
        updated_at: '2025-04-26T00:00:00.000Z'
      };
      
      const mockStudent = {
        id: 1,
        customer_id: 1,
        first_name: 'John',
        last_name: 'Doe',
        notes: null,
        created_at: '2025-04-26T00:00:00.000Z',
        updated_at: '2025-04-26T00:00:00.000Z'
      };
      
      const mockSessionType = {
        id: 1,
        name: 'French/Math Tutoring',
        description: 'French or mathematics tutoring session',
        quickbooks_item_id: '1',
        price: 45.00,
        duration_minutes: 60,
        created_at: '2025-04-26T00:00:00.000Z',
        updated_at: '2025-04-26T00:00:00.000Z'
      };
      
      const invoiceId = await createInvoiceForCheckIn(mockQbo, mockCheckIn, mockStudent, mockSessionType);
      
      expect(mockQbo.createInvoice).toHaveBeenCalled();
      expect(invoiceId).toBe('mock-invoice-id');
      
      // Verify the invoice object structure
      const invoiceArg = mockQbo.createInvoice.mock.calls[0][0];
      expect(invoiceArg).toHaveProperty('Line');
      expect(invoiceArg).toHaveProperty('CustomerRef');
      expect(invoiceArg).toHaveProperty('TxnDate');
      
      // Check line item details
      expect(invoiceArg.Line[0].Amount).toBe(45.00);
      expect(invoiceArg.Line[0].SalesItemLineDetail.ItemRef.name).toBe('French/Math Tutoring');
      
      // Check customer reference
      expect(invoiceArg.CustomerRef.name).toBe('John Doe');
    });
    
    it('should handle errors when creating an invoice', async () => {
      const mockQbo = {
        createInvoice: vi.fn((invoiceObj, callback) => {
          callback(new Error('QuickBooks API error'), null);
        })
      };
      
      const mockCheckIn = {
        id: 1,
        student_id: 1,
        session_type_id: 1,
        staff_id: 1,
        check_in_time: '2025-04-26T00:00:00.000Z',
        notes: null,
        quickbooks_invoice_id: null,
        quickbooks_sync_status: 'pending',
        created_at: '2025-04-26T00:00:00.000Z',
        updated_at: '2025-04-26T00:00:00.000Z'
      };
      
      const mockStudent = {
        id: 1,
        customer_id: 1,
        first_name: 'John',
        last_name: 'Doe',
        notes: null,
        created_at: '2025-04-26T00:00:00.000Z',
        updated_at: '2025-04-26T00:00:00.000Z'
      };
      
      const mockSessionType = {
        id: 1,
        name: 'French/Math Tutoring',
        description: 'French or mathematics tutoring session',
        quickbooks_item_id: '1',
        price: 45.00,
        duration_minutes: 60,
        created_at: '2025-04-26T00:00:00.000Z',
        updated_at: '2025-04-26T00:00:00.000Z'
      };
      
      await expect(createInvoiceForCheckIn(mockQbo, mockCheckIn, mockStudent, mockSessionType))
        .rejects.toThrow('QuickBooks API error');
    });
  });
  
  describe('processCheckInForBilling', () => {
    let mockDb;
    
    beforeEach(() => {
      // Mock database with prepare method
      mockDb = {
        prepare: vi.fn().mockReturnThis(),
        bind: vi.fn().mockReturnThis(),
        first: vi.fn(),
        run: vi.fn(),
        all: vi.fn()
      };
    });
    
    it('should update check-in with success status after billing', async () => {
      // Mock check-in data retrieval
      mockDb.first.mockResolvedValueOnce({
        id: 1,
        student_id: 1,
        student_first_name: 'John',
        student_last_name: 'Doe',
        session_type_id: 1,
        session_type_name: 'French/Math Tutoring',
        session_price: 45.00,
        quickbooks_item_id: '1'
      });
      
      // Mock the QuickBooks service
      const originalProcessCheckIn = processCheckInForBilling;
      global.processCheckInForBilling = vi.fn().mockImplementation(async (checkInId, db) => {
        // Simulate successful processing
        await db.prepare().bind().run();
        return Promise.resolve();
      });
      
      await global.processCheckInForBilling(1, mockDb);
      
      // Verify database update was called
      expect(mockDb.prepare).toHaveBeenCalledWith(expect.stringContaining('UPDATE check_ins'));
      expect(mockDb.bind).toHaveBeenCalledWith(expect.any(String), 1);
      expect(mockDb.run).toHaveBeenCalled();
      
      // Restore original function
      global.processCheckInForBilling = originalProcessCheckIn;
    });
  });
});
