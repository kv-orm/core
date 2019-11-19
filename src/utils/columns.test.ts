import { Entity } from '../Entity/Entity'
import { Datastore } from '../Datastore/Datastore'
import { MemoryDatastore } from '../MemoryDatastore/MemoryDatastore'
import { PrimaryColumnMissingError } from './errors'
import { getPrimaryColumnValue } from './columns'

describe(`columns`, () => {
  let datastore: Datastore
  beforeEach(() => {
    datastore = new MemoryDatastore()
  })
  describe(`PrimaryColumnMissingError`, () => {
    it(`is thrown when it does not exist`, () => {
      @Entity({ datastore })
      class MyEntity {}

      const instance = new MyEntity()

      expect(() => {
        getPrimaryColumnValue(instance)
      }).toThrow(PrimaryColumnMissingError)
    })
  })
})
