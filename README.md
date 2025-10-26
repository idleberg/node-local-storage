# @idleberg/local-storage

> A NodeJS ponyfill for the Storage API, utilizing SQLite.

[![License](https://img.shields.io/github/license/idleberg/node-local-storage?color=blue&style=for-the-badge)](https://github.com/idleberg/node-local-storage/blob/main/LICENSE)
[![Version](https://img.shields.io/npm/v/@idleberg/local-storage?style=for-the-badge)](https://www.npmjs.org/package/@idleberg/local-storage)
![GitHub branch check runs](https://img.shields.io/github/check-runs/idleberg/node-local-storage/main?style=for-the-badge)

## Features

-   zero dependencies
-   fully API compatible to both, `localStorage` and `sessionStorage`
-   persists data across sessions
-   supports `storage` events
-   supports optional quota

> [!NOTE]
> This module depends on the experimental `node:sqlite` module included in NodeJS v22.5 and later.

## Installation

`npm install @idleberg/local-storage`

## Usage

### API

#### `createStorage`

Usage: `createStorage(dbFile: string, options?: StorageFactoryOptions)`  
Returns: `{ sessionStorage, localStorage, emitter }`

Creates instances of both, [`sessionStorage`][] and [`localStorage`][], as well as a corresponding EventEmitter.

**Example:**

```typescript
import { createStorage } from "@idleberg/local-storage";

const { sessionStorage, localStorage, emitter } = createStorage("./db.sqlite");

// Listen for storage changes
emitter.on("storage", console.log);
```

#### `Storage` (Advanced Usage)

Usage: `new Storage(filePath: string | ':memory:', options: StorageClassOptions)`

This class is used internally by the above factory functions. It allows you more control over the EventEmitter, e.g. you could re-use an existing one from your application code.

**Example:**

```typescript
import { Storage } from "@idleberg/local-storage";
import EventEmitter from "events";

const myEmitter = new EventEmitter();

const localStorage = new Storage("./db.sqlite", {
    emitter: myEmitter,
});

// Listen for storage changes
myEmitter.on("storage", console.log);
```

## Related

-   [bun-storage](https://www.npmjs.com/package/bun-storage): a Bun implementation of this package

## License

This work is licensed under [The MIT License](https://opensource.org/licenses/MIT).

[`localStorage`]: https://developer.mozilla.org/docs/Web/API/Window/localStorage
[`sessionStorage`]: https://developer.mozilla.org/docs/Web/API/Window/sessionStorage
