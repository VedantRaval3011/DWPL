# ItemSelector - Quick Reference Card

## Basic Usage

```tsx
import ItemSelector from '@/components/ItemSelector';

<ItemSelector
  label="Label Text"
  value={selectedValue}
  onChange={(value) => handleChange(value)}
  items={itemsArray}
  placeholder="Select..."
  required={true}
  renderSelected={(item) => <span>{item.name}</span>}
  renderOption={(item) => <div>{item.name}</div>}
  getSearchableText={(item) => item.name}
/>
```

## Props Reference

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `label` | `string` | ✅ | Label text displayed above the selector |
| `value` | `string` | ✅ | Currently selected item ID |
| `onChange` | `(value: string) => void` | ✅ | Callback when selection changes |
| `items` | `T[]` | ✅ | Array of items to select from |
| `renderSelected` | `(item: T) => ReactNode` | ✅ | How to render the selected item |
| `renderOption` | `(item: T) => ReactNode` | ✅ | How to render each option |
| `getSearchableText` | `(item: T) => string` | ✅ | Extract searchable text from item |
| `placeholder` | `string` | ❌ | Placeholder text (default: "Select an item") |
| `required` | `boolean` | ❌ | Show required indicator (default: false) |
| `disabled` | `boolean` | ❌ | Disable the selector (default: false) |
| `helperText` | `string` | ❌ | Helper text below the selector |

## Common Patterns

### Simple Text Selection
```tsx
<ItemSelector
  label="Category"
  value={category}
  onChange={setCategory}
  items={categories}
  renderSelected={(cat) => <span>{cat.name}</span>}
  renderOption={(cat) => <span>{cat.name}</span>}
  getSearchableText={(cat) => cat.name}
/>
```

### Rich Information Display
```tsx
<ItemSelector
  label="Product"
  value={product}
  onChange={setProduct}
  items={products}
  renderSelected={(p) => (
    <div className="flex items-center gap-2">
      <span className="font-medium">{p.name}</span>
      <span className="text-sm text-slate-500">{p.code}</span>
    </div>
  )}
  renderOption={(p) => (
    <div>
      <div className="font-medium">{p.name}</div>
      <div className="text-xs text-slate-500">
        Code: {p.code} | Stock: {p.stock}
      </div>
    </div>
  )}
  getSearchableText={(p) => `${p.name} ${p.code}`}
/>
```

### With Helper Text
```tsx
<ItemSelector
  label="Supplier"
  value={supplier}
  onChange={setSupplier}
  items={suppliers}
  helperText="Select the primary supplier for this order"
  renderSelected={(s) => <span>{s.name}</span>}
  renderOption={(s) => (
    <div>
      <div className="font-medium">{s.name}</div>
      <div className="text-xs text-slate-500">{s.location}</div>
    </div>
  )}
  getSearchableText={(s) => `${s.name} ${s.location}`}
/>
```

### Dynamic Helper Text
```tsx
<ItemSelector
  label="Item"
  value={item}
  onChange={setItem}
  items={items}
  helperText={
    selectedItem 
      ? `Stock: ${selectedItem.stock} units`
      : "Select an item"
  }
  renderSelected={(i) => <span>{i.name}</span>}
  renderOption={(i) => <span>{i.name}</span>}
  getSearchableText={(i) => i.name}
/>
```

## Styling Tips

### Selected Item
Keep it concise - show only essential info:
```tsx
renderSelected={(item) => (
  <span className="font-medium text-slate-900 dark:text-white">
    {item.name}
  </span>
)}
```

### Option Items
Show more details to help with selection:
```tsx
renderOption={(item) => (
  <div>
    <div className="font-medium text-slate-900 dark:text-white">
      {item.name}
    </div>
    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
      {item.description}
    </div>
  </div>
)}
```

### Search Text
Include all relevant searchable fields:
```tsx
getSearchableText={(item) => 
  `${item.name} ${item.code} ${item.category} ${item.tags?.join(' ')}`
}
```

## TypeScript Types

```tsx
interface BaseItem {
  _id: string;
  [key: string]: any;
}

interface ItemSelectorProps<T extends BaseItem> {
  label: string;
  value: string;
  onChange: (value: string) => void;
  items: T[];
  renderSelected: (item: T) => React.ReactNode;
  renderOption: (item: T) => React.ReactNode;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  helperText?: string;
  getSearchableText: (item: T) => string;
}
```

## Common Issues & Solutions

### Issue: "Cannot read property '_id' of undefined"
**Solution**: Ensure all items in the array have an `_id` property.

### Issue: Search not working
**Solution**: Check that `getSearchableText` returns a string with all searchable fields.

### Issue: Selected item not displaying
**Solution**: Verify that `value` matches an item's `_id` in the `items` array.

### Issue: Dropdown not closing on selection
**Solution**: This is handled automatically. If it persists, check for event propagation issues.

## Best Practices

✅ **DO:**
- Include all relevant fields in search text
- Keep selected item display concise
- Show more details in option items
- Use helper text for additional context
- Make search comprehensive

❌ **DON'T:**
- Show too much info in selected state
- Forget to include required fields in search
- Use the same rendering for selected and options
- Ignore dark mode in custom renders

## Examples from DWPL

### GRN - Party Selection
```tsx
<ItemSelector
  label="Sending Party"
  value={formData.sendingParty}
  onChange={(value) => setFormData({ ...formData, sendingParty: value })}
  items={parties}
  placeholder="Select Party"
  required
  renderSelected={(party) => (
    <span className="font-medium text-slate-900 dark:text-white">
      {party.partyName}
    </span>
  )}
  renderOption={(party) => (
    <div>
      <div className="font-medium text-slate-900 dark:text-white">
        {party.partyName}
      </div>
    </div>
  )}
  getSearchableText={(party) => party.partyName}
/>
```

### GRN - RM Size Selection
```tsx
<ItemSelector
  label="RM Size"
  value={formData.rmSize}
  onChange={(value) => setFormData({ ...formData, rmSize: value })}
  items={rmItems}
  placeholder="Select RM Size"
  required
  helperText="Select the raw material size for this GRN"
  renderSelected={(item) => (
    <div className="flex items-center gap-2">
      <span className="font-medium text-slate-900 dark:text-white">
        {item.size}
      </span>
      <span className="text-sm text-slate-500">
        {item.grade} ({item.mill})
      </span>
    </div>
  )}
  renderOption={(item) => (
    <div>
      <div className="font-medium text-slate-900 dark:text-white">
        {item.size} - {item.grade}
      </div>
      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
        Mill: {item.mill}
      </div>
    </div>
  )}
  getSearchableText={(item) => 
    `${item.size} ${item.grade} ${item.mill}`
  }
/>
```

---

**Need more help?** Check the full documentation in `ITEM_SELECTION_UI.md`
