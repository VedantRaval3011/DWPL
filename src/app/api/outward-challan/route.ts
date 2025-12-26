import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { OutwardChallan } from '@/models/OutwardChallan';
import { PartyMaster } from '@/models/PartyMaster';
import { ItemMaster } from '@/models/ItemMaster';
import { validateProcessCounts } from '@/lib/bomValidator';
import { updateStockAfterOutward } from '@/lib/stockManager';
import { generateSequentialNumber } from '@/lib/utils';

export async function GET() {
  try {
    await connectDB();
    const challans = await OutwardChallan.find()
      .populate('party')
      .populate('finishSize')
      .populate('originalSize')
      .sort({ challanDate: -1 });
    
    return NextResponse.json({ success: true, data: challans });
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
    
    // Validate party exists
    const party = await PartyMaster.findById(body.party);
    if (!party) {
      return NextResponse.json(
        { success: false, error: 'Party not found' },
        { status: 400 }
      );
    }
    
    // Validate FG and RM items
    const fgItem = await ItemMaster.findById(body.finishSize);
    const rmItem = await ItemMaster.findById(body.originalSize);
    
    if (!fgItem || fgItem.category !== 'FG') {
      return NextResponse.json(
        { success: false, error: 'Invalid Finish Size (must be FG)' },
        { status: 400 }
      );
    }
    
    if (!rmItem || rmItem.category !== 'RM') {
      return NextResponse.json(
        { success: false, error: 'Invalid Original Size (must be RM)' },
        { status: 400 }
      );
    }
    
    // Validate BOM and process counts
    await validateProcessCounts(
      fgItem.size,
      rmItem.size,
      fgItem.grade,
      body.annealingCount,
      body.drawPassCount
    );
    
    // Generate challan number
    const challanNumber = await generateSequentialNumber('CH', OutwardChallan, 'challanNumber');
    
    // Get charges from party master
    const annealingCharge = party.annealingCharge;
    const drawCharge = party.drawCharge;
    
    // Create outward challan
    const challan = await OutwardChallan.create({
      ...body,
      challanNumber,
      annealingCharge,
      drawCharge,
    });
    
    // Update stock (decrease RM, increase FG)
    await updateStockAfterOutward(body.originalSize, body.finishSize, body.quantity);
    
    // Populate and return
    const populatedChallan = await OutwardChallan.findById((challan as any)._id)
      .populate('party')
      .populate('finishSize')
      .populate('originalSize');
    
    return NextResponse.json(
      { success: true, data: populatedChallan },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
