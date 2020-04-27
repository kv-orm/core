import { KVORMError } from "../utils/errors";
import { Value } from "../Datastore/Datastore";
import { EntityConstructor } from "../Entity/Entity";

export class EntityNotFoundError extends KVORMError {
  constructor(constructor: EntityConstructor, identifier?: Value) {
    super(
      `Could not find an Entity, ${constructor.name}, with Primary Column identifier, ${identifier} in Datastore`
    );
    this.name = `EntityNotFoundError`;
  }
}
