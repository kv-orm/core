import { KVORMError } from "../utils/errors";
import { SearchStrategy } from "./Datastore";

export class SearchStrategyError extends KVORMError {
  constructor(searchStrategy: SearchStrategy, message = `Unknown Error`) {
    super(
      `Error using Search Strategy, ${SearchStrategy[searchStrategy]}: ${message}`
    );
    this.name = `SearchStrategyError`;
  }
}
