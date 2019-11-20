import { Instruction } from './Instruction'
import { Datastore, Key, Value } from '../Datastore/Datastore'

export class WriteInstruction extends Instruction {
  protected keyGenerator: () => Promise<Key>
  public value: Value

  public constructor(keyGenerator: () => Promise<Key>, value: Value) {
    super()
    this.keyGenerator = keyGenerator
    this.value = value
  }

  public async perform(datastore: Datastore): Promise<void> {
    await datastore.write(await this.key, this.value)
  }
}
