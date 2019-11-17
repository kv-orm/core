import { Datastore } from '../Datastore/Datastore'
import { BaseEntity, Entity } from '../Entity/Entity'
import { MemoryDatastore } from '../MemoryDatastore/MemoryDatastore'
import { OneToMany } from './OneToMany'
import { Column } from '../Column/Column'
import { getRepository, Repository } from '../Repository/Repository'

describe(`OneToMany`, () => {
  let datastore: Datastore
  let childInstance: BaseEntity
  let otherChildInstance: BaseEntity
  let parentInstance: BaseEntity
  let singletonInstance: BaseEntity
  let singletonParentInstance: BaseEntity

  let childRepository: Repository
  let parentRepository: Repository
  let singletonRepository: Repository
  let singletonParentRepository: Repository

  beforeEach(async () => {
    datastore = new MemoryDatastore()

    @Entity({ datastore })
    class ChildEntity {
      @Column({ isPrimary: true })
      public id: string

      constructor(id: string) {
        this.id = id
      }
    }

    @Entity({ datastore })
    class ParentEntity {
      @OneToMany({ type: ChildEntity })
      public myProperty: ChildEntity[] = []
    }

    @Entity({ datastore })
    class SingletonEntity {
      @Column()
      public constantProperty = `Never change!`
    }

    @Entity({ datastore })
    class SingletonParentEntity {
      @OneToMany({ type: SingletonEntity })
      public myProperty: SingletonEntity[] = []
    }

    childRepository = getRepository(ChildEntity)
    parentRepository = getRepository(ParentEntity)
    singletonRepository = getRepository(SingletonEntity)
    singletonParentRepository = getRepository(SingletonParentEntity)

    childInstance = new ChildEntity(`abc`)
    otherChildInstance = new ChildEntity(`def`)
    await childRepository.save(childInstance)
    await childRepository.save(otherChildInstance)
    parentInstance = new ParentEntity()
    await parentRepository.save(parentInstance)
    singletonInstance = new SingletonEntity()
    await singletonRepository.save(singletonInstance)
    singletonParentInstance = new SingletonParentEntity()
    await singletonParentRepository.save(singletonParentInstance)
  })

  it(`can save and load a relationship to a non-singleton entity`, async () => {
    parentInstance.myProperty = [childInstance, otherChildInstance]
    await parentRepository.save(parentInstance)

    const loadedRelations = await parentInstance.myProperty
    expect(loadedRelations.length).toBe(2)
    expect(await loadedRelations[0].id).toEqual(await childInstance.id)
    expect(await loadedRelations[1].id).toEqual(await otherChildInstance.id)
  })

  it(`can save and load a relationship to a singleton entity`, async () => {
    singletonParentInstance.myProperty = [singletonInstance, singletonInstance]
    await singletonParentRepository.save(singletonParentInstance)

    const loadedRelations = await singletonParentInstance.myProperty
    expect(loadedRelations.length).toBe(1)
    expect(await loadedRelations[0].constantProperty).toEqual(`Never change!`)
  })
})
