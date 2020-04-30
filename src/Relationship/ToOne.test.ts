import { Datastore } from "../Datastore/Datastore";
import { BaseEntity, Entity } from "../Entity/Entity";
import { MemoryDatastore } from "../MemoryDatastore/MemoryDatastore";
import { ToOne } from "./ToOne";
import { Column } from "../Column/Column";
import { getRepository, Repository } from "../Repository/Repository";
import { ToOneChild } from "./toOneChild.testhelpers";
import { ToOneParent } from "./toOneParent.testhelpers";
import { ToManyParent } from "./toManyParent.testhelpers";
import { ToManyChild } from "./toManyChild.testhelpers";

describe(`ToOne`, () => {
  let datastore: Datastore;
  let childInstance: BaseEntity;
  let parentInstance: BaseEntity;
  let singletonInstance: BaseEntity;
  let singletonParentInstance: BaseEntity;

  let childRepository: Repository;
  let parentRepository: Repository;
  let singletonRepository: Repository;
  let singletonParentRepository: Repository;

  beforeEach(async () => {
    datastore = new MemoryDatastore();

    @Entity({ datastore })
    class ChildEntity {
      @Column({ isPrimary: true })
      public id: string;

      constructor(id: string) {
        this.id = id;
      }
    }

    @Entity({ datastore })
    class ParentEntity {
      @ToOne({ type: () => ChildEntity, cascade: true })
      public myProperty: ChildEntity | undefined = undefined;
    }

    @Entity({ datastore })
    class SingletonEntity {
      @Column()
      public constantProperty = `Never change!`;
    }

    @Entity({ datastore })
    class SingletonParentEntity {
      @ToOne({ type: () => SingletonEntity })
      public myProperty: SingletonEntity | undefined = undefined;
    }

    childRepository = getRepository(ChildEntity);
    parentRepository = getRepository(ParentEntity);
    singletonRepository = getRepository(SingletonEntity);
    singletonParentRepository = getRepository(SingletonParentEntity);

    childInstance = new ChildEntity(`abc`);
    await childRepository.save(childInstance);
    parentInstance = new ParentEntity();
    singletonInstance = new SingletonEntity();
    await singletonRepository.save(singletonInstance);
    singletonParentInstance = new SingletonParentEntity();
    await singletonParentRepository.save(singletonParentInstance);
  });

  it("returns the existing instance on get", async () => {
    parentInstance.myProperty = childInstance;
    expect(await parentInstance.myProperty).toBe(childInstance);
  });

  it(`can save and load a relationship to a non-singleton entity`, async () => {
    parentInstance.myProperty = childInstance;
    await parentRepository.save(parentInstance);

    const loadedRelation = await parentInstance.myProperty;
    expect(await loadedRelation.id).toEqual(await childInstance.id);
  });

  it(`can save and load a relationship to a singleton entity`, async () => {
    singletonParentInstance.myProperty = singletonInstance;
    await singletonParentRepository.save(singletonParentInstance);

    const loadedRelation = await singletonParentInstance.myProperty;
    expect(await loadedRelation.constantProperty).toEqual(`Never change!`);
  });
});

describe("backRefs on ToOne", () => {
  it("updates ToOneChild", async () => {
    const toOneChild = new ToOneChild("child");
    const toOneParent = new ToOneParent("parent");
    toOneParent.toOneChild = toOneChild;
    expect(await toOneParent.toOneChild).toBe(toOneChild);
    expect(await toOneChild.toOneParent).toBe(toOneParent);
  });

  it("updates ToOneParent", async () => {
    const toOneChild = new ToOneChild("child");
    const toOneParent = new ToOneParent("parent");
    toOneChild.toOneParent = toOneParent;
    expect(await toOneChild.toOneParent).toBe(toOneParent);
    expect(await toOneParent.toOneChild).toBe(toOneChild);
  });

  it("updates ToManyChild", async () => {
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

  it("updates ToManyParent", async () => {
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
});
