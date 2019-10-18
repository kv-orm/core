export class KVORMError extends Error {
  constructor(message: string) {
    super(`kv-orm Error: ${message}`)
    this.name = `kv-orm Error`
  }
}

export class SetupError extends KVORMError {
  constructor(message: string) {
    super(message)
    this.name = `Setup Error`
  }
}
