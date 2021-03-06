<h1 align="center">Welcome to @kv-orm/core 👋</h1>
<p>
  <a href="https://github.com/kv-orm/core/actions?query=workflow%3ATest" target="_blank">
    <img alt="GitHub Actions Checks" src="https://github.com/kv-orm/core/workflows/Test/badge.svg" />
  </a>
  <a href="https://lgtm.com/projects/g/kv-orm/core/alerts/" target="_blank">
    <img alt="LGTM Alerts" src="https://img.shields.io/lgtm/alerts/g/kv-orm/core.svg?logo=lgtm&style=plastic" />
  </a>
  <a href="https://snyk.io/test/github/kv-orm/core?targetFile=package.json" target="_blank">
    <img alt="Synk Vulnerabilities" src="https://snyk.io/test/github/kv-orm/core/badge.svg?targetFile=package.json" />
  </a>
  <a href="https://codecov.io/gh/kv-orm/core" target="_blank">
    <img alt="Codecov" src="https://img.shields.io/codecov/c/github/kv-orm/core?logo=codecov&style=plastic" />
  </a>
  <a href="https://lgtm.com/projects/g/kv-orm/core/context:javascript" target="_blank">
    <img alt="LGTM Code Quality" src="https://img.shields.io/lgtm/grade/javascript/g/kv-orm/core.svg?logo=lgtm&style=plastic" />
  </a>
  <a href="https://codeclimate.com/github/kv-orm/core/maintainability" target="_blank">
    <img alt="Code Climate Maintainability" src="https://img.shields.io/codeclimate/maintainability/kv-orm/core.svg?style=plastic">
  </a>
  <a href="https://github.com/kv-orm/core/packages" target="_blank">
    <img alt="Version" src="https://img.shields.io/github/package-json/v/kv-orm/core?style=plastic" />
  </a>
  <a href="https://github.com/kv-orm/core/blob/master/LICENSE" target="_blank">
    <img alt="License" src="https://img.shields.io/github/license/kv-orm/core?style=plastic" />
  </a>
  <a href="https://www.typescriptlang.org/" target="_blank">
    <img alt="Types" src="https://img.shields.io/npm/types/kv-orm.svg?style=plastic" />
  </a>
  <a href="https://github.com/kv-orm/core" target="_blank">
    <img alt="GitHub Last Commit" src="https://img.shields.io/github/last-commit/kv-orm/core.svg?logo=github&style=plastic" />
  </a>
</p>

