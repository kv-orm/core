import { KVORMError } from '../utils/errors'
import { BaseEntity, EntityConstructor } from '../Entity/Entity'

export class RepositoryLoadError extends KVORMError {
  constructor(
    constructor: EntityConstructor<BaseEntity>,
    message = `Unknown Error`
  ) {
    super(`Could not load Entity, ${constructor.name}: ${message}`)
    this.name = `RepositoryLoadError`
  }
}
