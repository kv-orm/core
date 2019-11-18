import { BaseEntity } from '../Entity/Entity'
import { Value, SearchStrategy } from '../Datastore/Datastore'
import { getConstructor } from '../utils/entities'
import { getDatastore } from '../utils/datastore'
import { generateManyRelationshipSearchKey } from '../utils/keyGeneration'
import { RelationshipMetadata } from './relationshipMetadata'
import { SearchStrategyError } from '../Datastore/SearchStrategyError'

// TODO: Cache?
export const oneToManyGet = async (
  instance: BaseEntity,
  relationshipMetadata: RelationshipMetadata
): Promise<Value[]> => {
  const constructor = getConstructor(instance)
  const datastore = getDatastore(constructor)

  const searchKey = generateManyRelationshipSearchKey(
    instance,
    relationshipMetadata
  )

  let strategy
  if (datastore.searchStrategies.indexOf(SearchStrategy.prefix) !== -1) {
    strategy = SearchStrategy.prefix
  }

  if (strategy === undefined) {
    throw new SearchStrategyError(
      SearchStrategy.prefix,
      `Datastore does not support searching`
    )
  }

  // TODO: Yield and paginate
  const searchResults = await datastore.search({
    strategy: SearchStrategy.prefix,
    term: searchKey,
  })

  // TODO: Be safer with string-ing
  return Promise.resolve(searchResults.keys.map(key => key.split(searchKey)[1]))
}
