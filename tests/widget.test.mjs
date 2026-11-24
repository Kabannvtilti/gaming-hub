import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateSession, mountSessionCalculator } from '../js/widget.js';

test('calculates the example, initial state, and both valid limits', () => {
  assert.deepEqual(calculateSession('3', 'performance', true), {
    total: 410, hoursError: '', planError: '',
  });
  assert.equal(calculateSession('2', 'standard', false).total, 160);
  assert.equal(calculateSession('1', 'standard', false).total, 80);
  assert.equal(calculateSession('12', 'console', true).total, 1850);
});

for (const hours of ['', '0', '-5', '13', '2.5', '1e1', '1e309', '9999999999999999', 'abc']) {
  test(`rejects invalid hours ${JSON.stringify(hours)}`, () => {
    const result = calculateSession(hours, 'performance', true);
    assert.equal(result.total, null);
    assert.ok(result.hoursError);
    assert.equal(result.planError, '');
  });
}

test('distinguishes incomplete browser input from an intentionally empty field', () => {
  const empty = calculateSession('', 'standard', false).hoursError;
  const incomplete = calculateSession('', 'standard', false, true).hoursError;
  assert.notEqual(empty, incomplete);
});

for (const plan of ['', 'unknown', 'toString', '__proto__']) {
  test(`rejects invalid tariff ${JSON.stringify(plan)}`, () => {
    const result = calculateSession('2', plan, false);
    assert.equal(result.total, null);
    assert.ok(result.planError);
  });
}

test('skips incomplete widget markup without throwing', () => {
  assert.doesNotThrow(() => mountSessionCalculator({ querySelector: () => null }));
});
