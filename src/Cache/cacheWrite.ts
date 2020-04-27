import { Cache } from "./Cache";
import { BaseEntity } from "../Entity/Entity";
import { Key, Value } from "../Datastore/Datastore";
import { WriteInstruction } from "../Instruction/WriteInstruction";

export const cacheWrite = (
  cache: Cache,
  instance: BaseEntity,
  keyGenerator: () => Key,
  value: Value
): void =>
  cache.recordInstruction(instance, new WriteInstruction(keyGenerator, value));
