import { Datastore, Key } from "../Datastore/Datastore";
import { BaseEntity, EntityConstructor } from "./Entity";
import { Metadata } from "../utils/metadata";

export interface EntityMetadata extends Metadata {
  datastore: Datastore;
  key: Key;
}

export const createEntityMetadata = ({
  options: { datastore, key },
  constructor,
}: {
  options: { datastore: Datastore; key?: Key };
  constructor: EntityConstructor;
}): EntityMetadata => ({
  datastore,
  key: key || constructor.name,
});
