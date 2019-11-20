import '../metadata'

import { BaseEntity, EntityConstructor } from '../Entity/Entity'
import { PropertyKey } from '../Entity/Entity'
import { Value } from '../Datastore/Datastore'
import { repositoryLoad } from './repositoryLoad'
import { repositorySearch } from './repositorySearch'
import { repositorySave } from './repositorySave'
// import { repositoryDelete } from './repositoryDelete'

export interface Repository {
  load(identifier?: Value): Promise<BaseEntity>
  delete(instance: BaseEntity): Promise<boolean>
  save(instance: BaseEntity): Promise<boolean>
  search(property: PropertyKey, identifier: Value): Promise<BaseEntity | null>
}

export const getRepository = <T extends BaseEntity>(
  constructor: EntityConstructor<T>
): Repository => {
  return {
    load(identifier?: Value): Promise<T> {
      return repositoryLoad(constructor, identifier)
    },
    delete(instance: BaseEntity): Promise<boolean> {
      return repositorySave(instance)
    },
    save(instance: BaseEntity): Promise<boolean> {
      return repositorySave(instance)
    },
    search(property: PropertyKey, identifier: Value): Promise<T | null> {
      return repositorySearch(constructor, property, identifier)
    },
  }
}
