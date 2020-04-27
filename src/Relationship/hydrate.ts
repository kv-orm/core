import { BaseEntity, EntityConstructor } from "../Entity/Entity";
import { repositoryLoad } from "../Repository/repositoryLoad";
import { Value } from "../Datastore/Datastore";
import { getPrimaryColumnMetadata } from "../utils/columns";

export const getHydrator = (
  constructor: EntityConstructor
): ((identifier: Value) => Promise<BaseEntity>) => {
  return async (identifier: Value): Promise<BaseEntity> => {
    const primaryColumn = getPrimaryColumnMetadata(constructor);
    if (identifier !== undefined && primaryColumn !== undefined) {
      return await repositoryLoad(constructor, identifier);
    } else {
      return await repositoryLoad(constructor);
    }
  };
};
