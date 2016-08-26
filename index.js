const Promise = require('promise');

module.exports = function jscg(key, defs, items, ctx) {
  return step.call({
    defs: defs,
    items: items || {},
    ctx: ctx
  }, key);
};

const step = function step(key) {
  if (key in this.items) {
    return this.items[key];
  }
  const def = this.defs[key];
  if (typeof def !== 'function') {
    return this.items[key] = Promise.resolve(def);
  }
  const args = parseargs(def).map(step, this);
  return this.items[key] = Promise.all(args).then(all => def.apply(this.ctx, all));
}

const ws = /\s+/g;
const arg = /^(function)?\(?([^\)\{\=]*)\)?(\{|\=\>)/;
const parseargs = fn => {
  const str = fn.toString().replace(ws, '').match(arg)[2];
  return str ? str.split(',') : [];
};

// console.log(parseargs(function (a, b, c) {}));
// console.log(parseargs(function (d) {}));
// console.log(parseargs(function () {}));
// console.log(parseargs((e, f, g) => {}));
// console.log(parseargs((h) => {}));
// console.log(parseargs(() => {}));
// console.log(parseargs((i, j, k) => i));
// console.log(parseargs((l) => i));
// console.log(parseargs(() => i));
// console.log(parseargs(m => {}));
// console.log(parseargs(n => n));

// module.exports('d', {
//   a: 'foo',
//   b: 42,
//   c: (a, b) => { return { a: a, b: b, c: 'lol' } },
//   d: c => new Promise(ok => setTimeout(() => ok(c), 200))
// }).then(console.log, console.error);
