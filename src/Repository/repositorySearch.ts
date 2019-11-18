import { EntityConstructor, BaseEntity } from '../Entity/Entity'
import { Value } from '../Datastore/Datastore'
import { getColumnMetadata } from '../utils/columns'
import { ColumnKey } from '../Column/Column'
import { generateIndexablePropertyKey } from '../utils/keyGeneration'
import { repositoryLoad } from './repositoryLoad'
import { getDatastore } from '../utils/datastore'

export const repositorySearch = async <T extends BaseEntity>(
  constructor: EntityConstructor<T>,
  property: ColumnKey,
  identifier: Value
): Promise<T | null> => {
  const datastore = getDatastore(constructor)
  const columnMetadata = getColumnMetadata(constructor, property)

  // TODO: Assert Column isIndexable

  const key = generateIndexablePropertyKey(
    constructor,
    columnMetadata,
    identifier
  )
  const primaryIdentifier = await datastore.read(key)

  // TODO: Failure check

  return await repositoryLoad(constructor, primaryIdentifier)
}
