import { EntityConstructor, BaseEntity } from '../Entity/Entity'
import { Datastore } from '../Datastore/Datastore'
import { getEntityMetadata } from './entity'

export const getDatastore = (
  constructor: EntityConstructor<BaseEntity>
): Datastore => getEntityMetadata(constructor).datastore
