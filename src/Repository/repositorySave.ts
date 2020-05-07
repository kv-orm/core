import { BaseEntity } from "../Entity/Entity";
import { getConstructorDatastoreCache } from "../utils/entities";
import { getRepository } from "./Repository";
import {
  getToOneRelationshipMetadatas,
  getToManyRelationshipMetadatas,
} from "../utils/relationships";
import { RelationshipMetadata } from "../Relationship/relationshipMetadata";

export const repositorySave = async (
  instance: BaseEntity,
  {
    skipRelationshipMetadatas,
  }: { skipRelationshipMetadatas: RelationshipMetadata[] } = {
    skipRelationshipMetadatas: [],
  }
): Promise<boolean> => {
  const { constructor, cache } = getConstructorDatastoreCache(instance);

  const toOneRelationshipMetadatas = getToOneRelationshipMetadatas(constructor);
  const toManyRelationshipMetadatas = getToManyRelationshipMetadatas(
    constructor
  );

  let updatedRelation = false;

  for (const toOneRelationshipMetadata of toOneRelationshipMetadatas) {
    if (
      toOneRelationshipMetadata.cascade.onUpdate &&
      !skipRelationshipMetadatas.includes(toOneRelationshipMetadata)
    ) {
      skipRelationshipMetadatas.push(toOneRelationshipMetadata);
      const cachedRelationInstance = toOneRelationshipMetadata.instance.get(
        instance
      );
      if (cachedRelationInstance) {
        updatedRelation =
          (await repositorySave(cachedRelationInstance, {
            skipRelationshipMetadatas,
          })) || updatedRelation;
      }
    }
  }

  for (const toManyRelationshipMetadata of toManyRelationshipMetadatas) {
    if (
      toManyRelationshipMetadata.cascade.onUpdate &&
      !skipRelationshipMetadatas.push(toManyRelationshipMetadata)
    ) {
      skipRelationshipMetadatas.push(toManyRelationshipMetadata);
      const cachedRelationInstances =
        toManyRelationshipMetadata.instances.get(instance) || [];
      for (const cachedRelationInstance of cachedRelationInstances) {
        updatedRelation =
          (await repositorySave(cachedRelationInstance, {
            skipRelationshipMetadatas,
          })) || updatedRelation;
      }
    }
  }

  return cache.sync(instance) || updatedRelation;
};
