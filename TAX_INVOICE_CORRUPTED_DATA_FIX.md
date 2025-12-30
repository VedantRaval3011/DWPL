# Tax Invoice Corrupted Data Fix

## Critical Error

```
Failed to fetch invoices: "Cast to ObjectId failed for value 
'{\n\n _id: new ObjectId('694e39a0adfa4b98649be8e4'),\n\n partyName: 'Tata Steel Ltd',
\n\n address: 'Ahmedabad, Gujarat',\n\n gstNumber: '24AAACT1234A1Z5',
\n\n contactNumber: '9876543210',\n\n annealingCharge: 3,\n\n drawCharge: 60,
\n\n isActive: true,\n\n createdAt: 2025-12-26T07:30:40.555Z,
\n\n updatedAt: 2025-12-26T07:30:40.555Z,\n\n __v: 0\n\n }' (type string) 
at path '\_id' for model 'PartyMaster'"
```

## Root Cause

**Corrupted Database Records**: Some Tax Invoices were created **before** we applied the fix for populated references. These invoices have the `party`, `finishSize`, and `originalSize` fields stored as **stringified objects** instead of **ObjectIds**.

### How It Happened

1. **Before the fix** (earlier today), when creating a Tax Invoice:
   ```typescript
   // ❌ WRONG: Passed populated objects directly
   const invoice = await TaxInvoice.create({
     party: challan.party,  // This was a full object!
     finishSize: challan.finishSize,  // This was a full object!
     originalSize: challan.originalSize,  // This was a full object!
   });
   ```

2. Mongoose tried to save these objects and **stringified them**

3. Now in the database, instead of:
   ```javascript
   party: ObjectId('694e39a0adfa4b98649be8e4')  // ✅ Correct
   ```
   
   We have:
   ```javascript
   party: "{\n _id: ObjectId('694e39a0adfa4b98649be8e4'), partyName: 'Tata Steel Ltd', ...}"  // ❌ Corrupted!
   ```

4. When trying to `.populate('party')`, Mongoose can't convert this string to an ObjectId → **CRASH!**

## Solution Applied

### 1. Enhanced GET Endpoint with Corruption Detection

Updated `/api/tax-invoice` GET endpoint to:
- ✅ Fetch raw data first (without populate)
- ✅ Check for corrupted references
- ✅ Return helpful error message with invoice numbers
- ✅ Prevent the crash and guide user to fix

```typescript
// Check for corrupted data
const corruptedInvoices = rawInvoices.filter(inv => {
  const isPartyCorrupted = typeof inv.party === 'string' && inv.party.includes('{');
  const isFinishSizeCorrupted = typeof inv.finishSize === 'string' && inv.finishSize.includes('{');
  const isOriginalSizeCorrupted = typeof inv.originalSize === 'string' && inv.originalSize.includes('{');
  return isPartyCorrupted || isFinishSizeCorrupted || isOriginalSizeCorrupted;
});

if (corruptedInvoices.length > 0) {
  return NextResponse.json({
    success: false,
    error: `Found ${corruptedInvoices.length} corrupted invoice(s). Please delete invoices: ${corruptedInvoices.map(i => i.invoiceNumber).join(', ')}`,
    corruptedInvoices: corruptedInvoices.map(i => ({
      _id: i._id,
      invoiceNumber: i.invoiceNumber,
    }))
  });
}
```

### 2. Created DELETE Endpoint

Created `/api/tax-invoice/[id]` DELETE endpoint to easily remove corrupted invoices:

```typescript
DELETE /api/tax-invoice/[invoice_id]
```

### 3. Prevention (Already Applied)

The POST endpoint was already fixed to extract IDs from populated objects:

```typescript
// ✅ CORRECT: Extract IDs from populated references
const invoice = await TaxInvoice.create({
  party: (challan.party as any)?._id || challan.party,
  finishSize: (challan.finishSize as any)?._id || challan.finishSize,
  originalSize: (challan.originalSize as any)?._id || challan.originalSize,
});
```

## How to Fix

### Option 1: Delete Corrupted Invoices via API (Recommended)

When you refresh the Tax Invoice page, you'll see an error message like:

```
Found 1 corrupted invoice(s). Please delete invoices: INV-001
```

The error response includes the corrupted invoice IDs. You can delete them using:

```bash
# Using curl
curl -X DELETE http://localhost:3000/api/tax-invoice/[invoice_id]

# Or using fetch in browser console
fetch('/api/tax-invoice/[invoice_id]', { method: 'DELETE' })
  .then(r => r.json())
  .then(console.log)
```

### Option 2: Delete Directly from MongoDB

1. Open MongoDB Compass or mongosh
2. Connect to your database
3. Find the `taxinvoices` collection
4. Delete documents where `party` is a string containing `{`

```javascript
// In mongosh
db.taxinvoices.deleteMany({
  $or: [
    { party: { $type: "string", $regex: /\{/ } },
    { finishSize: { $type: "string", $regex: /\{/ } },
    { originalSize: { $type: "string", $regex: /\{/ } }
  ]
})
```

### Option 3: Use the Fix Script

Run the automated fix script:

```bash
npx tsx scripts/fix-tax-invoice-data.ts
```

This will:
- ✅ Detect corrupted invoices
- ✅ Delete them automatically
- ✅ Show summary of what was fixed

## After Fixing

1. **Refresh the Tax Invoice page** - Error should be gone
2. **Recreate the deleted invoices**:
   - Go to Tax Invoice page
   - Click "Create Invoice"
   - Select the outward challan
   - Generate invoice again
3. **New invoices will be created correctly** with proper ObjectId references

## Prevention Going Forward

✅ **The fix is already in place!** All new invoices created from now on will have proper ObjectId references because the POST endpoint extracts IDs from populated objects.

## Files Modified

- ✅ `src/app/api/tax-invoice/route.ts` - Added corruption detection in GET endpoint
- ✅ `src/app/api/tax-invoice/[id]/route.ts` - Created DELETE endpoint
- ✅ `scripts/fix-tax-invoice-data.ts` - Created automated fix script

## Console Output

After the fix, when fetching invoices, you'll see:

```
Fetching tax invoices...
Found 1 invoice(s) in database
⚠️  CORRUPTED INVOICES DETECTED: 1
  - Invoice INV-001 (ID: 694e39a0adfa4b98649be8e4)
```

Or if no corruption:

```
Fetching tax invoices...
Found 2 invoice(s) in database
Successfully fetched 2 invoice(s)
```

## Summary

| Issue | Status |
|-------|--------|
| Corrupted invoices crash the page | ✅ Fixed - Now shows helpful error |
| Can't delete corrupted invoices | ✅ Fixed - DELETE endpoint created |
| New invoices get corrupted | ✅ Fixed - POST endpoint extracts IDs |
| No way to detect corruption | ✅ Fixed - GET endpoint checks data |

---

**Next Step**: Delete the corrupted invoice(s) using one of the methods above, then recreate them. All future invoices will be created correctly! 🎉
