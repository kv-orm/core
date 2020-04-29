import { Column } from "./Column";
import { Key } from "../Datastore/Datastore";

interface UniqueColumnOptions {
  key?: Key;
}

export const UniqueColumn = (options: UniqueColumnOptions = {}) =>
  Column({ ...options, isIndexable: true, isUnique: true });
