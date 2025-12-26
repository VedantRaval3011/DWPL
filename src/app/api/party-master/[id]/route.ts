import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { PartyMaster } from '@/models/PartyMaster';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const party = await PartyMaster.findById(id);
    
    if (!party) {
      return NextResponse.json(
        { success: false, error: 'Party not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: party });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();
    
    const party = await PartyMaster.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });
    
    if (!party) {
      return NextResponse.json(
        { success: false, error: 'Party not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: party });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const party = await PartyMaster.findByIdAndDelete(id);
    
    if (!party) {
      return NextResponse.json(
        { success: false, error: 'Party not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: party });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
