import { SetupError } from '../utils/errors'
import { ColumnMetadata } from './columnMetadata'
import { EntityConstructor } from '../Entity/Entity'

export class ColumnSetupError extends SetupError {
  constructor(
    constructor: EntityConstructor,
    columnMetadata: ColumnMetadata,
    message = `Unknown error`
  ) {
    super(
      `Could not setup the Column, ${columnMetadata.key}, on Entity, ${constructor.name}: ${message}`
    )
    this.name = `ColumnSetupError`
  }
}
