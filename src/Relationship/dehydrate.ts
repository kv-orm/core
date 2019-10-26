import { BaseEntity, EntityConstructor } from '../Entity/Entity'
import { Value } from '../Datastore/Datastore'
import { getPrimaryColumn, getPrimaryColumnValue } from '../utils/columns'
import { generateRelationshipKey } from '../utils/keyGeneration'

export const getDehydrator = (
  constructor: EntityConstructor<BaseEntity>
): ((instance: BaseEntity) => Value | undefined) => {
  return (instance: BaseEntity): Value | undefined => {
    if (instance) {
      const primaryColumn = getPrimaryColumn(instance)

      if (primaryColumn !== undefined) {
        return getPrimaryColumnValue(instance)
      }
      return generateRelationshipKey(instance)
    }
  }
}
