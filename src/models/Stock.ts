import mongoose, { Schema } from 'mongoose';
import { IStock } from '@/types';

const StockSchema = new Schema<IStock>(
  {
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: ['RM', 'FG'],
        message: 'Category must be either RM or FG',
      },
    },
    size: {
      type: String,
      ref: 'ItemMaster',
      required: [true, 'Size is required'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0, 'Quantity cannot be negative'],
      default: 0,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

// Create compound unique index
StockSchema.index({ category: 1, size: 1 }, { unique: true });

// Update lastUpdated before saving
StockSchema.pre('save', function () {
  this.lastUpdated = new Date();
});

export const Stock = mongoose.models.Stock || mongoose.model<IStock>('Stock', StockSchema);
