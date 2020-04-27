import { WriteInstruction } from "./WriteInstruction";
import { Key } from "../Datastore/Datastore";

describe(`WriteInstruction`, () => {
  let instruction: WriteInstruction;

  beforeEach(() => {
    instruction = new WriteInstruction((): Key => `key`, `value`);
  });

  it(`should generate keys`, async () => {
    expect(instruction.key).toEqual(`key`);
  });

  it(`should hold values`, () => {
    expect(instruction.value).toEqual(`value`);
  });
});
