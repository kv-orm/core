import { Datastore } from './Datastore'
import { BaseEntity, Entity } from './Entity'
import { MemoryDatastore } from './MemoryDatastore/MemoryDatastore'
import { Column } from './Column'
import { Repository, getRepository } from './Repository'

describe(`Repository`, () => {
  let datastore: Datastore
  let instance: BaseEntity
  let repository: Repository

  beforeEach(() => {
    datastore = new MemoryDatastore()

    @Entity({ datastore })
    class X {
      @Column()
      public xProp = `initial value`
    }

    repository = getRepository(X)
    instance = new X()
  })

  it(`can be initialized with a default value`, async () => {
    expect(await repository.save(instance)).toBeTruthy()
    expect(await repository.save(instance)).toBeFalsy()
  })

  it(`can be written to, and subsequently read from`, async () => {
    instance.xProp = `new value`
    expect(await instance.xProp).toEqual(`new value`)
  })
})
