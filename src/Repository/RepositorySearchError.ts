import { KVORMError } from '../utils/errors'
import { BaseEntity, EntityConstructor } from '../Entity/Entity'
import { ColumnKey } from '../Column/Column'

export class RepositorySearchError extends KVORMError {
  constructor(
    constructor: EntityConstructor<BaseEntity>,
    property: ColumnKey,
    message = `Unknown Error`
  ) {
    super(
      `Could not search Entity, ${constructor.name}, for property, ${property}: ${message}`
    )
    this.name = `RepositorySearchError`
  }
}
