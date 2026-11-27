// DSA Studio IUH — Automated Verification Suite (5,800 Questions + 250 Random Scenarios + Edge Cases)
// Ported from DSA_Studio/src/Tests.cs

'use strict';

const Lessons = require('../js/lessons.js');
const Algo = require('../js/algorithms.js');
const Questions = require('../js/questions.js');

let assertions = 0;

function assert(cond, msg) {
  assertions++;
  if (!cond) throw new Error('ASSERTION FAILED: ' + msg);
}

function balanced(n) {
  return !n || (Math.abs(Algo.bf(n)) <= 1 && balanced(n.l) && balanced(n.r));
}

function seqEqual(a, b, name) {
  assert(
    a.length === b.length && a.every((v, i) => v === b[i]),
    `${name}: [${a.join(', ')}] != [${b.join(', ')}]`
  );
}

function mulberry32(seed) {
  let s = seed >>> 0;
  return () => {
    s += 0x6D2B79F5;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function run() {
  // 1. Lessons check
  assert(Array.isArray(Lessons) && Lessons.length === 29, '29 lessons loaded');
  Lessons.forEach((l, i) => {
    assert(l.id === i + 1, `Lesson id ${l.id}`);
    assert(l.title && l.problem && Array.isArray(l.reasoning) && Array.isArray(l.solution) && l.tip && l.answer, `Lesson ${l.id} fields`);
  });

  // 2. 5,800 generated questions across 29 types x 200 seeds
  for (let type = 1; type <= 29; type++) {
    for (let seed = 0; seed < 200; seed++) {
      const q = Questions.make(type, seed + 1, seed % 3);
      assert(q.options.length === 4, `4 choices type ${type} seed ${seed}`);
      assert(new Set(q.options).size === 4, `Unique choices type ${type} seed ${seed}`);
      assert(q.options.filter((x) => x === q.correct).length === 1, `One exact answer type ${type} seed ${seed}`);
      assert(typeof q.explanation === 'string' && q.explanation.trim().length > 0, `Explanation type ${type}`);

      const treeSteps = q.trace.filter((x) => x.kind === 'tree');
      if (treeSteps.length > 0 && type !== 21) {
        treeSteps.forEach((step) => {
          const order = Algo.walk(step.tree, 'LNR');
          seqEqual(order, order.slice().sort((x, y) => x - y), `BST invariant type ${type}`);
        });
      }
      if (type === 28 || type === 29) {
        assert(balanced(q.trace[q.trace.length - 1].tree), `AVL final balance type ${type}`);
      }
    }
  }

  // 3. 250 randomized sorting & tree scenarios
  const rand = mulberry32(701);
  for (let i = 0; i < 250; i++) {
    const pool = Array.from({ length: 45 }, (_, k) => k + 1);
    for (let j = pool.length - 1; j > 0; j--) {
      const k = Math.floor(rand() * (j + 1));
      const tmp = pool[j]; pool[j] = pool[k]; pool[k] = tmp;
    }
    const a = pool.slice(0, 10);
    const sorted = a.slice().sort((x, y) => x - y);

    ['Bubble', 'Selection', 'Insertion', 'Interchange'].forEach((mode) => {
      const trace = Algo.sort(a, mode);
      seqEqual(trace[trace.length - 1].values, sorted, `Sorted ${mode}`);
      if (mode !== 'Insertion') {
        trace.forEach((step) => {
          seqEqual(step.values.slice().sort((x, y) => x - y), sorted, `Permutation ${mode}`);
        });
      }
    });

    const expected = Algo.build(a, true);
    const steps = Algo.treeTrace(a, true, null);
    assert(steps.some((s) => s.probe !== null), 'AVL search-path probe steps emitted');
    seqEqual(Algo.walk(steps[steps.length - 1].tree, 'NLR'), Algo.walk(expected, 'NLR'), 'AVL trace vs reference insert');
    assert(balanced(expected), 'AVL inserted balance');

    const remove = a[Math.floor(rand() * a.length)];
    const delSteps = Algo.treeTrace(a, true, remove);
    const actual = delSteps[delSteps.length - 1].tree;
    const deleted = Algo.deleteNode(Algo.cloneTree(expected), remove, true, []);
    seqEqual(Algo.walk(actual, 'NLR'), Algo.walk(deleted, 'NLR'), 'AVL trace vs reference delete');
    seqEqual(Algo.walk(actual, 'LNR'), a.filter((x) => x !== remove).sort((x, y) => x - y), 'Deleted LNR set');
    assert(balanced(actual), 'Deletion balance');
  }

  // 4. Known edge cases
  const bubbleTrace = Algo.sort([5, 13, 12, 2, 13, 8], 'Bubble');
  seqEqual(bubbleTrace.find((x) => x.title === 'Xong lượt i = 1').values, [5, 2, 12, 8, 13, 13], 'Known bubble');

  const ins = Algo.sort([3, 7, 1, 8, 2, 5], 'Insertion').find((x) => x.title === 'Xong lượt i = 4');
  assert(ins && ins.variables.endsWith('pos = 0'), 'Known insertion pos = 0');

  const post1 = Algo.postfix('8 3 2 * - 4 +');
  seqEqual(post1[post1.length - 1].values, [6], 'Postfix 8 3 2 * - 4 +');
  const post2 = Algo.postfix('7 2 /');
  seqEqual(post2[post2.length - 1].values, [3], 'Postfix integer division 7 2 /');

  ['2 +', '2 3', '2 0 /', 'hi'].forEach((bad) => {
    let threw = false;
    try { Algo.postfix(bad); } catch (e) { threw = true; }
    assert(threw, 'Reject invalid postfix: ' + bad);
  });

  const stRes = Algo.operations([1, 2, -1, 3], false);
  seqEqual(stRes[stRes.length - 1].values, [1, 3], 'Stack');
  const qRes = Algo.operations([1, 2, -1, 3], true);
  seqEqual(qRes[qRes.length - 1].values, [2, 3], 'Queue');
  const llRes = Algo.linkedPairs([1, 2, 3, 4, 5]);
  seqEqual(llRes[llRes.length - 1].values, [2, 1, 4, 3, 5], 'Linked pairs');

  console.log('PASS');
  console.log(`${assertions} assertions`);
  console.log('5800 generated questions across 29 types verified');
  console.log('250 randomized array/tree scenarios verified');
  console.log('All 11 simulation modes + AVL search-path probes verified');
}

run();
