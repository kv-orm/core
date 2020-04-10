import '../metadata'

import { EntityConstructor, BaseEntity } from '../Entity/Entity'
import { SetupError } from './errors'
import { Key } from '../Datastore/Datastore'

interface Metadata {
  key: Key
  property?: PropertyKey // TODO: Clean-up. Separate Relationship, Column and Entity Metadatas properly
  plugins: {}
}

export class MetadataSetupError extends SetupError {
  constructor(
    constructor: BaseEntity,
    metadata: Metadata,
    message = `Unknown Error`
  ) {
    super(
      `Could not setup the Column, ${metadata.key}, on Entity, ${constructor.name}: ${message}`
    )
    this.name = `MetadataSetupError`
  }
}

export const assertKeyNotInUse = (
  constructor: EntityConstructor,
  metadata: Metadata,
  {
    getMetadatas,
  }: {
    getMetadatas: (constructor: EntityConstructor) => Metadata[]
  }
): void => {
  const metadatas = getMetadatas(constructor)
  const keysInUse = metadatas.map((metadata) => metadata.key)

  if (keysInUse.indexOf(metadata.key) !== -1)
    throw new MetadataSetupError(constructor, metadata, `Key is already in use`)
}

export const getMetadatas = (
  key: symbol,
  constructor: EntityConstructor
): Metadata[] => Reflect.getMetadata(key, constructor) || []

const setMetadatas = (
  key: symbol,
  constructor: EntityConstructor,
  metadatas: Metadata[]
): void => Reflect.defineMetadata(key, metadatas, constructor)

export const getMetadata = (
  metadatas: Metadata[],
  property: PropertyKey,
  throwError: () => void
): Metadata => {
  const metadata = metadatas.find(({ property: p }) => p === property)
  if (metadata === undefined) throwError()

  return metadata as Metadata
}

export const setMetadata = (
  key: symbol,
  constructor: EntityConstructor,
  metadata: Metadata
): void => {
  const metadatas = getMetadatas(key, constructor)
  metadatas.push(metadata)
  setMetadatas(key, constructor, metadatas)
}
