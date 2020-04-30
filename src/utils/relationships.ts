import { EntityConstructor, PropertyKey, BaseEntity } from "../Entity/Entity";
import {
  TOONE_RELATIONSHIP_KEY,
  TOMANY_RELATIONSHIP_KEY,
  ToOneRelationshipMetadata,
  ToManyRelationshipMetadata,
  RelationshipMetadata,
} from "../Relationship/relationshipMetadata";
import { RelationshipLookupError } from "./errors";
import { getMetadatas, getMetadata, setMetadata } from "./metadata";
import { getConstructor } from "./entities";

export const getToOneRelationshipMetadatas = (
  constructor: EntityConstructor
): ToOneRelationshipMetadata[] =>
  getMetadatas(
    TOONE_RELATIONSHIP_KEY,
    constructor
  ) as ToOneRelationshipMetadata[];

export const getToManyRelationshipMetadatas = (
  constructor: EntityConstructor
): ToManyRelationshipMetadata[] =>
  getMetadatas(
    TOMANY_RELATIONSHIP_KEY,
    constructor
  ) as ToManyRelationshipMetadata[];

export const getToOneRelationshipMetadata = (
  constructor: EntityConstructor,
  property: PropertyKey
): ToOneRelationshipMetadata => {
  const toOneRelationshipMetadatas = getToOneRelationshipMetadatas(constructor);
  return getMetadata(toOneRelationshipMetadatas, property, () => {
    throw new RelationshipLookupError(
      constructor,
      property,
      `Could not find ToOne Relationship. Has it been defined yet?`
    );
  }) as ToOneRelationshipMetadata;
};

export const getToManyRelationshipMetadata = (
  constructor: EntityConstructor,
  property: PropertyKey
): ToManyRelationshipMetadata => {
  const toManyRelationshipMetadatas = getToManyRelationshipMetadatas(
    constructor
  );
  return getMetadata(toManyRelationshipMetadatas, property, () => {
    throw new RelationshipLookupError(
      constructor,
      property,
      `Could not find ToMany Relationship. Has it been defined yet?`
    );
  }) as ToManyRelationshipMetadata;
};

export const getRelationshipMetadata = (
  constructor: EntityConstructor,
  property: PropertyKey
): RelationshipMetadata => {
  const relationshipMetadatas = [
    ...getToOneRelationshipMetadatas(constructor),
    ...getToManyRelationshipMetadatas(constructor),
  ];

  return getMetadata(relationshipMetadatas, property, () => {
    throw new RelationshipLookupError(
      constructor,
      property,
      `Could not find Relationship. Has it been defined yet?`
    );
  }) as RelationshipMetadata;
};

export const setToOneRelationshipMetadata = (
  constructor: EntityConstructor,
  toOneRelationshipMetadata: ToOneRelationshipMetadata
): void =>
  setMetadata(TOONE_RELATIONSHIP_KEY, constructor, toOneRelationshipMetadata);

export const setToManyRelationshipMetadata = (
  constructor: EntityConstructor,
  toManyRelationshipMetadata: ToManyRelationshipMetadata
): void =>
  setMetadata(TOMANY_RELATIONSHIP_KEY, constructor, toManyRelationshipMetadata);

export async function* arrayToAsyncGenerator<T>(array: T[]) {
  for (const item of array) {
    yield item;
  }
}

export async function* combineAsyncGenerators<T>(
  a: AsyncGenerator<T>,
  b: AsyncGenerator<T>
): AsyncGenerator<T> {
  for await (const item of a) {
    yield item;
  }
  for await (const item of b) {
    yield item;
  }
}

export const makeCachingGenerator = (
  instance: BaseEntity,
  toManyRelationshipMetadata: ToManyRelationshipMetadata
) => {
  const constructor = getConstructor(instance);

  return async function* cacheGenerator(instances: AsyncGenerator<BaseEntity>) {
    for await (const relationshipInstance of instances) {
      const cachedRelationshipInstances = [
        ...(toManyRelationshipMetadata.instances.get(instance) || []),
        relationshipInstance,
      ];
      toManyRelationshipMetadata.instances.set(
        instance,
        cachedRelationshipInstances
      );
      setToManyRelationshipMetadata(constructor, toManyRelationshipMetadata);

      yield relationshipInstance;
    }
  };
};
