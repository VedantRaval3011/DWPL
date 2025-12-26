'use client';

import { useState } from 'react';
import { ChevronDown, X } from 'lucide-react';

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
  error?: string;
  showError?: boolean;
  getSearchableText: (item: T) => string;
}

export default function ItemSelector<T extends BaseItem>({
  label,
  value,
  onChange,
  items,
  renderSelected,
  renderOption,
  placeholder = 'Select an item',
  required = false,
  disabled = false,
  helperText,
  error,
  showError = false,
  getSearchableText,
}: ItemSelectorProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedItem = items.find((item) => item._id === value);

  const filteredItems = items.filter((item) =>
    getSearchableText(item).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (itemId: string) => {
    onChange(itemId);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
  };

  return (
    <div className="relative">
      <label className="label">
        {label} {required && <span style={{ color: 'var(--error)' }}>*</span>}
      </label>

      {/* Selector Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        style={{
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? 'not-allowed' : 'pointer',
          padding: '0.5rem 0.75rem',
          minHeight: '36px',
          height: '36px',
        }}
        className={`
          input flex items-center justify-between
          ${isOpen ? 'ring-2' : ''}
          ${showError && error ? 'border-red-500 focus:ring-red-500' : ''}
        `}
      >
        <div className="flex-1 text-left overflow-hidden text-sm">
          {selectedItem ? (
            <div className="flex items-center gap-2">
              {renderSelected(selectedItem)}
            </div>
          ) : (
            <span style={{ color: 'var(--text-muted)' }}>{placeholder}</span>
          )}
        </div>

        <div className="flex items-center gap-1 flex-shrink-0 ml-2">
          {selectedItem && !disabled && (
            <div
              onClick={handleClear}
              className="p-0.5 rounded transition-colors cursor-pointer hover:bg-slate-100"
            >
              <X className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
            </div>
          )}
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform flex-shrink-0 ${
              isOpen ? 'transform rotate-180' : ''
            }`}
            style={{ color: 'var(--text-muted)' }}
          />
        </div>
      </button>

      {helperText && !showError && (
        <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
          {helperText}
        </p>
      )}

      {showError && error && (
        <p className="text-[11px] mt-0.5 text-red-600 font-medium">
          {error}
        </p>
      )}

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Menu */}
          <div 
            className="absolute z-50 w-full mt-1 rounded-lg shadow-xl max-h-80 overflow-hidden"
            style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--border)',
            }}
          >
            {/* Search Input */}
            <div 
              className="p-3"
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none"
                style={{
                  border: '1px solid var(--border)',
                  background: 'white',
                  color: 'var(--foreground)',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--primary)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--border)';
                  e.target.style.boxShadow = 'none';
                }}
                autoFocus
              />
            </div>

            {/* Items List */}
            <div className="overflow-y-auto max-h-64">
              {filteredItems.length === 0 ? (
                <div 
                  className="p-4 text-center text-sm"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {searchQuery ? 'No items match your search' : 'No items available'}
                </div>
              ) : (
                filteredItems.map((item) => (
                  <button
                    key={item._id}
                    type="button"
                    onClick={() => handleSelect(item._id)}
                    className="w-full p-3 text-left transition-colors"
                    style={{
                      background: value === item._id ? '#EFF6FF' : 'white',
                      borderLeft: value === item._id ? '4px solid var(--primary)' : '4px solid transparent',
                    }}
                    onMouseEnter={(e) => {
                      if (value !== item._id) {
                        e.currentTarget.style.background = 'var(--hover-bg)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (value !== item._id) {
                        e.currentTarget.style.background = 'white';
                      }
                    }}
                  >
                    {renderOption(item)}
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
