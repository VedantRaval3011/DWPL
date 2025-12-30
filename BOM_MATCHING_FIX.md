# BOM-to-RM Matching Logic Fix

## Problem
The original BOM matching logic was too strict. It required an **exact match** of both:
- RM Size
- RM Grade

This caused errors like:
```
RM item not found in inventory: "12" "MS"
```

Even though an RM item with size "12" existed in the Item Master, it had a different grade (e.g., "SAE1008" instead of "MS"), so the match failed.

## Root Cause
The code was using:
```typescript
const rmItem = rmItems.find(
  (item) => item.size === matchingBOMs[0].rmSize && item.grade === matchingBOMs[0].grade
);
```

This required **both** size AND grade to match exactly.

## Solution
Changed the matching logic to match **by size only**:
```typescript
const rmItem = rmItems.find(
  (item) => item.size === matchingBOMs[0].rmSize
);
```

## Benefits

### 1. **Flexibility**
One RM size can now be used for multiple FG sizes, regardless of grade:
- RM Size: 12.3 mm (any grade)
- Can produce FG: 11.75 mm, 11.9 mm, 12.15 mm

### 2. **Simplified Inventory**
You don't need to maintain multiple RM items with the same size but different grades just to match BOM specifications.

### 3. **Real-World Alignment**
In manufacturing, the physical size is what matters for the drawing process. The grade is a material property that doesn't change the size conversion logic.

## How It Works Now

### Step 1: User Selects Finish Size (FG)
Example: 11.75 mm - SAE1008

### Step 2: System Finds BOM
Searches for BOM where:
- FG Size = 11.75
- Grade = SAE1008

### Step 3: BOM Specifies RM Size
BOM says: "Use RM Size 12"

### Step 4: System Finds RM Item (Size-Only Match)
Searches Item Master for **any** RM item with size = 12
- Could be: 12 - SAE1008
- Could be: 12 - MS
- Could be: 12 - Any other grade
- **First match is used**

### Step 5: Original Size Auto-Fills
The found RM item is automatically selected, regardless of its grade.

## Example Scenarios

### Scenario 1: Single RM Size, Multiple Grades ✅
**Item Master:**
- RM: 12 - SAE1008
- RM: 12 - MS
- FG: 11.75 - SAE1008

**BOM:**
- FG: 11.75 (SAE1008) → RM: 12

**Result:** System finds "12 - SAE1008" (first match) ✅

### Scenario 2: RM Size Doesn't Exist ❌
**Item Master:**
- RM: 10 - SAE1008
- FG: 11.75 - SAE1008

**BOM:**
- FG: 11.75 (SAE1008) → RM: 12

**Result:** Error - "RM item with size '12' not found" ❌
**Solution:** Add any RM item with size 12 to Item Master

### Scenario 3: One RM for Multiple FGs ✅
**Item Master:**
- RM: 12.3 - SAE1008
- FG: 11.75 - SAE1008
- FG: 11.9 - SAE1008
- FG: 12.15 - SAE1008

**BOM:**
- FG: 11.75 (SAE1008) → RM: 12.3
- FG: 11.9 (SAE1008) → RM: 12.3
- FG: 12.15 (SAE1008) → RM: 12.3

**Result:** All three FGs can use the same RM (12.3) ✅

## Updated Error Messages

### Before:
```
RM item "12 - MS" not found in Item Master. Please add it first.
```

### After:
```
RM item with size "12" not found in Item Master. Please add it (any grade is acceptable).
```

## Console Logging

The system now logs:
```
Looking for RM item with size: 12
RM item found: { _id: '...', size: '12', grade: 'SAE1008', mill: 'TATA' }
Form updated with RM item: ... 12 SAE1008
```

If not found:
```
RM item not found in inventory with size: 12
Available RM items: [{ size: '10', grade: 'SAE1008' }, { size: '14', grade: 'MS' }]
```

## Migration Notes

### No Database Changes Required
This is purely a logic change in the frontend code. No changes to:
- BOM schema
- Item Master schema
- API endpoints

### Existing BOMs Work As-Is
All existing BOM entries will continue to work. The system is now more forgiving about grade matching.

### Recommendation
When creating BOM entries, you can now:
1. Set the RM size to match what you actually use
2. The grade in the BOM can be informational only
3. System will find any RM item with that size

## Files Modified
- `src/app/outward-challan/page.tsx`
  - `fetchBOMsForFG()` function
  - Original Size field error message
