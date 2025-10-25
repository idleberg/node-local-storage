import assert from 'node:assert';
// Helpers
import { randomUUID } from 'node:crypto';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { beforeEach, test } from 'node:test';
import { createStorage } from '../src/index.ts';

const dbFile = resolve(tmpdir(), `${randomUUID()}.sqlite`);
const { sessionStorage, localStorage, emitter } = createStorage(dbFile);

[
	{
		type: 'sessionStorage',
		storage: sessionStorage,
		emitter: emitter,
	},
	{
		type: 'localStorage',
		storage: localStorage,
		emitter: emitter,
	},
].forEach(({ type, storage, emitter }) => {
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
