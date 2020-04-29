import { Entity, BaseEntity } from "../Entity/Entity";
import { MemoryDatastore } from "../MemoryDatastore/MemoryDatastore";
import { PrimaryColumn } from "./PrimaryColumn";
import { UniqueColumn } from "./UniqueColumn";

describe("UniqueColumn", () => {
  let instance: BaseEntity;
  beforeEach(() => {
    @Entity({ datastore: new MemoryDatastore() })
    class MyEntity {
      @PrimaryColumn()
      public id: string;
      @UniqueColumn()
      public uniqueProperty: string;
      constructor(id: string, uniqueProperty: string) {
        this.id = id;
        this.uniqueProperty = uniqueProperty;
      }
    }
    instance = new MyEntity("123", "uniqueValue");
  });
  it("can be setup", async () => {
    expect(await instance.uniqueProperty).toEqual("uniqueValue");
  });
});
