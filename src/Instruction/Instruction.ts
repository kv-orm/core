import { Datastore, Key, Value } from '../Datastore/Datastore'

export abstract class Instruction {
  protected abstract keyGenerator: () => Key
  public abstract value: Value

  public abstract async performOnDatastore(datastore: Datastore): Promise<void>
  public abstract async performOnCacheData(
    cacheData: Map<Key, Value>
  ): Promise<void>

  public get key(): Key {
    return this.keyGenerator()
  }
}
