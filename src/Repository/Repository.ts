import "../metadata";

import { BaseEntity, EntityConstructor } from "../Entity/Entity";
import { PropertyKey } from "../Entity/Entity";
import { Value } from "../Datastore/Datastore";
import { repositoryLoad } from "./repositoryLoad";
import { repositorySearch } from "./repositorySearch";
import { repositoryFind } from "./repositoryFind";
import { repositorySave } from "./repositorySave";
import { getHydrator } from "../Relationship/hydrate";

export interface Repository {
  load(identifier?: Value): Promise<BaseEntity>;
  save(entity: BaseEntity): Promise<boolean>;
  find(property: PropertyKey, identifier: Value): Promise<BaseEntity | null>;
  search(property: PropertyKey, identifier: Value): AsyncGenerator<BaseEntity>;
}

export const getRepository = <T extends BaseEntity>(
  constructor: EntityConstructor<T>
): Repository => {
  return {
    async load(identifier?: Value): Promise<T> {
      return await repositoryLoad(constructor, identifier);
    },
    async save(instance: BaseEntity): Promise<boolean> {
      return await repositorySave(instance);
    },
    async find(property: PropertyKey, identifier: Value): Promise<T | null> {
      return await repositoryFind(constructor, property, identifier);
    },
    search(property: PropertyKey, identifier: Value): AsyncGenerator<T> {
      return repositorySearch(constructor, property, identifier);
    },
  };
};
