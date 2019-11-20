import { DeleteInstruction } from './DeleteInstruction'

describe(`DeleteInstruction`, () => {
  let instruction: DeleteInstruction

  beforeEach(() => {
    instruction = new DeleteInstruction(() => `key`)
  })

  it(`should generate keys`, async () => {
    expect(instruction.key).toEqual(`key`)
  })

  it(`should have a null value`, () => {
    expect(instruction.value).toBeNull()
  })
})
