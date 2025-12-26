import mongoose, { Schema } from 'mongoose';
import { IBOM } from '@/types';

const BOMSchema = new Schema<IBOM>(
  {
    fgSize: {
      type: String,
      required: [true, 'Finish Size (FG) is required'],
      trim: true,
    },
    rmSize: {
      type: String,
      required: [true, 'Original Size (RM) is required'],
      trim: true,
    },
    grade: {
      type: String,
      required: [true, 'Grade is required'],
      trim: true,
    },
    annealingMin: {
      type: Number,
      required: [true, 'Minimum annealing count is required'],
      min: [0, 'Annealing minimum cannot be less than 0'],
      max: [7, 'Annealing minimum cannot exceed 7'],
      default: 0,
    },
    annealingMax: {
      type: Number,
      required: [true, 'Maximum annealing count is required'],
      min: [0, 'Annealing maximum cannot be less than 0'],
      max: [7, 'Annealing maximum cannot exceed 7'],
      default: 7,
    },
    drawPassMin: {
      type: Number,
      required: [true, 'Minimum draw pass count is required'],
      min: [0, 'Draw pass minimum cannot be less than 0'],
      max: [10, 'Draw pass minimum cannot exceed 10'],
      default: 0,
    },
    drawPassMax: {
      type: Number,
      required: [true, 'Maximum draw pass count is required'],
      min: [0, 'Draw pass maximum cannot be less than 0'],
      max: [10, 'Draw pass maximum cannot exceed 10'],
      default: 10,
    },
    status: {
      type: String,
      enum: {
        values: ['Active', 'Inactive'],
        message: 'Status must be either Active or Inactive',
      },
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
);

// Validation: Ensure min <= max for annealing and draw pass
BOMSchema.pre('save', function () {
  if (this.annealingMin > this.annealingMax) {
    throw new Error('Annealing minimum cannot be greater than maximum');
  }
  if (this.drawPassMin > this.drawPassMax) {
    throw new Error('Draw pass minimum cannot be greater than maximum');
  }
});

// Create compound index for uniqueness
BOMSchema.index({ fgSize: 1, rmSize: 1, grade: 1 }, { unique: true });

export const BOM = mongoose.models.BOM || mongoose.model<IBOM>('BOM', BOMSchema);
