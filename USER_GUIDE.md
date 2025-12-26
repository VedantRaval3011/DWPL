# User Guide - New UI Features

## Quick Start Guide

### Using Search Functionality

#### GST Master
1. Navigate to **Masters → GST Master**
2. Look for the search bar at the top of the page
3. Type to search by:
   - HSN Code (e.g., "7217")
   - GST Percentage (e.g., "18")
4. Results filter instantly as you type
5. Clear the search to see all records again

#### Item Master
1. Navigate to **Masters → Item Master**
2. Use the search bar to find items by:
   - Size (e.g., "8mm")
   - Grade (e.g., "MS")
   - Mill (e.g., "TATA")
   - HSN Code (e.g., "7217")
3. Combine with category filters (ALL/RM/FG) for refined results

#### Party Master
1. Navigate to **Masters → Party Master**
2. Search by:
   - Party Name
   - GST Number
   - Contact Number
3. Instant filtering of results

#### BOM & Routing
1. Navigate to **Masters → BOM & Routing**
2. Search by:
   - FG Size (Finish Size)
   - RM Size (Raw Material Size)
   - Grade
3. Quickly find specific BOMs

---

## Using Modal Forms

### Adding New Items

#### Item Master
1. Click the **"+ Add Item"** button (top right)
2. A modal dialog will open
3. Navigate between tabs:
   - **General**: Enter basic item information
     - Category (RM/FG)
     - Size/Diameter
     - Grade
     - Mill
     - HSN Code
     - Active status
   - **Document Control**: (Coming soon)
4. Fill in required fields (marked with *)
5. Click **"Create Item"** to save
6. Click **"Cancel"** or the X button to close without saving

#### Party Master
1. Click the **"+ Add Party"** button
2. Modal opens with 4 tabs:
   
   **Tab 1: General**
   - Party Name
   - GST Number (auto-validates format)
   - Contact Number
   - Address
   - Active status
   
   **Tab 2: Charges**
   - Annealing Charge (per unit)
   - Draw Charge (per pass/unit)
   
   **Tab 3: Bank Details**
   - (Placeholder for future features)
   
   **Tab 4: Document Control**
   - (Placeholder for future features)

3. Fill in all required information across tabs
4. Click **"Create Party"** to save
5. Click **"Cancel"** to discard changes

### Editing Existing Records

1. Find the record in the table
2. Click the **Edit icon** (pencil) in the Actions column
3. Modal opens with existing data pre-filled
4. Navigate tabs and modify as needed
5. Click **"Update"** to save changes
6. Click **"Cancel"** to discard changes

---

## Tips & Tricks

### Search Tips
- **Be specific**: Type exact codes for precise results
- **Partial matching**: Search works with partial text (e.g., "TA" finds "TATA")
- **Case insensitive**: Searches work regardless of capitalization
- **Clear search**: Delete search text to see all records

### Modal Tips
- **Click outside**: Click the dark area outside the modal to close it
- **Escape key**: Press ESC to close the modal
- **Tab navigation**: Use Tab key to move between fields
- **Required fields**: Look for the asterisk (*) to identify required fields

### Form Tips
- **Validation**: Forms validate on submit - fix errors before saving
- **Auto-uppercase**: GST numbers automatically convert to uppercase
- **Number fields**: Use decimal points for precise values (e.g., 18.50)
- **Active checkbox**: Uncheck to mark records as inactive (they'll still be saved)

---

## Keyboard Shortcuts

### General
- `ESC` - Close modal dialog
- `Tab` - Move to next field
- `Shift + Tab` - Move to previous field
- `Enter` - Submit form (when in a field)

### Search
- `Ctrl + F` (or `Cmd + F` on Mac) - Focus browser search (use our search bars instead!)

---

## Common Workflows

### Adding a New Item
```
1. Navigate to Item Master
2. Click "+ Add Item"
3. Select Category (RM or FG)
4. Enter Size (e.g., "8mm")
5. Enter Grade (e.g., "MS")
6. Enter Mill (e.g., "TATA")
7. Enter HSN Code (e.g., "7217")
8. Check "Active" if needed
9. Click "Create Item"
```

### Finding and Editing a Party
```
1. Navigate to Party Master
2. Type party name in search bar
3. Click Edit icon for the party
4. Modal opens with 4 tabs
5. Navigate to desired tab
6. Modify information
7. Click "Update Party"
```

### Searching for a Specific BOM
```
1. Navigate to BOM & Routing
2. Type FG size in search (e.g., "6mm")
3. Review filtered results
4. Click Edit to modify if needed
```

---

## Troubleshooting

### Search Not Working
- **Check spelling**: Ensure search terms are spelled correctly
- **Clear filters**: If using category filters, try "ALL"
- **Refresh page**: Press F5 to reload if needed

### Modal Not Opening
- **Check for errors**: Look for error messages at the top
- **Refresh page**: Try reloading the page
- **Clear browser cache**: If persistent, clear cache and reload

### Form Validation Errors
- **Required fields**: Ensure all fields marked with * are filled
- **GST format**: GST numbers must match pattern (15 characters)
- **Number fields**: Ensure numeric fields contain valid numbers
- **Duplicate check**: Some fields may not allow duplicates

### Changes Not Saving
- **Check network**: Ensure internet connection is stable
- **Validation errors**: Look for red error messages
- **Required fields**: Verify all required fields are filled
- **Try again**: Click save button again if it failed

---

## Feature Availability

### Currently Available ✅
- Search on all master pages
- Modal forms for Item and Party masters
- Tabbed interface for complex forms
- Real-time filtering
- Add/Edit/Delete operations
- Form validation

### Coming Soon 🚀
- **Item Master**:
  - Document Control features
  - Pricing tab
  - Inventory tracking tab
  
- **Party Master**:
  - Bank Details management
  - Document Control features
  - Credit limit tracking
  
- **All Pages**:
  - Export to Excel/PDF
  - Bulk operations
  - Advanced filters
  - Audit trail

---

## Best Practices

### Data Entry
1. **Use search first**: Before adding, search to avoid duplicates
2. **Fill all tabs**: Check all tabs in modal forms for complete data
3. **Verify before saving**: Review all entered data before clicking save
4. **Use consistent naming**: Follow naming conventions for easier searching

### Search & Filter
1. **Start broad**: Begin with general search terms, then refine
2. **Use filters**: Combine search with category filters for best results
3. **Clear between searches**: Clear search bar when switching contexts

### Organization
1. **Mark inactive**: Don't delete old records, mark them inactive
2. **Regular updates**: Keep party charges and item details current
3. **Consistent data**: Use standard abbreviations and formats

---

## Support

### Getting Help
- **Documentation**: Refer to this guide and other documentation files
- **Error Messages**: Read error messages carefully for guidance
- **Screenshots**: Take screenshots of issues for troubleshooting

### Reporting Issues
When reporting issues, include:
1. Page name (e.g., "Item Master")
2. Action attempted (e.g., "Adding new item")
3. Error message (if any)
4. Screenshot (if possible)
5. Steps to reproduce

---

## Summary

The new UI features provide:
- ✅ **Faster data access** through search
- ✅ **Better organization** with tabbed forms
- ✅ **Professional appearance** with modal dialogs
- ✅ **Improved workflow** with consistent patterns
- ✅ **Enhanced usability** with real-time filtering

Enjoy the improved DWPL system!
