import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

test('analytics loads only on the published website', () => {
  const html = fs.readFileSync('src/index.html', 'utf8');
  const code = html.match(/<script id="analytics">([\s\S]*?)<\/script>/)?.[1];
  assert.ok(code, 'Analytics initializer exists');
  for (const hostname of ['localhost', '127.0.0.1', 'example.com', 'ohmydevops.github.io']) {
    const scripts = [];
    const window = { location: { hostname } };
    vm.runInNewContext(code, { window, Date, document: {
      createElement: () => ({}), head: { appendChild: script => scripts.push(script) }
    }});
    assert.equal(scripts.length, hostname === 'ohmydevops.github.io' ? 1 : 0);
    if (scripts.length) {
      assert.equal(scripts[0].async, true);
      assert.ok(scripts[0].src.endsWith('id=G-7TJ3PRZWVX'));
      assert.equal(window.dataLayer[1][0], 'config');
      assert.equal(window.dataLayer[1][1], 'G-7TJ3PRZWVX');
    }
  }
});
