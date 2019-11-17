import {
  EntityConstructor,
  BaseEntity,
  EntityConstructorMetadata,
  ENTITY_KEY,
} from '../Entity/Entity'
import { EntityLookupError } from './errors'

export const getEntityMetadata = (
  constructor: EntityConstructor
): EntityConstructorMetadata => {
  const entityMetadata = Reflect.getMetadata(
    ENTITY_KEY,
    constructor
  ) as EntityConstructorMetadata

  if (entityMetadata === undefined)
    throw new EntityLookupError(
      constructor,
      `Could not find metadata on Entity. Has it been defined yet?`
    )

  return entityMetadata
}

export const getConstructor = (instance: BaseEntity): EntityConstructor =>
  instance.constructor as EntityConstructor

export const createEmptyInstance = <T extends BaseEntity>(
  constructor: EntityConstructor<T>
): T => Object.create(constructor.prototype)
