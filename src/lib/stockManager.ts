import { Stock } from '@/models/Stock';
import { ItemMaster } from '@/models/ItemMaster';

/**
 * Update stock after GRN - Increases RM stock
 */
export async function updateStockAfterGRN(rmSizeId: string, quantity: number) {
  // Verify RM exists
  const rmItem = await ItemMaster.findById(rmSizeId);
  if (!rmItem || rmItem.category !== 'RM') {
    throw new Error('Invalid RM size');
  }

  // Find or create stock entry
  let stock = await Stock.findOne({ category: 'RM', size: rmSizeId });
  
  if (!stock) {
    stock = new Stock({
      category: 'RM',
      size: rmSizeId,
      quantity: quantity,
    });
  } else {
    stock.quantity += quantity;
  }

  await stock.save();
  return stock;
}

/**
 * Update stock after Outward Challan - Decreases RM, Increases FG
 */
export async function updateStockAfterOutward(
  rmSizeId: string,
  fgSizeId: string,
  quantity: number
) {
  // Verify items exist
  const rmItem = await ItemMaster.findById(rmSizeId);
  const fgItem = await ItemMaster.findById(fgSizeId);

  if (!rmItem || rmItem.category !== 'RM') {
    throw new Error('Invalid RM size');
  }
  if (!fgItem || fgItem.category !== 'FG') {
    throw new Error('Invalid FG size');
  }

  // Check RM stock availability
  const rmStock = await Stock.findOne({ category: 'RM', size: rmSizeId });
  if (!rmStock || rmStock.quantity < quantity) {
    throw new Error(`Insufficient RM stock. Available: ${rmStock?.quantity || 0}, Required: ${quantity}`);
  }

  // Decrease RM stock
  rmStock.quantity -= quantity;
  if (rmStock.quantity < 0) {
    throw new Error('Stock cannot go negative');
  }
  await rmStock.save();

  // Increase FG stock
  let fgStock = await Stock.findOne({ category: 'FG', size: fgSizeId });
  if (!fgStock) {
    fgStock = new Stock({
      category: 'FG',
      size: fgSizeId,
      quantity: quantity,
    });
  } else {
    fgStock.quantity += quantity;
  }
  await fgStock.save();

  return { rmStock, fgStock };
}

/**
 * Get current stock for a specific item
 */
export async function getStockByItem(category: 'RM' | 'FG', sizeId: string) {
  const stock = await Stock.findOne({ category, size: sizeId }).populate('size');
  return stock;
}

/**
 * Get all stock items
 */
export async function getAllStock() {
  const stocks = await Stock.find().populate('size').sort({ category: 1, lastUpdated: -1 });
  return stocks;
}

/**
 * Check if sufficient stock is available
 */
export async function checkStockAvailability(category: 'RM' | 'FG', sizeId: string, requiredQuantity: number) {
  const stock = await Stock.findOne({ category, size: sizeId });
  if (!stock) {
    return { available: false, currentStock: 0 };
  }
  return {
    available: stock.quantity >= requiredQuantity,
    currentStock: stock.quantity,
  };
}
