<h1 align="center">Welcome to @kv-orm/core 👋</h1>
<p>
  <img alt="Version" src="https://img.shields.io/github/package-json/v/kv-orm/core?style=for-the-badge" />
  <a href="https://github.com/kv-orm/core/blob/master/LICENSE" target="_blank">
    <img alt="License: MIT" src="https://img.shields.io/github/license/kv-orm/core?style=for-the-badge" />
  </a>
  <a href="https://github.com/kv-orm/core" target="_blank">
    <img alt="GitHub Last Commit" src="https://img.shields.io/github/last-commit/gregbrimble/kv-orm.svg?logo=github&style=for-the-badge" />
  </a>
  <a href="https://lgtm.com/projects/g/kv-orm/core/alerts/" target="_blank">
    <img alt="LGTM Alerts" src="https://img.shields.io/lgtm/alerts/g/kv-orm/core.svg?style=for-the-badge&logo=lgtm">
  </a>
  <a href="https://lgtm.com/projects/g/kv-orm/core/context:javascript">
    <img alt="LGTM Code Quality" src="https://img.shields.io/lgtm/grade/javascript/g/kv-orm/core.svg?style=for-the-badge&logo=lgtm">
  </a>
</p>

> A Node.js ORM for key-value datastores

[kv-orm] is an Node.JS [ORM](https://en.wikipedia.org/wiki/Object-relational_mapping) for [key-value datastores](https://en.wikipedia.org/wiki/Key-value_database).

# Supported Datastores

- In-Memory
- [Cloudflare Workers KV](https://github.com/kv-orm/cf-workers)

# Usage

## Install

```sh
npm install @kv-orm/core
```

## Usage

```typescript
import {
  Datastore,
  MemoryDatastore,
  Entity,
  Column,
  getRepository,
} from '@kv-orm/core'

// First, we need a datastore to save our data
// A MemoryDatastore is a simple, in-memory key-value datastore
const datastore: Datastore = new MemoryDatastore()

// Next, we need to create an Entity
// An Entity is a object which stores data about something e.g. a User
// The Entity decorator needs a datastore to save the Entity instances into
@Entity({ datastore })
class User {
  // A Column is a saved property of an Entity class
  @Column()
  public firstName: string | undefined

  // You can override the key used in the datastore for an Entity or Column by passing it into the decorator
  @Column({ key: 'familyName' })
  public lastName: string | undefined

  // Non-singleton classes need a Primary Column
  // These values should be unique
  @Column({ isPrimary: true })
  public emailAddress: string

  // A Column can optionally be set as Indexable
  // This allows you to search for an instance of the Entity with an indexed value
  // Like with Primary Columns, Indexable Column values should be unique
  @Column({ isIndexable: true })
  public phoneNumber: string | undefined

  constructor(
    firstName?: string,
    lastName?: string,
    emailAddress: string,
    phoneNumber?: string
  ) {
    this.firstName = firstName
    this.lastName = lastName
    this.emailAddress = emailAddress
    this.phoneNumber = phoneNumber
  }
}

// The final bit of setup is getting a Repository
// This allows us to interact with the datastore for that Entity
const userRepository = getRepository(User)

// Now, we can create instances of the User class
const johnSmith = new User('John', 'Smith', 'john@smith.com', '+1234567890')

// When using a property, we need to 'await' the value
// This is because it might need to query the datastore, if it doesn't have the value in memory
console.log(await johnSmith.firstName) // John

// Let's save the instance so we can get it back later
await userRepository.save(johnSmith)

// Finally, let's load the instance we just saved
const loadedUser = await userRepository.load('john@smith.com')
console.log(await loadedUser.firstName) // John
```

# Development

## Clone and Install Dependencies

```sh
git clone git@github.com:kv-orm/core.git
npm install
```

## Run tests

```sh
npm run lint
npm test
```

## Author

👤 **Greg Brimble**

- Github: [@GregBrimble](https://github.com/GregBrimble)
- Personal Website: [https://gregbrimble.com/](https://gregbrimble.com/)

## 🤝 Contributing

Contributions, issues and feature requests are welcome!<br />Feel free to check [issues page](https://github.com/kv-orm/core/issues).

## 😍 Show your support

Please consider giving this project a ⭐️ if you use it, or if it provides some inspiration!

## 🚎 Roadmap

<a href="https://github.com/kv-orm/core/issues?q=is%3Aopen+is%3Aissue+label%3Aenhancement" target="_blank">
  <img alt="Features" src="https://img.shields.io/github/issues/kv-orm/core/enhancement?color=%2335a501&label=Features&logo=github&style=for-the-badge" />
</a>

- Relationships
- Improved performance

<a href="https://github.com/kv-orm/core/issues?q=is%3Aopen+is%3Aissue+label%3Abug" target="_blank">
  <img alt="Bugs" src="https://img.shields.io/github/issues/kv-orm/core/bug?color=%23d73a4a&label=Bugs&logo=github&style=for-the-badge" />
</a>

## 📝 License

Copyright © 2019 [Greg Brimble](https://github.com/GregBrimble).<br />
This project is [MIT](https://github.com/kv-orm/core/blob/master/LICENSE) licensed.

[kv-orm]: https://github.com/kv-orm/core
