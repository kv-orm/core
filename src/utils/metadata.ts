import { EntityConstructor, BaseEntity } from '../Entity/Entity'
import { SetupError } from './errors'

export class MetadataSetupError extends SetupError {
  constructor(
    constructor: BaseEntity,
    metadata: { key: string },
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
  metadata: { key: string },
  {
    getMetadatas,
  }: {
    getMetadatas: (constructor: EntityConstructor) => { key: string }[]
  }
): void => {
  const metadatas = getMetadatas(constructor)
  const keysInUse = metadatas.map(metadata => metadata.key)

  if (keysInUse.indexOf(metadata.key) !== -1)
    throw new MetadataSetupError(constructor, metadata, `Key is already in use`)
}
