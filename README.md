# @idleberg/local-storage

> A NodeJS ponyfill for the Storage API, utilizing SQLite.

[![License](https://img.shields.io/github/license/idleberg/node-local-storage?color=blue&style=for-the-badge)](https://github.com/idleberg/node-local-storage/blob/main/LICENSE)
[![Version](https://img.shields.io/npm/v/@idleberg/local-storage?style=for-the-badge)](https://www.npmjs.org/package/@idleberg/local-storage)
[![Build](https://img.shields.io/github/actions/workflow/status/idleberg/node-local-storage/test.yml?style=for-the-badge)](https://github.com/idleberg/node-local-storage/actions)

## Features

-   zero dependencies
-   fully API compatible to both, `localStorage` and `sessionStorage`
-   persists data across sessions
-   supports `storage` events

> [!NOTE]
> This module depends on experimental `node:sqlite` module included in NodeJS v22.5 and later.

## Installation

`npm install @idleberg/local-storage`

## Usage

### API

#### `createLocalStorage`

Usage: `createLocalStorage(dbFile: string)`  
Returns: `[Storage, EventEmitter]`

Creates an instance of the [`localStorage`](https://developer.mozilla.org/docs/Web/API/Window/localStorage) API and a corresponding EventEmitter.

**Example:**

```typescript
import { createLocalStorage } from "@idleberg/local-storage";

const [localStorage, emitter] = createLocalStorage("./db.sqlite");

// Listen for storage changes
emitter.on("storage", console.log);
```

#### `createSessionStorage`

Usage: `createSessionStorage()`  
Returns: `[Storage, EventEmitter]`

Creates an instance of the [`sessionStorage`](https://developer.mozilla.org/docs/Web/API/Window/sessionStorage) API and a corresponding EventEmitter.

**Example:**

```typescript
import { createSessionStorage } from "@idleberg/local-storage";

const [sessionStorage, emitter] = createSessionStorage();

// Listen for storage changes
emitter.on("storage", console.log);
```

#### `Storage` (Advanced Usage)

Usage: `new Storage(filePath: string | ':memory:', options: StorageEventOptions)`

This class is used internally by both of the above factory functions. However, instantiating the class allows you more control over the EventEmitter, i.e. you could re-use an existing one from your application code.

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

-   [`bun-storage`](https://www.npmjs.com/package/bun-storage): a Bun implementation of this package

## License

This work is licensed under [The MIT License](https://opensource.org/licenses/MIT).
