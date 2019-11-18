import { EntityConstructor, BaseEntity } from '../Entity/Entity'
import { Value } from '../Datastore/Datastore'
import { createEmptyInstance } from '../utils/entities'
import {
  getPrimaryColumnMetadata,
  setPrimaryColumnValue,
} from '../utils/columns'
import { RepositoryLoadError } from './RepositoryLoadError'

export const repositoryLoad = async <T extends BaseEntity>(
  constructor: EntityConstructor<T>,
  identifier?: Value
): Promise<T> => {
  const instance = createEmptyInstance(constructor)
  const primaryColumnMetadata = getPrimaryColumnMetadata(constructor)

  if (primaryColumnMetadata === undefined && identifier !== undefined) {
    throw new RepositoryLoadError(
      constructor,
      `Entity is a singleton, so cannot load with an identifier.`
    )
  } else if (primaryColumnMetadata !== undefined && identifier === undefined) {
    throw new RepositoryLoadError(
      constructor,
      `Entity is not a singleton, and so requires an identifier to load with.`
    )
  }

  // TODO: Throw error if does not exist

  if (primaryColumnMetadata !== undefined && identifier !== undefined) {
    setPrimaryColumnValue(instance, identifier)
  }

  return instance
}
