import { Datastore } from '../Datastore/Datastore'
import { BaseEntity, Entity } from '../Entity/Entity'
import { MemoryDatastore } from '../MemoryDatastore/MemoryDatastore'
import { Column } from '../Column/Column'
import { Repository, getRepository } from './Repository'
import { RepositoryLoadError } from './RepositoryLoadError'

describe(`Repository`, () => {
  let datastore: Datastore
  let singletonInstance: BaseEntity
  let singletonRepository: Repository
  let complexInstance: BaseEntity
  let complexRepository: Repository

  beforeEach(() => {
    datastore = new MemoryDatastore()

    @Entity({ datastore, key: `SingletonEntity` })
    class SingletonEntity {
      @Column({ key: `myProperty` })
      public myProperty = `initial value`
    }

    @Entity({ datastore, key: `ComplexEntity` })
    class ComplexEntity {
      @Column({ key: `myProperty` })
      public myProperty = `initial value`

      @Column({ key: `primaryProperty`, isPrimary: true })
      public primaryProperty: number

      @Column({ key: `indexableProperty`, isIndexable: true })
      public indexableProperty: string

      constructor(primaryProperty: number, indexableProperty: string) {
        this.primaryProperty = primaryProperty
        this.indexableProperty = indexableProperty
      }
    }

    singletonRepository = getRepository(SingletonEntity)
    singletonInstance = new SingletonEntity()

    complexRepository = getRepository(ComplexEntity)
    complexInstance = new ComplexEntity(12345, `abc@xyz.com`)
  })

  it(`can be initialized with a default value`, async () => {
    expect(await datastore.read(`SingletonEntity:myProperty`)).toBeNull()
    expect(await singletonRepository.save(singletonInstance)).toBeTruthy()
    expect(await datastore.read(`SingletonEntity:myProperty`)).toEqual(
      `initial value`
    )
    expect(await singletonRepository.save(singletonInstance)).toBeFalsy()

    expect(await complexRepository.save(complexInstance)).toBeTruthy()
    expect(await datastore.read(`ComplexEntity:myProperty`)).toBeNull()
    expect(await datastore.read(`ComplexEntity:12345:myProperty`)).toEqual(
      `initial value`
    )
    expect(await datastore.read(`ComplexEntity:12345:primaryProperty`)).toEqual(
      12345
    )
    expect(
      await datastore.read(`ComplexEntity:12345:indexableProperty`)
    ).toEqual(`abc@xyz.com`)
    expect(
      await datastore.read(`ComplexEntity:indexableProperty:abc@xyz.com`)
    ).toEqual(12345)
  })

  it(`can be written to, and subsequently read from`, async () => {
    singletonInstance.myProperty = `new value`
    expect(await singletonRepository.save(singletonInstance)).toBeTruthy()
    expect(await datastore.read(`SingletonEntity:myProperty`)).toEqual(
      `new value`
    )
    expect(await singletonInstance.myProperty).toEqual(`new value`)

    complexInstance.myProperty = `new value`
    expect(await singletonRepository.save(complexInstance)).toBeTruthy()
    expect(await datastore.read(`ComplexEntity:12345:myProperty`)).toEqual(
      `new value`
    )
    expect(await complexInstance.myProperty).toEqual(`new value`)
  })

  it(`can load an instance`, async () => {
    await singletonRepository.save(singletonInstance)
    let loadedInstance = await singletonRepository.load()
    expect(await loadedInstance.myProperty).toEqual(`initial value`)

    await complexRepository.save(complexInstance)
    loadedInstance = await complexRepository.load(12345)
    expect(await loadedInstance.myProperty).toEqual(`initial value`)

    singletonInstance.myProperty = `new value`
    await singletonRepository.save(singletonInstance)
    loadedInstance = await singletonRepository.load()
    expect(await loadedInstance.myProperty).toEqual(`new value`)

    complexInstance.myProperty = `new value`
    await complexRepository.save(complexInstance)
    loadedInstance = await complexRepository.load(12345)
    expect(await loadedInstance.myProperty).toEqual(`new value`)
  })

  it(`can search for an instance`, async () => {
    await complexRepository.save(complexInstance)
    const loadedInstance = await complexRepository.load(12345)
    const searchedInstance = (await complexRepository.search(
      `indexableProperty`,
      `abc@xyz.com`
    )) as BaseEntity
    expect(await searchedInstance.myProperty).toEqual(
      await loadedInstance.myProperty
    )
    expect(await searchedInstance.primaryProperty).toEqual(
      await loadedInstance.primaryProperty
    )
    expect(await searchedInstance.indexableProperty).toEqual(
      await loadedInstance.indexableProperty
    )
  })

  describe(`RepositoryLoadError`, () => {
    it(`is thrown when loading a singleton Entity with an identifier`, async () => {
      await expect(
        (async (): Promise<void> => {
          await singletonRepository.load(12345)
        })()
      ).rejects.toThrow(RepositoryLoadError)
    })
    it(`is thrown when loading a non-singleton Entity without an identifier`, async () => {
      await expect(
        (async (): Promise<void> => {
          await complexRepository.load()
        })()
      ).rejects.toThrow(RepositoryLoadError)
    })
  })
})
