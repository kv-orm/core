import { Entity, BaseEntity } from "../Entity/Entity";
import { MemoryDatastore } from "../MemoryDatastore/MemoryDatastore";
import { PrimaryColumn } from "./PrimaryColumn";
import { IndexableColumn } from "./IndexableColumn";

describe("UniqueColumn", () => {
  let instance: BaseEntity;
  beforeEach(() => {
    @Entity({ datastore: new MemoryDatastore() })
    class MyEntity {
      @PrimaryColumn()
      public id: string;
      @IndexableColumn()
      public indexableColumn: string;
      constructor(id: string, indexableColumn: string) {
        this.id = id;
        this.indexableColumn = indexableColumn;
      }
    }
    instance = new MyEntity("123", "indexableValue");
  });
  it("can be setup", async () => {
    expect(await instance.indexableColumn).toEqual("indexableValue");
  });
});
