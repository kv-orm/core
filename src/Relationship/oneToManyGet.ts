import { BaseEntity } from '../Entity/Entity'
import { Value, SearchStrategy, Datastore } from '../Datastore/Datastore'
import { getConstructor } from '../utils/entities'
import { getDatastore } from '../utils/datastore'
import { generateManyRelationshipSearchKey } from '../utils/keyGeneration'
import { RelationshipMetadata } from './relationshipMetadata'
import { SearchStrategyError } from '../Datastore/SearchStrategyError'
import { keysFromSearch } from '../utils/relationships'

const pickSearchStrategy = (datastore: Datastore): SearchStrategy => {
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
  return strategy
}

export async function* oneToManyGet(
  instance: BaseEntity,
  relationshipMetadata: RelationshipMetadata,
  hydrator: (identifier: Value) => Promise<BaseEntity>
): AsyncGenerator<BaseEntity> {
  const constructor = getConstructor(instance)
  const datastore = getDatastore(constructor)

  const searchKey = generateManyRelationshipSearchKey(
    instance,
    relationshipMetadata
  )
  const searchStrategy = pickSearchStrategy(datastore)

  const keyGenerator = await keysFromSearch(datastore, {
    strategy: searchStrategy,
    term: searchKey,
  })

  while (true) {
    const { done, value } = await keyGenerator.next()
    if (done) return
    yield await hydrator(value)
  }
}
