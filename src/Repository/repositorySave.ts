import { BaseEntity } from "../Entity/Entity";
import { getConstructorDatastoreCache } from "../utils/entities";
import { getRepository } from "./Repository";
import {
  getToOneRelationshipMetadatas,
  getToManyRelationshipMetadatas,
} from "../utils/relationships";

export const repositorySave = async (
  instance: BaseEntity
): Promise<boolean> => {
  const { constructor, cache } = getConstructorDatastoreCache(instance);

  const toOneRelationshipMetadatas = getToOneRelationshipMetadatas(constructor);
  const toManyRelationshipMetadatas = getToManyRelationshipMetadatas(
    constructor
  );

  let updatedRelation = false;

  for (const toOneRelationshipMetadata of toOneRelationshipMetadatas) {
    if (toOneRelationshipMetadata.cascade.onUpdate) {
      const relationshipRepository = getRepository(
        toOneRelationshipMetadata.type()
      );

      const cachedRelationInstance = toOneRelationshipMetadata.instance.get(
        instance
      );
      if (cachedRelationInstance) {
        updatedRelation =
          (await relationshipRepository.save(cachedRelationInstance)) ||
          updatedRelation;
      }
    }
  }

  for (const toManyRelationshipMetadata of toManyRelationshipMetadatas) {
    if (toManyRelationshipMetadata.cascade.onUpdate) {
      const relationshipRepository = getRepository(
        toManyRelationshipMetadata.type()
      );

      const cachedRelationInstances =
        toManyRelationshipMetadata.instances.get(instance) || [];
      for (const cachedRelationInstance of cachedRelationInstances) {
        updatedRelation =
          (await relationshipRepository.save(cachedRelationInstance)) ||
          updatedRelation;
      }
    }
  }

  return cache.sync(instance) || updatedRelation;
};
