import { KVORMError } from '../utils/errors'
import { EntityConstructor } from '../Entity/Entity'

export class RepositoryLoadError extends KVORMError {
  constructor(constructor: EntityConstructor, message = `Unknown Error`) {
    super(`Could not load Entity, ${constructor.name}: ${message}`)
    this.name = `RepositoryLoadError`
  }
}
