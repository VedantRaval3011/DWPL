# Bidirectional BOM Lookup - Implementation Summary

## Feature Overview
Implemented **bidirectional BOM lookup** for the Outward Challan form. Users can now enter **either** the Finish Size (FG) **or** the Original Size (RM), and the system will automatically populate the other field based on the BOM configuration.

## How It Works

### Option 1: Select Finish Size (FG) First
1. User selects a Finish Size (e.g., 11.75 mm - SAE1008)
2. System searches BOM for matching FG size and grade
3. BOM specifies the required RM size (e.g., 12 mm)
4. System finds RM item with that size (any grade)
5. Original Size field auto-fills with the RM item

### Option 2: Select Original Size (RM) First
1. User selects an Original Size (e.g., 12 mm - SAE1008)
2. System searches BOM for entries using that RM size
3. BOM specifies which FG can be produced (e.g., 11.75 mm - SAE1008)
4. System finds FG item with that size and grade
5. Finish Size field auto-fills with the FG item

## Technical Implementation

### 1. State Management
Added `lastChangedField` state to track which field was modified last:
```typescript
const [lastChangedField, setLastChangedField] = useState<'fg' | 'rm' | null>(null);
```

This prevents infinite loops when auto-filling fields.

### 2. New Function: fetchBOMsForRM()
Created reverse BOM lookup function:
```typescript
const fetchBOMsForRM = async (rmItemId: string) => {
  // Find RM item
  // Search BOMs that use this RM size
  // Find corresponding FG item
  // Auto-fill finish size
}
```

### 3. Updated useEffect Hooks
Modified to only trigger when the respective field was manually changed:

**For Finish Size:**
```typescript
useEffect(() => {
  if (formData.finishSize && lastChangedField === 'fg') {
    fetchBOMsForFG(formData.finishSize);
  }
}, [formData.finishSize, lastChangedField]);
```

**For Original Size:**
```typescript
useEffect(() => {
  if (formData.originalSize && lastChangedField === 'rm') {
    fetchBOMsForRM(formData.originalSize);
  }
}, [formData.originalSize, lastChangedField]);
```

### 4. Updated UI Components

**Finish Size Field:**
- Added `setLastChangedField('fg')` on change
- Updated helper text: "Select finish size - Original size will be auto-filled from BOM"

**Original Size Field:**
- Changed from disabled input to editable ItemSelector
- Added `setLastChangedField('rm')` on change
- Shows stock availability in helper text
- Helper text: "Select original size - Finish size will be auto-filled from BOM"

## User Experience

### Before:
- ❌ Original Size was disabled (read-only)
- ❌ Could only select Finish Size
- ❌ If BOM/RM item missing, user was stuck

### After:
- ✅ Both fields are selectable
- ✅ User can start with either FG or RM
- ✅ More flexible workflow
- ✅ Clear helper text explains what will happen

## Example Workflows

### Workflow 1: Know the Finish Size
```
1. Select FG: 11.75 mm - SAE1008
2. System auto-fills RM: 12 mm - SAE1008
3. Shows stock: ✓ Available Stock: 150.00 units
4. User continues with quantity/rate
```

### Workflow 2: Know the Original Size
```
1. Select RM: 12 mm - SAE1008
2. System auto-fills FG: 11.75 mm - SAE1008
3. Shows stock: ✓ Available Stock: 150.00 units
4. User continues with quantity/rate
```

### Workflow 3: Multiple FG Options
```
1. Select RM: 12.3 mm - SAE1008
2. System finds multiple BOMs:
   - FG: 11.75 mm - SAE1008
   - FG: 11.9 mm - SAE1008
   - FG: 12.15 mm - SAE1008
3. System auto-fills with FIRST match (11.75 mm)
4. User can manually change FG if needed
```

## Benefits

### 1. **Flexibility**
Users can work with whichever size they know first.

### 2. **Efficiency**
No need to remember both sizes - system fills the other automatically.

### 3. **Error Reduction**
System ensures FG-RM pairing matches BOM configuration.

### 4. **Better UX**
Clear visual feedback and helper text guide the user.

### 5. **Stock Visibility**
Shows available stock immediately when RM is selected/auto-filled.

## Edge Cases Handled

### Case 1: BOM Not Found
**Scenario:** User selects FG with no BOM entry
**Result:** Error message: "No BOM found for FG: {size} ({grade})"
**Solution:** Add BOM entry in BOM & Routing master

### Case 2: RM Item Not in Inventory
**Scenario:** BOM specifies RM size "12", but no RM item with size "12" exists
**Result:** Error message: "RM item with size '12' not found in Item Master"
**Solution:** Add RM item to Item Master

### Case 3: FG Item Not in Inventory
**Scenario:** User selects RM, BOM found, but FG item doesn't exist
**Result:** Error message: "FG item '{size} - {grade}' not found in Item Master"
**Solution:** Add FG item to Item Master

### Case 4: Multiple BOMs for Same RM
**Scenario:** RM size "12" can produce FG: 11.75, 11.9, 12.15
**Result:** System uses FIRST matching BOM
**User Action:** Can manually change FG to desired size

## Console Logging

Both functions log detailed information for debugging:

**fetchBOMsForFG:**
```
Searching BOM for FG: 11.75 SAE1008
Matching BOMs found: 1
Selected BOM: {...}
Looking for RM item with size: 12
RM item found: {...}
Form updated with RM item: ... 12 SAE1008
```

**fetchBOMsForRM:**
```
Searching BOM for RM: 12 SAE1008
Matching BOMs found for RM: 3
Selected BOM: {...}
Looking for FG item: 11.75 SAE1008
FG item found: {...}
Form updated with FG item: ... 11.75 SAE1008
```

## Files Modified
- `src/app/outward-challan/page.tsx`
  - Added `lastChangedField` state
  - Added `fetchBOMsForRM()` function
  - Updated useEffect hooks
  - Changed Original Size from input to ItemSelector
  - Updated helper texts and section title

## Testing Checklist
- [ ] Select FG → RM auto-fills
- [ ] Select RM → FG auto-fills
- [ ] Clear FG → RM clears
- [ ] Clear RM → FG clears
- [ ] Stock shows correctly for auto-filled RM
- [ ] Error messages display for missing BOM
- [ ] Error messages display for missing items
- [ ] Process parameters auto-fill correctly
- [ ] Create Challan works with both workflows
