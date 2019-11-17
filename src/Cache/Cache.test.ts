import { Cache } from './Cache'
import { Datastore } from '../Datastore/Datastore'
import { MemoryDatastore } from '../MemoryDatastore/MemoryDatastore'
import { Entity, BaseEntity } from '../Entity/Entity'
import { Column } from '../Column/Column'

describe(`Cache`, () => {
  let cache: Cache
  let datastore: Datastore
  let instance: BaseEntity

  beforeEach(() => {
    cache = new Cache()
    datastore = new MemoryDatastore()

    @Entity({ datastore })
    class MyEntity {
      @Column()
      public myProperty = `initial value`
    }

    instance = new MyEntity()
  })

  it(`can be written to, read from, and elements can be deleted`, async () => {
    cache.write(instance, () => `key`, `value`)
    expect(await cache.read(instance, `key`)).toEqual(`value`)
    await cache.delete(instance, () => `key`)
    expect(await cache.read(instance, `key`)).toBeNull()
  })
})
