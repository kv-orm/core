import { Datastore } from '../Datastore/Datastore'
import { BaseEntity, Entity } from '../Entity/Entity'
import { MemoryDatastore } from '../MemoryDatastore/MemoryDatastore'
import { OneToOne } from './OneToOne'
import { Column } from '../Column/Column'
import { getRepository, Repository } from '../Repository/Repository'

describe(`OneToMany`, () => {
  let datastore: Datastore
  let childInstance: BaseEntity
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
      @OneToOne({ type: ChildEntity })
      public myProperty: ChildEntity | undefined = undefined
    }

    @Entity({ datastore })
    class SingletonEntity {
      @Column()
      public constantProperty = `Never change!`
    }

    @Entity({ datastore })
    class SingletonParentEntity {
      @OneToOne({ type: SingletonEntity })
      public myProperty: SingletonEntity | undefined = undefined
    }

    childRepository = getRepository(ChildEntity)
    parentRepository = getRepository(ParentEntity)
    singletonRepository = getRepository(SingletonEntity)
    singletonParentRepository = getRepository(SingletonParentEntity)

    childInstance = new ChildEntity(`abc`)
    await childRepository.save(childInstance)
    parentInstance = new ParentEntity()
    await parentRepository.save(parentInstance)
    singletonInstance = new SingletonEntity()
    await singletonRepository.save(singletonInstance)
    singletonParentInstance = new SingletonParentEntity()
    await singletonParentRepository.save(singletonParentInstance)
  })

  it(`can save and load a relationship to a non-singleton entity`, async () => {
    parentInstance.myProperty = childInstance
    await parentRepository.save(parentInstance)

    const loadedRelation = await parentInstance.myProperty
    expect(await loadedRelation.id).toEqual(await childInstance.id)
  })

  it(`can save and load a relationship to a singleton entity`, async () => {
    singletonParentInstance.myProperty = singletonInstance
    await singletonParentRepository.save(singletonParentInstance)

    const loadedRelation = await singletonParentInstance.myProperty
    expect(await loadedRelation.constantProperty).toEqual(`Never change!`)
  })
})
