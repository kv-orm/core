import { BaseEntity } from "../Entity/Entity";
import { getConstructorDatastoreCache } from "../utils/entities";

export const repositorySave = async (
  instance: BaseEntity
): Promise<boolean> => {
  const { cache } = getConstructorDatastoreCache(instance);
  return cache.sync(instance);
};
