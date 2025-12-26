import mongoose, { Schema } from 'mongoose';
import { IItemMaster } from '@/types';

const ItemMasterSchema = new Schema<IItemMaster>(
  {
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: ['RM', 'FG'],
        message: 'Category must be either RM (Raw Material) or FG (Finished Good)',
      },
    },
    size: {
      type: String,
      required: [true, 'Size/Diameter is required'],
      trim: true,
    },
    grade: {
      type: String,
      required: [true, 'Grade is required'],
      trim: true,
    },
    mill: {
      type: String,
      required: [true, 'Mill is required'],
      trim: true,
    },
    hsnCode: {
      type: String,
      required: [true, 'HSN Code is required'],
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create compound index for uniqueness
ItemMasterSchema.index({ category: 1, size: 1, grade: 1, mill: 1 }, { unique: true });
ItemMasterSchema.index({ hsnCode: 1 });

export const ItemMaster = mongoose.models.ItemMaster || mongoose.model<IItemMaster>('ItemMaster', ItemMasterSchema);
