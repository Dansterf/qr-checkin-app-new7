'use client';

import React, { useState, useEffect } from 'react';
import QuickBooksSyncStatus from '@/components/QuickBooksSyncStatus';

export default function QuickBooksIntegrationPage() {
  const [checkIns, setCheckIns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Fetch check-ins with QuickBooks sync status
    const fetchCheckIns = async () => {
      try {
        setIsLoading(true);
        // In a real app, this would be an API call
        // For demo purposes, we'll use mock data
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data based on our database schema
        const mockCheckIns = [
          {
            id: 1,
            check_in_time: new Date().toISOString(),
            student_first_name: 'John',
            student_last_name: 'Doe',
            session_type_name: 'French/Math Tutoring',
            quickbooks_sync_status: 'success',
            quickbooks_invoice_id: 'INV-001'
          },
          {
            id: 2,
            check_in_time: new Date(Date.now() - 86400000).toISOString(), // Yesterday
            student_first_name: 'Jane',
            student_last_name: 'Smith',
            session_type_name: 'Music Session',
            quickbooks_sync_status: 'pending',
            quickbooks_invoice_id: null
          },
          {
            id: 3,
            check_in_time: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
            student_first_name: 'Michael',
            student_last_name: 'Johnson',
            session_type_name: 'French/Math Tutoring',
            quickbooks_sync_status: 'error',
            quickbooks_invoice_id: null
          }
        ];
        
        setCheckIns(mockCheckIns);
      } catch (error) {
        console.error('Error fetching check-ins:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCheckIns();
  }, []);
  
  const handleSync = async (checkInId: number) => {
    try {
      // In a real app, this would be an API call to your backend
      console.log(`Syncing check-in ${checkInId} with QuickBooks`);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update local state to reflect the sync
      setCheckIns(prevCheckIns => 
        prevCheckIns.map(checkIn => 
          checkIn.id === checkInId 
            ? { ...checkIn, quickbooks_sync_status: 'success', quickbooks_invoice_id: `INV-${checkInId}` } 
            : checkIn
        )
      );
      
      return Promise.resolve();
    } catch (error) {
      console.error('Error syncing with QuickBooks:', error);
      return Promise.reject(error);
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">QuickBooks Integration</h1>
      
      <div className="w-full max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6">Check-in Billing Status</h2>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
          </div>
        ) : checkIns.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No check-ins found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Session Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    QuickBooks Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice ID
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {checkIns.map((checkIn) => (
                  <tr key={checkIn.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {checkIn.student_first_name} {checkIn.student_last_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{checkIn.session_type_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(checkIn.check_in_time)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <QuickBooksSyncStatus
                        checkInId={checkIn.id}
                        initialStatus={checkIn.quickbooks_sync_status}
                        onSync={handleSync}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {checkIn.quickbooks_invoice_id || '-'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
