import { Cache } from "./Cache";
import { BaseEntity } from "../Entity/Entity";
import { Key } from "../Datastore/Datastore";
import { DeleteInstruction } from "../Instruction/DeleteInstruction";

export const cacheDelete = (
  cache: Cache,
  instance: BaseEntity,
  keyGenerator: () => Key
): void =>
  cache.recordInstruction(instance, new DeleteInstruction(keyGenerator));
