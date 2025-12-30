import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { BOM } from '@/models/BOM';

// GET all finish sizes for a given RM size
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const rmSize = searchParams.get('rmSize');
    
    if (!rmSize) {
      return NextResponse.json(
        { success: false, error: 'RM Size parameter is required' },
        { status: 400 }
      );
    }
    
    // Find all BOMs where the RM size matches
    const boms = await BOM.find({ 
      rmSize: rmSize,
      status: 'Active' 
    }).sort({ fgSize: 1 });
    
    console.log(`Found ${boms.length} finish sizes for RM: ${rmSize}`);
    
    return NextResponse.json({ 
      success: true, 
      data: boms,
      count: boms.length
    });
  } catch (error: any) {
    console.error('Error fetching BOMs by RM:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
