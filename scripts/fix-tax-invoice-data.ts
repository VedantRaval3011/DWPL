// Script to fix corrupted Tax Invoice data
// Run this with: npx tsx scripts/fix-tax-invoice-data.ts

import { connectDB } from '../src/lib/db';
import { TaxInvoice } from '../src/models/TaxInvoice';
import mongoose from 'mongoose';

async function fixTaxInvoiceData() {
  try {
    console.log('Connecting to database...');
    await connectDB();
    
    console.log('Fetching all tax invoices...');
    // Fetch raw documents without populate to see actual stored values
    const invoices = await TaxInvoice.find().lean();
    
    console.log(`Found ${invoices.length} invoice(s)`);
    
    let corruptedCount = 0;
    let fixedCount = 0;
    
    for (const invoice of invoices) {
      console.log('\n---');
      console.log('Invoice:', invoice.invoiceNumber);
      console.log('Party field type:', typeof invoice.party);
      console.log('Party field value:', invoice.party);
      
      // Check if party is a string (corrupted)
      if (typeof invoice.party === 'string') {
        console.log('⚠️  CORRUPTED: Party is stored as string instead of ObjectId');
        corruptedCount++;
        
        // Try to parse if it's a stringified object
        if (invoice.party.includes('partyName')) {
          console.log('❌ Party contains object data - this invoice needs to be deleted and recreated');
          console.log('Deleting corrupted invoice:', invoice.invoiceNumber);
          
          await TaxInvoice.deleteOne({ _id: invoice._id });
          fixedCount++;
          console.log('✅ Deleted corrupted invoice');
        }
      } else if (mongoose.Types.ObjectId.isValid(invoice.party)) {
        console.log('✅ OK: Party is a valid ObjectId');
      } else {
        console.log('❓ Unknown party format');
      }
    }
    
    console.log('\n=== Summary ===');
    console.log(`Total invoices: ${invoices.length}`);
    console.log(`Corrupted invoices: ${corruptedCount}`);
    console.log(`Fixed (deleted): ${fixedCount}`);
    console.log('\nNote: Deleted invoices need to be recreated from their outward challans.');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixTaxInvoiceData();
