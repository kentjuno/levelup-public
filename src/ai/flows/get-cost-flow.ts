/**
 * @fileOverview Calculates the cost of a Genkit generation based on character counts.
 *
 * - getCost - A function that calculates the cost.
 * - GetCostInput - The input type for the getCost function.
 */

import {
  GEMINI_FLASH_INPUT_PRICE_PER_CHAR,
  GEMINI_FLASH_OUTPUT_PRICE_PER_CHAR,
} from '@/lib/pricing';

export interface GetCostInput {
  inputCharacters: number;
  outputCharacters: number;
}

export function getCost({
  inputCharacters,
  outputCharacters,
}: GetCostInput): number {
  const inputCost = inputCharacters * GEMINI_FLASH_INPUT_PRICE_PER_CHAR;
  const outputCost = outputCharacters * GEMINI_FLASH_OUTPUT_PRICE_PER_CHAR;
  const totalCost = inputCost + outputCost;
  return totalCost;
}
