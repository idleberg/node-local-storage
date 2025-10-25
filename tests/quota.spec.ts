import assert from 'node:assert';
import { randomUUID } from 'node:crypto';
import { EventEmitter } from 'node:events';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { describe, test } from 'node:test';
import { createStorage, Storage } from '../src/index.ts';

const dbFile = resolve(tmpdir(), `${randomUUID()}.sqlite`);

describe('Storage with quota - enforces 5MB limit', () => {
	const { sessionStorage, localStorage } = createStorage(dbFile, { quota: 5 * 1024 * 1024 });

	[
		{
			type: 'sessionStorage',
			storage: sessionStorage,
		},
		{
			type: 'localStorage',
			storage: localStorage,
		},
	].forEach(({ type, storage }) => {
		test(type, () => {
			storage.clear();

			// Store ~4.9MB of data (should succeed)
			const largeValue = 'x'.repeat(2.45 * 1024 * 1024); // ~2.45M chars = ~4.9MB in UTF-16
			storage.setItem('key1', largeValue);

			assert.equal(storage.getItem('key1'), largeValue);

			// Try to add more data that would exceed 5MB (should throw)
			const extraValue = 'y'.repeat(100 * 1024); // ~100K chars = ~200KB
			assert.throws(() => storage.setItem('key2', extraValue));
		});
	});
});

describe('Storage with quota - enforces limit', () => {
	const { sessionStorage, localStorage } = createStorage(dbFile, { quota: 1024 * 1024 }); // 1MB

	[
		{
			type: 'sessionStorage',
			storage: sessionStorage,
		},
		{
			type: 'localStorage',
			storage: localStorage,
		},
	].forEach(({ type, storage }) => {
		test(type, () => {
			storage.clear();

			// Store ~0.9MB of data (should succeed)
			const largeValue = 'x'.repeat(450 * 1024); // ~450K chars = ~0.9MB in UTF-16
			storage.setItem('key1', largeValue);

			assert.equal(storage.getItem('key1'), largeValue);

			// Try to add more data that would exceed 1MB (should throw)
			const extraValue = 'y'.repeat(100 * 1024); // ~100K chars = ~200KB
			assert.throws(() => storage.setItem('key2', extraValue));
		});
	});
});

describe('Storage with no quota - allows unlimited storage', () => {
	const { sessionStorage, localStorage } = createStorage(dbFile);

	[
		{
			type: 'sessionStorage',
			storage: sessionStorage,
		},
		{
			type: 'localStorage',
			storage: localStorage,
		},
	].forEach(({ type, storage }) => {
		test(type, () => {
			storage.clear();

			// Store a very large amount of data (should succeed)
			const largeValue = 'x'.repeat(10 * 1024 * 1024); // ~10M chars = ~20MB in UTF-16
			storage.setItem('key1', largeValue);

			assert.equal(storage.getItem('key1'), largeValue);
		});
	});
});

describe('Storage quota - updating existing key with larger value', () => {
	const { sessionStorage, localStorage } = createStorage(dbFile, { quota: 100 * 1024 }); // 100KB

	[
		{
			type: 'sessionStorage',
			storage: sessionStorage,
		},
		{
			type: 'localStorage',
			storage: localStorage,
		},
	].forEach(({ type, storage }) => {
		test(type, () => {
			storage.clear();

			// Store initial value
			const smallValue = 'x'.repeat(10 * 1024); // ~10K chars = ~20KB
			storage.setItem('key1', smallValue);

			// Update with larger value that still fits (should succeed)
			const mediumValue = 'y'.repeat(40 * 1024); // ~40K chars = ~80KB
			storage.setItem('key1', mediumValue);
			assert.equal(storage.getItem('key1'), mediumValue);

			// Update with value that exceeds quota (should throw)
			const largeValue = 'z'.repeat(60 * 1024); // ~60K chars = ~120KB
			assert.throws(() => storage.setItem('key1', largeValue));
		});
	});
});

