import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { BOM } from '@/models/BOM';
import { ItemMaster } from '@/models/ItemMaster';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const fgSize = searchParams.get('fgSize');
    
    const filter = fgSize ? { fgSize, status: 'Active' } : {};
    const boms = await BOM.find(filter).sort({ fgSize: 1, rmSize: 1 });
    
    return NextResponse.json({ success: true, data: boms });
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
    
    // Validate that FG and RM sizes exist in Item Master
    const fgItem = await ItemMaster.findOne({ size: body.fgSize, category: 'FG' });
    const rmItem = await ItemMaster.findOne({ size: body.rmSize, category: 'RM' });
    
    if (!fgItem) {
      return NextResponse.json(
        { success: false, error: `FG size "${body.fgSize}" not found in Item Master` },
        { status: 400 }
      );
    }
    
    if (!rmItem) {
      return NextResponse.json(
        { success: false, error: `RM size "${body.rmSize}" not found in Item Master` },
        { status: 400 }
      );
    }
    
    const bom = await BOM.create(body);
    return NextResponse.json(
      { success: true, data: bom },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
