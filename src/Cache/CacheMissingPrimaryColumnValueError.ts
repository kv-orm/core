import { KVORMError } from "../utils/errors";
import { BaseEntity } from "../Entity/Entity";
import { getConstructor } from "../utils/entities";

export class CacheMissingPrimaryColumnValueError extends KVORMError {
  constructor(instance: BaseEntity) {
    super(
      `Could not find the value of the PrimaryColumn in the cache for an Entity, ${
        getConstructor(instance).name
      }`
    );
    this.name = `CacheMissingPrimaryColumnValueError`;
  }
}
