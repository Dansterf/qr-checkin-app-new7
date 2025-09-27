import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@/lib/db/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, phone, address } = body;
    
    if (!firstName || !lastName || !email) {
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
    
    // Create user with customer role
    const userResult = await context.DB.prepare(
      'INSERT INTO users (email, password_hash, role, first_name, last_name) VALUES (?, ?, ?, ?, ?) RETURNING id'
    ).bind(
      email,
      // Temporary password hash, would normally use proper hashing
      '$2a$10$temporaryPasswordHashForNewCustomers',
      'customer',
      firstName,
      lastName
    ).run();
    
    if (!userResult || !userResult.results || userResult.results.length === 0) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      );
    }
    
    const userId = userResult.results[0].id;
    
    // Create customer record
    const customerResult = await context.DB.prepare(
      'INSERT INTO customers (user_id, email, phone, address) VALUES (?, ?, ?, ?) RETURNING id'
    ).bind(
      userId,
      email,
      phone || null,
      address || null
    ).run();
    
    if (!customerResult || !customerResult.results || customerResult.results.length === 0) {
      return NextResponse.json(
        { error: 'Failed to create customer' },
        { status: 500 }
      );
    }
    
    const customerId = customerResult.results[0].id;
    
    // Get the created customer
    const customer = await context.DB.prepare(
      'SELECT * FROM customers WHERE id = ?'
    ).bind(customerId).first();
    
    return NextResponse.json({ 
      success: true,
      message: 'Customer registered successfully',
      customer
    });
  } catch (error) {
    console.error('Error registering customer:', error);
    return NextResponse.json(
      { error: 'Failed to register customer' },
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
    
    // Get all customers with user information
    const customers = await context.DB.prepare(`
      SELECT c.*, u.first_name, u.last_name, u.email as user_email
      FROM customers c
      JOIN users u ON c.user_id = u.id
      ORDER BY c.created_at DESC
    `).all();
    
    return NextResponse.json({ 
      success: true,
      customers: customers.results
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}
