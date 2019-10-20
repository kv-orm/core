import {
  EntityConstructor,
  BaseEntity,
  EntityConstructorMetadata,
  ENTITY_METADATA_KEY,
} from '../Entity/Entity'
import { EntityMetadataLookupError } from './errors'

export const getEntityMetadata = (
  constructor: EntityConstructor<BaseEntity>
): EntityConstructorMetadata => {
  const entityMetadata = Reflect.getMetadata(
    ENTITY_METADATA_KEY,
    constructor
  ) as EntityConstructorMetadata

  if (entityMetadata === undefined)
    throw new EntityMetadataLookupError(
      constructor,
      `Could not find metadata on Entity. Has it been defined yet?`
    )

  return entityMetadata
}

export const getEntityConstructor = (
  instance: BaseEntity
): EntityConstructor<BaseEntity> =>
  instance.constructor as EntityConstructor<BaseEntity>

export const createEmptyInstance = <T extends BaseEntity>(
  constructor: EntityConstructor<T>
): T => Object.create(constructor.prototype)
