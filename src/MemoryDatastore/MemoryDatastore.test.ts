import { MemoryDatastore } from './MemoryDatastore'
import { Datastore, Key, Value } from '../Datastore/Datastore'
import { SearchStrategy } from '../Datastore/databaseSearch'

const readWriteWorks = async (datastore: Datastore): Promise<boolean> => {
  await datastore.write(`key`, `value`)
  return (await datastore.read(`key`)) === `value`
}

describe(`MemoryDatastore`, () => {
  let datastore: Datastore

  beforeEach(() => {
    datastore = new MemoryDatastore()
  })

  it(`can be initialized`, () => {
    expect(datastore).toBeInstanceOf(Datastore)
    expect(datastore).toBeInstanceOf(MemoryDatastore)
  })

  it(`can be written to, and subsequently read from`, async () => {
    expect(await readWriteWorks(datastore)).toBeTruthy()
  })

  it(`can delete key-values`, async () => {
    expect(await readWriteWorks(datastore)).toBeTruthy()
    await datastore.delete(`key`)
    expect(await datastore.read(`key`)).toBeNull()
  })

  describe(`cache`, () => {
    let data: Map<Key, Value>
    let cacheData: Map<Key, Value>

    beforeEach(async () => {
      cacheData = (datastore.cache as any).data
      data = (datastore as any).data

      await datastore.write(`a key`, `a value`)
    })

    it(`is written to`, async () => {
      await datastore._write(`abc`, `def`)
      expect(data.size).toBeGreaterThan(cacheData.size)

      await datastore.write(`ghi`, `jkl`)
      expect(data.size).toBeGreaterThan(cacheData.size)
    })

    it(`is read from`, async () => {
      expect(await datastore._read(`a key`)).toEqual(`a value`)

      await (datastore.cache as Datastore)._write(`new key`, `new value`)
      expect(cacheData.size).toBeGreaterThan(data.size)
      expect(await datastore.read(`new key`)).toEqual(`new value`)
      expect(cacheData.size).toBeGreaterThan(data.size)

      expect(await datastore.read(`new key`, { skipCache: true })).toBeNull()
      expect(await datastore.read(`new key`)).toBeNull()
    })

    it(`is deleted from`, async () => {
      await datastore.delete(`a key`)
      expect(cacheData.size).toBe(0)
      expect(data.size).toBe(0)
    })

    it(`is NOT searched from`, async () => {
      await datastore._write(`a key only in the main datastore`, `hello!`)
      await (datastore.cache as Datastore)._write(
        `a key only in the cache datastore`,
        `hello as well!`
      )

      expect(
        (
          await datastore.search({
            term: `a key`,
            strategy: SearchStrategy.prefix,
          })
        ).keys
      ).toEqual([`a key`, `a key only in the main datastore`])
    })
  })

  describe(`search`, () => {
    const defaultSearchTerms = {
      term: `key`,
      strategy: SearchStrategy.prefix,
    }

    beforeEach(async () => {
      for (let i = 0; i < 2003; i++) {
        await datastore.write(`key${i}`, `value${i}`)
      }
    })

    it(`has a default limit of keys returned`, async () => {
      const results = await datastore.search(defaultSearchTerms)
      expect(results.keys.length).toBe(1000)
      expect(results.cursor).toBe(`999`)
      expect(results.hasNextPage).toBeTruthy()
    })

    it(`has limits the number of keys returned`, async () => {
      let results = await datastore.search({
        ...defaultSearchTerms,
        first: 2000,
      })
      expect(results.keys.length).toBe(1000)
      expect(results.cursor).toBe(`999`)
      expect(results.hasNextPage).toBeTruthy()

      results = await datastore.search({
        ...defaultSearchTerms,
        first: -99,
      })
      expect(results.keys.length).toBe(0)
      expect(results.cursor).toBe(`-1`)
      expect(results.hasNextPage).toBeTruthy()
    })

    it(`can paginate`, async () => {
      const results = await datastore.search({
        ...defaultSearchTerms,
        after: `3`,
      })
      expect(results.keys).not.toContain(`key3`)
      expect(results.keys).toContain(`key4`)
      expect(results.keys).toContain(`key1003`)
      expect(results.keys).not.toContain(`key1004`)
      expect(results.keys.length).toBe(1000)
      expect(results.cursor).toBe(`1003`)
      expect(results.hasNextPage).toBeTruthy()
    })

    it(`hits the end of pagination correctly`, async () => {
      const results = await datastore.search({
        ...defaultSearchTerms,
        after: `1999`,
      })
      expect(results.keys).toContain(`key2000`)
      expect(results.keys).toContain(`key2001`)
      expect(results.keys).toContain(`key2002`)
      expect(results.keys.length).toBe(3)
      expect(results.cursor).toBe(`2002`)
      expect(results.hasNextPage).toBeFalsy()
    })
  })
})
