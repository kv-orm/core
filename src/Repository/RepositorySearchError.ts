import { KVORMError } from '../utils/errors'
import { BaseEntity, EntityConstructor } from '../Entity/Entity'
import { ColumnKey } from '../Column/Column'

export class RepositorySearchError extends KVORMError {
  constructor(
    entityConstructor: EntityConstructor<BaseEntity>,
    property: ColumnKey,
    message = `Unknown Error`
  ) {
    super(
      `Could not search Entity, ${entityConstructor.name}, for property, ${property}: ${message}`
    )
    this.name = `RepositorySearchError`
  }
}
