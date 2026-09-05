const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const htmlPath = path.join(__dirname, '..', 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');

const configStart = html.indexOf("        const REFERENCE_DATE");
const configEnd = html.indexOf("        // ===== JANGAN UBAH KODE DI BAWAH INI =====", configStart);
const statusStart = html.indexOf("        function getACStatus(date)");
const statusEnd = html.indexOf("        function updateStatus()", statusStart);

assert.notEqual(configStart, -1, 'rotation config must remain in index.html');
assert.notEqual(configEnd, -1, 'rotation config boundary must remain in index.html');
assert.notEqual(statusStart, -1, 'getACStatus must remain in index.html');
assert.notEqual(statusEnd, -1, 'getACStatus boundary must remain in index.html');

const sandbox = {};
vm.runInNewContext(
  `${html.slice(configStart, configEnd)}\n${html.slice(statusStart, statusEnd)}\nthis.getACStatus = getACStatus;`,
  sandbox,
);

const getACStatus = sandbox.getACStatus;

assert.equal(
  getACStatus(new Date('2026-09-05T12:00:00')),
  'kanan',
  'the verified baseline date must keep AC kanan active',
);
assert.equal(
  getACStatus(new Date('2026-09-06T12:00:00')),
  'kiri',
  'the next calendar day must alternate to AC kiri, including Sunday',
);
assert.equal(
  getACStatus(new Date('2026-09-07T12:00:00')),
  'kanan',
  'the second calendar day after the baseline must alternate back to AC kanan',
);

console.log('rotation tests passed');
