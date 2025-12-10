import assert from 'node:assert';
import { randomUUID } from 'node:crypto';
import { existsSync, unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { test } from 'node:test';
import { createStorage } from '../src/index.ts';

test('defaults to in-memory when no filename provided', () => {
	const { localStorage, sessionStorage } = createStorage();

	localStorage.setItem('test', 'value');
	sessionStorage.setItem('test', 'value');

	assert.equal(localStorage.getItem('test'), 'value');
	assert.equal(sessionStorage.getItem('test'), 'value');
});

test('empty string defaults to in-memory', () => {
	const { localStorage } = createStorage('');

	localStorage.setItem('test', 'value');

	assert.equal(localStorage.getItem('test'), 'value');
});

test('creates persistent storage', () => {
	const dbFile = resolve(tmpdir(), `${randomUUID()}.sqlite`);

	const { localStorage } = createStorage(dbFile);
	localStorage.setItem('test', 'value');

	assert.equal(existsSync(dbFile), true);

	unlinkSync(dbFile);
});

test('explicitly creates in-memory storage', () => {
	const { localStorage } = createStorage(':memory:');

	localStorage.setItem('test', 'value');

	assert.equal(localStorage.getItem('test'), 'value');
});
