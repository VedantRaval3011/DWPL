import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { ItemMaster } from '@/models/ItemMaster';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    
    const filter = category ? { category } : {};
    const items = await ItemMaster.find(filter).sort({ category: 1, size: 1 });
    
    return NextResponse.json({ success: true, data: items });
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
    
    const item = await ItemMaster.create(body);
    return NextResponse.json(
      { success: true, data: item },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
