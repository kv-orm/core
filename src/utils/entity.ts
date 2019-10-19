import { EntityConstructor, BaseEntity } from '../Entity/Entity'

export const getEntityConstructor = (
  instance: BaseEntity
): EntityConstructor<BaseEntity> =>
  instance.constructor as EntityConstructor<BaseEntity>

export const createEmptyInstance = <T extends BaseEntity>(
  constructor: EntityConstructor<T>
): T => Object.create(constructor.prototype)
