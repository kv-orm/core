import { BaseEntity, EntityConstructor } from "../Entity/Entity";
import { repositoryLoad } from "../Repository/repositoryLoad";
import { Value, Datastore, Key } from "../Datastore/Datastore";
import { getPrimaryColumnMetadata } from "./columns";
import { pickSearchStrategy, keysFromSearch } from "./datastore";
import { extractValueFromSearchKey } from "./keyGeneration";

export type hydrator = (identifier: Value) => Promise<BaseEntity>;

export const getHydrator = (constructor: EntityConstructor): hydrator => {
  return async (identifier: Value): Promise<BaseEntity> => {
    const primaryColumn = getPrimaryColumnMetadata(constructor);
    if (identifier !== undefined && primaryColumn !== undefined) {
      return await repositoryLoad(constructor, identifier);
    } else {
      return await repositoryLoad(constructor);
    }
  };
};

export async function* hydrateMany(
  datastore: Datastore,
  searchKey: Key,
  hydrator: hydrator
): AsyncGenerator<BaseEntity> {
  const searchStrategy = pickSearchStrategy(datastore);

  const keyGenerator = keysFromSearch(datastore, {
    strategy: searchStrategy,
    term: searchKey,
  });

  while (true) {
    const { done, value } = await keyGenerator.next();
    if (done) return;

    const primaryColumnValue = extractValueFromSearchKey(
      datastore,
      value,
      searchKey
    );
    yield await hydrator(primaryColumnValue);
  }
}
