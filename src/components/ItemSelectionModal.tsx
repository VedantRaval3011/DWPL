'use client';

import { useState, useMemo } from 'react';
import Modal from './Modal';
import SearchBar from './SearchBar';
import { Check } from 'lucide-react';

interface BaseItem {
  _id: string;
  [key: string]: any;
}

interface ItemSelectionModalProps<T extends BaseItem> {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (item: T) => void;
  items: T[];
  title: string;
  searchPlaceholder?: string;
  renderItem: (item: T) => React.ReactNode;
  renderPreview?: (item: T) => React.ReactNode;
  getSearchableText: (item: T) => string;
  selectedId?: string;
  emptyMessage?: string;
}

export default function ItemSelectionModal<T extends BaseItem>({
  isOpen,
  onClose,
  onSelect,
  items,
  title,
  searchPlaceholder = 'Search...',
  renderItem,
  renderPreview,
  getSearchableText,
  selectedId,
  emptyMessage = 'No items found.',
}: ItemSelectionModalProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Filter items based on search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    
    const query = searchQuery.toLowerCase();
    return items.filter((item) =>
      getSearchableText(item).toLowerCase().includes(query)
    );
  }, [items, searchQuery, getSearchableText]);

  const handleSelect = (item: T) => {
    onSelect(item);
    setSearchQuery('');
    onClose();
  };

  const handleClose = () => {
    setSearchQuery('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title} size="lg">
      <div className="space-y-4">
        {/* Search Bar */}
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={searchPlaceholder}
        />

        {/* Items List */}
        <div 
          className="max-h-[400px] overflow-y-auto rounded-lg"
          style={{ border: '1px solid var(--border)' }}
        >
          {filteredItems.length === 0 ? (
            <div 
              className="text-center py-12 text-sm"
              style={{ color: 'var(--text-muted)' }}
            >
              <p>{searchQuery ? 'No items match your search.' : emptyMessage}</p>
            </div>
          ) : (
            <div style={{ borderTop: '1px solid var(--border)' }}>
              {filteredItems.map((item, index) => (
                <div
                  key={item._id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setHoveredId(item._id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className="relative p-4 cursor-pointer transition-all duration-200"
                  style={{
                    background: selectedId === item._id 
                      ? '#EFF6FF' 
                      : hoveredId === item._id 
                      ? 'var(--hover-bg)' 
                      : 'white',
                    borderLeft: selectedId === item._id ? '4px solid var(--primary)' : 'none',
                    borderBottom: index < filteredItems.length - 1 ? '1px solid var(--border)' : 'none',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      {renderItem(item)}
                    </div>
                    
                    {selectedId === item._id && (
                      <div className="ml-4 flex-shrink-0">
                        <div 
                          className="w-6 h-6 rounded-full flex items-center justify-center"
                          style={{ background: 'var(--primary)' }}
                        >
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Preview Section */}
        {renderPreview && hoveredId && (
          <div 
            className="border rounded-lg p-4"
            style={{ 
              background: 'var(--hover-bg)',
              border: '1px solid var(--border)',
            }}
          >
            <h4 
              className="text-sm font-semibold mb-2"
              style={{ color: 'var(--foreground)' }}
            >
              Preview
            </h4>
            {renderPreview(filteredItems.find((item) => item._id === hoveredId)!)}
          </div>
        )}

        {/* Footer */}
        <div 
          className="flex justify-between items-center pt-4"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''} available
          </p>
          <button onClick={handleClose} className="btn btn-outline">
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
}
