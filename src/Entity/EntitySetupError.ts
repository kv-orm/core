import { SetupError } from '../utils/errors'
import { EntityConstructor } from '../Entity/Entity'

export class EntitySetupError extends SetupError {
  constructor(constructor: EntityConstructor, message = `Unknown error`) {
    super(`Could not setup the Entity, ${constructor.name}: ${message}`)
    this.name = `EntitySetupError`
  }
}
