import { ToMany } from "../Relationship/ToMany";
import { Entity } from "../Entity/Entity";
import { Datastore } from "../Datastore/Datastore";
import { MemoryDatastore } from "../MemoryDatastore/MemoryDatastore";
import { toManyType } from "./toManyType";
import { PrimaryColumn } from "../Column/PrimaryColumn";

describe(`toManyType`, () => {
  let datastore: Datastore;

  beforeEach(() => {
    datastore = new MemoryDatastore();
  });

  it(`helps`, async () => {
    @Entity({ datastore })
    class Child {
      @PrimaryColumn()
      id: string = "child";
    }

    @Entity({ datastore })
    class WithColumnType {
      @ToMany({ type: () => Child })
      relation: toManyType<Child>;

      constructor() {
        this.relation = [new Child()];
      }
    }

    @Entity({ datastore })
    class WithoutColumnType {
      @ToMany({ type: () => Child })
      relation: Child[];

      constructor() {
        this.relation = [new Child()];
      }
    }

    const instanceWithColumnType = new WithColumnType();
    const instanceWithoutColumnType = new WithoutColumnType();

    await instanceWithColumnType.relation;
    await instanceWithoutColumnType.relation; // 'await' has no effect on the type of this expression.ts(80007)

    instanceWithColumnType.relation = [new Child()];
    instanceWithoutColumnType.relation = [new Child()];
  });
});
