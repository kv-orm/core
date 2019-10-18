import { KVORMError } from '../utils/errors'
import { BaseEntity, EntityConstructor } from '../Entity/Entity'

export class RepositoryLoadError extends KVORMError {
  constructor(
    entityConstructor: EntityConstructor<BaseEntity>,
    message = `Unknown Error`
  ) {
    super(`Could not load Entity, ${entityConstructor.name},: ${message}`)
    this.name = `RepositoryLoadError`
  }
}
