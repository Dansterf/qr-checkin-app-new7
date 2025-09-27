import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@/lib/db/types';
import { createQRCodeForCustomer, generateQRCodeImage } from '@/lib/qrcode/qrcode-service';
import { distributeQRCode } from '@/lib/qrcode/email-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId, customerEmail, customerName } = body;
    
    if (!customerId || !customerEmail || !customerName) {
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
    
    // Create QR code for customer
    const qrCode = await createQRCodeForCustomer(customerId, context.DB);
    
    // Distribute QR code via email
    await distributeQRCode(customerId, customerEmail, customerName, qrCode);
    
    return NextResponse.json({ 
      success: true,
      message: 'QR code generated and sent successfully',
      qrCode
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    return NextResponse.json(
      { error: 'Failed to generate QR code' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const codeValue = searchParams.get('code');
    
    if (!codeValue) {
      return NextResponse.json(
        { error: 'QR code value is required' },
        { status: 400 }
      );
    }
    
    // Generate QR code image
    const qrCodeDataUrl = await generateQRCodeImage(codeValue);
    
    return NextResponse.json({ 
      success: true,
      qrCodeDataUrl
    });
  } catch (error) {
    console.error('Error generating QR code image:', error);
    return NextResponse.json(
      { error: 'Failed to generate QR code image' },
      { status: 500 }
    );
  }
}
