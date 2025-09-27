import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@/lib/db/types';
import { processCheckInForBilling } from '@/lib/quickbooks/quickbooks-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { checkInId } = body;
    
    if (!checkInId) {
      return NextResponse.json(
        { error: 'Check-in ID is required' },
        { status: 400 }
      );
    }
    
    // Get database context
    const context = await getCloudflareContext();
    if (!context || !context.DB) {
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 500 }
      );
    }
    
    // Process check-in for QuickBooks billing
    await processCheckInForBilling(checkInId, context.DB);
    
    return NextResponse.json({ 
      success: true,
      message: 'Check-in processed for QuickBooks billing successfully'
    });
  } catch (error) {
    console.error('Error processing check-in for QuickBooks billing:', error);
    return NextResponse.json(
      { error: 'Failed to process check-in for QuickBooks billing' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get database context
    const context = await getCloudflareContext();
    if (!context || !context.DB) {
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 500 }
      );
    }
    
    // Get all check-ins with QuickBooks sync status
    const checkIns = await context.DB.prepare(`
      SELECT 
        ci.id, 
        ci.check_in_time, 
        ci.quickbooks_sync_status,
        ci.quickbooks_invoice_id,
        s.first_name as student_first_name,
        s.last_name as student_last_name,
        st.name as session_type_name
      FROM check_ins ci
      JOIN students s ON ci.student_id = s.id
      JOIN session_types st ON ci.session_type_id = st.id
      ORDER BY ci.check_in_time DESC
      LIMIT 100
    `).all();
    
    return NextResponse.json({ 
      success: true,
      checkIns: checkIns.results
    });
  } catch (error) {
    console.error('Error fetching QuickBooks sync status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch QuickBooks sync status' },
      { status: 500 }
    );
  }
}
