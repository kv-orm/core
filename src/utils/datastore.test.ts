import { Datastore, SearchStrategy } from "../Datastore/Datastore";
import { MemoryDatastore } from "../MemoryDatastore/MemoryDatastore";
import { paginateSearch } from "./datastore";

describe(`paginateSearch`, () => {
  let datastore: Datastore;

  beforeEach(async () => {
    datastore = new MemoryDatastore();

    for (let i = 0; i < 9999; i++) {
      await datastore.write(`KEY:${i}`, `VALUE${i}`);
    }
  });

  it(`does go beyond the first page`, async () => {
    const results = await paginateSearch(datastore, {
      strategy: SearchStrategy.prefix,
      term: `KEY:`,
    });
    expect(results.keys.length).toBe(9999);
    expect(results.keys).toContain(`KEY:0`);
    expect(results.keys).toContain(`KEY:1`);
    expect(results.keys).toContain(`KEY:9998`);
    expect(results.cursor).toEqual(`9998`);
    expect(results.hasNextPage).toBeFalsy();
  });
});
