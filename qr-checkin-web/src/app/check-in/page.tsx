'use client';

import React, { useState, useEffect } from 'react';
import QRScanner from '@/components/QRScanner';
import CheckInForm from '@/components/CheckInForm';
import { SessionType } from '@/lib/db/types';

export default function CheckInPage() {
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [sessionTypes, setSessionTypes] = useState<SessionType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [checkInSuccess, setCheckInSuccess] = useState(false);
  const [studentName, setStudentName] = useState('');
  
  // Mock staff ID for demo purposes
  const staffId = 1;
  
  useEffect(() => {
    // Fetch session types
    const fetchSessionTypes = async () => {
      try {
        // In a real app, this would be an API call
        // For now, we'll use mock data based on our database schema
        setSessionTypes([
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
        ]);
      } catch (error) {
        console.error('Error fetching session types:', error);
      }
    };
    
    fetchSessionTypes();
  }, []);
  
  const handleScan = (result: string) => {
    setScannedCode(result);
    setScanError(null);
  };
  
  const handleScanError = (error: Error) => {
    console.error('Scan error:', error);
    setScanError(error.message);
  };
  
  const handleCheckIn = async (sessionTypeId: number, notes: string) => {
    setIsLoading(true);
    try {
      // In a real app, this would be an API call to your backend
      // For demo purposes, we'll simulate a successful check-in
      console.log('Check-in data:', {
        qrCodeValue: scannedCode,
        sessionTypeId,
        staffId,
        notes
      });
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Set success state
      setCheckInSuccess(true);
      setStudentName('John Doe'); // In a real app, this would come from the API response
    } catch (error) {
      console.error('Error processing check-in:', error);
      alert('Failed to process check-in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const resetCheckIn = () => {
    setScannedCode(null);
    setCheckInSuccess(false);
    setStudentName('');
  };
  
  if (checkInSuccess) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Check-In Successful!</h2>
          <p className="text-gray-600 mb-6">
            {studentName} has been checked in successfully.
          </p>
          <button
            onClick={resetCheckIn}
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Scan Another Code
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-center mb-6">Student Check-In</h1>
      
      {!scannedCode ? (
        <div>
          <p className="text-gray-600 mb-4 text-center">
            Scan the QR code provided by the customer
          </p>
          <QRScanner onScan={handleScan} onError={handleScanError} />
          {scanError && (
            <p className="text-red-600 mt-4 text-center">{scanError}</p>
          )}
        </div>
      ) : (
        <div>
          <div className="mb-6 p-4 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-500 mb-1">Scanned QR Code:</p>
            <p className="font-mono text-gray-800 break-all">{scannedCode}</p>
          </div>
          
          <CheckInForm
            sessionTypes={sessionTypes}
            staffId={staffId}
            onSubmit={handleCheckIn}
            isLoading={isLoading}
          />
          
          <button
            onClick={() => setScannedCode(null)}
            className="w-full mt-4 py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Scan Different Code
          </button>
        </div>
      )}
    </div>
  );
}
