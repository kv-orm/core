import { Cache } from '../Cache/Cache'
import { Datastore } from '../Datastore/Datastore'

export const getCache = (datastore: Datastore): Cache => {
  return datastore.cache
}