[kv-orm] is an Node.JS [ORM](https://en.wikipedia.org/wiki/Object-relational_mapping) for [key-value datastores](https://en.wikipedia.org/wiki/Key-value_database). **It is currently in beta**.

## Author

👤 **Greg Brimble**

- Github: [@GregBrimble](https://github.com/GregBrimble)
- Personal Website: [https://gregbrimble.com/](https://gregbrimble.com/)

## 🤝 Contributing

Contributions, issues and feature requests are welcome! Feel free to check [issues page](https://github.com/kv-orm/core/issues).

## 😍 Show your support

Please consider giving this project a <a href="https://github.com/kv-orm/core/stargazers" target="_blank" title="Thank you!">⭐️</a> if you use it, or if it provides some inspiration!

# Supported Datastores

- In-Memory
- [Cloudflare Workers KV](https://github.com/kv-orm/cf-workers)

If there is any other datastore that you'd like to see supported, please [create an issue](https://github.com/kv-orm/core/issues/new), or [make a pull request](https://github.com/kv-orm/core/fork).

# Features

- Support for multiple key-value datastores in a single application.

  ```typescript
  import { MemoryDatastore } from "@kv-orm/core";

  const libraryDatastore = new MemoryDatastore();
  const applicationSecrets = new MemoryDatastore();
  ```

  See above for the full list of [Supported Datastores](#Supported%20Datastores).

- Easy construction of typed Entities using [Typescript](https://www.typescriptlang.org/).

  ```typescript
  import { Column, Entity } from "@kv-orm/core";

  @Entity({ datastore: libraryDatastore })
  class Author {
    @Column()
    public firstName: string;

    @Column()
    public lastName: string;

    // ...
  }
  ```

- On-demand, asynchronous, lazy-loading: [kv-orm] won't load properties of an Entity until they're needed, and will do so seamlessly at the time of lookup.

  ```typescript
  import { getRepository } from "@kv-orm/core";

  const authorRepository = getRepository(Author);

  let author = await authorRepository.load("william@shakespeare.com"); // 1ms - no properties of the author have been loaded

  console.log(await author.firstName); // 60ms - author.firstName is fetched
  ```

- No unnecessary reads: if a property is already in memory, [kv-orm] won't look it up again unless it needs to.

  ```typescript
  let author = await authorRepository.load("william@shakespeare.com");

  console.log(await author.lastName); // 60ms - author.lastName is fetched
  console.log(await author.lastName); // 1ms - author.lastName is retrieved from memory (no lookup performed)
  ```

- Indexable and Unique Columns allowing quick lookups for specific entity instances:

  ```typescript
  import { UniqueColumn, IndexableColumn } from "@kv-orm/core";

  @Entity({ datastore: libraryDatastore })
  class Author {
    // ...

    @IndexableColumn()
    public birthYear: number;

    @UniqueColumn()
    public phoneNumber: string;
    // ...
  }

  let authors = await authorRepository.search("birthYear", 1564); // An AsyncGenerator yielding authors born in 1564
  let author = await authorRepository.find("phoneNumber", "+1234567890"); // A single author with the phone number +1234567890
  ```

- Relationships (\*-to-one & \*-to-many) with backref support, and on-update & on-delete cascading.

  ```typescript
  import { ToOne, ToMany } from "@kv-orm/core";

  @Entity({ datastore: libraryDatastore })
  class Author {
    // ...

    @ToOne({ type: Book, backRef: "author", cascade: true })
    public books: Book[];

    // ...
  }

  @Entity({ datastore: libraryDatastore })
  class Book {
    @ToMany({ type: Author, backRef: "books", cascade: true })
    public author: Author;

    // ...
  }
  ```

# Usage

## Install

```sh
npm install --save @kv-orm/core
```

## Datastores

### `MemoryDatastore`

`MemoryDatastore` is inbuilt into `@kv-orm/core`. It is a simple in-memory key-value datastore, and can be used for prototyping applications.

```typescript
import { MemoryDatastore } from `@kv-orm/core`;

const libraryDatastore = new MemoryDatastore();
```

### Cloudflare Workers KV

See [`@kv-orm/cf-workers`](https://github.com/kv-orm/cf-workers) for more information.

## Entities

An Entity is an object which stores data about something e.g. an Author. The Entity decorator takes a datastore to save the Entity instances into.

Optionally, you can also pass in a `key` to the decorator, to rename the key name in the datastore.

You can initialize a new instance of the Entity as normal.

```typescript
import { Entity } from "@kv-orm/core";

@Entity({ datastore: libraryDatastore, key: "Author" })
class Author {
  // ...
}

const authorInstance = new Author();
```

## Columns

Using the `@Column()` decorator on an Entity property is how you mark it as a savable property. You must `await` their value. This is because it might need to asynchronously query the datastore, if it doesn't have the value in memory.

Like with Entities, you can optionally pass in a `key` to the decorator.

```typescript
import {
  Column,
  PrimaryColumn,
  UniqueColumn,
  IndexableColumn,
} from "@kv-orm/core";
import { Book } from "./Book";

@Entity({ datastore: libraryDatastore })
class Author {
  @Column({ key: "givenName" })
  public firstName: string;

  @Column()
  public lastName: string;

  @Column()
  public nickName: string | undefined;

  @PrimaryColumn()
  public emailAddress: string;

  @IndexableColumn()
  public birthYear: number;

  @UniqueColumn()
  public phoneNumber: string;

  public someUnsavedProperty: any;

  @ToMany({ type: () => Book, backRef: "author", cascade: true }) // More on this later
  public books: Book[] = [];

  public constructor({
    firstName,
    lastName,
    emailAddress,
    birthYear,
    phoneNumber,
  }: {
    firstName: string;
    lastName: string;
    emailAddress: string;
    birthYear: number;
    phoneNumber: string;
  }) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.emailAddress = emailAddress;
    this.birthYear = birthYear;
    this.phoneNumber = phoneNumber;
  }
}

const williamShakespeare = new Author({
  firstName: "William",
  lastName: "Shakespeare",
  emailAddress: "william@shakespeare.com",
  birthYear: 1564,
  phoneNumber: "+1234567890",
});
williamShakespeare.nickName = "Bill";
williamShakespeare.someUnsavedProperty = "Won't get saved!";

// When in an async function, you can fetch the value with `await`
(async () => {
  console.log(await author.firstName);
})();
```

### Primary Columns

Any non-singleton class needs a PrimaryColumn used to differentiate Entity instances. For this reason, **PrimaryColumn values are required and must be unique**.

```typescript
@Entity({ datastore: libraryDatastore })
class Author {
  // ...

  @PrimaryColumn()
  public emailAddress: string;

  // ...
}
```

An example of a singleton class where you do not need a PrimaryColumn, might be a global configuration Entity where you store application secrets (e.g. API keys).

### Indexable Columns

An IndexableColumn can be used to mark a property as one which you may wish to later lookup with. For example, in SQL, you might perform the following query: `SELECT * FROM Author WHERE birthYear = 1564`. In [kv-orm], you can lookup Entity instances with a given IndexableColumn value with a repository's [search](#Search) method

```typescript
@Entity({ datastore: libraryDatastore })
class Author {
  // ...

  @IndexableColumn()
  public birthYear: number;

  // ...
}
```

IndexableColumn types should be used to store non-unique values.

### Unique Columns

Columns with unique values can be setup with UniqueColumn. This is more efficient that an IndexableColumn, and the [loading mechanism](#Find) is simpler.

```typescript
@Entity({ datastore: libraryDatastore })
class Author {
  // ...

  @UniqueColumn()
  public phoneNumber: number;

  // ...
}
```

### Property Getters/Setters

If your property is particularly complex (i.e. can't be stored natively in the datastore), you may wish to use a property getter/setter for a Column, to allow you to serialize it before saving in the datastore.

For example, let's say you have a complex property on `Author`, `somethingComplex`:

```typescript
@Entity({ datastore: libraryDatastore })
class Author {
  // ...

  @Column()
  private _complex: string = ""; // place to store serialized value of somethingComplex

  set somethingComplex(value: any) {
    // function serialize(value: any): string
    this._complex = serialize(value);
  }
  get somethingComplex(): any {
    // function deserialize(serializedValue: string): any
    return (async () => deserialize(await this._complex))();
  }

  // ...
}
```

## Repositories

To actually interact with the datastore, you'll need a Repository.

```typescript
import { getRepository } from "@kv-orm/core";

const authorRepository = getRepository(Author);
```

### Save

You can then save Entity instances.

```typescript
const williamShakespeare = new Author({
  firstName: "William",
  lastName: "Shakespeare",
  emailAddress: "william@shakespeare.com",
  birthYear: 1564,
  phoneNumber: "+1234567890",
});

await authorRepository.save(williamShakepseare);
```

### Load

And subsequently, load them back again. If the Entity has a PrimaryColumn, you can load the specific instance by passing in the PrimaryColumn value.

```typescript
const loadedWilliamShakespeare = await authorRepository.load(
  "william@shakespeare.com"
);

console.log(await loadedWilliamShakespeare.nickName); // Bill
```

### Search

If a property has been set as an IndexableColumn (is non-unique), you can search for instances with a saved value.

```typescript
const searchedAuthors = await authorRepository.search("birthYear", 1564);

for await (const searchedAuthor of searchedAuthors) {
  console.log(await searchedAuthor.nickName); // Bill
}
```

### Find

If a property has been set as a UniqueColumn, you can directly load an instance by a saved value. If no results are found, `null` is returned.

```typescript
const foundWilliamShakespeare = await authorRepository.find(
  "phoneNumber",
  "+1234567890"
);

console.log(await foundWilliamShakespeare?.nickName); // Bill

const foundNonexistent = await authorRepository.find(
  "phoneNumber",
  "+9999999999"
);

console.log(foundNonexistent); // null
```

## Relationships

All Relationships must supply the `type` of Entity as a function (to allow circular dependencies) and a `backRef` (the property name on the inverse-side of the Relationship).

In order to propagate changes automatically on update and on delete, `cascade` can be set to `true`.

Note: deleting may be disproportionally intensive as it load, and then must edit or delete every related instance.

### One To One / Many To One

For \* to one Relationships, use the ToOne decorator.

```typescript
import { Author, authorRepository } from "./Author";

@Entity({ datastore: libraryDatastore })
class Book {
  // ...

  @ToOne({ type: () => Author, backRef: "books", cascade: true })
  public author: Author;

  // ...
}

const bookRepository = getRepository(Book);

const williamShakespeare = await authorRepository.load(
  "william@shakespeare.com"
);

const hamlet = new Book({ title: "Hamlet", author: williamShakespeare });

console.log((await hamlet.author) === williamShakespeare); // true

// And because `cascade` was set to `true`, the Author instance has been updated as well
const books = await williamShakespeare.books;
for await (const book of books) {
  console.log(await book.title); // Hamlet
}

await bookRepository.save(hamlet); // Will also save williamShakespeare
```

### One To Many / Many To Many

ToMany Relationships are slightly different to how Columns and ToOne Relationships work. Instead of setting its value and awaiting a Promise of its value, ToMany Relationships set an array of values, and await a Promise of an [AsyncGenerator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of) which yields its values.

```typescript
@Entity({ datastore: libraryDatastore })
class Author {
  // ...

  @ToMany({ type: () => Book, backRef: "author", cascade: true }) // More on this later
  public books: Book[] = [];

  // ...
}

// ...

const hamlet = new Book({ title: "Hamlet" });

williamShakespeare.books = [hamlet];

const books = await williamShakespeare.books;
for await (const book of books) {
  console.log(await book.title); // Hamlet
}

// And because `cascade` was set to `true`, the Book instance has been updated as well
console.log((await hamlet.author) === williamShakespeare); // true - because `cascade` is set to true

await authorRepository.save(williamShakespeare); // Will also save hamlet
```

Note: The order of returned Entities by the AsyncGenerator is not guaranteed. In fact, as items are loaded into memory, they will be pushed to the front to ensure tha other Entities are loaded only as needed.

#### Helpers

To simplify interacting with `ToMany` Relationships, some helpers are available.

Note: saving must still be completed afterwards to persist changes.

##### `addTo`

`addTo` simplifies pushing an element to a ToMany relaionship:

```typescript
import { addTo } from "@kv-orm/core";

addTo(williamShakespeare, "books", hamlet);
```

##### `removeFrom`

`removeFrom` simplifies splicing an element from a ToMany relaionship:

```typescript
import { removeFrom } from "@kv-orm/core";

removeFrom(williamShakespeare, "books", hamlet);
```

# Types

## `columnType`

When defining an Entity in TypeScript, you must provide types for the properties. For example, `firstName` and `lastName` are set as `string`s:

```typescript
import { Column, Entity } from "@kv-orm/core";

@Entity({ datastore: libraryDatastore })
class Author {
  @Column()
  public firstName: string;

  @Column()
  public lastName: string;

  // ...
}
```

However, when reading these values with kv-orm, in fact a `Promise<string>` is returned. Simply switching these type definitions to `Promise<T>` is not valid either, as writing values is done synchronously.

Therefore, to improve the developer experience and prevent TypeScript errors such as `'await' has no effect on the type of this expression. ts(80007)` and `Property 'then' does not exist on type 'T'. ts(2339)`, when declaring the Entity, wrap the property types in the `columnType` helper. In the same example:

```typescript
import { columnType } from "@kv-orm/core";

@Entity({ datastore: libraryDatastore })
class Author {
  @Column()
  public firstName: columnType<string>;

  @Column()
  public lastName: columnType<string>;

  // ...
}
```

`columnType` is simply an alias: `type columnType<T> = T | Promise<T>`.

## `toOneType`

Similarly, for ToOne Relationships:

```typescript
import { toOneType } from "@kv-orm/core";

@Entity({ datastore: libraryDatastore })
class Book {
  // ...

  @ToOne({ type: () => Author, backRef: "books", cascade: true })
  public author: toOneType<Author>;

  // ...
}
```

## `toManyType`

And ToMany Relationships:

```typescript
import { toManyType } from "@kv-orm/core";

@Entity({ datastore: libraryDatastore })
class Author {
  // ...

  @ToMany({ type: () => Book, backRef: "author", cascade: true })
  public books: toManyType<Book>;

  // ...
}
```

# Development

## Clone and Install Dependencies

```sh
git clone git@github.com:kv-orm/core.git
npm install
```

## Run tests

```sh
npm run lint  # 'npm run lint:fix' will automatically fix most problems
npm test
```

## 🚎 Roadmap

<a href="https://github.com/kv-orm/core/issues?q=is%3Aopen+is%3Aissue+label%3Aenhancement" target="_blank">
  <img alt="Features" src="https://img.shields.io/github/issues/kv-orm/core/enhancement?color=%2335a501&label=Features&logo=github&style=plastic" />
</a>

<a href="https://github.com/kv-orm/core/issues?q=is%3Aopen+is%3Aissue+label%3Abug" target="_blank">
  <img alt="Bugs" src="https://img.shields.io/github/issues/kv-orm/core/bug?color=%23d73a4a&label=Bugs&logo=github&style=plastic" />
</a>

## 📝 License

Copyright © 2019 [Greg Brimble](https://github.com/GregBrimble).<br />
This project is [MIT](https://github.com/kv-orm/core/blob/master/LICENSE) licensed.

# FAQs

## My Entity keys are getting mangled when they are saved into the datastore

If you're using a preprocessor that minifies class names, such as Babel, the class constructors names often get shortened. kv-orm will always use this class name, so, either disable minification in the preprocessor, or manually set the `key` value when creating an Entity e.g.

```typescript
@Entity({ key: "MyClass" })
class MyClass {
  // ...
}
```

## How can I upgrade from the alpha (0.0.X)?

Thank you for trying out kv-orm in it's alpha period! Thanks to a generous sponsor, I have been able to complete work to elevate [kv-orm] to a more featureful beta. Unfortunately, this has meant a couple of minor breaking changes.

- [`PrimaryColumn`](#Primary-Column), [`IndexableColumn`](#Indexable-Column) and [`UniqueColumn`](#Unique-Column) have been introduced to deprecate the `isPrimary`, `isIndexable` and `isUnique` options on the `Column` decorator.

- `Repository`'s `find` method has been renamted to [`search`](#Search), and a different, new function [`find`](#Find) been added.

  This is probably the most confusing and frustrating breaking change (apologies—I will take efforts to make sure this doesn't happen again). With the introduction of `UniqueColumn` as a more specific type of `IndexableColumn`, we needed a way to take advantage of its simpler loading mechanism. Since `UniqueColumn` has unique-values, there should be only ever one instance with a given value (or none), and so `find` seemed a more appropriate verb for its loading. Whereas `IndexableColumn` can have non-unique values, `search` seemed more appropriate a verb when returning an `AsyncGenerator` of instances.

- [`ToOne`](#To-One) & [`ToMany`](#To-Many) have been formally introduced (renamed from their drafted `ManyToOne` & `ManyToMany` names—the parent's cardinality does not matter).

- Various bugfixes and improvements. None should have unexpected breaking changes, but if I've missed a use-case, please file a [GitHub Issue](https://github.com/kv-orm/core/issues) and tell me about it.

[kv-orm]: https://github.com/kv-orm/core
