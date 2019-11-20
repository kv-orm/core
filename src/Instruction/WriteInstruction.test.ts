import { WriteInstruction } from './WriteInstruction'

describe(`WriteInstruction`, () => {
  let instruction: WriteInstruction

  beforeEach(() => {
    instruction = new WriteInstruction(() => `key`, `value`)
  })

  it(`should generate keys`, async () => {
    expect(instruction.key).toEqual(`key`)
  })

  it(`should hold values`, () => {
    expect(instruction.value).toEqual(`value`)
  })
})
