'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Users, 
  Package, 
  FileText, 
  TruckIcon, 
  Settings,
  ClipboardList,
  FileInput,
  Warehouse,
  Send,
  Receipt
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { 
    name: 'Masters', 
    icon: Settings,
    children: [
      { name: 'Party Master', href: '/masters/party', icon: Users },
      { name: 'Item Master', href: '/masters/item', icon: Package },
      { name: 'BOM & Routing', href: '/masters/bom', icon: ClipboardList },
      { name: 'GST Master', href: '/masters/gst', icon: FileText },
      { name: 'Transport Master', href: '/masters/transport', icon: TruckIcon },
    ]
  },
  { name: 'GRN', href: '/grn', icon: FileInput },
  // { name: 'Stock', href: '/stock', icon: Warehouse }, // Hidden - can be re-enabled later
  { name: 'Outward Challan', href: '/outward-challan', icon: Send },
  { name: 'Tax Invoice', href: '/tax-invoice', icon: Receipt },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen fixed left-0 top-0 overflow-y-auto">
      <div className="p-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          DWPL
        </h1>
        <p className="text-sm text-slate-400 mt-1">Manufacturing System</p>
      </div>

      <nav className="px-4 space-y-1">
        {navigation.map((item) => {
          if (item.children) {
            return (
              <div key={item.name} className="space-y-1">
                <div className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-300">
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </div>
                <div className="ml-4 space-y-1">
                  {item.children.map((child) => {
                    const isActive = pathname === child.href;
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all ${
                          isActive
                            ? 'bg-blue-600 text-white'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <child.icon className="w-4 h-4" />
                        {child.name}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          }

          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
