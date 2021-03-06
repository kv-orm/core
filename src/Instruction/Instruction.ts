import { Datastore, Key, Value } from "../Datastore/Datastore";

export abstract class Instruction {
  protected abstract keyGenerator: () => Key;
  public abstract value: Value;

  public abstract async perform(datastore: Datastore): Promise<void>;

  public get key(): Key {
    return this.keyGenerator();
  }
}
