import { MemoryDatastore } from './MemoryDatastore'
import { Datastore, SearchStrategy } from './Datastore'

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
      const results = await datastore.search({
        ...defaultSearchTerms,
        first: 2000,
      })
      expect(results.keys.length).toBe(1000)
      expect(results.cursor).toBe(`999`)
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
