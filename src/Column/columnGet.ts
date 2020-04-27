import { BaseEntity } from "../Entity/Entity";
import { ColumnMetadata } from "./columnMetadata";
import { Value } from "../Datastore/Datastore";
import { getConstructorDatastoreCache } from "../utils/entities";
import { generatePropertyKey } from "../utils/keyGeneration";

export const columnGet = async (
  instance: BaseEntity,
  columnMetadata: ColumnMetadata
): Promise<Value> => {
  const { cache } = getConstructorDatastoreCache(instance);

  const key = generatePropertyKey(instance, columnMetadata);

  return await cache.read(instance, key);
};
