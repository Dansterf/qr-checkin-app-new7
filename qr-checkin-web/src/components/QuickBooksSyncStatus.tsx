import React, { useState, useEffect } from 'react';

interface QuickBooksSyncStatusProps {
  checkInId: number;
  initialStatus: 'pending' | 'success' | 'error';
  onSync: (checkInId: number) => Promise<void>;
}

export default function QuickBooksSyncStatus({ 
  checkInId, 
  initialStatus, 
  onSync 
}: QuickBooksSyncStatusProps) {
  const [status, setStatus] = useState<'pending' | 'success' | 'error' | 'syncing'>(initialStatus);
  const [error, setError] = useState<string | null>(null);
  
  const handleSync = async () => {
    try {
      setStatus('syncing');
      setError(null);
      await onSync(checkInId);
      setStatus('success');
    } catch (err) {
      console.error('Error syncing with QuickBooks:', err);
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    }
  };
  
  const getStatusBadge = () => {
    switch (status) {
      case 'success':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Synced with QuickBooks
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Pending QuickBooks Sync
          </span>
        );
      case 'syncing':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Syncing with QuickBooks...
          </span>
        );
      case 'error':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            QuickBooks Sync Failed
          </span>
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center space-x-2">
        {getStatusBadge()}
        
        {(status === 'pending' || status === 'error') && (
          <button
            onClick={handleSync}
            disabled={status === 'syncing'}
            className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {status === 'syncing' ? 'Syncing...' : 'Sync Now'}
          </button>
        )}
      </div>
      
      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}
