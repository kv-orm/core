import { Key } from "../Datastore/Datastore";
import { PropertyKey } from "../Entity/Entity";
import { Metadata } from "../utils/metadata";

export interface ColumnMetadata extends Metadata {
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
    key?: Key;
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
