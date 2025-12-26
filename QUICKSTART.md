# DWPL Manufacturing System - Quick Start Guide

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- MongoDB installed locally OR MongoDB Atlas account
- Basic understanding of manufacturing processes

### Installation Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Up Database**
   
   Create a `.env.local` file in the root directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/dwpl
   ```
   
   Or for MongoDB Atlas:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dwpl
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```

4. **Open Browser**
   
   Navigate to: http://localhost:3000

## 📋 Initial Setup Workflow

Follow this exact sequence to set up your system:

### Step 1: Create Parties
**Path:** Masters → Party Master

Create at least one party with:
- Party Name
- Address
- GST Number (format: 27AAPFU0939F1ZV)
- Contact Number
- **Annealing Charge** (e.g., 5.00 per unit)
- **Draw Charge** (e.g., 3.00 per pass)

**Why:** Charges are auto-applied in outward challans

### Step 2: Create Items (RM & FG)
**Path:** Masters → Item Master

#### Create Raw Materials (RM):
- Category: RM
- Size: 8mm, 10mm, 12mm (examples)
- Grade: MS, SS304, etc.
- Mill: TATA, JSW, etc.
- HSN Code: 7217

#### Create Finished Goods (FG):
- Category: FG
- Size: 6mm, 8mm, 10mm (examples)
- Grade: MS, SS304, etc.
- Mill: TATA, JSW, etc.
- HSN Code: 7217

**Why:** Items must exist before creating BOMs

### Step 3: Create GST Rates
**Path:** Masters → GST Master

Create GST rates for your HSN codes:
- HSN Code: 7217
- GST Percentage: 18%

**Why:** GST is auto-calculated in tax invoices

### Step 4: Create BOMs
**Path:** Masters → BOM & Routing

Define size conversion rules:
- **FG Size:** 6mm (must match Item Master)
- **RM Size:** 8mm (must match Item Master)
- **Grade:** MS
- **Annealing Range:** 0-7 (min-max)
- **Draw Pass Range:** 0-10 (min-max)

Example BOMs:
```
8mm (RM) → 6mm (FG), Grade: MS, Annealing: 0-7, Draw: 0-10
10mm (RM) → 8mm (FG), Grade: MS, Annealing: 0-7, Draw: 0-10
12mm (RM) → 10mm (FG), Grade: MS, Annealing: 0-7, Draw: 0-10
```

**Why:** BOM controls which RM can convert to which FG and process limits

### Step 5: Create GRN (Receive Stock)
**Path:** GRN

Record incoming raw materials:
- Select Sending Party
- Enter Party Challan Number
- Select RM Size (e.g., 8mm MS)
- Enter Quantity (e.g., 1000)
- Enter Rate (e.g., 50.00)
- Select GRN Date

**Result:** RM stock increases automatically

### Step 6: Verify Stock
**Path:** Stock

Check that RM stock has been updated:
- Filter by RM
- Verify quantity matches GRN

### Step 7: Create Outward Challan
**Path:** Outward Challan

Create production record:
1. Select Party
2. Select **Finish Size (FG)** - e.g., 6mm MS
3. **Original Size (RM)** auto-fills from BOM - e.g., 8mm MS
4. Select **Annealing Count** from dropdown (0-7 based on BOM)
5. Select **Draw Pass Count** from dropdown (0-10 based on BOM)
6. Enter Quantity (must be ≤ RM stock)
7. Enter Rate

**Charge Breakdown Shows:**
- Material Cost = Quantity × Rate
- Annealing Charge = Party's Annealing Charge × Quantity × Annealing Count
- Draw Charge = Party's Draw Charge × Quantity × Draw Pass Count
- **Total Amount** = Sum of all above

**Result:** 
- RM stock decreases
- FG stock increases
- Challan created with auto-calculated charges

### Step 8: Verify Stock Again
**Path:** Stock

Check stock changes:
- RM should have decreased
- FG should have increased

### Step 9: Create Tax Invoice
**Path:** Tax Invoice

Generate invoice from challan:
1. Select Outward Challan from dropdown
2. Select Invoice Date
3. Click "Generate Invoice"

**Auto-Calculated:**
- Base Amount (from challan)
- GST % (from HSN code)
- GST Amount
- Total Amount

**Result:** Tax invoice created with GST

## 🎯 Key Business Rules

### BOM Rules
✅ **DO:**
- Create BOM before outward challan
- Use exact size and grade from Item Master
- Set realistic annealing (0-7) and draw pass (0-10) ranges

❌ **DON'T:**
- Try to create outward challan without BOM
- Use sizes not in Item Master

### Stock Rules
✅ **DO:**
- Create GRN before outward challan
- Check stock availability before creating challan

❌ **DON'T:**
- Try to create outward challan with insufficient RM stock
- Expect negative stock (system prevents this)

### Charge Rules
✅ **DO:**
- Set party charges before creating outward challan
- Verify charge breakdown before submitting

❌ **DON'T:**
- Manually override charges (they're auto-calculated)

### Invoice Rules
✅ **DO:**
- Create outward challan first
- Ensure HSN code has GST rate defined

❌ **DON'T:**
- Try to create invoice without outward challan
- Create multiple invoices for same challan (system prevents this)

## 🔍 Common Issues & Solutions

### Issue: "No BOM found for FG"
**Solution:** Create BOM linking the FG size to an RM size

### Issue: "Insufficient RM stock"
**Solution:** Create GRN to receive more RM stock

### Issue: "GST rate not found for HSN Code"
**Solution:** Add GST rate in GST Master for that HSN code

### Issue: "Invoice already exists for this challan"
**Solution:** Each challan can only have one invoice

### Issue: Annealing/Draw dropdown is empty
**Solution:** Check BOM has valid min-max ranges

## 📊 Sample Data Set

Here's a complete sample data set to get started:

### Party
- Name: ABC Industries
- GST: 27AAPFU0939F1ZV
- Contact: 9876543210
- Annealing Charge: 5.00
- Draw Charge: 3.00

### Items (RM)
- 8mm, MS, TATA, HSN: 7217
- 10mm, MS, TATA, HSN: 7217

### Items (FG)
- 6mm, MS, TATA, HSN: 7217
- 8mm, MS, TATA, HSN: 7217

### GST
- HSN: 7217, GST: 18%

### BOM
- FG: 6mm, RM: 8mm, Grade: MS, Annealing: 0-7, Draw: 0-10

### GRN
- Party: ABC Industries
- Challan: CH001
- RM: 8mm MS
- Qty: 1000
- Rate: 50.00

### Outward Challan
- Party: ABC Industries
- FG: 6mm MS (RM: 8mm MS auto-filled)
- Annealing: 3
- Draw Pass: 5
- Qty: 500
- Rate: 75.00

**Expected Charges:**
- Material: 500 × 75 = ₹37,500
- Annealing: 5 × 500 × 3 = ₹7,500
- Draw: 3 × 500 × 5 = ₹7,500
- **Total: ₹52,500**

### Tax Invoice
- Select above challan
- Base: ₹52,500
- GST 18%: ₹9,450
- **Total: ₹61,950**

## 🎓 Training Tips

1. **Start Small:** Create 1-2 items, 1 BOM, test the flow
2. **Verify Each Step:** Check stock after each transaction
3. **Understand BOM:** It's the heart of the system
4. **Follow Sequence:** Masters → GRN → Stock → Outward → Invoice
5. **Check Calculations:** Verify charge breakdown makes sense

## 📞 Need Help?

- Check README.md for detailed documentation
- Review IMPLEMENTATION.md for technical details
- Verify all masters are created before transactions

---

**Happy Manufacturing! 🏭**
