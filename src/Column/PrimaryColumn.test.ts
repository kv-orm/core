import { Entity, BaseEntity } from "../Entity/Entity";
import { MemoryDatastore } from "../MemoryDatastore/MemoryDatastore";
import { PrimaryColumn } from "./PrimaryColumn";
import { ReadOnlyError } from "../utils/errors";

describe("PrimaryColumn", () => {
  let instance: BaseEntity;
  beforeEach(() => {
    @Entity({ datastore: new MemoryDatastore() })
    class MyEntity {
      @PrimaryColumn()
      public id: string;
      constructor(id: string) {
        this.id = id;
      }
    }
    instance = new MyEntity("123");
  });
  it("can be setup", async () => {
    expect(await instance.id).toEqual("123");
  });
  describe(`ReadOnlyError`, () => {
    it(`is thrown when attempting to write to a Primary Column twice`, () => {
      expect(() => {
        instance.id = `zzz`;
      }).toThrow(ReadOnlyError);
    });
  });
});
