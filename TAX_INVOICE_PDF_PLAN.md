# Tax Invoice PDF Export - Implementation Plan

## Objective
Implement 3-copy PDF export for Tax Invoice matching the Pinnacle Fastener format exactly.

## Requirements

### 1. **Three Copies in One PDF**
- Page 1: **Triplicate**
- Page 2: **Duplicate**  
- Page 3: **Original For Recipient**

Each copy should be identical except for the copy type label in the top-right corner.

### 2. **Page Breaks**
Use CSS page breaks to separate each copy:
```css
page-break-after: always;
```

### 3. **Layout Structure**

#### Top Section:
```
IRN: [IRN Number if available]                    (Triplicate/Duplicate/Original)
```

#### Left Column - Company Details:
```
PINNACLE FASTENER
Plot No. 1005/B1, Phase-III, G.I.D.C.,
Wadhwancity, Surendranagar, Gujarat, India - 363035
GSTIN: 24AAQCP2416F1ZD
PAN No: AAQCP2416F
State: Gujarat
State Code: 24
```

#### Right Column - Invoice Details:
```
INVOICE NO: PF/252600019          Date: 21/12/2025
P.O. No.: checking invoice printing  P.O. Date: 21/12/2025
Payment Term: 0 Days
Supplier Code: 0
Vehicle No/LR No: EG13AW3140 /
E-Way Bill No:
Dispatched Through: By Road
```

#### Billed To Section:
```
Details of Receiver (Billed To)
[Party Name]
[Address]
GSTIN: [GST Number]
State Code: [State Code]
```

#### Shipped To Section:
```
Details of Consignee (Shipped To)
[Same as Billed To or different]
GSTIN: [GST Number]
State Code: [State Code]
```

#### Item Table:
| Sr. No. | Description | HSN/SAC | No. & Type Of Packing | Total Qty. Nos./ Kgs | Rate Per Unit | Amount Rs. |
|---------|-------------|---------|----------------------|---------------------|---------------|------------|
| 1 | M12X1.75 Hex Nut - ISO4032 - MS<br>Item no 1 | 73181600 | 91000<br>KGS | 91000<br>KGS | 1.00 | 1281.69 |

#### GST Calculation Section:
```
Rs ZERO Rupees And Zero Paise Only                Transport Charges         0.00
                                                  Ass Value:           108,281.69
Rs ONE Lakh EIGHT Thousand TWO Hundred EIGHTY    CGST 9.00%:            9,745.35
ONE Rupees And SIXTY NINE Paise Only             SGST 9.00%:            9,745.35
                                                  IGST 0.00%:                0.00
                                                  TCS 0%:                    0.00
Net Total Rs ONE Lakh TWENTY SEVEN Thousand      Net Payable:         127,772.00
SEVEN Hundred SEVENTY TWO Rupees And ZERO Paise Only
```

#### Terms & Conditions:
```
I / we certify that our registration certificate under the GST Act, 2017 is in force on the date on which the supply of goods specified in this Tax Invoice is made by me/us & that the transaction of supply covered by this Tax Invoice had been effected by me/us & it shall be accounted for in the turnover of supplies while filing of return & the due tax, if any, payable on the supplies has been paid or shall be paid. Further certified that the particulars given above are true & correct & the amount indicated represents the prices actually charged & that there is no flow of additional consideration directly or indirectly from the buyer.

Date & time of issue: 21/12/2025 6:23:47 PM
```

#### Signature Section:
```
(Customer's Seal and Signature)    Prepared By: [Name]  Verified By: [Name]  Authorised Signatory
```

#### Footer:
```
(SUBJECT TO SURENDRANAGAR JURISDICTION)
(This is Computer Generated Invoice)
```

## Implementation Approach

### Function Structure:
```typescript
const handleDirectPDFExport = async (invoice: TaxInvoice) => {
  // Create hidden container
  const tempContainer = document.createElement('div');
  
  // Generate 3 copies
  const copies = ['Triplicate', 'Duplicate', 'Original For Recipient'];
  let htmlContent = '';
  
  copies.forEach((copyType, index) => {
    htmlContent += `
      <div style="page-break-after: ${index < 2 ? 'always' : 'auto'};">
        ${generateInvoiceHTML(invoice, copyType)}
      </div>
    `;
  });
  
  tempContainer.innerHTML = htmlContent;
  
  // Export to PDF
  await exportToPDF('temp-invoice-print', filename);
  
  // Cleanup
  document.body.removeChild(tempContainer);
};
```

### Helper Function:
```typescript
const generateInvoiceHTML = (invoice: TaxInvoice, copyType: string) => {
  return `
    <div style="padding: 20px; font-family: Arial, sans-serif; font-size: 11px;">
      <!-- IRN and Copy Type -->
      <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
        <div>${invoice.irnNumber ? `IRN: ${invoice.irnNumber}` : ''}</div>
        <div style="font-weight: bold;">(${copyType})</div>
      </div>
      
      <!-- Title -->
      <div style="text-align: center; margin-bottom: 15px;">
        <h2 style="margin: 0;">Tax Invoice</h2>
      </div>
      
      <!-- Company and Invoice Details Grid -->
      <!-- ... rest of the HTML ... -->
    </div>
  `;
};
```

## Data Mapping

### From Tax Invoice Model:
- ✅ invoiceNumber → INVOICE NO
- ✅ invoiceDate → Date
- ✅ irnNumber → IRN
- ✅ poNumber → P.O. No.
- ✅ paymentTerm → Payment Term
- ✅ supplierCode → Supplier Code
- ✅ vehicleNumber → Vehicle No/LR No
- ✅ eWayBillNo → E-Way Bill No
- ✅ dispatchedThrough → Dispatched Through
- ✅ party (populated) → Billed To details
- ✅ finishSize (populated) → Description
- ✅ quantity → Total Qty
- ✅ rate → Rate Per Unit
- ✅ packingType → Type Of Packing
- ✅ transportCharges → Transport Charges
- ✅ assessableValue → Ass Value
- ✅ cgstPercentage, cgstAmount → CGST
- ✅ sgstPercentage, sgstAmount → SGST
- ✅ igstPercentage, igstAmount → IGST
- ✅ tcsPercentage, tcsAmount → TCS
- ✅ totalAmount → Net Payable

### Static/Default Values:
- Company Name: "PINNACLE FASTENER"
- Company Address: "Plot No. 1005/B1, Phase-III, G.I.D.C., Wadhwancity..."
- Company GSTIN: "24AAQCP2416F1ZD"
- Company PAN: "AAQCP2416F"
- State: "Gujarat"
- State Code: "24"

## Styling Guidelines

- **Font**: Arial, sans-serif
- **Font Size**: 11px (body), 10px (small text)
- **Colors**: Black text on white background
- **Borders**: 1px solid black for tables
- **Layout**: Clean, professional, business document style
- **No gradients or colors** - black and white only

## Next Steps

1. Update Tax Invoice page to fetch populated data
2. Implement `handleDirectPDFExport` function
3. Add "Export PDF" button to Tax Invoice table
4. Test with real data
5. Adjust styling to match reference exactly

---

**Ready to implement!** All schema fields are in place.
