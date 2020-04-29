import "../metadata";

import { Key, Value, Datastore } from "../Datastore/Datastore";
import { BaseEntity, EntityConstructor } from "../Entity/Entity";
import { ColumnMetadata } from "../Column/columnMetadata";
import { getPrimaryColumnMetadata, getPrimaryColumnValue } from "./columns";
import { getDatastore } from "./datastore";
import { getConstructor, getEntityMetadata } from "./entities";
import { RelationshipMetadata } from "../Relationship/relationshipMetadata";
import { InvalidKeyError } from "./errors";

export const assertKeysDoNotContainSeparator = (
  datastore: Datastore,
  keys: Key[]
): void => {
  for (const key of keys) {
    if (key.toString().includes(datastore.keySeparator))
      throw new InvalidKeyError(key, `Key contains Datastore's Key Separator`);
  }
};

const getEntityKey = (constructor: EntityConstructor): Key => {
  const datastore = getDatastore(constructor);
  const entityMetadata = getEntityMetadata(constructor);
  assertKeysDoNotContainSeparator(datastore, [entityMetadata.key]);
  return entityMetadata.key;
};

// Author:UUID-HERE:name
// or, if singleton, ApplicationConfiguration:password
export const generatePropertyKey = (
  instance: BaseEntity,
  metadata: ColumnMetadata | RelationshipMetadata
): Key => {
  const constructor = getConstructor(instance);
  const datastore = getDatastore(constructor);
  const keys = [getEntityKey(constructor)];
  const primaryColumnMetadata = getPrimaryColumnMetadata(constructor);

  if (primaryColumnMetadata) {
    keys.push(getPrimaryColumnValue(instance));
  }

  keys.push(metadata.key);

  assertKeysDoNotContainSeparator(datastore, keys);
  return keys.join(datastore.keySeparator);
};

// Author:email:abc@xyz.com:UUID-HERE
// or, if isUnique, Author:email:abc@xyz.com
export const generateIndexablePropertyKey = (
  instance: BaseEntity,
  columnMetadata: ColumnMetadata,
  value: Value
): Key => {
  const constructor = getConstructor(instance);
  const datastore = getDatastore(constructor);

  const keys = [getEntityKey(constructor), columnMetadata.key, value];

  if (!columnMetadata.isUnique) {
    keys.push(generateRelationshipKey(instance));
  }

  assertKeysDoNotContainSeparator(datastore, keys);
  return keys.join(datastore.keySeparator);
};

// Author:email:abc@xyz.com
export const getUniqueSearchKey = (
  constructor: EntityConstructor,
  columnMetadata: ColumnMetadata,
  value: Value
) => {
  const datastore = getDatastore(constructor);

  const keys = [getEntityKey(constructor), columnMetadata.key, value];

  assertKeysDoNotContainSeparator(datastore, keys);
  return keys.join(datastore.keySeparator);
};

export const getIndexableSearchKey = (
  constructor: EntityConstructor,
  columnMetadata: ColumnMetadata,
  value: Value
) => {
  const datastore = getDatastore(constructor);

  return (
    getUniqueSearchKey(constructor, columnMetadata, value) +
    datastore.keySeparator
  );
};

// UUID-HERE
// or, if singleton, ApplicationConfiguration
export const generateRelationshipKey = (instance: BaseEntity): Key => {
  const constructor = getConstructor(instance);
  const datastore = getDatastore(constructor);
  const primaryColumnMetadata = getPrimaryColumnMetadata(constructor);

  let key;
  if (primaryColumnMetadata) {
    key = getPrimaryColumnValue(instance);
  } else {
    key = getEntityKey(constructor);
  }

  assertKeysDoNotContainSeparator(datastore, [key]);
  return key;
};

// Author:UUID-HERE:passport
export const generateOneRelationshipKey = (
  instance: BaseEntity,
  relationshipMetadata: RelationshipMetadata
): Key => generatePropertyKey(instance, relationshipMetadata);

// Author:UUID-HERE:books:UUID-HERE
export const generateManyRelationshipKey = (
  instance: BaseEntity,
  relationshipMetadata: RelationshipMetadata,
  relationshipInstance: BaseEntity
): Key => {
  const constructor = getConstructor(instance);
  const datastore = getDatastore(constructor);
  const keys = [
    generatePropertyKey(instance, relationshipMetadata),
    generateRelationshipKey(relationshipInstance),
  ];
  return keys.join(datastore.keySeparator);
};

export const generateManyRelationshipSearchKey = (
  instance: BaseEntity,
  relationshipMetadata: RelationshipMetadata
): Key => {
  const constructor = getConstructor(instance);
  const datastore = getDatastore(constructor);

  return (
    generatePropertyKey(instance, relationshipMetadata) + datastore.keySeparator
  );
};

export const extractValueFromSearchKey = (
  datastore: Datastore,
  key: Key,
  searchKey: Key
): Key => key.split(searchKey)[1].split(datastore.keySeparator)[0];
