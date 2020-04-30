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
class ToManyChild {
  @PrimaryColumn()
  public id: string;

  @ToOne({ type: () => ToOneParent, backRef: "toManyChild" })
  public toOneParent?: toOneType<ToOneParent> = undefined;

  @ToMany({ type: () => ToManyParent, backRef: "toManyChild" })
  public toManyParent: toManyType<ToManyParent> = [];

  constructor(id: string) {
    this.id = id;
  }
}

export { ToManyChild };
