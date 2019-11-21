import { Key, Datastore, Value } from '../Datastore/Datastore'
import { WriteInstruction } from './WriteInstruction'

export class DeleteInstruction extends WriteInstruction {
  public constructor(keyGenerator: () => Key) {
    super(keyGenerator, null)
  }

  public async performOnDatastore(datastore: Datastore): Promise<void> {
    await datastore.delete(this.key)
  }

  public performOnCacheData(cacheData: Map<Key, Value>): void {
    cacheData.delete(this.key)
  }
}
