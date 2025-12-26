import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { PartyMaster } from '@/models/PartyMaster';

export async function GET() {
  try {
    await connectDB();
    const parties = await PartyMaster.find().sort({ partyName: 1 });
    return NextResponse.json({ success: true, data: parties });
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
    
    const party = await PartyMaster.create(body);
    return NextResponse.json(
      { success: true, data: party },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
