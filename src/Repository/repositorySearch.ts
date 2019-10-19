import { EntityConstructor, BaseEntity } from '../Entity/Entity'
import { Value } from '../Datastore/Datastore'
import { getConstantColumns } from '../utils/columns'
import { ColumnKey } from '../Column/Column'
import { RepositorySearchError } from './RepositorySearchError'
import { generateIndexablePropertySearchKey } from '../utils/keyGeneration'
import { repositoryLoad } from './repositoryLoad'
import { getDatastore } from '../utils/datastore'

export const repositorySearch = async <T extends BaseEntity>(
  constructor: EntityConstructor<T>,
  property: ColumnKey,
  identifier: Value
): Promise<T | null> => {
  const datastore = getDatastore(constructor)
  const columns = getConstantColumns(constructor)
  const indexableProperty = columns.find(column => column.property === property)

  if (indexableProperty === undefined)
    throw new RepositorySearchError(
      constructor,
      property,
      `Property is not indexable, or does not exist.`
    )

  const key = await generateIndexablePropertySearchKey(
    constructor,
    indexableProperty,
    identifier
  )
  const primaryIdentifier = await datastore.read(key)
  return await repositoryLoad(constructor, primaryIdentifier)
}
