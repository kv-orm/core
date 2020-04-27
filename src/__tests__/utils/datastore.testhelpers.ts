import { Value, Key, Datastore } from '../../Datastore/Datastore'

export const datastoreEqualTo = (
  datastore: Datastore,
  b: [Key, Value][],
  comparator = (a: Value, b: Value) => JSON.stringify(a) === JSON.stringify(b)
) => {
  const data = (datastore as any).data as Map<Key, Value>

  const isInData = ([key, value]: [Key, Value]) =>
    comparator(data.get(key), value)

  return data.size === b.length && b.every(isInData)
}
