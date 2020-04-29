import { EntityConstructor, PropertyKey } from "../Entity/Entity";
import { Key, Value } from "../Datastore/Datastore";

export class KVORMError extends Error {
  constructor(message: string) {
    super(`kv-orm Error: ${message}`);
    this.name = `kv-orm Error`;
  }
}

export class SetupError extends KVORMError {
  constructor(message: string) {
    super(message);
    this.name = `SetupError`;
  }
}

export class MetadataError extends KVORMError {
  constructor(message: string) {
    super(message);
    this.name = `MetadataError`;
  }
}

export class ReadOnlyError extends KVORMError {
  constructor(
    constructor: EntityConstructor,
    property: PropertyKey,
    value: Value,
    message = `Unknown Error`
  ) {
    super(
      `Could not write Value, ${value}, to Column, ${property.toString()}, on Entity, ${
        constructor.name
      }: ${message}`
    );
    this.name = `ReadOnlyError`;
  }
}

export class EntityLookupError extends MetadataError {
  constructor(constructor: EntityConstructor, message = `Unknown Error`) {
    super(`Error looking up Entity, ${constructor.name}: ${message}`);
    this.name = `EntityLookupError`;
  }
}

export class ColumnLookupError extends MetadataError {
  constructor(
    constructor: EntityConstructor,
    property: PropertyKey,
    message = `Unknown Error`
  ) {
    super(
      `Error looking up Column, ${property.toString()}, on Entity, ${
        constructor.name
      }: ${message}`
    );
    this.name = `ColumnLookupError`;
  }
}

export class RelationshipLookupError extends MetadataError {
  constructor(
    constructor: EntityConstructor,
    property: PropertyKey,
    message = `Unknown Error`
  ) {
    super(
      `Error looking up Relationship, ${property.toString()}, on Entity, ${
        constructor.name
      }: ${message}`
    );
    this.name = `RelationshipLookupError`;
  }
}

export class PrimaryColumnMissingError extends MetadataError {
  constructor(
    constructor: EntityConstructor,
    message = `PrimaryColumn Missing`
  ) {
    super(`PrimaryColumn not found on Entity, ${constructor.name}: ${message}`);
    this.name = `PrimaryColumnMissingError`;
  }
}

export class InvalidKeyError extends MetadataError {
  constructor(key: Key, message = `Unknown Error`) {
    super(`Key, ${key}, is invalid: ${message}`);
    this.name = `InvalidKeyError`;
  }
}
