const test = require('node:test');
const assert = require('node:assert');
const { validateAnswers } = require('../validator.js');

test('validateAnswers edge cases', async (t) => {
  const schema = [
    { id: 'q_text', type: 'text', required: true },
    { id: 'q_bool', type: 'boolean', required: true },
    { id: 'q_check', type: 'checkbox', required: true, options: ['A', 'B'] },
    { id: 'q_num', type: 'number', required: true },
    { id: 'q_drop', type: 'dropdown', required: true, options: ['Y', 'N'] },
    { id: 'q_textarea', type: 'textarea', required: false },
  ];

  await t.test('required missing', () => {
    const res = validateAnswers(schema, {});
    assert.ok(res.errors);
    assert.strictEqual(res.errors.q_text, 'This field is required');
    assert.strictEqual(res.errors.q_bool, 'This field is required');
    assert.strictEqual(res.errors.q_check, 'This field is required');
    assert.strictEqual(res.errors.q_num, 'This field is required');
    assert.strictEqual(res.errors.q_drop, 'This field is required');
  });

  await t.test('required boolean answered false passes', () => {
    // Only q_bool is provided. Other required fields will fail, but q_bool should NOT have an error.
    const res = validateAnswers(schema, { q_bool: false });
    assert.ok(res.errors);
    assert.strictEqual(res.errors.q_bool, undefined);
  });

  await t.test('whitespace text fails', () => {
    const res = validateAnswers(schema, { q_text: '   ' });
    assert.ok(res.errors);
    assert.strictEqual(res.errors.q_text, 'This field is required');
  });

  await t.test('empty checkbox array fails', () => {
    const res = validateAnswers(schema, { q_check: [] });
    assert.ok(res.errors);
    assert.strictEqual(res.errors.q_check, 'This field is required');
  });

  await t.test('number must be typeof number and finite', () => {
    // String number must be rejected (frontend should convert to Number)
    const res1 = validateAnswers(schema, { q_num: '123' });
    assert.strictEqual(res1.errors.q_num, 'Must be a valid finite number');

    // Non-numeric string must be rejected
    const res2 = validateAnswers(schema, { q_num: 'abc' });
    assert.strictEqual(res2.errors.q_num, 'Must be a valid finite number');

    // NaN must be rejected
    const res3 = validateAnswers(schema, { q_num: NaN });
    assert.strictEqual(res3.errors.q_num, 'Must be a valid finite number');

    // Infinity must be rejected
    const res4 = validateAnswers(schema, { q_num: Infinity });
    assert.strictEqual(res4.errors.q_num, 'Must be a valid finite number');

    // Valid number must pass
    const res5 = validateAnswers(schema, { q_num: 123 });
    assert.strictEqual(res5.errors.q_num, undefined);

    // Zero must pass
    const res6 = validateAnswers(schema, { q_num: 0 });
    assert.strictEqual(res6.errors.q_num, undefined);

    // Negative number must pass
    const res7 = validateAnswers(schema, { q_num: -5 });
    assert.strictEqual(res7.errors.q_num, undefined);
  });

  await t.test('dropdown value in options', () => {
    const res = validateAnswers(schema, { q_drop: 'X' });
    assert.strictEqual(res.errors.q_drop, 'Invalid option selected');
    
    const res2 = validateAnswers(schema, { q_drop: 'Y' });
    assert.strictEqual(res2.errors.q_drop, undefined);
  });

  await t.test('checkbox value in options', () => {
    const res = validateAnswers(schema, { q_check: ['A', 'C'] });
    assert.strictEqual(res.errors.q_check, 'Invalid options: C');

    // Valid selections pass
    const res2 = validateAnswers(schema, { q_check: ['A', 'B'] });
    assert.strictEqual(res2.errors.q_check, undefined);
  });

  await t.test('checkbox must be an array', () => {
    const res = validateAnswers(schema, { q_check: 'A' });
    assert.strictEqual(res.errors.q_check, 'Must be an array of selections');
  });

  await t.test('unknown question IDs rejected', () => {
    const res = validateAnswers(schema, { unknown: 'value' });
    assert.strictEqual(res.errors.unknown, 'Unknown question ID');
  });

  await t.test('boolean must be typeof boolean', () => {
    const res = validateAnswers(schema, { q_bool: 'true' });
    assert.strictEqual(res.errors.q_bool, 'Must be a boolean (true/false)');

    const res2 = validateAnswers(schema, { q_bool: 1 });
    assert.strictEqual(res2.errors.q_bool, 'Must be a boolean (true/false)');
  });

  await t.test('text must be typeof string', () => {
    const res = validateAnswers(schema, { q_text: 123 });
    assert.strictEqual(res.errors.q_text, 'Must be text');
  });

  await t.test('optional fields accept empty values', () => {
    // textarea is optional — should not error when empty
    const res = validateAnswers(schema, { q_textarea: '' });
    assert.strictEqual(res.errors.q_textarea, undefined);
  });

  await t.test('all valid answers pass', () => {
    const res = validateAnswers(schema, {
      q_text: 'John Doe',
      q_bool: true,
      q_check: ['A'],
      q_num: 5,
      q_drop: 'Y',
    });
    assert.strictEqual(res, null);
  });
});
