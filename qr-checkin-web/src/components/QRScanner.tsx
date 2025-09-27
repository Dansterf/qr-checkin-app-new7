import React, { useState, useEffect } from 'react';
import { QrReader } from 'react-qr-reader';

interface QRScannerProps {
  onScan: (result: string) => void;
  onError: (error: Error) => void;
}

export default function QRScanner({ onScan, onError }: QRScannerProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    // Check for camera permissions
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(() => setHasPermission(true))
        .catch((error) => {
          console.error('Camera permission error:', error);
          setHasPermission(false);
          onError(new Error('Camera permission denied'));
        });
    } else {
      setHasPermission(false);
      onError(new Error('Camera not available on this device'));
    }

    return () => {
      setIsMounted(false);
    };
  }, [onError]);

  if (!isMounted) {
    return null;
  }

  if (hasPermission === null) {
    return (
      <div className="flex justify-center items-center h-64 bg-gray-100 rounded-lg">
        <p className="text-gray-600">Requesting camera permission...</p>
      </div>
    );
  }

  if (hasPermission === false) {
    return (
      <div className="flex flex-col justify-center items-center h-64 bg-gray-100 rounded-lg p-4">
        <p className="text-red-600 mb-2">Camera permission denied</p>
        <p className="text-gray-600 text-center">
          Please enable camera access in your browser settings to scan QR codes.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="relative overflow-hidden rounded-lg">
        <QrReader
          constraints={{ facingMode: 'environment' }}
          onResult={(result, error) => {
            if (result) {
              onScan(result.getText());
            }
            if (error && error.name !== 'NotFoundError') {
              onError(error);
            }
          }}
          className="w-full"
          scanDelay={500}
          videoStyle={{ objectFit: 'cover' }}
          videoContainerStyle={{ 
            position: 'relative',
            width: '100%', 
            paddingTop: '100%',
            overflow: 'hidden'
          }}
          videoId="qr-scanner-video"
        />
        <div className="absolute inset-0 border-2 border-blue-500 pointer-events-none z-10">
          <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-blue-500"></div>
          <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-blue-500"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-blue-500"></div>
          <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-blue-500"></div>
        </div>
      </div>
      <p className="text-center mt-4 text-gray-600">
        Position the QR code within the frame to scan
      </p>
    </div>
  );
}
