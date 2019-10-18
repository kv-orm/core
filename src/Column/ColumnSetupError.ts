import { SetupError } from '../utils/errors'
import { ConstantColumnMetadata } from './Column'
import { BaseEntity } from '../Entity/Entity'

export class ColumnSetupError extends SetupError {
  constructor(
    instance: BaseEntity,
    column: ConstantColumnMetadata,
    message = `Unknown error`
  ) {
    super(
      `Could not setup the Column, ${column.key}, on Entity, ${instance.constructor.name}: ${message}`
    )
    this.name = `ColumnSetupError`
  }
}
