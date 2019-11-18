import { Key, Value } from '../Datastore/Datastore'
import { BaseEntity } from '../Entity/Entity'
import { Instruction } from '../Instruction/Instruction'
import { WriteInstruction } from '../Instruction/WriteInstruction'
import { DeleteInstruction } from '../Instruction/DeleteInstruction'
import { getConstructor } from '../utils/entities'
import { getDatastore } from '../utils/datastore'

// TODO: Tidy and extract out
export class Cache {
  private instructions = new Map<BaseEntity, Instruction[]>()
  private data = new Map<BaseEntity, Map<Key, Value>>()
  private primaryColumnValues = new Map<BaseEntity, Value>()

  private async getData(instance: BaseEntity): Promise<Map<Key, Value>> {
    await this.stabilize(instance)
    return this.data.get(instance) || new Map()
  }

  private optimizeInstructions(instance: BaseEntity): void {
    const instructions = [...(this.instructions.get(instance) || [])].reverse()
    const optimalInstructions = []
    const seenKeys = new Set()
    for (const instruction of instructions) {
      const key = instruction.key
      if (!seenKeys.has(key)) {
        optimalInstructions.push(instruction)
        seenKeys.add(key)
      }
    }
    this.instructions.set(instance, optimalInstructions.reverse())
  }

  private async stabilize(instance: BaseEntity): Promise<boolean> {
    this.optimizeInstructions(instance)
    const instructions = this.instructions.get(instance) || []

    if (instructions.length === 0) return Promise.resolve(false)

    const data = this.data.get(instance) || new Map()

    for (const instruction of instructions) {
      data.set(instruction.key, instruction.value)
    }

    this.data.set(instance, data)

    return Promise.resolve(true)
  }

  public async read(instance: BaseEntity, key: Key): Promise<Value> {
    const data = await this.getData(instance)
    let value = data.get(key) || null
    if (value !== null) return value

    const constructor = getConstructor(instance)
    const datastore = getDatastore(constructor)
    value = await datastore.read(key)
    data.set(key, value)
    this.data.set(instance, data)
    return value
  }

  private recordInstruction(
    instance: BaseEntity,
    instruction: Instruction
  ): void {
    const instructions = this.instructions.get(instance) || []
    instructions.push(instruction)
    this.instructions.set(instance, instructions)
  }

  public async sync(instance: BaseEntity): Promise<boolean> {
    this.optimizeInstructions(instance)
    const constructor = getConstructor(instance)
    const datastore = getDatastore(constructor)
    const instructions = this.instructions.get(instance) || []

    if (instructions.length === 0) return Promise.resolve(false)

    for (const instruction of instructions) {
      await instruction.perform(datastore)
    }

    this.instructions.set(instance, [])

    return Promise.resolve(true)
  }

  public write(
    instance: BaseEntity,
    keyGenerator: () => Key,
    value: Value
  ): void {
    this.recordInstruction(instance, new WriteInstruction(keyGenerator, value))
  }

  public delete(instance: BaseEntity, keyGenerator: () => Key): void {
    this.recordInstruction(instance, new DeleteInstruction(keyGenerator))
  }

  public getPrimaryColumnValue(instance: BaseEntity): Value {
    const value = this.primaryColumnValues.get(instance)
    if (value === null) throw new Error(``) // TODO
    return value
  }

  public setPrimaryColumnValue(instance: BaseEntity, value: Value): void {
    this.primaryColumnValues.set(instance, value)
  }
}
