import { SetupError } from '../utils/errors'
import { ColumnMetadata } from './Column'
import { BaseEntity, EntityConstructor } from '../Entity/Entity'

export class ColumnSetupError extends SetupError {
  constructor(
    constructor: EntityConstructor<BaseEntity>,
    column: ColumnMetadata,
    message = `Unknown error`
  ) {
    super(
      `Could not setup the Column, ${column.key}, on Entity, ${constructor.name}: ${message}`
    )
    this.name = `ColumnSetupError`
  }
}
