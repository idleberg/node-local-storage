import assert from 'node:assert';
import { beforeEach, test } from 'node:test';
import { createLocalStorage, createSessionStorage } from '../src/index.ts';

// Helpers
import { randomUUID } from 'node:crypto';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';

const dbFile = resolve(tmpdir(), `${randomUUID()}.sqlite`);

[
	{
		type: 'localStorage',
		storage: createLocalStorage(dbFile)[0],
	},
	{
		type: 'sessionStorage',
		storage: createSessionStorage()[0],
	},
].map(({ type, storage }) => {
	beforeEach(() => {
		storage.clear();
	});

	test(`${type}.clear()`, () => {
		storage.setItem('demo', 'Hello, world!');
		storage.clear();

		const actual = storage.getItem('demo');
		const expected = null;

		assert.equal(actual, expected);
	});

	test(`${type}.key() - Valid Index`, () => {
		const expected = 'demo';
		storage.setItem(expected, 'Hello, world!');

		const actual = storage.key(0);

		assert.equal(actual, expected);;
	});

	test(`${type}.key() - Invalid Index`, () => {
		storage.setItem('demo', 'Hello, world');

		const actual = storage.key(1);

		assert.equal(actual, null);
	});

	test(`${type}.key() - Valid Fraction Index`, () => {
		const expected = 'demo';
		storage.setItem(expected, 'Hello, world');

		const actual = storage.key(0.1);

		assert.equal(actual, expected);;
	});

	test(`${type}.key() - Invalid Fraction Index`, () => {
		storage.setItem('demo', 'Hello, world');

		const actual = storage.key(1.1);

		assert.equal(actual, null);
	});

	test(`${type}.length() - 0`, () => {
		storage.setItem('demo', 'Hello, world!');
		storage.clear();

		const actual = storage.length;
		const expected = 0;

		assert.equal(actual, expected);;
	});

	test(`${type}.length() - 1`, () => {
		storage.setItem('demo', 'Hello, world!');

		const actual = storage.length;
		const expected = 1;

		assert.equal(actual, expected);;
	});

	test(`${type}.removeItem()`, () => {
		storage.setItem('demo', 'Hello, world!');
		storage.removeItem('demo');
		const actual = storage.getItem('demo');

		assert.equal(actual, null);
	});

	test(`${type}.*etItem() - String`, () => {
		const expected = 'Hello, world!';
		storage.setItem('demo', expected);
		const actual = storage.getItem('demo');

		assert.equal(actual, expected);;
	});

	test(`${type}.*etItem() - Number`, () => {
		const expected = 1;
		storage.setItem('demo', expected);
		const actual = storage.getItem('demo');

		assert.equal(actual, String(expected));
	});

	test(`${type}.*etItem() - Boolean`, () => {
		const expected = true;
		storage.setItem('demo', expected);
		const actual = storage.getItem('demo');

		assert.equal(actual, String(expected));
	});

	test(`${type}.*etItem() - Null`, () => {
		const expected = null;
		storage.setItem('demo', expected);
		const actual = storage.getItem('demo');

		assert(actual, String(expected));
	});

	test(`${type}.*etItem() - Object`, () => {
		const expected = {};
		storage.setItem('demo', expected);
		const actual = storage.getItem('demo');

		assert(actual, String(expected));
	});

	test(`${type}.*etItem() - Undefined`, () => {
		const expected = undefined;
		storage.setItem('demo', expected);
		const actual = storage.getItem('demo');

		assert(actual, String(expected));
	});

	test(`${type}.*etItem() - BigInt`, () => {
		const expected = BigInt('1');
		storage.setItem('demo', expected);
		const actual = storage.getItem('demo');

		assert(actual, String(expected));
	});

	test(`${type}.*etItem() - Symbol`, () => {
		const expected = Symbol('foo');
		storage.setItem('demo', expected);
		const actual = storage.getItem('demo');

		assert(actual, String(expected));
	});
});
