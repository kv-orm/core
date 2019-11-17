import { DeleteInstruction } from './DeleteInstruction'
import { Key } from '../Datastore/Datastore'

describe(`DeleteInstruction`, () => {
  let instruction: DeleteInstruction

  beforeEach(() => {
    instruction = new DeleteInstruction((): Key => `key`)
  })

  it(`should generate keys`, async () => {
    expect(await instruction.key).toEqual(`key`)
  })

  it(`should have a null value`, () => {
    expect(instruction.value).toBeNull()
  })
})
