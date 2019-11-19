import { Cache } from './Cache'
import { Datastore } from '../Datastore/Datastore'
import { MemoryDatastore } from '../MemoryDatastore/MemoryDatastore'
import { Entity, BaseEntity } from '../Entity/Entity'
import { Column } from '../Column/Column'
import { CacheMissingPrimaryColumnValueError } from './CacheMissingPrimaryColumnValueError'

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

      @Column({ isPrimary: true })
      public id: string

      constructor(id: string) {
        this.id = id
      }
    }

    instance = new MyEntity(`abc`)
  })

  it(`can be written to, read from, and elements can be deleted`, async () => {
    cache.write(instance, () => `key`, `value`)
    expect(await cache.read(instance, `key`)).toEqual(`value`)
    await cache.delete(instance, () => `key`)
    expect(await cache.read(instance, `key`)).toBeNull()
  })

  describe(`CacheMissingPrimaryColumnValueError`, () => {
    it(`is thrown when reading an, as yet, unset Primary Column value`, () => {
      expect(() => {
        cache.getPrimaryColumnValue({})
      }).toThrow(CacheMissingPrimaryColumnValueError)
    })
  })
})
