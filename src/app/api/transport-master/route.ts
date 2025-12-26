import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { TransportMaster } from '@/models/TransportMaster';

export async function GET() {
  try {
    await connectDB();
    const transports = await TransportMaster.find().sort({ vehicleNumber: 1 });
    return NextResponse.json({ success: true, data: transports });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    
    const transport = await TransportMaster.create(body);
    return NextResponse.json(
      { success: true, data: transport },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
