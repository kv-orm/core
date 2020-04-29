import { KVORMError } from "../utils/errors";
import { EntityConstructor } from "../Entity/Entity";

export class RepositoryFindError extends KVORMError {
  constructor(constructor: EntityConstructor, message = `Unknown Error`) {
    super(`Could not find Entity, ${constructor.name}: ${message}`);
    this.name = `RepositoryFindError`;
  }
}
