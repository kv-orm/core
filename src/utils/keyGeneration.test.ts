import { EntityMetadataError } from './errors'
import { Column, ColumnMetadata } from '../Column/Column'
import {
  generatePropertyKey,
  generateIndexablePropertyKey,
} from './keyGeneration'
import { MemoryDatastore } from '../MemoryDatastore/MemoryDatastore'
import { Datastore } from '../Datastore/Datastore'
import { getColumns, getPrimaryColumn } from './columns'
import { Entity, BaseEntity, EntityConstructor } from '../Entity/Entity'

describe(`keyGeneration`, () => {
  let datastore: Datastore
  let singletonEntityConstructor: EntityConstructor<BaseEntity>
  let singletonEntityWithCustomKeysConstructor: EntityConstructor<BaseEntity>
  let complexEntityConstructor: EntityConstructor<BaseEntity>
  let complexEntityWithCustomKeysConstructor: EntityConstructor<BaseEntity>

  beforeEach(() => {
    datastore = new MemoryDatastore()

    @Entity({ datastore })
    class SingletonEntity {
      @Column()
      public myProperty = `initial value`
    }

    singletonEntityConstructor = SingletonEntity

    @Entity({ datastore, key: `CustomSingletonEntityKey` })
    class SingletonEntityWithCustomKeys {
      @Column({ key: `CustomPropertyKey` })
      public myProperty = `initial value`
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
    }

    complexEntityWithCustomKeysConstructor = ComplexEntityWithCustomKeys
  })

  describe(`generatePropertyKey`, () => {
    it(`generates a key for a singleton with default keys`, async () => {
      const instance = new singletonEntityConstructor()
      const columnMetadata = getColumns(instance)[0]
      expect(
        await generatePropertyKey(datastore, instance, columnMetadata)
      ).toEqual(`SingletonEntity:myProperty`)
    })
    it(`generates a key for a singleton with custom keys`, async () => {
      const instance = new singletonEntityWithCustomKeysConstructor()
      const columnMetadata = getColumns(instance)[0]
      expect(
        await generatePropertyKey(datastore, instance, columnMetadata)
      ).toEqual(`CustomSingletonEntityKey:CustomPropertyKey`)
    })
    it(`generates a key with default keys`, async () => {
      const instance = new complexEntityConstructor()
      const primaryColumnMetadata = getPrimaryColumn(instance) as ColumnMetadata
      const otherColumnMetadata = getColumns(instance).find(
        columnMetadata =>
          !columnMetadata.isPrimary && !columnMetadata.isIndexable
      ) as ColumnMetadata
      const indexableColumnMetadata = getColumns(instance).find(
        columnMetadata => columnMetadata.isIndexable
      ) as ColumnMetadata

      expect(
        await generatePropertyKey(datastore, instance, primaryColumnMetadata)
      ).toEqual(`ComplexEntity:12345:id`)
      expect(
        await generatePropertyKey(datastore, instance, otherColumnMetadata)
      ).toEqual(`ComplexEntity:12345:myProperty`)
      expect(
        await generatePropertyKey(datastore, instance, indexableColumnMetadata)
      ).toEqual(`ComplexEntity:12345:indexable`)
    })
    it(`generates a key with custom keys`, async () => {
      const instance = new complexEntityWithCustomKeysConstructor()
      const primaryColumnMetadata = getPrimaryColumn(instance) as ColumnMetadata
      const otherColumnMetadata = getColumns(instance).find(
        columnMetadata =>
          !columnMetadata.isPrimary && !columnMetadata.isIndexable
      ) as ColumnMetadata
      const indexableColumnMetadata = getColumns(instance).find(
        columnMetadata => columnMetadata.isIndexable
      ) as ColumnMetadata

      expect(
        await generatePropertyKey(datastore, instance, primaryColumnMetadata)
      ).toEqual(`CustomComplexEntityKey:12345:CustomPrimaryKey`)
      expect(
        await generatePropertyKey(datastore, instance, otherColumnMetadata)
      ).toEqual(`CustomComplexEntityKey:12345:CustomPropertyKey`)
      expect(
        await generatePropertyKey(datastore, instance, indexableColumnMetadata)
      ).toEqual(`CustomComplexEntityKey:12345:CustomIndexableKey`)
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
          const columnMetadata = getColumns(instance)[0]
          await generatePropertyKey(datastore, instance, columnMetadata)
        })()
      ).rejects.toThrow(EntityMetadataError)
    })
  })
  describe(`generateIndexablePropertyKey`, () => {
    it(`generates a key`, async () => {
      const instance = new complexEntityConstructor()
      const indexableColumnMetadata = getColumns(instance).find(
        columnMetadata => columnMetadata.isIndexable
      ) as ColumnMetadata
      expect(
        await generateIndexablePropertyKey(
          datastore,
          instance,
          indexableColumnMetadata
        )
      ).toEqual(`ComplexEntity:indexable:abc@xyz.com`)
    })
    it(`generates a key with custom keys`, async () => {
      const instance = new complexEntityWithCustomKeysConstructor()
      const indexableColumnMetadata = getColumns(instance).find(
        columnMetadata => columnMetadata.isIndexable
      ) as ColumnMetadata
      expect(
        await generateIndexablePropertyKey(
          datastore,
          instance,
          indexableColumnMetadata
        )
      ).toEqual(`CustomComplexEntityKey:CustomIndexableKey:abc@xyz.com`)
    })
  })
  // describe(`generateOneRelationshipKey`, () => {
  //   it(`generates a key for a singleton`, async () => {
  //     const instance = new singletonEntityConstructor()
  //     const columnMetadata = getColumns(instance)[0] as ColumnMetadata
  //     expect(
  //       await generateOneRelationshipKey(datastore, instance, columnMetadata)
  //     ).toEqual(await generatePropertyKey(datastore, instance, columnMetadata))
  //   })
  //   it(`generates a key for a singleton with custom keys`, async () => {
  //     const instance = new singletonEntityWithCustomKeysConstructor()
  //     const columnMetadata = getColumns(instance)[0] as ColumnMetadata
  //     expect(
  //       await generateOneRelationshipKey(datastore, instance, columnMetadata)
  //     ).toEqual(await generatePropertyKey(datastore, instance, columnMetadata))
  //   })
  //   it(`generates a key with default keys`, async () => {
  //     const instance = new complexEntityConstructor()
  //     const otherColumnMetadata = getColumns(instance).find(
  //       columnMetadata =>
  //         !columnMetadata.isPrimary && !columnMetadata.isIndexable
  //     ) as ColumnMetadata

  //     expect(
  //       await generatePropertyKey(datastore, instance, otherColumnMetadata)
  //     ).toEqual(
  //       await generatePropertyKey(datastore, instance, otherColumnMetadata)
  //     )
  //   })
  //   it(`generates a key with custom keys`, async () => {
  //     const instance = new complexEntityWithCustomKeysConstructor()
  //     const otherColumnMetadata = getColumns(instance).find(
  //       columnMetadata =>
  //         !columnMetadata.isPrimary && !columnMetadata.isIndexable
  //     ) as ColumnMetadata

  //     expect(
  //       await generatePropertyKey(datastore, instance, otherColumnMetadata)
  //     ).toEqual(
  //       await generatePropertyKey(datastore, instance, otherColumnMetadata)
  //     )
  //   })
  // })
})
