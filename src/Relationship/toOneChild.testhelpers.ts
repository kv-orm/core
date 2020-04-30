import { Entity } from "../Entity/Entity";
import { MemoryDatastore } from "../MemoryDatastore/MemoryDatastore";
import { PrimaryColumn } from "../Column/PrimaryColumn";
import { ToOne } from "./ToOne";
import { ToOneParent } from "./toOneParent.testhelpers";
import { ToManyParent } from "./toManyParent.testhelpers";
import { toManyType } from "../types/toManyType";
import { toOneType } from "../types/toOneType";
import { ToMany } from "./ToMany";

const datastore = new MemoryDatastore();

@Entity({ datastore })
class ToOneChild {
  @PrimaryColumn()
  public id: string;

  @ToOne({ type: () => ToOneParent, backRef: "toOneChild" })
  public toOneParent?: toOneType<ToOneParent> = undefined;

  @ToMany({ type: () => ToManyParent, backRef: "toOneChild" })
  public toManyParent: toManyType<ToManyParent> = [];

  constructor(id: string) {
    this.id = id;
  }
}

export { ToOneChild };
