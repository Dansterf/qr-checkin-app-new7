import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@/lib/db/types';
import { validateQRCode } from '@/lib/qrcode/qrcode-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { qrCodeValue, sessionTypeId, staffId, notes } = body;
    
    if (!qrCodeValue || !sessionTypeId || !staffId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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
    
    // Validate QR code and get customer ID
    const customerId = await validateQRCode(qrCodeValue, context.DB);
    if (!customerId) {
      return NextResponse.json(
        { error: 'Invalid QR code' },
        { status: 400 }
      );
    }
    
    // Get students for this customer
    const students = await context.DB.prepare(
      'SELECT * FROM students WHERE customer_id = ?'
    ).bind(customerId).all();
    
    if (!students.results || students.results.length === 0) {
      return NextResponse.json(
        { error: 'No students found for this customer' },
        { status: 400 }
      );
    }
    
    // For simplicity, use the first student if there are multiple
    // In a real application, you might want to let the staff select which student
    const studentId = students.results[0].id;
    
    // Create check-in record
    const checkInResult = await context.DB.prepare(`
      INSERT INTO check_ins (
        student_id, 
        session_type_id, 
        staff_id, 
        notes, 
        quickbooks_sync_status
      ) 
      VALUES (?, ?, ?, ?, 'pending')
      RETURNING id, check_in_time
    `).bind(
      studentId,
      sessionTypeId,
      staffId,
      notes || null
    ).run();
    
    if (!checkInResult || !checkInResult.results || checkInResult.results.length === 0) {
      return NextResponse.json(
        { error: 'Failed to create check-in record' },
        { status: 500 }
      );
    }
    
    const checkInId = checkInResult.results[0].id;
    const checkInTime = checkInResult.results[0].check_in_time;
    
    // Get student and session type details for the response
    const student = await context.DB.prepare(
      'SELECT * FROM students WHERE id = ?'
    ).bind(studentId).first();
    
    const sessionType = await context.DB.prepare(
      'SELECT * FROM session_types WHERE id = ?'
    ).bind(sessionTypeId).first();
    
    return NextResponse.json({ 
      success: true,
      message: 'Check-in recorded successfully',
      checkIn: {
        id: checkInId,
        checkInTime,
        student,
        sessionType,
        quickbooksSyncStatus: 'pending'
      }
    });
  } catch (error) {
    console.error('Error processing check-in:', error);
    return NextResponse.json(
      { error: 'Failed to process check-in' },
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
    
    // Get all check-ins with related information
    const checkIns = await context.DB.prepare(`
      SELECT 
        ci.id, 
        ci.check_in_time, 
        ci.notes,
        ci.quickbooks_sync_status,
        ci.quickbooks_invoice_id,
        s.first_name as student_first_name,
        s.last_name as student_last_name,
        st.name as session_type_name,
        u.first_name as staff_first_name,
        u.last_name as staff_last_name
      FROM check_ins ci
      JOIN students s ON ci.student_id = s.id
      JOIN session_types st ON ci.session_type_id = st.id
      JOIN users u ON ci.staff_id = u.id
      ORDER BY ci.check_in_time DESC
      LIMIT 100
    `).all();
    
    return NextResponse.json({ 
      success: true,
      checkIns: checkIns.results
    });
  } catch (error) {
    console.error('Error fetching check-ins:', error);
    return NextResponse.json(
      { error: 'Failed to fetch check-ins' },
      { status: 500 }
    );
  }
}
