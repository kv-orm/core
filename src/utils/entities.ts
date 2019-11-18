import { EntityConstructor, BaseEntity, ENTITY_KEY } from '../Entity/Entity'
import { EntityLookupError } from './errors'
import { EntityMetadata } from '../Entity/entityMetadata'

export const getEntityMetadata = (
  constructor: EntityConstructor
): EntityMetadata => {
  const entityMetadata = Reflect.getMetadata(
    ENTITY_KEY,
    constructor
  ) as EntityMetadata

  if (entityMetadata === undefined)
    throw new EntityLookupError(
      constructor,
      `Could not find metadata on Entity. Has it been defined yet?`
    )

  return entityMetadata
}

export const setEntityMetadata = (
  constructor: EntityConstructor,
  entityMetadata: EntityMetadata
): void => Reflect.defineMetadata(ENTITY_KEY, entityMetadata, constructor)

export const getConstructor = (instance: BaseEntity): EntityConstructor =>
  instance.constructor as EntityConstructor

export const createEmptyInstance = <T extends BaseEntity>(
  constructor: EntityConstructor<T>
): T => Object.create(constructor.prototype)
