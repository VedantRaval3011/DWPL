import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { TaxInvoice } from '@/models/TaxInvoice';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const invoice = await TaxInvoice.findById(id)
      .populate('party')
      .populate('outwardChallan')
      .populate('finishSize')
      .populate('originalSize');
    
    if (!invoice) {
      return NextResponse.json(
        { success: false, error: 'Tax Invoice not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: invoice });
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
    const invoice = await TaxInvoice.findByIdAndDelete(id);
    
    if (!invoice) {
      return NextResponse.json(
        { success: false, error: 'Tax Invoice not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: invoice });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
