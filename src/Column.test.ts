import { Entity, BaseEntity } from './Entity'
import { MemoryDatastore } from './MemoryDatastore/MemoryDatastore'
import { Datastore } from './Datastore'
import { Column } from './Column'

describe(`Column`, () => {
  let datastore: Datastore
  let instance: BaseEntity

  beforeEach(() => {
    datastore = new MemoryDatastore()

    @Entity({ datastore })
    class X {
      @Column()
      public xProp = `initial value`
    }

    instance = new X()
  })

  it(`can be initialized with a default value`, async () => {
    expect(await instance.xProp).toEqual(`initial value`)
  })

  it(`can be written to, and subsequently read from`, async () => {
    instance.xProp = `new value`
    expect(await instance.xProp).toEqual(`new value`)
  })
})
