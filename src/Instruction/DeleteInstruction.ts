import { Key } from '../Datastore/Datastore'
import { WriteInstruction } from './WriteInstruction'

export class DeleteInstruction extends WriteInstruction {
  public constructor(keyGenerator: () => Key) {
    super(keyGenerator, null)
  }
}
