import { Key, Datastore, Value } from '../Datastore/Datastore'
import { WriteInstruction } from './WriteInstruction'

export class DeleteInstruction extends WriteInstruction {
  public constructor(keyGenerator: () => Key) {
    super(keyGenerator, null)
  }

  public async performOnDatastore(datastore: Datastore): Promise<void> {
    await datastore.delete(this.key)
  }

  public async performOnCacheData(cacheData: Map<Key, Value>): Promise<void> {
    cacheData.delete(this.key)
  }
}
