import { Entity } from './Entity'
import { MemoryDatastore } from './MemoryDatastore'
import { Datastore } from './Datastore'

describe(`Entity`, () => {
  let datastore: Datastore

  beforeEach(() => {
    datastore = new MemoryDatastore()
  })

  it(`can be initialized with a MemoryDatastore`, () => {
    @Entity({ datastore })
    class X {}

    const instance = new X()

    expect(instance).toBeInstanceOf(X)
    expect(instance.constructor).toBe(X)
  })
})
