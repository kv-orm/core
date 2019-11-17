import { KVORMError } from '../utils/errors'
import { EntityConstructor } from '../Entity/Entity'
import { ColumnKey } from '../Column/Column'

export class RepositorySearchError extends KVORMError {
  constructor(
    constructor: EntityConstructor,
    property: ColumnKey,
    message = `Unknown Error`
  ) {
    super(
      `Could not search Entity, ${
        constructor.name
      }, for property, ${property.toString()}: ${message}`
    )
    this.name = `RepositorySearchError`
  }
}
