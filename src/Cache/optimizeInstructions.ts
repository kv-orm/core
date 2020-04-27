import { Cache } from "./Cache";
import { BaseEntity } from "../Entity/Entity";
import { Instruction } from "../Instruction/Instruction";

export const optimizeInstructions = (
  cache: Cache,
  instance: BaseEntity
): Instruction[] => {
  let instructions = cache.instructions.get(instance) || [];
  instructions = [...instructions].reverse();
  const optimalInstructions = [];
  const seenKeys = new Set();
  for (const instruction of instructions) {
    const key = instruction.key;
    if (!seenKeys.has(key)) {
      optimalInstructions.push(instruction);
      seenKeys.add(key);
    }
  }
  optimalInstructions.reverse();
  cache.instructions.set(instance, optimalInstructions);
  return optimalInstructions;
};
