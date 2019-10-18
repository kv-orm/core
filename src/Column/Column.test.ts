import { Entity, BaseEntity } from '../Entity/Entity'
import { MemoryDatastore } from '../MemoryDatastore/MemoryDatastore'
import { Datastore } from '../Datastore/Datastore'
import { Column } from '../Column/Column'
import { ColumnSetupError } from './ColumnSetupError'

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

      public otherProp = `1`
    }

    instance = new MyEntity()
    otherInstance = new MyEntity()
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

  describe(`ColumnSetupError`, () => {
    it(`is thrown with a duplicate key`, () => {
      expect(() => {
        @Entity({ datastore, key: `MyOtherEntity` })
        class MyOtherEntity {
          @Column({ key: `myDuplicatedProperty` })
          public myProperty1 = `initial value`

          @Column({ key: `myDuplicatedProperty` })
          public myProperty2 = `other initial value`
        }
      }).toThrow(ColumnSetupError)
    })
  })
})
