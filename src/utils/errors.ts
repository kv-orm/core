import { BaseEntity } from '../Entity/Entity'
import { ColumnMetadata } from '../Column/Column'

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

export class EntityMetadataError extends MetadataError {
  constructor(instance: BaseEntity, message = `Unknown Error`) {
    super(
      `Error with Entity Metadata, ${instance.constructor.name}: ${message}`
    )
    this.name = `EntityMetadataError`
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
    this.name = `EntityMetadataError`
  }
}
