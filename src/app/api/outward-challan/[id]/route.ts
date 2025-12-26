import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { OutwardChallan } from '@/models/OutwardChallan';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const challan = await OutwardChallan.findById(id)
      .populate('party')
      .populate('finishSize')
      .populate('originalSize');
    
    if (!challan) {
      return NextResponse.json(
        { success: false, error: 'Outward Challan not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: challan });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
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
    
    // Note: Deleting outward challan should ideally reverse stock
    // In production, implement stock reversal or prevent deletion
    const challan = await OutwardChallan.findByIdAndDelete(id);
    
    if (!challan) {
      return NextResponse.json(
        { success: false, error: 'Outward Challan not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: challan });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