describe('Storage quota - key length counts toward quota', () => {
	const { sessionStorage, localStorage } = createStorage(dbFile, { quota: 1024 }); // 1KB

	[
		{
			type: 'sessionStorage',
			storage: sessionStorage,
		},
		{
			type: 'localStorage',
			storage: localStorage,
		},
	].forEach(({ type, storage }) => {
		test(type, () => {
			storage.clear();

			// Use a very long key name
			const longKey = 'k'.repeat(400); // ~400 chars = ~800 bytes
			const value = 'v'.repeat(50); // ~50 chars = ~100 bytes
			storage.setItem(longKey, value);

			// Key + value should be within quota
			assert.equal(storage.getItem(longKey), value);

			// Adding another item should exceed quota
			assert.throws(() => storage.setItem('key2', 'x'.repeat(100)));
		});
	});
});

describe('Storage quota - error message is correct', () => {
	const { sessionStorage, localStorage } = createStorage(dbFile, { quota: 100 }); // 100 bytes

	[
		{
			type: 'sessionStorage',
			storage: sessionStorage,
		},
		{
			type: 'localStorage',
			storage: localStorage,
		},
	].forEach(({ type, storage }) => {
		test(type, () => {
			storage.clear();

			try {
				storage.setItem('key', 'x'.repeat(100)); // ~100 chars = ~200 bytes
				throw new Error('Should have thrown');
			} catch (error) {
				assert.strictEqual((error as Error).name, 'QuotaExceededError');
				assert.match((error as Error).message, /exceeded the quota/);
				assert.match((error as Error).message, /key/);
			}
		});
	});
});

describe('Storage quota - multiple small items exceed quota', () => {
	const { sessionStorage, localStorage } = createStorage(dbFile, { quota: 1024 }); // 1KB

	[
		{
			type: 'sessionStorage',
			storage: sessionStorage,
		},
		{
			type: 'localStorage',
			storage: localStorage,
		},
	].forEach(({ type, storage }) => {
		test(type, () => {
			storage.clear();

			// Add multiple small items
			storage.setItem('key1', 'x'.repeat(100)); // ~200 bytes
			storage.setItem('key2', 'y'.repeat(100)); // ~200 bytes
			storage.setItem('key3', 'z'.repeat(100)); // ~200 bytes

			// Next item should exceed quota
			assert.throws(() => storage.setItem('key4', 'a'.repeat(200)));

			// Verify first 3 items are still there
			assert.equal(storage.getItem('key1'), 'x'.repeat(100));
			assert.equal(storage.getItem('key2'), 'y'.repeat(100));
			assert.equal(storage.getItem('key3'), 'z'.repeat(100));
		});
	});
});

describe('Storage quota - updating to smaller value frees space', () => {
	const { sessionStorage, localStorage } = createStorage(dbFile, { quota: 1024 }); // 1KB

	[
		{
			type: 'sessionStorage',
			storage: sessionStorage,
		},
		{
			type: 'localStorage',
			storage: localStorage,
		},
	].forEach(({ type, storage }) => {
		test(type, () => {
			storage.clear();

			// Fill almost to capacity
			storage.setItem('key1', 'x'.repeat(400)); // ~800 bytes

			// Can't add more
			assert.throws(() => storage.setItem('key2', 'y'.repeat(200)));

			// Update to smaller value
			storage.setItem('key1', 'x'.repeat(100)); // ~200 bytes

			// Now we can add more
			storage.setItem('key2', 'y'.repeat(200)); // ~400 bytes
			assert.equal(storage.getItem('key2'), 'y'.repeat(200));
		});
	});
});

test('Storage constructor with quota option', () => {
	const emitter = new EventEmitter();
	const storage = new Storage(dbFile, {
		emitter,
		quota: 2048,
	});

	storage.clear();
	// Should respect quota
	storage.setItem('key', 'x'.repeat(500)); // ~1000 bytes
	assert.throws(() => storage.setItem('key2', 'y'.repeat(1000))); // Would exceed 2048 bytes
});
