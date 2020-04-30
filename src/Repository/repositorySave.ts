import { BaseEntity } from "../Entity/Entity";
import { getConstructorDatastoreCache } from "../utils/entities";
import { getDatastore } from "../utils/datastore";
import { getRepository } from "./Repository";
import { toOneGet } from "../Relationship/toOneGet";
import { toManyGet } from "../Relationship/toManyGet";
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

  // // TODO: Not quite. This will load up all instances. We only care about those in the cache, as those are the only ones that possibly need updating.
  // for (const relationshipMetadata of relationshipMetadatas) {
  //   if (relationshipMetadata.cascade) {
  //     const relationshipRepository = getRepository(relationshipMetadata.type);

  //     switch (relationshipMetadata.cardinality) {
  //       case "ToOne":
  //         const relationInstance = toOneGet(instance, relationshipMetadata);
  //         break;
  //       case "ToMany":
  //         const relationInstances = toManyGet(instance, relationshipMetadata);

  //         for await (const relationInstance of relationInstances) {
  //         }
  //         break;
  //     }

  //     // relationshipRepository.save();
  //   }
  // }

  return cache.sync(instance);
};
