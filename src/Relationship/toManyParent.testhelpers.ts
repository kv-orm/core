import { Entity } from "../Entity/Entity";
import { MemoryDatastore } from "../MemoryDatastore/MemoryDatastore";
import { PrimaryColumn } from "../Column/PrimaryColumn";
import { ToOne } from "./ToOne";
import { ToMany } from "./ToMany";
import { toManyType } from "../types/toManyType";
import { toOneType } from "../types/toOneType";
import { ToOneChild } from "./toOneChild.testhelpers";
import { ToManyChild } from "./toManyChild.testhelpers";

const datastore = new MemoryDatastore();

@Entity({ datastore })
class ToManyParent {
  @PrimaryColumn()
  public id: string;

  @ToOne({ type: () => ToOneChild, backRef: "toManyParent", cascade: true })
  public toOneChild?: toOneType<ToOneChild> = undefined;

  @ToMany({ type: () => ToManyChild, backRef: "toManyParent", cascade: true })
  public toManyChild: toManyType<ToManyChild> = [];

  constructor(id: string) {
    this.id = id;
  }
}

export { ToManyParent };
