import { Document } from 'mongoose';

// ============= MASTER TYPES =============

export interface IPartyMaster extends Document {
  partyName: string;
  address: string;
  gstNumber: string;
  contactNumber: string;
  annealingCharge: number; // per unit
  drawCharge: number; // per pass/unit
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IItemMaster extends Document {
  category: 'RM' | 'FG';
  size: string; // diameter
  grade: string;
  mill: string;
  hsnCode: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITransportMaster extends Document {
  vehicleNumber: string;
  ownerName: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBOM extends Document {
  fgSize: string; // Finish Size
  rmSize: string; // Original/Raw Material Size
  grade: string;
  annealingMin: number; // 0-7
  annealingMax: number; // 0-7
  drawPassMin: number; // 0-10
  drawPassMax: number; // 0-10
  status: 'Active' | 'Inactive';
  createdAt: Date;
  updatedAt: Date;
}

export interface IGSTMaster extends Document {
  hsnCode: string;
  gstPercentage: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============= TRANSACTION TYPES =============

export interface IGRN extends Document {
  sendingParty: string; // Party ID
  partyChallanNumber: string;
  rmSize: string; // Item ID
  quantity: number;
  rate: number;
  totalValue: number;
  grnDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IStock extends Document {
  category: 'RM' | 'FG';
  size: string; // Item ID reference
  quantity: number;
  lastUpdated: Date;
}

export interface IOutwardChallan extends Document {
  challanNumber: string;
  party: string; // Party ID
  finishSize: string; // FG Item ID
  originalSize: string; // RM Item ID (from BOM)
  annealingCount: number; // 0-7
  drawPassCount: number; // 0-10
  quantity: number;
  rate: number;
  annealingCharge: number; // auto-calculated from Party Master
  drawCharge: number; // auto-calculated from Party Master
  totalAmount: number;
  challanDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITaxInvoice extends Document {
  invoiceNumber: string;
  outwardChallan: string; // Outward Challan ID
  party: string; // Party ID
  finishSize: string;
  originalSize: string;
  annealingCount: number;
  drawPassCount: number;
  quantity: number;
  rate: number;
  annealingCharge: number;
  drawCharge: number;
  baseAmount: number;
  gstPercentage: number; // from GST Master
  gstAmount: number;
  totalAmount: number;
  invoiceDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ============= FORM TYPES =============

export type PartyMasterForm = Omit<IPartyMaster, keyof Document | 'createdAt' | 'updatedAt'>;
export type ItemMasterForm = Omit<IItemMaster, keyof Document | 'createdAt' | 'updatedAt'>;
export type TransportMasterForm = Omit<ITransportMaster, keyof Document | 'createdAt' | 'updatedAt'>;
export type BOMForm = Omit<IBOM, keyof Document | 'createdAt' | 'updatedAt'>;
export type GSTMasterForm = Omit<IGSTMaster, keyof Document | 'createdAt' | 'updatedAt'>;
export type GRNForm = Omit<IGRN, keyof Document | 'createdAt' | 'updatedAt' | 'totalValue'>;
export type OutwardChallanForm = Omit<IOutwardChallan, keyof Document | 'createdAt' | 'updatedAt' | 'totalAmount' | 'annealingCharge' | 'drawCharge' | 'challanNumber'>;
export type TaxInvoiceForm = Omit<ITaxInvoice, keyof Document | 'createdAt' | 'updatedAt' | 'baseAmount' | 'gstAmount' | 'totalAmount' | 'invoiceNumber'>;
