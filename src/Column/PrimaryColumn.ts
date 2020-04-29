import { Column } from "./Column";
import { Key } from "../Datastore/Datastore";

interface PrimaryColumnOptions {
  key?: Key;
}

export const PrimaryColumn = (options: PrimaryColumnOptions = {}) =>
  Column({ ...options, isPrimary: true });
