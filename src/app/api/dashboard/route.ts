import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { PartyMaster } from '@/models/PartyMaster';
import { ItemMaster } from '@/models/ItemMaster';

export async function GET() {
  try {
    await connectDB();
    
    // Count total parties
    const totalParties = await PartyMaster.countDocuments();
    
    // Count total items
    const totalItems = await ItemMaster.countDocuments();
    
    return NextResponse.json({
      success: true,
      data: {
        totalParties,
        totalItems,
        pendingChallans: 0, // Can be implemented later
        pendingInvoices: 0, // Can be implemented later
      },
    });
  } catch (error: any) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
