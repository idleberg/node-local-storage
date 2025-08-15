import assert from 'node:assert';
import { beforeEach, test } from 'node:test';
import { createLocalStorage, createSessionStorage, createStorages } from '../src/index.ts';

// Helpers
import { randomUUID } from 'node:crypto';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';

const dbFile = resolve(tmpdir(), `${randomUUID()}.sqlite`);

const [localStorage, localStorageEmitter] = createLocalStorage(dbFile);
const [sessionStorage, sessionStorageEmitter] = createSessionStorage();
const storages = createStorages(dbFile);

[
	{
		type: 'localStorage',
		storage: localStorage,
		emitter: localStorageEmitter,
	},
	{
		type: 'sessionStorage',
		storage: sessionStorage,
		emitter: sessionStorageEmitter,
	},
	{
		type: 'storages.localStorage',
		storage: storages.localStorage,
		emitter: storages.emitter,
	},
	{
		type: 'storages.sessionStorage',
		storage: storages.sessionStorage,
		emitter: storages.emitter,
	},
].map(({ type, storage, emitter }) => {
	beforeEach(() => {
		emitter.removeAllListeners();
		storage.clear();
	});

	test(`Event ${type}.clear()`, async () => {
		await new Promise<void>((resolve, reject) => {
			emitter.addListener('storage', (data) => {
				try {
					assert.deepEqual(data, {
						key: null,
						newValue: null,
						oldValue: null,
						storageArea: {},
						url: undefined,
					});
					resolve();
				} catch (error) {
					reject(error);
				}
			});

			storage.clear();
		});
	});

	test(`Event: ${type}.setItem()`, async () => {
		const key = randomUUID();

		await new Promise<void>((resolve, reject) => {
			emitter.addListener('storage', (data) => {
				try {
					assert.deepEqual(data, {
						key: 'demo',
						newValue: key,
						oldValue: null,
						storageArea: {
							demo: key,
						},
						url: undefined,
					});
					resolve();
				} catch (error) {
					reject(error);
				}
			});

			storage.setItem('demo', key);
		});
	});

	test(`${type}.removeItem()`, async () => {
		const key = randomUUID();
		storage.setItem('demo', key);

		await new Promise<void>((resolve, reject) => {
			emitter.addListener('storage', (data) => {
				try {
					assert.deepEqual(data, {
						key: 'demo',
						newValue: null,
						oldValue: key,
						storageArea: {},
						url: undefined,
					});
					resolve();
				} catch (error) {
					reject(error);
				}
			});

			storage.removeItem('demo');
		});
	});
});
