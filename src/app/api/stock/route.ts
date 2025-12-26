import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { getAllStock } from '@/lib/stockManager';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    
    const stocks = await getAllStock();
    
    const filteredStocks = category
      ? stocks.filter((s) => s.category === category)
      : stocks;
    
    return NextResponse.json({ success: true, data: filteredStocks });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
