// DSA Studio IUH — Complete Algorithm & Trace Engine (11 modes)
// Faithfully implements all algorithms from DSA_Studio with persistent UIDs and smooth animation metadata.

(function (root) {
  'use strict';

  function formatArr(a) {
    return '[' + a.join(', ') + ']';
  }

  function formatSeq(a) {
    return a.join(', ');
  }

  function cloneSlots(arr) {
    return arr.map((x) => (x ? { uid: x.uid, val: x.val } : null));
  }

  function valuesOf(slots) {
    return slots.filter(Boolean).map((x) => x.val);
  }

  function snapArray(opts) {
    const slots = opts.slots ? cloneSlots(opts.slots) : (opts.values || []).map((val, i) => ({ uid: i + 1, val }));
    const values = opts.values ? opts.values.slice() : valuesOf(slots);
    const vars = opts.vars || (opts.variables ? [opts.variables] : []);
    return {
      kind: opts.kind || 'array',
      title: opts.title,
      note: opts.note,
      vars,
      variables: opts.variables !== undefined ? opts.variables : vars.join('; '),
      values,
      slots,
      held: opts.held ? { ...opts.held } : null,
      active: opts.active ? opts.active.slice() : [],
      compare: opts.compare ? opts.compare.slice() : [],
      swap: opts.swap ? opts.swap.slice() : [],
      sorted: opts.sorted ? opts.sorted.slice() : [],
      pointers: opts.pointers ? { ...opts.pointers } : {},
      low: opts.low !== undefined ? opts.low : 0,
      high: opts.high !== undefined ? opts.high : values.length - 1,
      mid: opts.mid !== undefined ? opts.mid : null,
      found: opts.found !== undefined ? opts.found : null
    };
  }

  // 1-4. SORTING: Bubble, Selection, Insertion, Interchange
  function sort(input, mode) {
    const items = input.map((val, idx) => ({ uid: idx + 1, val }));
    const n = items.length;
    const steps = [snapArray({
      title: 'Bắt đầu',
      note: 'Chỉ số bắt đầu từ 0. Sắp xếp tăng dần.',
      slots: items,
      vars: [`n = ${n}`],
      sorted: mode === 'Insertion' ? [0] : []
    })];

    if (mode === 'Bubble') {
      for (let i = 0; i < n - 1; i++) {
        const sortedNow = [];
        for (let k = n - i; k < n; k++) sortedNow.push(k);
        for (let j = 0; j < n - i - 1; j++) {
          const needSwap = items[j].val > items[j + 1].val;
          steps.push(snapArray({
            title: 'So sánh cặp kề',
            note: `${items[j].val}${needSwap ? ' > ' : ' ≤ '}${items[j + 1].val}${needSwap ? ': cần đổi chỗ.' : ': giữ nguyên.'}`,
            slots: items,
            vars: [`i = ${i}`, `j = ${j}`],
            active: [j, j + 1],
            compare: [j, j + 1],
            sorted: sortedNow,
            pointers: { j, 'j+1': j + 1 }
          }));
          if (needSwap) {
            const t = items[j];
            items[j] = items[j + 1];
            items[j + 1] = t;
            steps.push(snapArray({
              title: 'Đổi hai phần tử',
              note: 'Mỗi lần đổi kề loại bỏ một nghịch thế.',
              slots: items,
              vars: [`i = ${i}`, `j = ${j}`],
              active: [j, j + 1],
              swap: [j, j + 1],
              sorted: sortedNow,
              pointers: { j, 'j+1': j + 1 }
            }));
          }
        }
        const doneSorted = [];
        for (let k = n - 1 - i; k < n; k++) doneSorted.push(k);
        steps.push(snapArray({
          title: `Xong lượt i = ${i}`,
          note: `Phần tử lớn nhất đoạn (${items[n - 1 - i].val}) đã về cuối đoạn.`,
          slots: items,
          vars: [`i = ${i}`],
          active: [n - 1 - i],
          sorted: doneSorted
        }));
      }
    } else if (mode === 'Selection') {
      for (let i = 0; i < n - 1; i++) {
        const sortedNow = Array.from({ length: i }, (_, k) => k);
        let min = i;
        steps.push(snapArray({
          title: 'Bắt đầu lượt chọn',
          note: 'min lưu chỉ số, không lưu giá trị.',
          slots: items,
          vars: [`i = ${i}`, `min = ${min}`],
          active: [i],
          compare: [i],
          sorted: sortedNow,
          pointers: { i, min }
        }));
        for (let j = i + 1; j < n; j++) {
          if (items[j].val < items[min].val) min = j;
          steps.push(snapArray({
            title: 'Tìm phần tử nhỏ nhất',
            note: 'Chưa đổi chỗ cho đến khi quét hết đoạn.',
            slots: items,
            vars: [`i = ${i}`, `j = ${j}`, `min = ${min}`],
            active: [min, j],
            compare: [min, j],
            sorted: sortedNow,
            pointers: { i, min, j }
          }));
        }
        if (min !== i) {
          const t = items[i];
          items[i] = items[min];
          items[min] = t;
        }
        steps.push(snapArray({
          title: `Xong lượt i = ${i}`,
          note: 'Đưa phần tử nhỏ nhất về đầu đoạn chưa sắp.',
          slots: items,
          vars: [`i = ${i}`, `min = ${min}`],
          active: [i, min],
          swap: min !== i ? [i, min] : [],
          sorted: Array.from({ length: i + 1 }, (_, k) => k),
          pointers: { i }
        }));
      }
    } else if (mode === 'Interchange') {
      for (let i = 0; i < n - 1; i++) {
        const sortedNow = Array.from({ length: i }, (_, k) => k);
        for (let j = i + 1; j < n; j++) {
          const needSwap = items[i].val > items[j].val;
          const note = `${items[i].val}${needSwap ? ' > ' : ' ≤ '}${items[j].val}. Dùng giá trị a[i] mới cho lần tiếp theo.`;
          if (needSwap) {
            const t = items[i];
            items[i] = items[j];
            items[j] = t;
          }
          steps.push(snapArray({
            title: needSwap ? 'Đổi ngay với a[i]' : 'Giữ nguyên',
            note,
            slots: items,
            vars: [`i = ${i}`, `j = ${j}`],
            active: [i, j],
            compare: needSwap ? [] : [i, j],
            swap: needSwap ? [i, j] : [],
            sorted: sortedNow,
            pointers: { i, j }
          }));
        }
        steps.push(snapArray({
          title: `Xong lượt i = ${i}`,
          note: 'a[i] đã đúng vị trí.',
          slots: items,
          vars: [`i = ${i}`],
          active: [i],
          sorted: Array.from({ length: i + 1 }, (_, k) => k),
          pointers: { i }
        }));
      }
    } else {
      // Insertion Sort with elevated holding slot `x`
      const slots = cloneSlots(items);
      for (let i = 1; i < n; i++) {
        const xItem = slots[i];
        let pos = i - 1;
        slots[i] = null;
        steps.push(snapArray({
          title: 'Giữ x để chèn',
          note: `Đoạn a[0..${i - 1}] đã có thứ tự. Nhấc x = ${xItem.val} lên vùng tạm.`,
          slots,
          values: valuesOf(slots),
          held: { uid: xItem.uid, val: xItem.val, overSlot: i },
          vars: [`i = ${i}`, `x = ${xItem.val}`, `pos = ${pos}`],
          active: [i, pos],
          compare: [pos],
          sorted: Array.from({ length: i }, (_, k) => k),
          pointers: { pos }
        }));
        while (pos >= 0 && slots[pos].val > xItem.val) {
          const shifted = slots[pos].val;
          slots[pos + 1] = slots[pos];
          slots[pos] = null;
          pos--;
          steps.push(snapArray({
            title: 'Dịch sang phải',
            note: `Vì ${shifted} > x (${xItem.val}), dịch ${shifted} sang phải; pos giảm xuống ${pos}.`,
            slots,
            values: valuesOf(slots),
            held: { uid: xItem.uid, val: xItem.val, overSlot: pos + 1 },
            vars: [`i = ${i}`, `x = ${xItem.val}`, `pos = ${pos}`],
            active: [pos + 1, pos + 2],
            compare: pos >= 0 ? [pos] : [],
            sorted: Array.from({ length: i + 1 }, (_, k) => k).filter((k) => k !== pos + 1),
            pointers: pos >= 0 ? { pos } : {}
          }));
        }
        slots[pos + 1] = xItem;
        steps.push(snapArray({
          title: `Xong lượt i = ${i}`,
          note: `Chèn x ở pos + 1 = ${pos + 1}. Đây là pos SAU vòng while.`,
          slots,
          values: valuesOf(slots),
          held: null,
          vars: [`i = ${i}`, `x = ${xItem.val}`, `pos = ${pos}`],
          active: [pos + 1],
          sorted: Array.from({ length: i + 1 }, (_, k) => k),
          pointers: { 'pos+1': pos + 1 }
        }));
      }
      steps.push(snapArray({
        title: 'Hoàn thành',
        note: 'Mảng đã tăng dần.',
        slots,
        vars: [`n = ${n}`],
        sorted: Array.from({ length: n }, (_, k) => k)
      }));
      return steps;
    }

    steps.push(snapArray({
      title: 'Hoàn thành',
      note: 'Mảng đã tăng dần.',
      slots: items,
      vars: [`n = ${n}`],
      sorted: Array.from({ length: n }, (_, k) => k)
    }));
    return steps;
  }

  // 5. BINARY SEARCH
  function binary(input, target) {
    const items = input.map((val, idx) => ({ uid: idx + 1, val }));
    const n = items.length;
    const steps = [];
    let lo = 0, hi = n - 1;

    steps.push(snapArray({
      kind: 'binary',
      title: `Tìm khóa key = ${target}`,
      note: `Khởi tạo đoạn đóng [0 .. ${hi}] trên dãy tăng dần.`,
      slots: items,
      vars: [`low = ${lo}`, `high = ${hi}`, `key = ${target}`],
      low: lo,
      high: hi,
      mid: null,
      found: null,
      pointers: { low: lo, high: hi }
    }));

    while (lo <= hi) {
      const mid = lo + Math.floor((hi - lo) / 2);
      steps.push(snapArray({
        kind: 'binary',
        title: 'Xét phần tử giữa',
        note: `So ${target} với a[${mid}] = ${items[mid].val}.`,
        slots: items,
        vars: [`low = ${lo}`, `high = ${hi}`, `mid = ${mid}`, `key = ${target}`],
        active: [mid],
        low: lo,
        high: hi,
        mid,
        found: null,
        pointers: { low: lo, mid, high: hi }
      }));

      if (items[mid].val === target) {
        steps.push(snapArray({
          kind: 'binary',
          title: 'Tìm thấy',
          note: `Trả về chỉ số ${mid}.`,
          slots: items,
          vars: [`index = ${mid}`, `key = ${target}`],
          active: [mid],
          low: lo,
          high: hi,
          mid,
          found: mid,
          pointers: { mid }
        }));
        return steps;
      }

      if (items[mid].val < target) {
        lo = mid + 1;
        steps.push(snapArray({
          kind: 'binary',
          title: `Thu hẹp sang phải [${lo} .. ${hi}]`,
          note: `${items[mid].val} < ${target} → bỏ nửa trái, đặt low = mid + 1 = ${lo}.`,
          slots: items,
          vars: [`low = ${lo}`, `high = ${hi}`, `key = ${target}`],
          low: lo,
          high: hi,
          mid: null,
          found: null,
          pointers: lo <= hi ? { low: lo, high: hi } : {}
        }));
      } else {
        hi = mid - 1;
        steps.push(snapArray({
          kind: 'binary',
          title: `Thu hẹp sang trái [${lo} .. ${hi}]`,
          note: `${items[mid].val} > ${target} → bỏ nửa phải, đặt high = mid - 1 = ${hi}.`,
          slots: items,
          vars: [`low = ${lo}`, `high = ${hi}`, `key = ${target}`],
          low: lo,
          high: hi,
          mid: null,
          found: null,
          pointers: lo <= hi ? { low: lo, high: hi } : {}
        }));
      }
    }

    steps.push(snapArray({
      kind: 'binary',
      title: 'Không tìm thấy',
      note: 'Đoạn tìm kiếm rỗng: low > high. Trả về -1.',
      slots: items,
      vars: [`low = ${lo}`, `high = ${hi}`, 'kết quả = -1'],
      low: lo,
      high: hi,
      mid: null,
      found: null,
      pointers: {}
    }));
    return steps;
  }

  // 6 & 7. STACK & QUEUE OPERATIONS
  function operations(values, isQueue) {
    const items = [];
    let uidCounter = 1;
    const kind = isQueue ? 'queue' : 'stack';
    const steps = [{
      kind,
      title: 'Bắt đầu',
      note: isQueue
        ? 'Số ≥ 0: enqueue() vào rear · Số -1: dequeue() lấy ở front.'
        : 'Số ≥ 0: push() vào đỉnh · Số -1: pop() lấy ở đỉnh.',
      vars: ['size = 0', isQueue ? 'front → rear' : 'bottom → top'],
      variables: isQueue ? 'Trái = front; phải = rear' : 'Trái = bottom; phải = top',
      values: [],
      items: [],
      popped: null,
      tokenIndex: -1,
      tokens: values.slice()
    }];

    values.forEach((v, idx) => {
      let title, note, popped = null;
      if (v === -1) {
        if (items.length === 0) {
          title = 'Cấu trúc rỗng';
          note = 'Không lấy được phần tử; trạng thái giữ nguyên.';
        } else {
          popped = isQueue ? items.shift() : items.pop();
          title = isQueue ? 'dequeue()' : 'pop()';
          note = `Lấy ra ${popped.val}.`;
        }
      } else {
        const node = { uid: uidCounter++, val: v };
        items.push(node);
        title = (isQueue ? 'enqueue(' : 'push(') + v + ')';
        note = isQueue ? 'Thêm ở rear.' : 'Thêm ở top.';
      }
      steps.push({
        kind,
        title,
        note,
        vars: [`size = ${items.length}`].concat(popped ? [`lấy ra = ${popped.val}`] : (items.length ? [`${isQueue ? 'rear' : 'top'} = ${items[items.length - 1].val}`] : [])),
        variables: isQueue ? 'Trái = front; phải = rear' : 'Trái = bottom; phải = top',
        values: items.map((x) => x.val),
        items: cloneSlots(items),
        popped: popped ? { ...popped } : null,
        tokenIndex: idx,
        tokens: values.slice()
      });
    });

    return steps;
  }

  // 8. POSTFIX EVALUATION
  function postfix(input) {
    const tokens = String(input || '').trim().split(/\s+/).filter(Boolean);
    if (!tokens.length) throw new Error('Nhập biểu thức hậu tố, ví dụ: 8 3 2 * - 4 +');
    const st = [];
    let uidCounter = 1;

    const steps = [{
      kind: 'postfix',
      title: 'Bắt đầu',
      note: 'Quét hậu tố trái sang phải. Gặp toán hạng thì push; gặp toán tử thì pop hai số (pop đầu = toán hạng phải).',
      vars: [`Biểu thức: ${tokens.join(' ')}`],
      variables: input,
      values: [],
      items: [],
      tokens: tokens.slice(),
      tokenIndex: -1,
      calc: null
    }];

    tokens.forEach((tok, idx) => {
      let note;
      let calc = null;
      if (/^-?\d+$/.test(tok)) {
        const val = parseInt(tok, 10);
        if (val < -999999 || val > 999999) throw new Error('Giá trị số quá lớn.');
        st.push({ uid: uidCounter++, val });
        note = `Push toán hạng ${val}.`;
      } else {
        if (!['+', '-', '*', '/'].includes(tok) || st.length < 2) {
          throw new Error('Biểu thức hậu tố không hợp lệ ở token: ' + tok);
        }
        const r = st.pop().val;
        const l = st.pop().val;
        let result;
        if (tok === '+') result = l + r;
        else if (tok === '-') result = l - r;
        else if (tok === '*') result = l * r;
        else {
          if (r === 0) throw new Error('Không thể chia cho 0.');
          result = Math.trunc(l / r);
        }
        st.push({ uid: uidCounter++, val: result });
        note = `Trái = ${l}, phải = ${r}. Tính ${l} ${tok} ${r} = ${result} (chia nguyên nếu dùng /).`;
        calc = { left: l, op: tok, right: r, result };
      }

      steps.push({
        kind: 'postfix',
        title: `Đọc token: ${tok}`,
        note,
        vars: [`Token = ${tok}`, `size = ${st.length}`].concat(calc ? [`${calc.left} ${calc.op} ${calc.right} = ${calc.result}`] : []),
        variables: 'Bottom → top',
        values: st.map((x) => x.val),
        items: cloneSlots(st),
        tokens: tokens.slice(),
        tokenIndex: idx,
        calc
      });
    });

    if (st.length !== 1) throw new Error('Hết biểu thức phải còn đúng một kết quả.');
    steps.push({
      kind: 'postfix',
      title: 'Kết quả',
      note: `Giá trị biểu thức = ${st[0].val}.`,
      vars: [`Kết quả = ${st[0].val}`],
      variables: 'Bottom → top',
      values: st.map((x) => x.val),
      items: cloneSlots(st),
      tokens: tokens.slice(),
      tokenIndex: tokens.length,
      calc: null
    });
    return steps;
  }

  // 9. LINKED LIST PAIRWISE DATA SWAP
  function linkedPairs(input) {
    const items = input.map((val, idx) => ({ uid: idx + 1, val }));
    const steps = [snapArray({
      kind: 'linked',
      title: 'Danh sách ban đầu',
      note: 'Đổi dữ liệu từng cặp nút, không đổi liên kết next.',
      slots: items,
      vars: items.length >= 2 ? ['p = nút 0', 'q = nút 1'] : ['Danh sách < 2 nút'],
      variables: 'p ở nút 0; q ở nút 1',
      pointers: items.length >= 2 ? { p: 0, q: 1 } : (items.length === 1 ? { p: 0 } : {})
    })];

    for (let i = 0; i + 1 < items.length; i += 2) {
      const t = items[i];
      items[i] = items[i + 1];
      items[i + 1] = t;
      steps.push(snapArray({
        kind: 'linked',
        title: `Đổi cặp nút ${i}, ${i + 1}`,
        note: 'Đổi dữ liệu hai nút (p, q) rồi tiến sang cặp tiếp theo. Nút cuối lẻ giữ nguyên.',
        slots: items,
        vars: [`p = ${i}`, `q = ${i + 1}`],
        variables: `p = ${i}; q = ${i + 1}`,
        active: [i, i + 1],
        swap: [i, i + 1],
        pointers: { p: i, q: i + 1 }
      }));
    }
    return steps;
  }

  // 10 & 11. BST & AVL TREE + SEARCH-PATH TRAVERSAL + ROTATIONS + OPTIONAL DELETE
  function cloneTree(t) {
    return t ? { v: t.v, l: cloneTree(t.l), r: cloneTree(t.r) } : null;
  }

  function height(t) {
    return t ? 1 + Math.max(height(t.l), height(t.r)) : 0;
  }

  function bf(t) {
    return t ? height(t.l) - height(t.r) : 0;
  }

  function walk(t, order = 'LNR') {
    const res = [];
    if (!t) return res;
    if (order === 'Level') {
      const q = [t];
      while (q.length > 0) {
        const n = q.shift();
        res.push(n.v);
        if (n.l) q.push(n.l);
        if (n.r) q.push(n.r);
      }
      return res;
    }
    if (order === 'NLR') res.push(t.v);
    res.push(...walk(t.l, order));
    if (order === 'LNR') res.push(t.v);
    res.push(...walk(t.r, order));
    if (order === 'LRN') res.push(t.v);
    return res;
  }

  function leaves(t) {
    if (!t) return 0;
    if (!t.l && !t.r) return 1;
    return leaves(t.l) + leaves(t.r);
  }

  function rotRight(y) {
    const x = y.l;
    const b = x.r;
    x.r = y;
    y.l = b;
    return x;
  }

  function rotLeft(x) {
    const y = x.r;
    const b = y.l;
    y.l = x;
    x.r = b;
    return y;
  }

  function balance(t, log = []) {
    const b = bf(t);
    if (b > 1) {
      if (bf(t.l) < 0) {
        log.push(`LR: xoay trái tại ${t.l.v}.`);
        t.l = rotLeft(t.l);
      }
      log.push(`Xoay phải tại ${t.v} (BF=${b}).`);
      return rotRight(t);
    }
    if (b < -1) {
      if (bf(t.r) > 0) {
        log.push(`RL: xoay phải tại ${t.r.v}.`);
        t.r = rotRight(t.r);
      }
      log.push(`Xoay trái tại ${t.v} (BF=${b}).`);
      return rotLeft(t);
    }
    return t;
  }

  function insertNode(t, v, avl = false, log = []) {
    if (!t) {
      log.push(`Gắn ${v} vào vị trí trống.`);
      return { v, l: null, r: null };
    }
    if (v < t.v) t.l = insertNode(t.l, v, avl, log);
    else if (v > t.v) t.r = insertNode(t.r, v, avl, log);
    else {
      log.push('Khóa trùng: giữ nguyên cây.');
      return t;
    }
    return avl ? balance(t, log) : t;
  }

  function deleteNode(t, v, avl = false, log = []) {
    if (!t) {
      log.push(`Không có khóa ${v} trong cây.`);
      return null;
    }
    if (v < t.v) t.l = deleteNode(t.l, v, avl, log);
    else if (v > t.v) t.r = deleteNode(t.r, v, avl, log);
    else {
      if (!t.l) {
        log.push(`Xóa ${v}; nối lên cây con phải (có thể rỗng).`);
        return t.r;
      }
      if (!t.r) {
        log.push(`Xóa ${v}; nối lên cây con trái.`);
        return t.l;
      }
      let n = t.r;
      while (n.l) n = n.l;
      log.push(`Thế mạng phải: nhỏ nhất cây phải = ${n.v}.`);
      t.v = n.v;
      t.r = deleteNode(t.r, n.v, avl, log);
    }
    return avl ? balance(t, log) : t;
  }

  function build(arr, avl = false) {
    let t = null;
    for (const x of arr) t = insertNode(t, x, avl, []);
    return t;
  }

  function treeStep(title, note, t, extra = {}) {
    const count = walk(t, 'LNR').length;
    const h = height(t);
    const leafCount = leaves(t);
    const vars = [`Cao = ${h} mức`, `Số nút = ${count}`, `Lá = ${leafCount}`];
    if (extra.probe) vars.push(`Đang xét = ${extra.probe.v}`);
    if (extra.badge) vars.push(`Xoay: ${extra.badge}`);
    return {
      kind: 'tree',
      title,
      note,
      vars,
      variables: `Chiều cao theo số mức: ${h}; số nút: ${count}; lá: ${leafCount}`,
      values: [],
      tree: cloneTree(t),
      highlight: extra.highlight ? extra.highlight.slice() : [],
      visited: extra.visited ? extra.visited.slice() : [],
      probe: extra.probe ? { ...extra.probe } : null
    };
  }

  function treeTrace(input, avl = false, remove = null) {
    let root = null;
    const steps = [treeStep('Cây rỗng', 'Chèn từng khóa từ trái sang phải, so sánh từ gốc đi xuống.' + (avl ? ' Tự động xoay cân bằng khi |BF| > 1.' : ''), root)];

    function rebalanceTrace(node, assignInParent) {
      if (!node) return null;
      node.l = rebalanceTrace(node.l, (x) => { node.l = x; });
      node.r = rebalanceTrace(node.r, (x) => { node.r = x; });
      const b = bf(node);
      if (b > 1) {
        if (bf(node.l) < 0) {
          const piv = node.l.v;
          node.l = rotLeft(node.l);
          steps.push(treeStep(`Xoay trái tại ${piv}`, `LR: xoay trái tại con trái (${piv}) trước.`, root, { highlight: [piv, node.l.v], badge: 'LR (1/2)' }));
        }
        const at = node.v;
        const next = rotRight(node);
        assignInParent(next);
        steps.push(treeStep(`Xoay phải tại ${at}`, `Đưa cây con trái (${next.v}) lên làm gốc tại ${at}. Thứ tự LNR không đổi.`, root, { highlight: [at, next.v], badge: 'Xoay phải' }));
        return next;
      }
      if (b < -1) {
        if (bf(node.r) > 0) {
          const piv = node.r.v;
          node.r = rotRight(node.r);
          steps.push(treeStep(`Xoay phải tại ${piv}`, `RL: xoay phải tại con phải (${piv}) trước.`, root, { highlight: [piv, node.r.v], badge: 'RL (1/2)' }));
        }
        const at = node.v;
        const next = rotLeft(node);
        assignInParent(next);
        steps.push(treeStep(`Xoay trái tại ${at}`, `Đưa cây con phải (${next.v}) lên làm gốc tại ${at}. Thứ tự LNR không đổi.`, root, { highlight: [at, next.v], badge: 'Xoay trái' }));
        return next;
      }
      return node;
    }

    for (const v of input) {
      if (!root) {
        root = insertNode(root, v, false, []);
        steps.push(treeStep(`Chèn nút gốc ${v}`, `Cây đang rỗng nên ${v} trở thành nút gốc (root).`, root, { highlight: [v] }));
      } else {
        let cur = root;
        const visitedPath = [];
        let lastParent = root.v;
        let lastDir = 'trái';
        while (cur) {
          visitedPath.push(cur.v);
          if (v === cur.v) break;
          const goLeft = v < cur.v;
          const dir = goLeft ? 'left' : 'right';
          const cmpSymbol = goLeft ? '<' : '>';
          const nextChild = goLeft ? cur.l : cur.r;
          steps.push(treeStep(
            `So sánh ${v} với ${cur.v}`,
            `${v} ${cmpSymbol} ${cur.v} → đi sang nhánh ${goLeft ? 'trái' : 'phải'}${nextChild ? ` (tới nút ${nextChild.v})` : ' (vị trí trống)'}.`,
            root,
            {
              highlight: [cur.v],
              visited: visitedPath,
              probe: { v, atVal: cur.v, dir, label: `${v} ${cmpSymbol} ${cur.v} → ${goLeft ? 'Trái' : 'Phải'}` }
            }
          ));
          lastParent = cur.v;
          lastDir = goLeft ? 'trái' : 'phải';
          cur = nextChild;
        }
        root = insertNode(root, v, false, []);
        steps.push(treeStep(
          `Chèn ${v}`,
          `Gắn ${v} làm con ${lastDir} của ${lastParent} theo quy tắc BST.${avl ? ' Kiểm tra BF từ dưới lên.' : ''}`,
          root,
          { highlight: [v], visited: visitedPath }
        ));
        if (avl) root = rebalanceTrace(root, (x) => { root = x; });
      }
    }

    if (remove !== null && remove !== undefined) {
      let cur = root;
      const searchPath = [];
      while (cur) {
        searchPath.push(cur.v);
        if (cur.v === remove) {
          steps.push(treeStep(
            `Định vị nút xóa ${remove}`,
            `Đã tìm thấy nút ${remove} trên cây. Tiến hành xóa theo quy tắc BST.`,
            root,
            { highlight: [remove], visited: searchPath }
          ));
          break;
        }
        const goLeft = remove < cur.v;
        const dir = goLeft ? 'left' : 'right';
        const cmpSymbol = goLeft ? '<' : '>';
        steps.push(treeStep(
          `Dò khóa xóa ${remove}: so sánh với ${cur.v}`,
          `${remove} ${cmpSymbol} ${cur.v} → đi sang nhánh ${goLeft ? 'trái' : 'phải'}.`,
          root,
          {
            highlight: [cur.v],
            visited: searchPath,
            probe: { v: remove, atVal: cur.v, dir, label: `Tìm ${remove} ${cmpSymbol} ${cur.v}` }
          }
        ));
        cur = goLeft ? cur.l : cur.r;
      }

      const log = [];
      root = deleteNode(root, remove, false, log);
      steps.push(treeStep(`Xóa ${remove}`, log.join('\n'), root, {}));
      if (avl) root = rebalanceTrace(root, (x) => { root = x; });
    }

    steps.push(treeStep('Hoàn thành', `LNR: ${formatSeq(walk(root, 'LNR'))}`, root, {}));
    return steps;
  }

  const Algo = {
    formatArr,
    formatSeq,
    snapArray,
    sort,
    binary,
    operations,
    postfix,
    linkedPairs,
    cloneTree,
    height,
    bf,
    walk,
    leaves,
    rotRight,
    rotLeft,
    balance,
    insertNode,
    deleteNode,
    build,
    treeStep,
    treeTrace
  };

  root.DSA_ALGO = Algo;
  if (typeof module !== 'undefined' && module.exports) module.exports = Algo;
})(typeof window !== 'undefined' ? window : globalThis);
