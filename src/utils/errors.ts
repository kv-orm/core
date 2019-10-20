import {
  BaseEntity,
  EntityConstructor,
  EntityConstructorMetadata,
} from '../Entity/Entity'
import { ColumnMetadata, ColumnKey } from '../Column/Column'

export class KVORMError extends Error {
  constructor(message: string) {
    super(`kv-orm Error: ${message}`)
    this.name = `kv-orm Error`
  }
}

export class SetupError extends KVORMError {
  constructor(message: string) {
    super(message)
    this.name = `SetupError`
  }
}

export class MetadataError extends KVORMError {
  constructor(message: string) {
    super(message)
    this.name = `MetadataError`
  }
}

export class EntityMetadataLookupError extends MetadataError {
  constructor(
    constructor: EntityConstructor<BaseEntity>,
    message = `Unknown Error`
  ) {
    super(
      `Error looking up Entity Metadata for Entity, ${constructor.name}: ${message}`
    )
    this.name = `EntityMetadataLookupError`
  }
}

export class EntityMetadataError extends MetadataError {
  constructor(
    entityMetadata: EntityConstructorMetadata,
    message = `Unknown Error`
  ) {
    super(`Error with Entity Metadata, ${entityMetadata.key}: ${message}`)
    this.name = `EntityMetadataError`
  }
}

export class ColumnMetadataLookupError extends MetadataError {
  constructor(
    instance: BaseEntity,
    property: ColumnKey,
    message = `Unknown Error`
  ) {
    super(
      `Error looking up Column Metadata for Column, ${property}, on Entity, ${instance.constructor.name}: ${message}`
    )
    this.name = `ColumnMetadataLookupError`
  }
}

export class ColumnMetadataError extends MetadataError {
  constructor(
    instance: BaseEntity,
    column: ColumnMetadata,
    message = `Unknown Error`
  ) {
    super(
      `Error with Column Metadata, ${column.key}, on Entity, ${instance.constructor.name}: ${message}`
    )
    this.name = `ColumnMetadataError`
  }
}
