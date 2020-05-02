describe(`the universe`, () => {
  it(`can do math`, () => {
    expect(1 + 1).toEqual(2);
  });
});

describe("exports", () => {
  it("includes everything", () => {
    const everything = require("./index");
    expect(Object.keys(everything)).toMatchInlineSnapshot(`
      Array [
        "Datastore",
        "SearchStrategy",
        "MemoryDatastore",
        "Entity",
        "Column",
        "PrimaryColumn",
        "UniqueColumn",
        "IndexableColumn",
        "ToOne",
        "ToMany",
        "addTo",
        "removeFrom",
        "getRepository",
      ]
    `);
  });
});
