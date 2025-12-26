# DWPL Manufacturing Management System

A comprehensive web-based manufacturing management system for wire drawing and annealing operations.

## 🚀 Features

### Core Modules

1. **Masters**
   - Party Master (with charges)
   - Item Master (RM/FG)
   - BOM & Routing (size conversion rules)
   - GST Master
   - Transport Master

2. **Transactions**
   - GRN (Goods Receipt Note) - Auto stock update
   - Outward Challan - BOM-driven with charge calculation
   - Tax Invoice - GST auto-calculation

3. **Stock Management**
   - Real-time inventory tracking
   - Automatic RM/FG updates
   - Negative stock prevention

## 🛠️ Tech Stack

- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Server Actions
- **Database**: MongoDB with Mongoose ODM
- **UI**: Lucide React Icons, Custom CSS Design System

## 📦 Installation

1. **Clone the repository**
   ```bash
   cd dwpl
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/dwpl
   ```

   For MongoDB Atlas:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dwpl?retryWrites=true&w=majority
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
dwpl/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes
│   │   │   ├── party-master/
│   │   │   ├── item-master/
│   │   │   ├── bom/
│   │   │   ├── grn/
│   │   │   ├── stock/
│   │   │   ├── outward-challan/
│   │   │   └── tax-invoice/
│   │   ├── masters/           # Master pages
│   │   ├── stock/
│   │   └── page.tsx           # Dashboard
│   ├── components/            # Reusable UI components
│   ├── lib/                   # Utility functions
│   │   ├── db.ts             # MongoDB connection
│   │   ├── stockManager.ts   # Stock operations
│   │   ├── bomValidator.ts   # BOM validation
│   │   └── utils.ts          # Helper functions
│   ├── models/               # Mongoose models
│   └── types/                # TypeScript types
└── package.json
```

## 🔑 Key Business Rules

### BOM & Routing
- Defines FG → RM size conversion
- Controls annealing range (0-7)
- Controls draw pass range (0-10)
- Enforced at API level

### Stock Management
- GRN increases RM stock only
- Outward Challan: RM decreases, FG increases
- Stock cannot go negative
- Real-time updates

### Charge Calculation
- Annealing charge from Party Master
- Draw charge from Party Master
- Auto-calculated in Outward Challan
- Carried forward to Tax Invoice

### Tax Invoice
- Must reference Outward Challan
- GST % fetched from HSN code
- Auto-calculation of GST amount
- One invoice per challan

## 📊 API Endpoints

### Party Master
- `GET /api/party-master` - List all parties
- `POST /api/party-master` - Create party
- `GET /api/party-master/[id]` - Get party
- `PUT /api/party-master/[id]` - Update party
- `DELETE /api/party-master/[id]` - Delete party

### Item Master
- `GET /api/item-master?category=RM|FG` - List items
- `POST /api/item-master` - Create item
- `GET /api/item-master/[id]` - Get item
- `PUT /api/item-master/[id]` - Update item
- `DELETE /api/item-master/[id]` - Delete item

### BOM
- `GET /api/bom?fgSize=...` - List BOMs
- `POST /api/bom` - Create BOM
- `GET /api/bom/[id]` - Get BOM
- `PUT /api/bom/[id]` - Update BOM
- `DELETE /api/bom/[id]` - Delete BOM

### GRN
- `GET /api/grn` - List GRNs
- `POST /api/grn` - Create GRN (auto-updates RM stock)

### Stock
- `GET /api/stock?category=RM|FG` - View stock

### Outward Challan
- `GET /api/outward-challan` - List challans
- `POST /api/outward-challan` - Create challan (validates BOM, updates stock)

### Tax Invoice
- `GET /api/tax-invoice` - List invoices
- `POST /api/tax-invoice` - Create invoice (from challan)

## 🎨 UI Features

- **Modern Design**: Clean, professional industrial UI
- **Responsive**: Mobile-friendly layouts
- **Dark Mode**: Automatic dark mode support
- **Real-time Updates**: Instant stock and data updates
- **Form Validation**: Client and server-side validation
- **Error Handling**: User-friendly error messages

## 🔒 Validation Rules

### GST Number Format
- Pattern: `[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}`
- Example: `27AAPFU0939F1ZV`

### Annealing Count
- Range: 0-7
- Validated against BOM limits

### Draw Pass Count
- Range: 0-10
- Validated against BOM limits

## 🚧 Future Enhancements

- [ ] Job work module
- [ ] Advanced reports and analytics
- [ ] Export to Excel/PDF
- [ ] User authentication and roles
- [ ] Audit logs
- [ ] Barcode/QR code integration
- [ ] Email notifications
- [ ] Dashboard analytics charts

## 📝 License

This project is proprietary software for DWPL.

## 🤝 Support

For support and queries, contact the development team.

---

**Built with ❤️ for DWPL Manufacturing**
