import { Datastore, Key } from "../Datastore/Datastore";
import { BaseEntity } from "./Entity";

export interface EntityMetadata {
  datastore: Datastore;
  key: Key;
  instances: BaseEntity[];
  plugins: {};
}

export const createEntityMetadata = (
  {
    datastore,
    key,
  }: {
    datastore: Datastore;
    key: Key;
  },
  plugins = {}
): EntityMetadata => ({
  datastore,
  key,
  instances: [], // TODO
  plugins,
});
