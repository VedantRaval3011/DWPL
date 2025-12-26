import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { TaxInvoice } from '@/models/TaxInvoice';
import { OutwardChallan } from '@/models/OutwardChallan';
import { ItemMaster } from '@/models/ItemMaster';
import { GSTMaster } from '@/models/GSTMaster';
import { generateSequentialNumber } from '@/lib/utils';

export async function GET() {
  try {
    await connectDB();
    const invoices = await TaxInvoice.find()
      .populate('party')
      .populate('outwardChallan')
      .populate('finishSize')
      .populate('originalSize')
      .sort({ invoiceDate: -1 });
    
    return NextResponse.json({ success: true, data: invoices });
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
    
    // Validate outward challan exists
    const challan = await OutwardChallan.findById(body.outwardChallan)
      .populate('party')
      .populate('finishSize')
      .populate('originalSize');
    
    if (!challan) {
      return NextResponse.json(
        { success: false, error: 'Outward Challan not found' },
        { status: 400 }
      );
    }
    
    // Check if invoice already exists for this challan
    const existingInvoice = await TaxInvoice.findOne({ outwardChallan: body.outwardChallan });
    if (existingInvoice) {
      return NextResponse.json(
        { success: false, error: 'Invoice already exists for this Outward Challan' },
        { status: 400 }
      );
    }
    
    // Get FG item to fetch HSN code
    const fgItem = await ItemMaster.findById(challan.finishSize);
    if (!fgItem) {
      return NextResponse.json(
        { success: false, error: 'Finish Size item not found' },
        { status: 400 }
      );
    }
    
    // Get GST percentage from GST Master
    const gstMaster = await GSTMaster.findOne({ hsnCode: fgItem.hsnCode, isActive: true });
    if (!gstMaster) {
      return NextResponse.json(
        { success: false, error: `GST rate not found for HSN Code: ${fgItem.hsnCode}` },
        { status: 400 }
      );
    }
    
    // Generate invoice number
    const invoiceNumber = await generateSequentialNumber('INV', TaxInvoice, 'invoiceNumber');
    
    // Create tax invoice with data from outward challan
    const invoice = await TaxInvoice.create({
      invoiceNumber,
      outwardChallan: challan._id,
      party: challan.party,
      finishSize: challan.finishSize,
      originalSize: challan.originalSize,
      annealingCount: challan.annealingCount,
      drawPassCount: challan.drawPassCount,
      quantity: challan.quantity,
      rate: challan.rate,
      annealingCharge: challan.annealingCharge,
      drawCharge: challan.drawCharge,
      gstPercentage: gstMaster.gstPercentage,
      invoiceDate: body.invoiceDate || new Date(),
    });
    
    // Populate and return
    await invoice.populate(['party', 'outwardChallan', 'finishSize', 'originalSize']);
    
    return NextResponse.json(
      { success: true, data: invoice },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
