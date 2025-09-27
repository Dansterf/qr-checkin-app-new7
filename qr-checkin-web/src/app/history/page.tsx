'use client';

import React, { useState, useEffect } from 'react';
import CheckInHistory from '@/components/CheckInHistory';

export default function CheckInHistoryPage() {
  const [checkIns, setCheckIns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Fetch check-in history
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
          },
          {
            id: 3,
            check_in_time: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
            student_first_name: 'Michael',
            student_last_name: 'Johnson',
            session_type_name: 'French/Math Tutoring',
            staff_first_name: 'Staff',
            staff_last_name: 'Member',
            quickbooks_sync_status: 'error',
            notes: 'Needs extra help with fractions'
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
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Check-In History</h1>
      <CheckInHistory checkIns={checkIns} isLoading={isLoading} />
    </div>
  );
}
