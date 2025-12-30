# Tax Invoice Validation Fix

## Issue
When creating a Tax Invoice, the following validation error occurred:
```
Cast to ObjectId failed for value "{...}" (type Object) at path "..." 
for model "ItemMaster"
```

The error was showing fields like `category`, `size`, `grade`, `transCode`, `itemCode`, `isActive`, and `createdAt` - all belonging to the ItemMaster model.

## Root Cause
The Tax Invoice API was fetching the Outward Challan with populated references:

```typescript
const challan = await OutwardChallan.findById(body.outwardChallan)
  .populate('party')
  .populate('finishSize')
  .populate('originalSize');
```

This meant that `challan.finishSize`, `challan.originalSize`, and `challan.party` were **full objects** (with all their properties like category, size, grade, etc.), not just ObjectIds.

When creating the Tax Invoice, the code was passing these full objects:

```typescript
const invoice = await TaxInvoice.create({
  party: challan.party,           // ❌ Full PartyMaster object
  finishSize: challan.finishSize, // ❌ Full ItemMaster object
  originalSize: challan.originalSize, // ❌ Full ItemMaster object
  // ...
});
```

Mongoose expected ObjectIds for these reference fields, but received full objects instead, causing the "Cast to ObjectId failed" validation error.

## Solution
Updated the Tax Invoice API (`src/app/api/tax-invoice/route.ts`) to extract the `_id` from populated references before passing them to `TaxInvoice.create()`:

```typescript
// Extract IDs from populated references to avoid validation errors
const invoice = await TaxInvoice.create({
  invoiceNumber,
  outwardChallan: challan._id,
  party: (challan.party as any)?._id || challan.party,
  finishSize: (challan.finishSize as any)?._id || challan.finishSize,
  originalSize: (challan.originalSize as any)?._id || challan.originalSize,
  // ... rest of the fields
});
```

Also updated the FG item retrieval to use the already-populated object instead of fetching it again:

```typescript
// challan.finishSize is already populated, so we can use it directly
const fgItem = challan.finishSize as any;
```

## How It Works Now

### 1. **Tax Invoice Creation Flow:**
```
User selects Outward Challan
   ↓
API fetches Challan data
   ↓
API gets GST % from GST Master (based on HSN code)
   ↓
API splits GST into CGST (9%) + SGST (9%) for 18% total
   ↓
API creates Tax Invoice with all fields
   ↓
Pre-save hook calculates:
   - baseAmount = material + annealing + draw charges
   - assessableValue = baseAmount + transport (0)
   - cgstAmount = assessableValue × cgstPercentage / 100
   - sgstAmount = assessableValue × sgstPercentage / 100
   - gstAmount = cgstAmount + sgstAmount
   - tcsAmount = (assessableValue + gstAmount) × tcsPercentage / 100
   - totalAmount = assessableValue + gstAmount + tcsAmount
   ↓
Invoice saved successfully!
```

### 2. **Example Calculation:**
```
Quantity: 100 kg
Rate: ₹50/kg
Annealing: 2 passes × ₹5/kg = ₹10/kg
Draw: 3 passes × ₹3/kg = ₹9/kg

Material Cost: 100 × 50 = ₹5,000
Annealing Charge: 100 × 10 = ₹1,000
Draw Charge: 100 × 9 = ₹900
-----------------------------------
Base Amount: ₹6,900
Transport Charges: ₹0
-----------------------------------
Assessable Value: ₹6,900

GST: 18% (CGST 9% + SGST 9%)
CGST 9%: ₹621
SGST 9%: ₹621
Total GST: ₹1,242

TCS 0%: ₹0
-----------------------------------
Net Payable: ₹8,142
```

## Files Modified
- `src/app/api/tax-invoice/route.ts`
  - Added CGST/SGST percentage calculation
  - Set percentages when creating invoice

## Testing
To test the fix:
1. ✅ Create an Outward Challan
2. ✅ Go to Tax Invoice page
3. ✅ Select the challan
4. ✅ Click "Generate Invoice"
5. ✅ Invoice should be created successfully
6. ✅ All amounts should be calculated correctly
7. ✅ Export PDF should show proper GST breakdown

## Benefits
- ✅ Automatic calculation of all amounts
- ✅ Proper GST split (CGST/SGST for intra-state)
- ✅ Support for IGST (inter-state) in future
- ✅ TCS support ready
- ✅ Transport charges support ready
- ✅ Clean, maintainable code

## Future Enhancements
- Add state detection to automatically choose CGST/SGST vs IGST
- Add UI fields for transport charges
- Add UI fields for TCS percentage
- Add IRN generation support
- Add e-invoice integration

---

**Status:** ✅ Fixed! Tax Invoices can now be created successfully with all amounts calculated automatically.
