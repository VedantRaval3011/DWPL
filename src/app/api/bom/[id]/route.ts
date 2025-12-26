import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { BOM } from '@/models/BOM';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const bom = await BOM.findById(id);
    
    if (!bom) {
      return NextResponse.json(
        { success: false, error: 'BOM not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: bom });
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
    
    const bom = await BOM.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });
    
    if (!bom) {
      return NextResponse.json(
        { success: false, error: 'BOM not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: bom });
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
    const bom = await BOM.findByIdAndDelete(id);
    
    if (!bom) {
      return NextResponse.json(
        { success: false, error: 'BOM not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: bom });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
