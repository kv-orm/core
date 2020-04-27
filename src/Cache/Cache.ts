import { Key, Value } from "../Datastore/Datastore";
import { BaseEntity } from "../Entity/Entity";
import { Instruction } from "../Instruction/Instruction";
import { cacheWrite } from "./cacheWrite";
import { cacheDelete } from "./cacheDelete";
import { cacheRead } from "./cacheRead";
import { cacheSync } from "./cacheSync";
import { CacheMissingPrimaryColumnValueError } from "./CacheMissingPrimaryColumnValueError";

export class Cache {
  public instructions = new Map<BaseEntity, Instruction[]>();
  public data = new Map<BaseEntity, Map<Key, Value>>();
  private primaryColumnValues = new Map<BaseEntity, Value>();

  public recordInstruction(
    instance: BaseEntity,
    instruction: Instruction
  ): void {
    const instructions = this.instructions.get(instance) || [];
    instructions.push(instruction);
    this.instructions.set(instance, instructions);
  }

  public async sync(instance: BaseEntity): Promise<boolean> {
    return cacheSync(this, instance);
  }

  public async read(instance: BaseEntity, key: Key): Promise<Value> {
    return cacheRead(this, instance, key);
  }

  public write(
    instance: BaseEntity,
    keyGenerator: () => Key,
    value: Value
  ): void {
    return cacheWrite(this, instance, keyGenerator, value);
  }

  public delete(instance: BaseEntity, keyGenerator: () => Key): void {
    return cacheDelete(this, instance, keyGenerator);
  }

  public getPrimaryColumnValue(
    instance: BaseEntity,
    { failSilently } = { failSilently: false }
  ): Value {
    const value = this.primaryColumnValues.get(instance);
    if (value === undefined && !failSilently)
      throw new CacheMissingPrimaryColumnValueError(instance);
    return value;
  }

  public setPrimaryColumnValue(instance: BaseEntity, value: Value): void {
    this.primaryColumnValues.set(instance, value);
  }
}
