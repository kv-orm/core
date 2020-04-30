import { BaseEntity } from "../Entity/Entity";
import { getConstructorDatastoreCache } from "../utils/entities";
import { getColumnMetadatas } from "../utils/columns";
import {
  getToOneRelationshipMetadatas,
  getToManyRelationshipMetadatas,
} from "../utils/relationships";
import { columnSet } from "../Column/columnSet";
import { repositorySave } from "./repositorySave";

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

  // for (const  of relationshipMetadatas) {
  // }

  return repositorySave(instance);
};
