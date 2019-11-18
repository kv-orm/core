import { EntityConstructor, BaseEntity } from '../Entity/Entity'
import { Datastore } from '../Datastore/Datastore'
import { getEntityMetadata } from './entities'

export const getDatastore = (constructor: EntityConstructor): Datastore =>
  getEntityMetadata(constructor).datastore
