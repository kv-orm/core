import { Entity } from "./Entity";
import { MemoryDatastore } from "../MemoryDatastore/MemoryDatastore";
import { Datastore } from "../Datastore/Datastore";
import { MetadataSetupError } from "../utils/metadata";

describe(`Entity`, () => {
  let datastore: Datastore;

  beforeEach(() => {
    datastore = new MemoryDatastore();
  });

  it(`can be initialized with a MemoryDatastore`, () => {
    @Entity({ datastore })
    class X {}

    const instance = new X();

    expect(instance).toBeInstanceOf(X);
    expect(instance.constructor).toBe(X);
  });

  describe(`MetadataSetupError`, () => {
    it(`is thrown when registering two Entities with the same Key`, () => {
      expect(() => {
        @Entity({ datastore })
        class X {}

        @Entity({ datastore, key: `X` })
        class Y {}
      }).toThrow(MetadataSetupError);
    });
  });
});
