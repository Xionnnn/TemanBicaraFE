const assert = require('node:assert/strict');
const { test } = require('node:test');
const { pageWithFixedSlots } = require('../src/catalog/paging.ts');

const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];

test('reserves the first slot on every page', () => {
  assert.deepEqual(pageWithFixedSlots(letters, 0, 4, 1), { items: ['a', 'b', 'c'], page: 0, totalPages: 3 });
  assert.deepEqual(pageWithFixedSlots(letters, 1, 4, 1), { items: ['d', 'e', 'f'], page: 1, totalPages: 3 });
  assert.deepEqual(pageWithFixedSlots(letters, 2, 4, 1), { items: ['g'], page: 2, totalPages: 3 });
});

test('clamps out-of-range pages', () => {
  assert.equal(pageWithFixedSlots(letters, -3, 4, 1).page, 0);
  assert.deepEqual(pageWithFixedSlots(letters, 99, 4, 1).items, ['g']);
});

test('an empty list still has one page for the fixed tile', () => {
  assert.deepEqual(pageWithFixedSlots([], 0, 4, 1), { items: [], page: 0, totalPages: 1 });
  assert.deepEqual(pageWithFixedSlots([], 0, 3, 1).totalPages, 1);
});

test('a full last page does not create an extra empty page', () => {
  assert.equal(pageWithFixedSlots(['a', 'b', 'c', 'd'], 0, 3, 1).totalPages, 2);
  assert.equal(pageWithFixedSlots(['a', 'b', 'c', 'd', 'e', 'f'], 0, 4, 1).totalPages, 2);
});
