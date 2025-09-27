import React, { useState } from 'react';
import { QRCode } from '@/lib/db/types';

interface QRCodeDisplayProps {
  customerName: string;
  qrCodeDataUrl?: string;
  qrCodeValue?: string;
  isLoading?: boolean;
}

export default function QRCodeDisplay({ 
  customerName, 
  qrCodeDataUrl, 
  qrCodeValue,
  isLoading = false 
}: QRCodeDisplayProps) {
  return (
    <div className="w-full max-w-md mx-auto bg-white p-6 rounded-lg shadow-md text-center">
      <h2 className="text-2xl font-bold mb-2">Your QR Code</h2>
      <p className="text-gray-600 mb-6">For {customerName}</p>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
        </div>
      ) : qrCodeDataUrl ? (
        <div className="mb-6">
          <img 
            src={qrCodeDataUrl} 
            alt="QR Code" 
            className="mx-auto max-w-full h-auto"
            style={{ maxWidth: '250px' }}
          />
        </div>
      ) : (
        <div className="flex justify-center items-center h-64 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-500">No QR code available</p>
        </div>
      )}
      
      {qrCodeValue && (
        <div className="mt-4">
          <p className="text-sm text-gray-600 mb-1">Your unique code:</p>
          <p className="font-mono bg-gray-100 p-2 rounded">{qrCodeValue}</p>
        </div>
      )}
      
      <div className="mt-6">
        <p className="text-sm text-gray-600">
          Present this QR code when you bring your child to their tutoring session.
        </p>
      </div>
    </div>
  );
}
