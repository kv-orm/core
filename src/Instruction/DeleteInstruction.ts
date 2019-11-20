import { Key, Datastore } from '../Datastore/Datastore'
import { WriteInstruction } from './WriteInstruction'

export class DeleteInstruction extends WriteInstruction {
  public constructor(keyGenerator: () => Key) {
    super(keyGenerator, null)
  }

  public async perform(datastore: Datastore): Promise<void> {
    await datastore.delete(this.key)
  }
}
