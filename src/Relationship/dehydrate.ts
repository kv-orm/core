import { BaseEntity, EntityConstructor } from '../Entity/Entity'
import { Value } from '../Datastore/Datastore'
import { generateRelationshipKey } from '../utils/keyGeneration'

export const getDehydrator = (
  constructor: EntityConstructor<BaseEntity>
): ((instance: BaseEntity) => Value | undefined) => {
  return (instance: BaseEntity): Value | undefined => {
    if (instance) {
      return generateRelationshipKey(instance)
    }
  }
}
