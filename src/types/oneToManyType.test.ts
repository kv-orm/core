import { OneToMany } from '../Relationship/OneToMany'
import { Entity } from '../Entity/Entity'
import { Datastore } from '../Datastore/Datastore'
import { MemoryDatastore } from '../MemoryDatastore/MemoryDatastore'
import { oneToManyType } from './oneToManyType'

describe(`oneToManyType`, () => {
  let datastore: Datastore

  beforeEach(() => {
    datastore = new MemoryDatastore()
  })

  it(`helps`, async () => {
    @Entity({ datastore })
    class Child {}

    @Entity({ datastore })
    class WithColumnType {
      @OneToMany({ type: Child })
      relation: oneToManyType<Child>

      constructor() {
        this.relation = [new Child()]
      }
    }

    @Entity({ datastore })
    class WithoutColumnType {
      @OneToMany({ type: Child })
      relation: Child[]

      constructor() {
        this.relation = [new Child()]
      }
    }

    const instanceWithColumnType = new WithColumnType()
    const instanceWithoutColumnType = new WithoutColumnType()

    await instanceWithColumnType.relation
    await instanceWithoutColumnType.relation // 'await' has no effect on the type of this expression.ts(80007)

    instanceWithColumnType.relation = [new Child()]
    instanceWithoutColumnType.relation = [new Child()]
  })
})
