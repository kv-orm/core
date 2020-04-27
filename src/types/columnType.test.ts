import { Column } from "../Column/Column";
import { Entity } from "../Entity/Entity";
import { Datastore } from "../Datastore/Datastore";
import { MemoryDatastore } from "../MemoryDatastore/MemoryDatastore";
import { columnType } from "./columnType";

describe(`columnType`, () => {
  let datastore: Datastore;

  beforeEach(() => {
    datastore = new MemoryDatastore();
  });

  it(`helps`, async () => {
    @Entity({ datastore })
    class WithColumnType {
      @Column()
      id: columnType<number>;

      constructor(id: number) {
        this.id = id;
      }
    }

    @Entity({ datastore })
    class WithoutColumnType {
      @Column()
      id: number;

      constructor(id: number) {
        this.id = id;
      }
    }

    const instanceWithColumnType = new WithColumnType(123);
    const instanceWithoutColumnType = new WithoutColumnType(123);

    await instanceWithColumnType.id;
    await instanceWithoutColumnType.id; // 'await' has no effect on the type of this expression.ts(80007)

    instanceWithColumnType.id = 234;
    instanceWithoutColumnType.id = 234;
  });
});

type oneToManyType<T> =
  | T[]
  | {
      push(value: T): void;
    };
