import { Datastore, Key } from '../Datastore/Datastore'
import { BaseEntity } from './Entity'

export interface EntityMetadata {
  datastore: Datastore
  key: Key
  instances: BaseEntity[]
}

export const createEntityMetadata = ({
  datastore,
  key,
}: {
  datastore: Datastore
  key: Key
}): EntityMetadata => ({
  datastore,
  key,
  instances: [], // TODO
})
