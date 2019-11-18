import '../metadata'

import { BaseEntity, EntityConstructor } from '../Entity/Entity'
import { PropertyKey } from '../Entity/Entity'
import { Value } from '../Datastore/Datastore'
import { repositoryLoad } from './repositoryLoad'
import { repositorySearch } from './repositorySearch'
import { repositorySave } from './repositorySave'

export interface Repository {
  load(identifier?: Value): Promise<BaseEntity>
  save(entity: BaseEntity): Promise<boolean>
  search(property: PropertyKey, identifier: Value): Promise<BaseEntity | null>
}

export const getRepository = <T extends BaseEntity>(
  constructor: EntityConstructor<T>
): Repository => {
  return {
    async load(identifier?: Value): Promise<T> {
      return await repositoryLoad(constructor, identifier)
    },
    async save(instance: BaseEntity): Promise<boolean> {
      return await repositorySave(instance)
    },
    async search(property: PropertyKey, identifier: Value): Promise<T | null> {
      return await repositorySearch(constructor, property, identifier)
    },
  }
}
