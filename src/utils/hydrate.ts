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
    if (primaryColumn !== undefined) {
      return await repositoryLoad(constructor, identifier);
    } else {
      return await repositoryLoad(constructor);
    }
  };
};

export async function* hydrateMany(
  datastore: Datastore,
  searchKey: Key,
  hydrator: hydrator,
  { skip }: { skip: (primaryColumnValue: Key) => boolean } = {
    skip: () => false,
  }
): AsyncGenerator<BaseEntity> {
  const searchStrategy = pickSearchStrategy(datastore);

  const keyGenerator = keysFromSearch(datastore, {
    strategy: searchStrategy,
    term: searchKey,
  });

  for await (const value of keyGenerator) {
    const primaryColumnValue = extractValueFromSearchKey(
      datastore,
      value,
      searchKey
    );
    !skip(primaryColumnValue) && (yield await hydrator(primaryColumnValue));
  }
}
