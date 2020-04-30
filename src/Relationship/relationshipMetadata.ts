import { Key } from "../Datastore/Datastore";
import { PropertyKey, BaseEntity } from "../Entity/Entity";
import { EntityConstructor } from "../Entity/Entity";
import { Metadata } from "../utils/metadata";

export const TOONE_RELATIONSHIP_KEY = Symbol(`ToOneRelationship`);
export const TOMANY_RELATIONSHIP_KEY = Symbol(`ToManyRelationship`);

export interface RelationshipMetadata extends Metadata {
  key: Key;
  property: PropertyKey;
  type: () => EntityConstructor;
  cascade: boolean;
  backRef?: PropertyKey;
  cardinality: "ToOne" | "ToMany";
}

export interface ToOneRelationshipMetadata extends RelationshipMetadata {
  instance: Map<BaseEntity, BaseEntity>;
  cardinality: "ToOne";
}

export interface ToManyRelationshipMetadata extends RelationshipMetadata {
  instances: Map<BaseEntity, BaseEntity[]>;
  cardinality: "ToMany";
}

export interface RelationshipOptions {
  key?: Key;
  type: () => EntityConstructor;
  cascade?: boolean;
  backRef?: PropertyKey;
}

export const createToOneRelationshipMetadata = ({
  options: { key, type, cascade, backRef },
  property,
}: {
  options: RelationshipOptions;
  property: PropertyKey;
}): ToOneRelationshipMetadata => ({
  key: key || property.toString(),
  property,
  type,
  cascade: !!cascade,
  backRef,
  instance: new Map(),
  cardinality: "ToOne",
});

export const createToManyRelationshipMetadata = ({
  options: { key, type, cascade, backRef },
  property,
}: {
  options: RelationshipOptions;
  property: PropertyKey;
}): ToManyRelationshipMetadata => ({
  key: key || property.toString(),
  property,
  type,
  cascade: !!cascade,
  backRef,
  instances: new Map(),
  cardinality: "ToMany",
});
