import { Column } from '../Column/Column'
import { ColumnMetadata } from '../Column/columnMetadata'
import {
  generatePropertyKey,
  generateIndexablePropertyKey,
  generateOneRelationshipKey,
  generateManyRelationshipKey,
  assertKeysDoNotContainSeparator,
} from './keyGeneration'
import { MemoryDatastore } from '../MemoryDatastore/MemoryDatastore'
import { Datastore } from '../Datastore/Datastore'
import {
  getPrimaryColumnMetadata,
  getColumnMetadatas,
  getColumnMetadata,
} from './columns'
import { getRelationshipMetadata } from './relationships'
import { Entity, EntityConstructor, BaseEntity } from '../Entity/Entity'
import { EntityLookupError, InvalidKeyError } from './errors'
import { OneToOne } from '../Relationship/OneToOne'

describe(`keyGeneration`, () => {
  let datastore: Datastore
  let singletonEntityConstructor: EntityConstructor
  let singletonEntityWithCustomKeysConstructor: EntityConstructor
  let complexEntityConstructor: EntityConstructor
  let complexEntityWithCustomKeysConstructor: EntityConstructor

  beforeEach(() => {
    datastore = new MemoryDatastore()

    @Entity({ datastore })
    class SingletonEntity {
      @Column()
      public myProperty = `initial value`

      @OneToOne({ type: SingletonEntity })
      public relationshipProperty: undefined
    }

    singletonEntityConstructor = SingletonEntity

    @Entity({ datastore, key: `CustomSingletonEntityKey` })
    class SingletonEntityWithCustomKeys {
      @Column({ key: `CustomPropertyKey` })
      public myProperty = `initial value`

      @OneToOne({
        type: SingletonEntityWithCustomKeys,
        key: `CustomRelationshipKey`,
      })
      public relationshipProperty: undefined
    }

    singletonEntityWithCustomKeysConstructor = SingletonEntityWithCustomKeys

    @Entity({ datastore })
    class ComplexEntity {
      @Column({ isPrimary: true })
      public id = 12345

      @Column()
      public myProperty = `initial value`

      @Column({ isIndexable: true })
      public indexable = `abc@xyz.com`

      @OneToOne({ type: ComplexEntity })
      public relationshipProperty: undefined
    }

    complexEntityConstructor = ComplexEntity

    @Entity({ datastore, key: `CustomComplexEntityKey` })
    class ComplexEntityWithCustomKeys {
      @Column({ isPrimary: true, key: `CustomPrimaryKey` })
      public id = 12345

      @Column({ key: `CustomPropertyKey` })
      public myProperty = `initial value`

      @Column({ isIndexable: true, key: `CustomIndexableKey` })
      public indexable = `abc@xyz.com`

      @OneToOne({
        type: ComplexEntityWithCustomKeys,
        key: `CustomRelationshipKey`,
      })
      public relationshipProperty: undefined
    }

    complexEntityWithCustomKeysConstructor = ComplexEntityWithCustomKeys
  })

  describe(`generatePropertyKey`, () => {
    it(`generates a key for a singleton with default keys`, async () => {
      const instance = new singletonEntityConstructor()
      const columnMetadata = getColumnMetadata(
        singletonEntityConstructor,
        `myProperty`
      )
      expect(generatePropertyKey(instance, columnMetadata)).toEqual(
        `SingletonEntity:myProperty`
      )
    })
    it(`generates a key for a singleton with custom keys`, async () => {
      const instance = new singletonEntityWithCustomKeysConstructor()
      const columnMetadata = getColumnMetadata(
        singletonEntityWithCustomKeysConstructor,
        `myProperty`
      )
      expect(generatePropertyKey(instance, columnMetadata)).toEqual(
        `CustomSingletonEntityKey:CustomPropertyKey`
      )
    })
    it(`generates a key with default keys`, async () => {
      const instance = new complexEntityConstructor()
      const primaryColumnMetadata = getPrimaryColumnMetadata(
        complexEntityConstructor
      ) as ColumnMetadata
      const otherColumnMetadata = getColumnMetadata(
        complexEntityConstructor,
        `myProperty`
      )
      const indexableColumnMetadata = getColumnMetadata(
        complexEntityConstructor,
        `indexable`
      )

      expect(generatePropertyKey(instance, primaryColumnMetadata)).toEqual(
        `ComplexEntity:12345:id`
      )
      expect(generatePropertyKey(instance, otherColumnMetadata)).toEqual(
        `ComplexEntity:12345:myProperty`
      )
      expect(generatePropertyKey(instance, indexableColumnMetadata)).toEqual(
        `ComplexEntity:12345:indexable`
      )
    })
    it(`generates a key with custom keys`, async () => {
      const instance = new complexEntityWithCustomKeysConstructor()
      const primaryColumnMetadata = getPrimaryColumnMetadata(
        complexEntityWithCustomKeysConstructor
      ) as ColumnMetadata
      const otherColumnMetadata = getColumnMetadata(
        complexEntityWithCustomKeysConstructor,
        `myProperty`
      )
      const indexableColumnMetadata = getColumnMetadata(
        complexEntityWithCustomKeysConstructor,
        `indexable`
      )

      expect(generatePropertyKey(instance, primaryColumnMetadata)).toEqual(
        `CustomComplexEntityKey:12345:CustomPrimaryKey`
      )
      expect(generatePropertyKey(instance, otherColumnMetadata)).toEqual(
        `CustomComplexEntityKey:12345:CustomPropertyKey`
      )
      expect(generatePropertyKey(instance, indexableColumnMetadata)).toEqual(
        `CustomComplexEntityKey:12345:CustomIndexableKey`
      )
    })
    it(`throws an error for invalid Entities`, async () => {
      await expect(
        (async (): Promise<void> => {
          // No @Entity() decorator
          class MyInvalidEntity {
            @Column()
            public myProperty = `initial value`
          }

          const instance = new MyInvalidEntity()
          const columnMetadata = getColumnMetadatas(MyInvalidEntity)[0]
          generatePropertyKey(instance, columnMetadata)
        })()
      ).rejects.toThrow(EntityLookupError)
    })
  })
  describe(`generateIndexablePropertyKey`, () => {
    it(`generates a key`, () => {
      const indexableColumnMetadata = getColumnMetadata(
        complexEntityConstructor,
        `indexable`
      )
      expect(
        generateIndexablePropertyKey(
          complexEntityConstructor,
          indexableColumnMetadata,
          `abc@xyz.com`
        )
      ).toEqual(`ComplexEntity:indexable:abc@xyz.com`)
    })
    it(`generates a key with custom keys`, () => {
      const indexableColumnMetadata = getColumnMetadata(
        complexEntityWithCustomKeysConstructor,
        `indexable`
      )
      expect(
        generateIndexablePropertyKey(
          complexEntityWithCustomKeysConstructor,
          indexableColumnMetadata,
          `abc@xyz.com`
        )
      ).toEqual(`CustomComplexEntityKey:CustomIndexableKey:abc@xyz.com`)
    })
  })
  describe(`generateOneRelationshipKey`, () => {
    it(`generates a key for a singleton`, async () => {
      const instance = new singletonEntityConstructor()
      const relationshipMetadata = getRelationshipMetadata(
        singletonEntityConstructor,
        `relationshipProperty`
      )
      expect(
        generateOneRelationshipKey(instance, relationshipMetadata)
      ).toEqual(generatePropertyKey(instance, relationshipMetadata))
    })
    it(`generates a key for a singleton with custom keys`, async () => {
      const instance = new singletonEntityWithCustomKeysConstructor()
      const relationshipMetadata = getRelationshipMetadata(
        singletonEntityWithCustomKeysConstructor,
        `relationshipProperty`
      )
      expect(
        generateOneRelationshipKey(instance, relationshipMetadata)
      ).toEqual(generatePropertyKey(instance, relationshipMetadata))
    })
    it(`generates a key with default keys`, async () => {
      const instance = new complexEntityConstructor()
      const otherRelationshipMetadata = getRelationshipMetadata(
        complexEntityConstructor,
        `relationshipProperty`
      )

      expect(generatePropertyKey(instance, otherRelationshipMetadata)).toEqual(
        generatePropertyKey(instance, otherRelationshipMetadata)
      )
    })
    it(`generates a key with custom keys`, async () => {
      const instance = new complexEntityWithCustomKeysConstructor()
      const otherRelationshipMetadata = getRelationshipMetadata(
        complexEntityWithCustomKeysConstructor,
        `relationshipProperty`
      )

      expect(generatePropertyKey(instance, otherRelationshipMetadata)).toEqual(
        generatePropertyKey(instance, otherRelationshipMetadata)
      )
    })
  })
  describe(`generateManyRelationshipKey`, () => {
    let relationshipInstance: BaseEntity

    beforeEach(() => {
      relationshipInstance = new complexEntityConstructor()
    })

    it(`generates a key for a singleton`, async () => {
      const instance = new singletonEntityConstructor()
      const relationshipMetadata = getRelationshipMetadata(
        singletonEntityConstructor,
        `relationshipProperty`
      )
      expect(
        generateManyRelationshipKey(
          instance,
          relationshipMetadata,
          relationshipInstance
        )
      ).toEqual(`SingletonEntity:relationshipProperty:12345`)
    })
    it(`generates a key for a singleton with custom keys`, async () => {
      const instance = new singletonEntityWithCustomKeysConstructor()
      const relationshipMetadata = getRelationshipMetadata(
        singletonEntityWithCustomKeysConstructor,
        `relationshipProperty`
      )
      expect(
        generateManyRelationshipKey(
          instance,
          relationshipMetadata,
          relationshipInstance
        )
      ).toEqual(`CustomSingletonEntityKey:CustomRelationshipKey:12345`)
    })
    it(`generates a key with default keys`, async () => {
      const instance = new complexEntityConstructor()
      const otherRelationshipMetadata = getRelationshipMetadata(
        complexEntityConstructor,
        `relationshipProperty`
      )

      expect(
        generateManyRelationshipKey(
          instance,
          otherRelationshipMetadata,
          relationshipInstance
        )
      ).toEqual(`ComplexEntity:12345:relationshipProperty:12345`)
    })
    it(`generates a key with custom keys`, async () => {
      const instance = new complexEntityWithCustomKeysConstructor()
      const otherRelationshipMetadata = getRelationshipMetadata(
        complexEntityWithCustomKeysConstructor,
        `relationshipProperty`
      )

      expect(
        generateManyRelationshipKey(
          instance,
          otherRelationshipMetadata,
          relationshipInstance
        )
      ).toEqual(`CustomComplexEntityKey:12345:CustomRelationshipKey:12345`)
    })
  })

  describe(`InvalidKeyError`, () => {
    it(`is thrown when generating a key with the key separator in it`, () => {
      expect(() => {
        assertKeysDoNotContainSeparator(datastore, [`test:bad:key`, `:`])
      }).toThrow(InvalidKeyError)
    })
  })
})
