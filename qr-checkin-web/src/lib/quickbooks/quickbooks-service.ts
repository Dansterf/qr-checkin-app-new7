import QuickBooks from 'node-quickbooks';
import { CheckIn, Student, SessionType } from '../db/types';

// QuickBooks API configuration
// In a production environment, these would be stored securely
// and retrieved from environment variables
interface QuickBooksConfig {
  consumerKey: string;
  consumerSecret: string;
  token: string;
  tokenSecret: string;
  realmId: string;
  useSandbox: boolean;
}

// Initialize QuickBooks client
export function initializeQuickBooksClient(config: QuickBooksConfig): QuickBooks {
  return new QuickBooks(
    config.consumerKey,
    config.consumerSecret,
    config.token,
    config.tokenSecret,
    config.realmId,
    config.useSandbox
  );
}

// Create an invoice in QuickBooks for a check-in
export async function createInvoiceForCheckIn(
  qbo: QuickBooks,
  checkIn: CheckIn,
  student: Student,
  sessionType: SessionType
): Promise<string> {
  try {
    // Format the date for QuickBooks
    const checkInDate = new Date(checkIn.check_in_time);
    const formattedDate = checkInDate.toISOString().split('T')[0];
    
    // Create invoice object
    const invoiceObj = {
      Line: [
        {
          Amount: sessionType.price,
          DetailType: 'SalesItemLineDetail',
          SalesItemLineDetail: {
            ItemRef: {
              value: sessionType.quickbooks_item_id || '1', // Default to item ID 1 if not specified
              name: sessionType.name
            },
            Qty: 1,
            UnitPrice: sessionType.price
          },
          Description: `${sessionType.name} - ${formattedDate} - ${student.first_name} ${student.last_name}`
        }
      ],
      CustomerRef: {
        value: '1', // This would be the actual QuickBooks customer ID in production
        name: `${student.first_name} ${student.last_name}`
      },
      TxnDate: formattedDate
    };
    
    // Create the invoice in QuickBooks
    return new Promise((resolve, reject) => {
      qbo.createInvoice(invoiceObj, (err: any, invoice: any) => {
        if (err) {
          console.error('Error creating QuickBooks invoice:', err);
          reject(err);
        } else {
          console.log('QuickBooks invoice created:', invoice.Id);
          resolve(invoice.Id);
        }
      });
    });
  } catch (error) {
    console.error('Error in createInvoiceForCheckIn:', error);
    throw new Error('Failed to create invoice in QuickBooks');
  }
}

// Process check-in for QuickBooks billing
export async function processCheckInForBilling(
  checkInId: number,
  db: any
): Promise<void> {
  try {
    // Get check-in details with related data
    const checkInData = await db.prepare(`
      SELECT 
        ci.*, 
        s.first_name as student_first_name,
        s.last_name as student_last_name,
        s.id as student_id,
        st.name as session_type_name,
        st.price as session_price,
        st.quickbooks_item_id,
        st.id as session_type_id
      FROM check_ins ci
      JOIN students s ON ci.student_id = s.id
      JOIN session_types st ON ci.session_type_id = st.id
      WHERE ci.id = ?
    `).bind(checkInId).first();
    
    if (!checkInData) {
      throw new Error(`Check-in with ID ${checkInId} not found`);
    }
    
    // In a real application, you would retrieve these from secure storage
    // For demo purposes, we're using placeholder values
    const qbConfig: QuickBooksConfig = {
      consumerKey: 'your-consumer-key',
      consumerSecret: 'your-consumer-secret',
      token: 'your-token',
      tokenSecret: 'your-token-secret',
      realmId: 'your-realm-id',
      useSandbox: true // Use sandbox for development/testing
    };
    
    // Initialize QuickBooks client
    const qbo = initializeQuickBooksClient(qbConfig);
    
    // Create student and session type objects from the data
    const student: Student = {
      id: checkInData.student_id,
      customer_id: 0, // Not needed for this operation
      first_name: checkInData.student_first_name,
      last_name: checkInData.student_last_name,
      notes: null,
      created_at: '',
      updated_at: ''
    };
    
    const sessionType: SessionType = {
      id: checkInData.session_type_id,
      name: checkInData.session_type_name,
      description: null,
      quickbooks_item_id: checkInData.quickbooks_item_id,
      price: checkInData.session_price,
      duration_minutes: 0, // Not needed for this operation
      created_at: '',
      updated_at: ''
    };
    
    // Create invoice in QuickBooks
    const invoiceId = await createInvoiceForCheckIn(qbo, checkInData, student, sessionType);
    
    // Update check-in record with QuickBooks invoice ID and sync status
    await db.prepare(`
      UPDATE check_ins
      SET quickbooks_invoice_id = ?, quickbooks_sync_status = 'success', updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(invoiceId, checkInId).run();
    
    console.log(`Check-in ${checkInId} successfully processed for billing with invoice ${invoiceId}`);
  } catch (error) {
    console.error('Error processing check-in for billing:', error);
    
    // Update check-in record with error status
    await db.prepare(`
      UPDATE check_ins
      SET quickbooks_sync_status = 'error', updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(checkInId).run();
    
    throw error;
  }
}
