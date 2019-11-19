import { Entity } from '../Entity/Entity'
import { Datastore } from '../Datastore/Datastore'
import { MemoryDatastore } from '../MemoryDatastore/MemoryDatastore'
import { getRelationshipMetadata } from './relationships'
import { RelationshipLookupError } from './errors'

describe(`relationships`, () => {
  let datastore: Datastore
  beforeEach(() => {
    datastore = new MemoryDatastore()
  })
  describe(`RelationshipLookupError`, () => {
    it(`is thrown when it does not exist`, () => {
      @Entity({ datastore })
      class MyEntity {}

      expect(() => {
        getRelationshipMetadata(MyEntity, `fakeRelationship`)
      }).toThrow(RelationshipLookupError)
    })
  })
})
