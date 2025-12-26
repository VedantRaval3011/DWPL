import mongoose, { Schema, HydratedDocument } from 'mongoose';
import { ITaxInvoice } from '@/types';

const TaxInvoiceSchema = new Schema<ITaxInvoice>(
  {
    invoiceNumber: {
      type: String,
      required: [true, 'Invoice number is required'],
      unique: true,
      trim: true,
    },
    outwardChallan: {
      type: String,
      ref: 'OutwardChallan',
      required: [true, 'Outward challan reference is required'],
    },
    party: {
      type: String,
      ref: 'PartyMaster',
      required: [true, 'Party is required'],
    },
    finishSize: {
      type: String,
      ref: 'ItemMaster',
      required: [true, 'Finish Size is required'],
    },
    originalSize: {
      type: String,
      ref: 'ItemMaster',
      required: [true, 'Original Size is required'],
    },
    annealingCount: {
      type: Number,
      required: true,
    },
    drawPassCount: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    rate: {
      type: Number,
      required: true,
    },
    annealingCharge: {
      type: Number,
      required: true,
    },
    drawCharge: {
      type: Number,
      required: true,
    },
    baseAmount: {
      type: Number,
      required: true,
    },
    gstPercentage: {
      type: Number,
      required: [true, 'GST percentage is required'],
      min: [0, 'GST percentage cannot be negative'],
    },
    gstAmount: {
      type: Number,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    invoiceDate: {
      type: Date,
      required: [true, 'Invoice date is required'],
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-calculate GST and total amount before saving
TaxInvoiceSchema.pre('save', async function () {
  const materialAmount = this.quantity * this.rate;
  const totalAnnealingCharge = this.annealingCharge * this.quantity * this.annealingCount;
  const totalDrawCharge = this.drawCharge * this.quantity * this.drawPassCount;
  
  this.baseAmount = materialAmount + totalAnnealingCharge + totalDrawCharge;
  this.gstAmount = (this.baseAmount * this.gstPercentage) / 100;
  this.totalAmount = this.baseAmount + this.gstAmount;
});

// Create indexes
TaxInvoiceSchema.index({ party: 1, invoiceDate: -1 });
TaxInvoiceSchema.index({ invoiceNumber: 1 });
TaxInvoiceSchema.index({ outwardChallan: 1 });

export const TaxInvoice = mongoose.models.TaxInvoice || mongoose.model<ITaxInvoice>('TaxInvoice', TaxInvoiceSchema);
