import { Datastore } from '../Datastore/Datastore'
import { BaseEntity, Entity } from '../Entity/Entity'
import { MemoryDatastore } from '../MemoryDatastore/MemoryDatastore'
import { OneToOne } from './OneToOne'
import { Column } from '../Column/Column'
import { getRepository, Repository } from '../Repository/Repository'
import { EntityNotFoundError } from '../Repository/EntityNotFoundError'

describe(`OneToMany`, () => {
  let datastore: Datastore
  let parentInstance: BaseEntity
  let singletonParentInstance: BaseEntity

  let childRepository: Repository
  let parentRepository: Repository
  let singletonChildRepository: Repository
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
      @OneToOne({
        type: ChildEntity,
        cascade: { onSave: true, onDelete: true },
      })
      public myProperty: ChildEntity = new ChildEntity(`abc`)

      @Column({ isPrimary: true })
      id: string

      constructor(id: string) {
        this.id = id
      }
    }

    @Entity({ datastore })
    class SingletonEntity {
      @Column()
      public constantProperty = `Never change!`
    }

    @Entity({ datastore })
    class SingletonParentEntity {
      @OneToOne({
        type: SingletonEntity,
        cascade: { onSave: true, onDelete: true },
      })
      public myProperty: SingletonEntity = new SingletonEntity()
    }

    childRepository = getRepository(ChildEntity)
    parentRepository = getRepository(ParentEntity)
    singletonChildRepository = getRepository(SingletonEntity)
    singletonParentRepository = getRepository(SingletonParentEntity)

    parentInstance = new ParentEntity(`xyz`)
    singletonParentInstance = new SingletonParentEntity()
  })

  // it(`can save and load a relationship to a non-singleton entity`, async () => {
  //   let loadedRelation

  //   loadedRelation = await parentInstance.myProperty
  //   expect(await loadedRelation.id).toEqual(`abc`)

  //   expect(await parentRepository.save(parentInstance)).toBeTruthy()

  //   loadedRelation = await parentInstance.myProperty
  //   expect(await loadedRelation.id).toEqual(`abc`)

  //   loadedRelation = await childRepository.load(`abc`)
  //   expect(await loadedRelation.id).toEqual(`abc`)
  // })

  // it(`can save and load a relationship to a singleton entity`, async () => {
  //   let loadedRelation

  //   loadedRelation = await singletonParentInstance.myProperty
  //   expect(await loadedRelation.constantProperty).toEqual(`Never change!`)

  //   expect(
  //     await singletonParentRepository.save(singletonParentInstance)
  //   ).toBeTruthy()

  //   loadedRelation = await singletonParentInstance.myProperty
  //   expect(await loadedRelation.constantProperty).toEqual(`Never change!`)

  //   loadedRelation = await singletonChildRepository.load()
  //   expect(await loadedRelation.constantProperty).toEqual(`Never change!`)
  // })

  it(`can delete a non-singleton entity`, async () => {
    expect(await parentRepository.save(parentInstance)).toBeTruthy()
    expect(await parentRepository.delete(parentInstance)).toBeTruthy()

    await expect(
      (async (): Promise<void> => {
        await childRepository.load(`abc`)
      })()
    ).rejects.toThrow(EntityNotFoundError)
    await expect(
      (async (): Promise<void> => {
        await parentRepository.load(`xyz`)
      })()
    ).rejects.toThrow(EntityNotFoundError)
    await expect(
      (async (): Promise<void> => {
        await parentInstance.myProperty
      })()
    ).rejects.toThrow(EntityNotFoundError)

    console.log(`here`)
    expect(await parentRepository.delete(parentInstance)).toBeFalsy()
  })

  // it(`can delete a singleton entity`, async () => {
  //   expect(
  //     await singletonParentRepository.save(singletonParentInstance)
  //   ).toBeTruthy()
  //   expect(
  //     await singletonParentRepository.delete(singletonParentInstance)
  //   ).toBeTruthy()

  //   const loadedRelation = await singletonChildRepository.load()

  //   // See: https://github.com/kv-orm/core/issues/46
  //   // expect(loadedRelation).toBeNull()
  //   expect(await loadedRelation.constantProperty).toBeNull()

  //   console.log(datastore)
  //   expect(
  //     await singletonParentRepository.delete(singletonParentInstance)
  //   ).toBeFalsy()
  // })
})
