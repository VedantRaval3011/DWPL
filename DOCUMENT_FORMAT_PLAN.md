# Document Format Implementation Plan

## Overview
This document outlines the plan to update the Outward Challan and Tax Invoice PDF export formats to match the provided reference documents.

## 1. Outward Challan Format Update

### Reference: Drawell Wires Private Limited Delivery Challan

### Key Elements to Implement:

#### Header Section:
- Company Name: "Drawell Wires Private Limited" (or DWPL INDUSTRIES)
- Full Address with multiple lines
- Phone, Email, GSTIN details
- Title: "Delivery Challan" (centered, bold)

#### Left Section - Consignee Details:
- Consignee Name
- Address
- GSTIN

#### Right Section - Challan Info:
- Challan No
- Date
- Transport Mode
- Destination
- Our GSTIN

#### Item Table:
Columns:
1. Sr. No
2. Draw Wire Size (Finish Size)
3. Original Wire Size (RM Size)
4. Wire Grade
5. Quantity
6. Rate
7. Amount

#### Bottom Section:
- Process Done: Wire Draw Process details
- Total Amount (in words and figures)
- Footer: "Subject to Surendranagar Jurisdiction Only"
- Authorized Signatory box (right aligned)

### Design Notes:
- Simple table borders
- Minimal styling
- Black and white only
- Professional business document look

---

## 2. Tax Invoice Format Update

### Reference: Pinnacle Fastener Tax Invoice

### Key Requirement:
**Generate 3 copies in single PDF:**
1. **Triplicate** (page 1)
2. **Duplicate** (page 2)
3. **Original For Recipient** (page 3)

### Key Elements to Implement:

#### Top Section:
- IRN number (if applicable)
- Copy type indicator (Triplicate/Duplicate/Original) - top right corner

#### Left Column - Company Details:
- Company Name
- Full Address
- GSTIN
- PAN No
- State Code

#### Right Column - Invoice Details:
- INVOICE NO
- Date
- P.O. No
- Payment Term
- Supplier Code
- Vehicle No/LR No
- E-Way Bill No
- Dispatched Through

#### Billed To Section:
- Details of Receiver (Billed To)
- Company Name
- Address
- GSTIN
- State Code

#### Shipped To Section:
- Details of Consignee (Shipped To)
- Company Name
- Address
- GSTIN
- State Code

#### Item Table:
Columns:
1. Sr. No.
2. Description
3. HSN/SAC
4. No. & Type Of Packing
5. Total Qty. Nos./ Kgs
6. Rate Per Unit
7. Amount Rs.

#### GST Calculation Section:
- Transport Charges
- Ass Value
- CGST 9.00%
- SGST 9.00%
- IGST 0.00%
- TCS 0%
- **Net Payable**

#### Terms & Conditions:
- GST registration certificate text
- Supply covered by Pin Tax Invoice
- Date & time of issue

#### Bottom Section:
- (Customer's Seal and Signature) - left
- Prepared By | Verified By | Authorised Signatory - right
- Footer: "SUBJECT TO SURENDRANAGAR JURISDICTION"
- Sub-footer: "(This is Computer Generated Invoice)"

### Design Notes:
- Clean table borders
- Professional layout
- Black text on white background
- Proper spacing and alignment
- Each copy should be identical except for the copy type label

---

## Implementation Strategy

### Phase 1: Outward Challan Update
1. Update `handleDirectPDFExport` in `src/app/outward-challan/page.tsx`
2. Redesign HTML template to match Drawell format
3. Simplify styling (remove gradients, use simple borders)
4. Add all required fields
5. Test PDF generation

### Phase 2: Tax Invoice Implementation
1. View current Tax Invoice page structure
2. Create `handleDirectPDFExport` function in `src/app/tax-invoice/page.tsx`
3. Design HTML template matching Pinnacle format
4. Implement 3-copy generation:
   - Loop through copy types: ['Triplicate', 'Duplicate', 'Original For Recipient']
   - Render same content 3 times with different copy labels
   - Use page breaks between copies
5. Add GST calculation logic
6. Add all required fields
7. Test multi-page PDF generation

### Technical Considerations:

#### For Multi-Page PDF (Tax Invoice):
```typescript
// Render 3 copies
const copies = ['Triplicate', 'Duplicate', 'Original For Recipient'];
let htmlContent = '';

copies.forEach((copyType, index) => {
  htmlContent += `
    <div style="page-break-after: ${index < 2 ? 'always' : 'auto'};">
      <!-- Invoice content with copyType label -->
    </div>
  `;
});
```

#### CSS for Page Breaks:
```css
@media print {
  .page-break {
    page-break-after: always;
  }
}
```

### Data Requirements:

#### Outward Challan Needs:
- ✅ Challan Number
- ✅ Date
- ✅ Party Details (Consignee)
- ✅ Item Details (FG Size, RM Size, Grade, Quantity, Rate)
- ✅ Total Amount
- ❓ Transport Mode (add to form?)
- ❓ Destination (add to form?)

#### Tax Invoice Needs:
- ❓ IRN Number
- ❓ Invoice Number
- ❓ P.O. Number
- ❓ Payment Terms
- ❓ Supplier Code
- ❓ Vehicle No/LR No
- ❓ E-Way Bill No
- ❓ Dispatched Through
- ❓ HSN/SAC codes for items
- ❓ Packing details
- ❓ GST rates (CGST, SGST, IGST, TCS)
- ❓ Transport Charges
- ❓ Assessable Value

**Note:** Many of these fields don't currently exist in the data model. Need to:
1. Check existing Tax Invoice schema
2. Add missing fields if needed
3. Update form to collect these values

---

## Next Steps

1. **Confirm Data Availability:**
   - Check Tax Invoice model for existing fields
   - Identify which fields need to be added
   - Decide on default values for optional fields

2. **Start with Outward Challan:**
   - Simpler format
   - Most data already available
   - Good test case for PDF generation

3. **Then Tax Invoice:**
   - More complex
   - Requires multi-page handling
   - May need schema updates

4. **Testing:**
   - Generate sample PDFs
   - Compare with reference images
   - Adjust styling as needed
   - Test with real data

---

## Questions for User

1. Should we add Transport Mode and Destination fields to the Outward Challan form?
2. For Tax Invoice, do we have all the required data fields in the database?
3. Should the company name be "DWPL INDUSTRIES" or "Drawell Wires Private Limited"?
4. What should be the default GST rates (CGST/SGST/IGST/TCS percentages)?
5. Do you want to implement both formats now, or start with one?
