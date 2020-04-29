import { Column } from "./Column";
import { Key } from "../Datastore/Datastore";

interface IndexableColumnOptions {
  key?: Key;
}

export const IndexableColumn = (options: IndexableColumnOptions = {}) =>
  Column({ ...options, isIndexable: true });
