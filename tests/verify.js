// DSA Studio IUH — Automated Verification Suite (6,400 Questions + 250 Random Scenarios + Edge Cases)
// Ported and expanded from DSA_Studio/src/Tests.cs

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
  // 1. Lessons check (32 IUH-aligned types across 4 slide chapters)
  assert(Array.isArray(Lessons) && Lessons.length === 32, '32 lessons loaded');
  Lessons.forEach((l, i) => {
    assert(l.id === i + 1, `Lesson id ${l.id}`);
    assert(l.chapter && (l.miniSim || l.diagram) && l.codeNote, `Lesson ${l.id} IUH chapter/visuals/codeNote`);
    assert(l.title && l.problem && Array.isArray(l.reasoning) && Array.isArray(l.solution) && l.tip && l.answer, `Lesson ${l.id} fields`);
  });

  // 2. 6,400 generated questions across 32 types x 200 seeds
  for (let type = 1; type <= 32; type++) {
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

    const bubbleRtl = Algo.sort(a, 'Bubble', { direction: 'rtl' });
    seqEqual(bubbleRtl[bubbleRtl.length - 1].values, sorted, 'Sorted Bubble RTL');
    bubbleRtl.forEach((step) => {
      seqEqual(step.values.slice().sort((x, y) => x - y), sorted, 'Permutation Bubble RTL');
    });

    const quickTrace = Algo.quickSort(a);
    seqEqual(quickTrace[quickTrace.length - 1].values, sorted, 'Sorted Quick Sort');
    quickTrace.forEach((step) => {
      seqEqual(step.values.slice().sort((x, y) => x - y), sorted, 'Permutation Quick Sort');
    });

    const expected = Algo.build(a, true);
    const steps = Algo.treeTrace(a, true, null);
    assert(steps.some((s) => s.probe !== null), 'AVL search-path probe steps emitted');
    seqEqual(Algo.walk(steps[steps.length - 1].tree, 'NLR'), Algo.walk(expected, 'NLR'), 'AVL trace vs reference insert');
    assert(balanced(expected), 'AVL inserted balance');
    assert(Algo.bfIuh(expected) === -Algo.bf(expected), 'IUH CSCB sign invariant');

    const remove = a[Math.floor(rand() * a.length)];
    ['right', 'left'].forEach((replaceSide) => {
      const delSteps = Algo.treeTrace(a, true, remove, { replaceSide });
      const actual = delSteps[delSteps.length - 1].tree;
      const deleted = Algo.deleteNode(Algo.cloneTree(expected), remove, true, [], replaceSide);
      seqEqual(Algo.walk(actual, 'NLR'), Algo.walk(deleted, 'NLR'), `AVL trace vs reference delete (${replaceSide})`);
      seqEqual(Algo.walk(actual, 'LNR'), a.filter((x) => x !== remove).sort((x, y) => x - y), `Deleted LNR set (${replaceSide})`);
      assert(balanced(actual), `Deletion balance (${replaceSide})`);

      const bstSteps = Algo.treeTrace(a, false, remove, { replaceSide });
      const bstFinal = bstSteps[bstSteps.length - 1].tree;
      seqEqual(Algo.walk(bstFinal, 'LNR'), a.filter((x) => x !== remove).sort((x, y) => x - y), `BST deleted LNR (${replaceSide})`);
    });
  }

  // 4. Known edge cases & IUH-specific trace steps
  const bubbleLtr = Algo.sort([5, 13, 12, 2, 13, 8], 'Bubble', { direction: 'ltr' });
  seqEqual(bubbleLtr.find((x) => x.title === 'Xong lượt i = 1').values, [5, 2, 12, 8, 13, 13], 'Known bubble LTR');

  const bubbleIuh = Algo.sort([5, 13, 12, 2, 13, 8], 'Bubble', { direction: 'rtl' });
  const bubbleIuhPass0 = bubbleIuh.find((x) => x.title === 'Xong lượt i = 0');
  assert(bubbleIuhPass0 && bubbleIuhPass0.values[0] === 2, 'Known bubble IUH RTL pass 0 bubbles 2 to index 0');

  const ins = Algo.sort([3, 7, 1, 8, 2, 5], 'Insertion').find((x) => x.title === 'Xong lượt i = 4');
  assert(ins && ins.variables.endsWith('pos = 0'), 'Known insertion pos = 0');

  // Interchange 2-step Compare -> Swap invariant
  const inter = Algo.sort([9, 3, 7, 1], 'Interchange');
  let interSwaps = 0;
  for (let k = 1; k < inter.length; k++) {
    if (inter[k].title === 'Đổi ngay với a[i]') {
      interSwaps++;
      assert(inter[k - 1].title.startsWith('So sánh a['), 'Interchange swap preceded by compare step');
      seqEqual(inter[k - 1].compare, inter[k].swap, 'Interchange compare indices match swap indices');
    }
  }
  assert(interSwaps > 0, 'Interchange emitted swap steps');

  // Quick Sort duplicate handling
  const quickDup = Algo.quickSort([2, 2, 1, 3, 2]);
  seqEqual(quickDup[quickDup.length - 1].values, [1, 2, 2, 2, 3], 'Quick Sort with duplicates');

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

  // Linked List 2-step Pairwise Compare -> Swap invariant
  const llRes = Algo.linkedPairs([1, 2, 3, 4, 5]);
  seqEqual(llRes[llRes.length - 1].values, [2, 1, 4, 3, 5], 'Linked pairs final values');
  let llSwaps = 0;
  for (let k = 1; k < llRes.length; k++) {
    if (llRes[k].title.startsWith('Đổi cặp nút')) {
      llSwaps++;
      assert(llRes[k - 1].title.startsWith('Xét cặp nút'), 'Linked pair swap preceded by pair compare step');
      seqEqual(llRes[k - 1].compare, llRes[k].swap, 'Linked compare indices match swap indices');
    }
  }
  assert(llSwaps === 2, 'Linked pairs emitted 2 swap steps');

  // 2-child delete choice vs leaf delete behavior
  const delRight = Algo.treeTrace([30, 20, 40, 10, 25, 35, 50], false, 30, { replaceSide: 'right' });
  const choiceRight = delRight.find((s) => s.deleteChoice !== null);
  assert(
    choiceRight && choiceRight.deleteChoice.targetVal === 30 && choiceRight.deleteChoice.leftVal === 25 &&
    choiceRight.deleteChoice.rightVal === 35 && choiceRight.deleteChoice.selected === 'right',
    'BST 2-child root deleteChoice (right)'
  );
  assert(Algo.walk(delRight[delRight.length - 1].tree, 'NLR')[0] === 35, 'BST root replaced by right-min 35');

  const delLeft = Algo.treeTrace([30, 20, 40, 10, 25, 35, 50], false, 30, { replaceSide: 'left' });
  const choiceLeft = delLeft.find((s) => s.deleteChoice !== null);
  assert(choiceLeft && choiceLeft.deleteChoice.selected === 'left', 'BST 2-child root deleteChoice (left)');
  assert(Algo.walk(delLeft[delLeft.length - 1].tree, 'NLR')[0] === 25, 'BST root replaced by left-max 25');

  const delLeaf = Algo.treeTrace([30, 20, 40, 10, 25, 35, 50], false, 10);
  assert(delLeaf.every((s) => s.deleteChoice === null), 'Leaf deletion hides 2-child replacement choice');

  console.log('PASS');
  console.log(`${assertions} assertions`);
  console.log('6400 generated questions across 32 types verified');
  console.log('250 randomized array/tree scenarios verified');
  console.log('All 12 simulation modes + Bubble RTL/LTR + 2-step Interchange/Linked + 2-child BST/AVL delete verified');
}

run();
