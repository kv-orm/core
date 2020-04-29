import { Key } from "../Datastore/Datastore";
import { PropertyKey } from "../Entity/Entity";

export interface ColumnMetadata {
  key: Key;
  property: PropertyKey;
  isPrimary?: boolean;
  isIndexable?: boolean;
  isUnique?: boolean;
}

export const createColumnMetadata = ({
  options: { key, isIndexable, isPrimary, isUnique },
  property,
}: {
  options: {
    key?: string;
    isIndexable?: boolean;
    isPrimary?: boolean;
    isUnique?: boolean;
  };
  property: PropertyKey;
}): ColumnMetadata => ({
  key: key || property.toString(),
  property,
  isIndexable: !!isPrimary || !!isIndexable,
  isPrimary: !!isPrimary,
  isUnique: !!isPrimary || !!isUnique,
});
