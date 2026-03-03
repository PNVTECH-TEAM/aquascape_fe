import type { TankInfo } from "@app/core/interface";

const WATER_LEVEL = 0.9;

export const calculateTankInfo = (
  w: number,
  h: number,
  d: number
): TankInfo => {

  const volumeLiters = (w * h * d * WATER_LEVEL) / 1000;

  let thickness: number;

  if (h <= 40) thickness = 6;
  else if (h <= 60) thickness = 8;
  else if (h <= 80) thickness = 10;
  else thickness = 12;

  const glassArea = (2 * (w * h + h * d + w * d)) / 10000;

  const glassWeight = glassArea * thickness * 2.5;

  return {
    volume: Math.round(volumeLiters),
    thickness,
    glassWeight: glassWeight.toFixed(1),
  };
};