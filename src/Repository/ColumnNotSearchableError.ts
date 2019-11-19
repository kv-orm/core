import { KVORMError } from '../utils/errors'
import { EntityConstructor } from '../Entity/Entity'
import { ColumnMetadata } from '../Column/columnMetadata'

export class ColumnNotSearchableError extends KVORMError {
  constructor(
    constructor: EntityConstructor,
    columnMetadata: ColumnMetadata,
    message = `Unknown Error`
  ) {
    super(
      `The Column, ${columnMetadata.property.toString()}, on Entity, ${
        constructor.name
      } cannot be searched: ${message}`
    )
    this.name = `ColumnNotSearchableError`
  }
}
