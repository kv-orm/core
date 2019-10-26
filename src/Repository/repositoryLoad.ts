import { EntityConstructor, BaseEntity } from '../Entity/Entity'
import { Value } from '../Datastore/Datastore'
import { createEmptyInstance } from '../utils/entity'
import { getPrimaryColumn, setPrimaryColumnValue } from '../utils/columns'
import { RepositoryLoadError } from './RepositoryLoadError'

export const repositoryLoad = async <T extends BaseEntity>(
  constructor: EntityConstructor<T>,
  identifier?: Value
): Promise<T> => {
  const instance = createEmptyInstance(constructor)
  const primaryColumn = getPrimaryColumn(instance)

  if (primaryColumn === undefined && identifier !== undefined) {
    throw new RepositoryLoadError(
      constructor,
      `Entity is a singleton, so cannot load with an identifier.`
    )
  } else if (primaryColumn !== undefined && identifier === undefined) {
    throw new RepositoryLoadError(
      constructor,
      `Entity is not a singleton, and so requires an identifier to load with.`
    )
  }

  if (primaryColumn !== undefined && identifier !== undefined) {
    setPrimaryColumnValue(instance, identifier)
  }
  return instance
}
