import { Program } from '../../types';
import { neckProgram } from './neck';
import { shouldersProgram } from './shoulders';
import { chestProgram } from './chest';
import { armsProgram } from './arms';
import { coreProgram } from './core';
import { lowerBackProgram } from './lowerBack';
import { upperBackProgram } from './upperBack';
import { hipsProgram } from './hips';
import { glutesProgram } from './glutes';
import { quadricepsProgram } from './quadriceps';
import { hamstringsProgram } from './hamstrings';
import { kneesProgram } from './knees';
import { shinsProgram } from './shins';
import { calvesProgram } from './calves';
import { anklesProgram } from './ankles';

// Map body part IDs to their unique programs
// Each body part now has its own dedicated exercise program
export const programs: Record<string, Program> = {
  // Front body parts
  'neck': neckProgram,
  'shoulders': shouldersProgram,
  'chest': chestProgram,
  'arms': armsProgram,
  'core': coreProgram,
  'hips': hipsProgram,
  'quadriceps': quadricepsProgram,
  'knees': kneesProgram,
  'shins': shinsProgram,
  'ankles': anklesProgram,
  // Back body parts
  'neck-back': neckProgram, // Same as front neck - same anatomical area
  'upper-back': upperBackProgram,
  'lower-back': lowerBackProgram,
  'glutes': glutesProgram,
  'hamstrings': hamstringsProgram,
  'calves-back': calvesProgram,
};

export const getProgramForBodyPart = (bodyPartId: string): Program | undefined => {
  return programs[bodyPartId];
};

/** One entry per program, at its canonical URL (aliases such as 'neck-back' are left out). */
export const libraryPrograms: Program[] = Array.from(new Set(Object.values(programs)));

/** The canonical body part ID for a program alias, e.g. 'neck-back' -> 'neck'. */
export const canonicalBodyPartId = (bodyPartId: string): string | undefined => programs[bodyPartId]?.bodyPartId;

export const getAllPrograms = (): Program[] => {
  // Return unique programs only
  const uniquePrograms = new Set(Object.values(programs));
  return Array.from(uniquePrograms);
};

export {
  neckProgram,
  shouldersProgram,
  chestProgram,
  armsProgram,
  coreProgram,
  lowerBackProgram,
  upperBackProgram,
  hipsProgram,
  glutesProgram,
  quadricepsProgram,
  hamstringsProgram,
  kneesProgram,
  shinsProgram,
  calvesProgram,
  anklesProgram,
};
