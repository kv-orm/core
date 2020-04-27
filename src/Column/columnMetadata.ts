import { Key } from "../Datastore/Datastore";
import { PropertyKey } from "../Entity/Entity";

export interface ColumnMetadata {
  key: Key;
  property: PropertyKey;
  isPrimary?: boolean;
  isIndexable?: boolean;
  plugins: {};
}

export const createColumnMetadata = (
  {
    options: { key, isIndexable, isPrimary },
    property,
  }: {
    options: { key?: string; isIndexable?: boolean; isPrimary?: boolean };
    property: PropertyKey;
  },
  plugins = {}
): ColumnMetadata => ({
  key: key || property.toString(),
  property,
  isIndexable: !!isIndexable,
  isPrimary: !!isPrimary,
  plugins,
});
