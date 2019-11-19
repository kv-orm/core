import { OneToOne } from '../Relationship/OneToOne'
import { Entity } from '../Entity/Entity'
import { Datastore } from '../Datastore/Datastore'
import { MemoryDatastore } from '../MemoryDatastore/MemoryDatastore'
import { oneToOneType } from './oneToOneType'

describe(`oneToOneType`, () => {
  let datastore: Datastore

  beforeEach(() => {
    datastore = new MemoryDatastore()
  })

  it(`helps`, async () => {
    @Entity({ datastore })
    class Child {}

    @Entity({ datastore })
    class WithColumnType {
      @OneToOne({ type: Child })
      relation: oneToOneType<Child>

      constructor() {
        this.relation = new Child()
      }
    }

    @Entity({ datastore })
    class WithoutColumnType {
      @OneToOne({ type: Child })
      relation: Child

      constructor() {
        this.relation = new Child()
      }
    }

    const instanceWithColumnType = new WithColumnType()
    const instanceWithoutColumnType = new WithoutColumnType()

    await instanceWithColumnType.relation
    await instanceWithoutColumnType.relation // 'await' has no effect on the type of this expression.ts(80007)

    instanceWithColumnType.relation = new Child()
    instanceWithoutColumnType.relation = new Child()
  })
})
