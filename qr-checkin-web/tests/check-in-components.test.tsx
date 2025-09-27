import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import QRScanner from '../src/components/QRScanner';
import CheckInForm from '../src/components/CheckInForm';
import CheckInHistory from '../src/components/CheckInHistory';

// Mock the react-qr-reader
vi.mock('react-qr-reader', () => ({
  QrReader: vi.fn().mockImplementation(({ onResult }) => {
    // Simulate successful scan after component mounts
    setTimeout(() => {
      onResult({ getText: () => 'test-qr-code' }, null);
    }, 100);
    
    return <div data-testid="qr-scanner">QR Scanner Mock</div>;
  })
}));

describe('Check-in Components', () => {
  describe('QRScanner', () => {
    beforeEach(() => {
      // Mock navigator.mediaDevices
      Object.defineProperty(global.navigator, 'mediaDevices', {
        value: {
          getUserMedia: vi.fn().mockResolvedValue(true)
        },
        writable: true
      });
    });
    
    it('should render the QR scanner', () => {
      const onScan = vi.fn();
      const onError = vi.fn();
      
      render(<QRScanner onScan={onScan} onError={onError} />);
      
      expect(screen.getByTestId('qr-scanner')).toBeInTheDocument();
    });
    
    it('should call onScan when a QR code is scanned', async () => {
      const onScan = vi.fn();
      const onError = vi.fn();
      
      render(<QRScanner onScan={onScan} onError={onError} />);
      
      await waitFor(() => {
        expect(onScan).toHaveBeenCalledWith('test-qr-code');
      });
    });
  });
  
  describe('CheckInForm', () => {
    const mockSessionTypes = [
      {
        id: 1,
        name: 'French/Math Tutoring',
        description: 'French or mathematics tutoring session',
        quickbooks_item_id: null,
        price: 45.00,
        duration_minutes: 60,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 2,
        name: 'Music Session',
        description: 'Music instruction session',
        quickbooks_item_id: null,
        price: 50.00,
        duration_minutes: 45,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    
    it('should render the check-in form with session types', () => {
      const onSubmit = vi.fn();
      
      render(
        <CheckInForm 
          sessionTypes={mockSessionTypes} 
          staffId={1} 
          onSubmit={onSubmit} 
          isLoading={false} 
        />
      );
      
      expect(screen.getByText('Check-In Details')).toBeInTheDocument();
      expect(screen.getByText('Session Type')).toBeInTheDocument();
      expect(screen.getByText('Notes (Optional)')).toBeInTheDocument();
      
      // Check if session types are rendered in the dropdown
      const selectElement = screen.getByRole('combobox');
      expect(selectElement).toBeInTheDocument();
      
      // Open the dropdown
      fireEvent.click(selectElement);
      
      // Check if both session types are in the document
      expect(screen.getByText('French/Math Tutoring (60 min)')).toBeInTheDocument();
      expect(screen.getByText('Music Session (45 min)')).toBeInTheDocument();
    });
    
    it('should call onSubmit with selected session type and notes', async () => {
      const onSubmit = vi.fn();
      
      render(
        <CheckInForm 
          sessionTypes={mockSessionTypes} 
          staffId={1} 
          onSubmit={onSubmit} 
          isLoading={false} 
        />
      );
      
      // Select a session type
      fireEvent.change(screen.getByRole('combobox'), { target: { value: '1' } });
      
      // Enter notes
      fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Test notes' } });
      
      // Submit the form
      fireEvent.click(screen.getByText('Complete Check-In'));
      
      // Check if onSubmit was called with correct arguments
      expect(onSubmit).toHaveBeenCalledWith(1, 'Test notes');
    });
    
    it('should disable submit button when loading', () => {
      const onSubmit = vi.fn();
      
      render(
        <CheckInForm 
          sessionTypes={mockSessionTypes} 
          staffId={1} 
          onSubmit={onSubmit} 
          isLoading={true} 
        />
      );
      
      // Select a session type
      fireEvent.change(screen.getByRole('combobox'), { target: { value: '1' } });
      
      // Check if button is disabled
      expect(screen.getByText('Processing...')).toBeDisabled();
    });
  });
  
  describe('CheckInHistory', () => {
    const mockCheckIns = [
      {
        id: 1,
        check_in_time: new Date().toISOString(),
        student_first_name: 'John',
        student_last_name: 'Doe',
        session_type_name: 'French/Math Tutoring',
        staff_first_name: 'Staff',
        staff_last_name: 'Member',
        quickbooks_sync_status: 'success',
        notes: 'First session'
      },
      {
        id: 2,
        check_in_time: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        student_first_name: 'Jane',
        student_last_name: 'Smith',
        session_type_name: 'Music Session',
        staff_first_name: 'Staff',
        staff_last_name: 'Member',
        quickbooks_sync_status: 'pending',
        notes: null
      }
    ];
    
    it('should render check-in history table with data', () => {
      render(<CheckInHistory checkIns={mockCheckIns} isLoading={false} />);
      
      expect(screen.getByText('Recent Check-ins')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('French/Math Tutoring')).toBeInTheDocument();
      expect(screen.getByText('Music Session')).toBeInTheDocument();
    });
    
    it('should show loading indicator when isLoading is true', () => {
      render(<CheckInHistory checkIns={[]} isLoading={true} />);
      
      expect(screen.getByText('Recent Check-ins')).toBeInTheDocument();
      // Check for loading spinner (this is a simplified check)
      expect(document.querySelector('.animate-spin')).toBeInTheDocument();
    });
    
    it('should show message when no check-ins are available', () => {
      render(<CheckInHistory checkIns={[]} isLoading={false} />);
      
      expect(screen.getByText('No check-ins recorded yet')).toBeInTheDocument();
    });
  });
});
