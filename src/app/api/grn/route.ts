import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { GRN } from '@/models/GRN';
import { ItemMaster } from '@/models/ItemMaster';
import { updateStockAfterGRN } from '@/lib/stockManager';

export async function GET() {
  try {
    await connectDB();
    const grns = await GRN.find()
      .populate('sendingParty')
      .populate('rmSize')
      .sort({ grnDate: -1 });
    
    return NextResponse.json({ success: true, data: grns });
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
    
    // Validate RM size exists and is RM category
    const rmItem = await ItemMaster.findById(body.rmSize);
    if (!rmItem) {
      return NextResponse.json(
        { success: false, error: 'RM Size not found in Item Master' },
        { status: 400 }
      );
    }
    
    if (rmItem.category !== 'RM') {
      return NextResponse.json(
        { success: false, error: 'Selected item must be Raw Material (RM)' },
        { status: 400 }
      );
    }
    
    // Create GRN
    const grn = await GRN.create(body);
    
    // Update stock
    await updateStockAfterGRN(body.rmSize, body.quantity);
    
    // Populate and return
    const populatedGRN = await GRN.findById(grn._id)
      .populate('sendingParty')
      .populate('rmSize');
    
    return NextResponse.json(
      { success: true, data: populatedGRN },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
