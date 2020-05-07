import { Datastore, Value, SearchStrategy } from "../Datastore/Datastore";
import { BaseEntity, Entity, EntityConstructor } from "../Entity/Entity";
import { MemoryDatastore } from "../MemoryDatastore/MemoryDatastore";
import { ToMany } from "./ToMany";
import { Column } from "../Column/Column";
import { getRepository, Repository } from "../Repository/Repository";
import { SearchResult } from "../Datastore/Datastore";
import { SearchStrategyError } from "../Datastore/SearchStrategyError";
import { ToManyChild } from "./toManyChild.testhelpers";
import { ToManyParent } from "./toManyParent.testhelpers";
import { ToOneChild } from "./toOneChild.testhelpers";
import { ToOneParent } from "./toOneParent.testhelpers";

describe(`ToMany`, () => {
  let childInstance: BaseEntity;
  let childEntityConstructor: EntityConstructor;
  let otherChildInstance: BaseEntity;
  let parentInstance: BaseEntity;

  let childRepository: Repository;
  let parentRepository: Repository;

  beforeEach(async () => {
    childRepository = getRepository(ToOneChild);
    parentRepository = getRepository(ToOneParent);

    childInstance = new ToOneChild("child");
    otherChildInstance = new ToOneChild("child2");
    await childRepository.save(childInstance);
    parentInstance = new ToOneParent("parent");
  });

  // it(`can save and load a relationship to a non-singleton entity`, async () => {
  //   parentInstance.myProperty = [childInstance, otherChildInstance];
  //   await parentRepository.save(parentInstance);

  //   const loadedRelations = await parentInstance.myProperty;

  //   const expectedIDs = [`child`, "child2"];
  //   let i = 0;
  //   for await (const loadedRelation of loadedRelations) {
  //     expect(await loadedRelation.id).toEqual(expectedIDs[i]);
  //     i++;
  //   }
  //   expect(i).toBe(2);
  // });

  // it(`can save and load a relationship to a singleton entity`, async () => {
  //   singletonParentInstance.myProperty = [singletonInstance, singletonInstance];
  //   await singletonParentRepository.save(singletonParentInstance);

  //   const loadedRelations = await singletonParentInstance.myProperty;

  //   let i = 0;
  //   for await (const loadedRelation of loadedRelations) {
  //     expect(await loadedRelation.constantProperty).toEqual(`Never change!`);
  //     i++;
  //   }
  //   expect(i).toBe(2);
  // });

  describe(`SearchStrategyError`, () => {
    class UselessDatastore extends Datastore {
      public searchStrategies = [];

      protected _read(): Promise<Value> {
        throw new Error(`Method not implemented.`);
      }

      protected _write(): Promise<void> {
        throw new Error(`Method not implemented.`);
      }

      protected _delete(): Promise<void> {
        throw new Error(`Method not implemented.`);
      }

      protected _search(): Promise<SearchResult> {
        throw new Error(`Method not implemented.`);
      }
    }

    const uselessDatastore = new UselessDatastore();

    @Entity({ datastore: uselessDatastore })
    class UselessEntity {
      @ToMany({ type: () => childEntityConstructor, backRef: "" })
      relations = undefined;
    }

    const instance = new UselessEntity();

    it(`is thrown when using an unsupported Datastore`, async () => {
      await expect(
        (async (): Promise<void> => {
          const relations = ((await instance.relations) as unknown) as {
            next: () => Promise<void>;
          };
          await relations.next();
        })()
      ).rejects.toThrow(SearchStrategyError);
    });

    it(`is thrown wnen trying to manually search the datastore`, async () => {
      await expect(
        (async (): Promise<void> => {
          await uselessDatastore.search({
            strategy: SearchStrategy.prefix,
            term: `test`,
          });
        })()
      ).rejects.toThrow(SearchStrategyError);
    });
  });
});

describe("backRefs on ToMany", () => {
  it("updates ToManyChild", async () => {
    const toManyChild = new ToManyChild("child");
    const toManyParent = new ToManyParent("parent");
    toManyParent.toManyChild = [toManyChild];
    await getRepository(ToManyParent).save(toManyParent);

    const relationChildInstances = await toManyParent.toManyChild;
    let i = 0;
    for await (const relationInstance of relationChildInstances) {
      expect(relationInstance).toBe(toManyChild);
      i++;
    }
    expect(i).toBe(1);

    const relationParentInstances = await toManyChild.toManyParent;
    i = 0;
    for await (const relationInstance of relationParentInstances) {
      expect(relationInstance).toBe(toManyParent);
      i++;
    }
    expect(i).toBe(1);
  });

  it("updates ToManyParent", async () => {
    const toManyChild = new ToManyChild("child");
    const toManyParent = new ToManyParent("parent");
    toManyChild.toManyParent = [toManyParent];

    const relationParentInstances = await toManyChild.toManyParent;
    let i = 0;
    for await (const relationInstance of relationParentInstances) {
      expect(relationInstance).toBe(toManyParent);
      i++;
    }
    expect(i).toBe(1);

    const relationChildInstances = await toManyParent.toManyChild;
    i = 0;
    for await (const relationInstance of relationChildInstances) {
      expect(relationInstance).toBe(toManyChild);
      i++;
    }
    expect(i).toBe(1);
  });

  it("updates ToOneChild", async () => {
    const toOneChild = new ToOneChild("child");
    const toManyParent = new ToManyParent("parent");
    toManyParent.toOneChild = toOneChild;
    expect(await toManyParent.toOneChild).toBe(toOneChild);

    const relationInstances = await toOneChild.toManyParent;
    let i = 0;
    for await (const relationInstance of relationInstances) {
      expect(relationInstance).toBe(toManyParent);
      i++;
    }
    expect(i).toBe(1);
  });

  it("updates ToOneParent", async () => {
    const toManyChild = new ToManyChild("child");
    const toOneParent = new ToOneParent("parent");
    toOneParent.toManyChild = [toManyChild];
    expect(await toManyChild.toOneParent).toBe(toOneParent);

    const relationInstances = await toOneParent.toManyChild;
    let i = 0;
    for await (const relationInstance of relationInstances) {
      expect(relationInstance).toBe(toManyChild);
      i++;
    }
    expect(i).toBe(1);
  });
});
