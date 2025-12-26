import { BOM } from '@/models/BOM';

/**
 * Validate if the FG-RM conversion is allowed as per BOM
 */
export async function validateBOMConversion(fgSize: string, rmSize: string, grade: string) {
  const bom = await BOM.findOne({
    fgSize,
    rmSize,
    grade,
    status: 'Active',
  });

  if (!bom) {
    throw new Error(`No active BOM found for FG: ${fgSize}, RM: ${rmSize}, Grade: ${grade}`);
  }

  return bom;
}

/**
 * Validate annealing and draw pass counts against BOM limits
 */
export async function validateProcessCounts(
  fgSize: string,
  rmSize: string,
  grade: string,
  annealingCount: number,
  drawPassCount: number
) {
  const bom = await validateBOMConversion(fgSize, rmSize, grade);

  if (annealingCount < bom.annealingMin || annealingCount > bom.annealingMax) {
    throw new Error(
      `Annealing count ${annealingCount} is outside allowed range [${bom.annealingMin}-${bom.annealingMax}]`
    );
  }

  if (drawPassCount < bom.drawPassMin || drawPassCount > bom.drawPassMax) {
    throw new Error(
      `Draw pass count ${drawPassCount} is outside allowed range [${bom.drawPassMin}-${bom.drawPassMax}]`
    );
  }

  return bom;
}

/**
 * Get all active BOMs for a specific FG size
 */
export async function getBOMsForFG(fgSize: string) {
  const boms = await BOM.find({ fgSize, status: 'Active' });
  return boms;
}

/**
 * Get BOM routing limits
 */
export async function getBOMRoutingLimits(fgSize: string, rmSize: string, grade: string) {
  const bom = await BOM.findOne({ fgSize, rmSize, grade, status: 'Active' });
  
  if (!bom) {
    return null;
  }

  return {
    annealingRange: { min: bom.annealingMin, max: bom.annealingMax },
    drawPassRange: { min: bom.drawPassMin, max: bom.drawPassMax },
  };
}
