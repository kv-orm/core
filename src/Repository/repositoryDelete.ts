import { BaseEntity } from "../Entity/Entity";
import { getConstructorDatastoreCache } from "../utils/entities";
import { getColumnMetadatas } from "../utils/columns";
import {
  getToOneRelationshipMetadatas,
  getToManyRelationshipMetadatas,
  getRelationshipMetadata,
} from "../utils/relationships";
import { columnSet } from "../Column/columnSet";
import { repositorySave } from "./repositorySave";
import { toOneGet } from "../Relationship/toOneGet";
import { toManyGet } from "../Relationship/toManyGet";
import { removeFrom } from "../Relationship/removeFrom";

export const repositoryDelete = async (
  instance: BaseEntity
): Promise<boolean> => {
  const { constructor } = getConstructorDatastoreCache(instance);
  const columnMetadatas = getColumnMetadatas(constructor);

  for (const columnMetadata of columnMetadatas) {
    columnSet(instance, columnMetadata, null);
  }

  const toOneRelationshipMetadatas = getToOneRelationshipMetadatas(constructor);
  const toManyRelationshipMetadatas = getToManyRelationshipMetadatas(
    constructor
  );

  let updatedRelation = false;

  for (const toOneRelationshipMetadata of toOneRelationshipMetadatas) {
    if (toOneRelationshipMetadata.cascade.onDelete) {
      const relationInstance = await toOneGet(
        instance,
        toOneRelationshipMetadata
      );
      const relationshipConstructor = toOneRelationshipMetadata.type();
      const relationshipRelationshipMetadata = getRelationshipMetadata(
        relationshipConstructor,
        toOneRelationshipMetadata.backRef
      );

      switch (relationshipRelationshipMetadata.cardinality) {
        case "ToOne":
          updatedRelation =
            (await repositoryDelete(relationInstance)) || updatedRelation;
          break;
        case "ToMany":
          // TODO: updatedRelation =
          removeFrom(
            relationInstance,
            toOneRelationshipMetadata.backRef,
            instance
          );
          break;
      }
    }
  }

  for (const toManyRelationshipMetadata of toManyRelationshipMetadatas) {
    if (toManyRelationshipMetadata.cascade.onDelete) {
      const relationInstances = toManyGet(instance, toManyRelationshipMetadata);
      const relationshipConstructor = toManyRelationshipMetadata.type();
      const relationshipRelationshipMetadata = getRelationshipMetadata(
        relationshipConstructor,
        toManyRelationshipMetadata.backRef
      );

      switch (relationshipRelationshipMetadata.cardinality) {
        case "ToOne":
          for await (const relationInstance of relationInstances) {
            updatedRelation =
              (await repositoryDelete(relationInstance)) || updatedRelation;
          }
          break;
        case "ToMany":
          for await (const relationInstance of relationInstances) {
            // TODO: updatedRelation =
            removeFrom(
              relationInstance,
              toManyRelationshipMetadata.backRef,
              instance
            );
          }
          break;
      }
    }
  }

  return repositorySave(instance) || updatedRelation;
};
