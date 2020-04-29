import { Datastore } from "../Datastore/Datastore";
import { BaseEntity, Entity } from "../Entity/Entity";
import { MemoryDatastore } from "../MemoryDatastore/MemoryDatastore";
import { Column } from "../Column/Column";
import { Repository, getRepository } from "./Repository";
import { RepositoryLoadError } from "./RepositoryLoadError";
import { ColumnLookupError } from "../utils/errors";
import { EntityNotFoundError } from "./EntityNotFoundError";
import { ColumnNotSearchableError } from "./ColumnNotSearchableError";
import { ColumnNotFindableError } from "./ColumnNotFindableError";
import { RepositoryFindError } from "./RepositoryFindError";

describe(`Repository`, () => {
  let datastore: Datastore;
  let singletonInstance: BaseEntity;
  let singletonRepository: Repository;
  let complexInstance: BaseEntity;
  let complexRepository: Repository;

  beforeEach(() => {
    datastore = new MemoryDatastore();

    @Entity({ datastore, key: `SingletonEntity` })
    class SingletonEntity {
      @Column({ key: `myProperty`, isIndexable: true })
      public myProperty = `initial value`;
    }

    @Entity({ datastore, key: `ComplexEntity` })
    class ComplexEntity {
      @Column({ key: `myProperty` })
      public myProperty = `initial value`;

      @Column({ key: `primaryProperty`, isPrimary: true })
      public primaryProperty: number;

      @Column({
        key: `indexableUniqueProperty`,
        isIndexable: true,
        isUnique: true,
      })
      public indexableUniqueProperty: string;

      @Column({
        key: `indexableProperty`,
        isIndexable: true,
      })
      public indexableProperty: string;

      @Column()
      public arrayProperty: number[] = [];

      constructor(
        primaryProperty: number,
        indexableUniqueProperty: string,
        indexableProperty: string
      ) {
        this.primaryProperty = primaryProperty;
        this.indexableUniqueProperty = indexableUniqueProperty;
        this.indexableProperty = indexableProperty;
      }
    }

    singletonRepository = getRepository(SingletonEntity);
    singletonInstance = new SingletonEntity();

    complexRepository = getRepository(ComplexEntity);
    complexInstance = new ComplexEntity(12345, `abc@xyz.com`, `blue`);
  });

  it(`can be initialized with a default value`, async () => {
    expect(await datastore.read(`SingletonEntity:myProperty`)).toBeNull();
    expect(await singletonRepository.save(singletonInstance)).toBeTruthy();
    expect(await datastore.read(`SingletonEntity:myProperty`)).toEqual(
      `initial value`
    );
    expect(await singletonRepository.save(singletonInstance)).toBeFalsy();

    expect(await complexRepository.save(complexInstance)).toBeTruthy();
    expect(await datastore.read(`ComplexEntity:myProperty`)).toBeNull();
    expect(await datastore.read(`ComplexEntity:12345:myProperty`)).toEqual(
      `initial value`
    );
    expect(await datastore.read(`ComplexEntity:12345:primaryProperty`)).toEqual(
      12345
    );
    expect(
      await datastore.read(`ComplexEntity:12345:indexableUniqueProperty`)
    ).toEqual(`abc@xyz.com`);
    expect(
      await datastore.read(`ComplexEntity:indexableUniqueProperty:abc@xyz.com`)
    ).toEqual(12345);
    expect(
      await datastore.read(`ComplexEntity:indexableProperty:blue:12345`)
    ).toEqual(12345);
  });

  it(`can be written to, and subsequently read from`, async () => {
    singletonInstance.myProperty = `new value`;
    expect(await singletonRepository.save(singletonInstance)).toBeTruthy();
    expect(await datastore.read(`SingletonEntity:myProperty`)).toEqual(
      `new value`
    );
    expect(await singletonInstance.myProperty).toEqual(`new value`);

    complexInstance.myProperty = `new value`;
    expect(await singletonRepository.save(complexInstance)).toBeTruthy();
    expect(await datastore.read(`ComplexEntity:12345:myProperty`)).toEqual(
      `new value`
    );
    expect(await complexInstance.myProperty).toEqual(`new value`);
  });

  it(`can load an instance`, async () => {
    await singletonRepository.save(singletonInstance);
    let loadedInstance = await singletonRepository.load();
    expect(await loadedInstance.myProperty).toEqual(`initial value`);

    await complexRepository.save(complexInstance);
    loadedInstance = await complexRepository.load(12345);
    expect(await loadedInstance.myProperty).toEqual(`initial value`);

    singletonInstance.myProperty = `new value`;
    await singletonRepository.save(singletonInstance);
    loadedInstance = await singletonRepository.load();
    expect(await loadedInstance.myProperty).toEqual(`new value`);

    complexInstance.myProperty = `new value`;
    await complexRepository.save(complexInstance);
    loadedInstance = await complexRepository.load(12345);
    expect(await loadedInstance.myProperty).toEqual(`new value`);
  });

  it(`can find an instance`, async () => {
    await complexRepository.save(complexInstance);
    const loadedInstance = await complexRepository.load(12345);
    const foundInstance = (await complexRepository.find(
      `indexableUniqueProperty`,
      `abc@xyz.com`
    )) as BaseEntity;
    expect(await foundInstance.myProperty).toEqual(
      await loadedInstance.myProperty
    );
    expect(await foundInstance.primaryProperty).toEqual(
      await loadedInstance.primaryProperty
    );
    expect(await foundInstance.indexableUniqueProperty).toEqual(
      await loadedInstance.indexableUniqueProperty
    );
  });

  it("throws an error when finding a non UniqueColumn", () => {
    expect(
      complexRepository.find("indexableProperty", "")
    ).rejects.toThrowError();
  });

  it(`returns null when finding for a non-existent instance`, async () => {
    await complexRepository.save(complexInstance);
    const foundInstance = await complexRepository.find(
      `indexableUniqueProperty`,
      `non-existent@email.com`
    );
    expect(foundInstance).toBeNull();
  });

  it(`can save and load a Column with an array type`, async () => {
    const values = [1, 2, 3, 4, 5];
    complexInstance.arrayProperty = values;
    expect(await complexInstance.arrayProperty).toEqual(values);
    await complexRepository.save(complexInstance);

    const loadedInstance = await complexRepository.load(12345);
    expect(await loadedInstance.arrayProperty).toEqual(values);
  });

  it("can search", async () => {
    await complexRepository.save(complexInstance);
    const searchResults = await complexRepository.search(
      "indexableProperty",
      "blue"
    );
    const expectedIDs = [12345];
    let i = 0;
    for await (const searchResult of searchResults) {
      expect(await searchResult.primaryProperty).toEqual(expectedIDs[i]);
      i++;
    }
    expect(i).toBe(expectedIDs.length);
  });

  describe(`RepositoryLoadError`, () => {
    it(`is thrown when loading a singleton Entity with an identifier`, async () => {
      await expect(
        (async (): Promise<void> => {
          await singletonRepository.load(12345);
        })()
      ).rejects.toThrow(RepositoryLoadError);
    });
    it(`is thrown when loading a non-singleton Entity without an identifier`, async () => {
      await expect(
        (async (): Promise<void> => {
          await complexRepository.load();
        })()
      ).rejects.toThrow(RepositoryLoadError);
    });
  });

  describe("RepositoryFindError", () => {
    it(`is thrown when loading a singleton Entity without an identifier`, async () => {
      await expect(
        (async (): Promise<void> => {
          await singletonRepository.find("myProperty", "someValue");
        })()
      ).rejects.toThrow(RepositoryFindError);
    });
  });

  describe(`ColumnLookupError`, () => {
    it(`is thrown when searching a non-existent property`, async () => {
      await expect(
        (async (): Promise<void> => {
          await complexRepository.find(`fakeProperty`, 1);
        })()
      ).rejects.toThrow(ColumnLookupError);
    });
  });

  describe(`ColumnNotFindableError`, () => {
    it(`is thrown when searching a non IndexableColumn`, async () => {
      await expect(
        (async (): Promise<void> => {
          await complexRepository.find(`myProperty`, `value`);
        })()
      ).rejects.toThrow(ColumnNotFindableError);
    });
  });

  describe(`ColumnNotFindableError`, () => {
    it(`is thrown when searching a non IndexableColumn`, async () => {
      await expect(
        (async (): Promise<void> => {
          await complexRepository.search(`myProperty`, `value`);
        })()
      ).rejects.toThrow(ColumnNotSearchableError);
    });
  });

  describe(`EntityNotFoundError`, () => {
    it(`is thrown when loading a non-existent non-singleton entity`, async () => {
      await expect(
        (async (): Promise<void> => {
          await complexRepository.load(`99999`);
        })()
      ).rejects.toThrow(EntityNotFoundError);
    });

    it(`is [not?] thrown when loading a non-existent singleton entity`, async () => {
      // TODO: Should we throw an EntityNotFoundError here?
      // await expect(
      //   (async (): Promise<void> => {
      //     await singletonRepository.load()
      //   })()
      // ).rejects.toThrow(EntityNotFoundError)
    });
  });
});
