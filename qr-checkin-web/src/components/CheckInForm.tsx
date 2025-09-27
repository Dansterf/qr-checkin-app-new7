import React, { useState } from 'react';
import { SessionType } from '@/lib/db/types';

interface CheckInFormProps {
  sessionTypes: SessionType[];
  staffId: number;
  onSubmit: (sessionTypeId: number, notes: string) => Promise<void>;
  isLoading: boolean;
}

export default function CheckInForm({ 
  sessionTypes, 
  staffId, 
  onSubmit, 
  isLoading 
}: CheckInFormProps) {
  const [selectedSessionTypeId, setSelectedSessionTypeId] = useState<number | ''>('');
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSessionTypeId === '') {
      return;
    }
    await onSubmit(Number(selectedSessionTypeId), notes);
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Check-In Details</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="sessionType" className="block text-sm font-medium text-gray-700 mb-1">
            Session Type
          </label>
          <select
            id="sessionType"
            value={selectedSessionTypeId}
            onChange={(e) => setSelectedSessionTypeId(e.target.value ? Number(e.target.value) : '')}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a session type</option>
            {sessionTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name} ({type.duration_minutes} min)
              </option>
            ))}
          </select>
        </div>
        
        <div className="mb-6">
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Notes (Optional)
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading || selectedSessionTypeId === ''}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Processing...' : 'Complete Check-In'}
        </button>
      </form>
    </div>
  );
}
