import { Entity, BaseEntity } from '../Entity/Entity'
import { MemoryDatastore } from '../MemoryDatastore/MemoryDatastore'
import { Datastore } from '../Datastore/Datastore'
import { Column } from '../Column/Column'
import { MetadataSetupError } from '../utils/metadata'
import { ReadOnlyError } from '../utils/errors'

describe(`Column`, () => {
  let datastore: Datastore
  let instance: BaseEntity
  let otherInstance: BaseEntity

  beforeEach(() => {
    datastore = new MemoryDatastore()

    @Entity({ datastore, key: `MyEntity` })
    class MyEntity {
      @Column({ key: `myProperty` })
      public myProperty = `initial value`

      @Column({ isPrimary: true })
      public id: string

      constructor(id: string) {
        this.id = id
      }

      public otherProp = `1`
    }

    instance = new MyEntity(`abc`)
    otherInstance = new MyEntity(`def`)
    otherInstance.otherProp = `2`
  })

  it(`can be initialized with a default value`, async () => {
    expect(await instance.myProperty).toEqual(`initial value`)
  })

  it(`can be written to, and subsequently read from`, async () => {
    instance.myProperty = `new value`
    expect(await instance.myProperty).toEqual(`new value`)
    expect(await otherInstance.myProperty).toEqual(`initial value`)
  })

  it(`can write and read an array value`, async () => {
    @Entity({ datastore })
    class EntityWithArrayColumn {
      @Column()
      public arrayColumn: number[]

      constructor(arrayValues: number[]) {
        this.arrayColumn = arrayValues
      }
    }

    const values = [1, 2, 3, 4, 5]
    instance = new EntityWithArrayColumn(values)

    expect(await instance.arrayColumn).toEqual(values)
  })

  describe(`MetadataSetupError`, () => {
    it(`is thrown with a duplicate key`, () => {
      expect(() => {
        @Entity({ datastore, key: `MyOtherEntity` })
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        class MyOtherEntity {
          @Column({ key: `myDuplicatedProperty` })
          public myProperty1 = `initial value`

          @Column({ key: `myDuplicatedProperty` })
          public myProperty2 = `other initial value`
        }
      }).toThrow(MetadataSetupError)
    })
  })

  describe(`ReadOnlyError`, () => {
    it(`is thrown when attempting to write to a Primary Column twice`, () => {
      expect(() => {
        instance.id = `zzz`
      }).toThrow(ReadOnlyError)
    })
  })
})
