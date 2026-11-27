// DSA Studio IUH — Complete Algorithm & Trace Engine (12 modes)
// Aligned with IUH Data Structures & Algorithms slides (C2_1, C2_2, C3, C4, C5).

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
      range: opts.range ? opts.range.slice() : null,
      pivotVal: opts.pivotVal !== undefined ? opts.pivotVal : null,
      pivotIdx: opts.pivotIdx !== undefined ? opts.pivotIdx : null,
      low: opts.low !== undefined ? opts.low : 0,
      high: opts.high !== undefined ? opts.high : values.length - 1,
      mid: opts.mid !== undefined ? opts.mid : null,
      found: opts.found !== undefined ? opts.found : null
    };
  }

  // 1-4. SORTING: Bubble (LTR & IUH RTL), Selection, Insertion, Interchange (2-step Compare -> Swap)
  function sort(input, mode, opts = {}) {
    const items = input.map((val, idx) => ({ uid: idx + 1, val }));
    const n = items.length;
    const bubbleDir = opts.direction || 'ltr';

    const steps = [snapArray({
      title: 'Bắt đầu',
      note: mode === 'Bubble' && bubbleDir === 'rtl'
        ? 'Bubble Sort (Slide IUH): duyệt j từ phải sang trái (n-1 → i+1), đẩy số nhỏ nhất lên đầu.'
        : 'Chỉ số bắt đầu từ 0. Sắp xếp tăng dần.',
      slots: items,
      vars: [`n = ${n}`],
      sorted: mode === 'Insertion' ? [0] : []
    })];

    if (mode === 'Bubble') {
      if (bubbleDir === 'rtl') {
        for (let i = 0; i < n - 1; i++) {
          const sortedNow = Array.from({ length: i }, (_, k) => k);
          for (let j = n - 1; j > i; j--) {
            const needSwap = items[j].val < items[j - 1].val;
            steps.push(snapArray({
              title: 'So sánh cặp kề (Phải → Trái)',
              note: `a[${j}] = ${items[j].val}${needSwap ? ' < ' : ' ≥ '}a[${j - 1}] = ${items[j - 1].val}${needSwap ? ': cần đẩy số nhỏ hơn sang trái.' : ': giữ nguyên.'}`,
              slots: items,
              vars: [`i = ${i}`, `j = ${j}`, 'Chiều: Phải → Trái'],
              active: [j - 1, j],
              compare: [j - 1, j],
              sorted: sortedNow,
              pointers: { 'j-1': j - 1, j }
            }));
            if (needSwap) {
              const t = items[j];
              items[j] = items[j - 1];
              items[j - 1] = t;
              steps.push(snapArray({
                title: 'Đổi hai phần tử',
                note: `Đưa ${items[j - 1].val} nổi dần về đầu dãy.`,
                slots: items,
                vars: [`i = ${i}`, `j = ${j}`],
                active: [j - 1, j],
                swap: [j - 1, j],
                sorted: sortedNow,
                pointers: { 'j-1': j - 1, j }
              }));
            }
          }
          const doneSorted = Array.from({ length: i + 1 }, (_, k) => k);
          steps.push(snapArray({
            title: `Xong lượt i = ${i}`,
            note: `Phần tử nhỏ nhất đoạn (${items[i].val}) đã nổi về vị trí đầu ${i}.`,
            slots: items,
            vars: [`i = ${i}`],
            active: [i],
            sorted: doneSorted
          }));
        }
      } else {
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
          steps.push(snapArray({
            title: `So sánh a[${i}] và a[${j}]`,
            note: `${items[i].val}${needSwap ? ' > ' : ' ≤ '}${items[j].val}${needSwap ? `: cần đổi ngay với a[${i}].` : ': giữ nguyên vị trí.'}`,
            slots: items,
            vars: [`i = ${i}`, `j = ${j}`, `a[i] = ${items[i].val}`, `a[j] = ${items[j].val}`],
            active: [i, j],
            compare: [i, j],
            sorted: sortedNow,
            pointers: { i, j }
          }));
          if (needSwap) {
            const t = items[i];
            items[i] = items[j];
            items[j] = t;
            steps.push(snapArray({
              title: 'Đổi ngay với a[i]',
              note: `Hoán đổi a[${i}] và a[${j}]. Giá trị a[${i}] mới = ${items[i].val} được dùng cho các phép so tiếp theo.`,
              slots: items,
              vars: [`i = ${i}`, `j = ${j}`, `a[i] = ${items[i].val}`],
              active: [i, j],
              swap: [i, j],
              sorted: sortedNow,
              pointers: { i, j }
            }));
          }
        }
        steps.push(snapArray({
          title: `Xong lượt i = ${i}`,
          note: `a[${i}] = ${items[i].val} đã đúng vị trí.`,
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

  // 12th MODE: QUICK SORT (Slide IUH C2_2 tr. 68 — Hoare 2 pointers, middle pivot x = a[(left+right)/2])
  function quickSort(input) {
    const items = input.map((val, idx) => ({ uid: idx + 1, val }));
    const n = items.length;
    const sortedIndices = new Set();

    const steps = [snapArray({
      kind: 'quick',
      title: 'Bắt đầu Quick Sort (Slide IUH)',
      note: 'Chọn phần tử giữa x = a[(left+right)/2] làm mốc. Dùng i (từ trái) và j (từ phải) để phân hoạch thành 3 đoạn.',
      slots: items,
      vars: [`n = ${n}`],
      range: [0, n - 1],
      pivotVal: null
    })];

    function qs(left, right) {
      if (left >= right) {
        if (left === right) sortedIndices.add(left);
        return;
      }
      const mid = Math.floor((left + right) / 2);
      const x = items[mid].val;
      let i = left;
      let j = right;

      steps.push(snapArray({
        kind: 'quick',
        title: `Phân hoạch [${left} .. ${right}], mốc x = ${x}`,
        note: `mid = (${left} + ${right}) / 2 = ${mid} → x = a[${mid}] = ${x}. Đặt i = ${i}, j = ${j}.`,
        slots: items,
        vars: [`left = ${left}`, `right = ${right}`, `x = ${x}`, `i = ${i}`, `j = ${j}`],
        range: [left, right],
        pivotVal: x,
        pivotIdx: mid,
        compare: [mid],
        sorted: Array.from(sortedIndices),
        pointers: { i, j }
      }));

      do {
        while (items[i].val < x) {
          steps.push(snapArray({
            kind: 'quick',
            title: `Tăng i: a[${i}] < x`,
            note: `${items[i].val} < ${x} đúng → i tiến sang phải (${i} → ${i + 1}).`,
            slots: items,
            vars: [`x = ${x}`, `i = ${i}`, `j = ${j}`],
            range: [left, right],
            pivotVal: x,
            compare: [i],
            sorted: Array.from(sortedIndices),
            pointers: { i, j }
          }));
          i++;
        }
        while (items[j].val > x) {
          steps.push(snapArray({
            kind: 'quick',
            title: `Giảm j: a[${j}] > x`,
            note: `${items[j].val} > ${x} đúng → j lùi sang trái (${j} → ${j - 1}).`,
            slots: items,
            vars: [`x = ${x}`, `i = ${i}`, `j = ${j}`],
            range: [left, right],
            pivotVal: x,
            compare: [j],
            sorted: Array.from(sortedIndices),
            pointers: { i, j }
          }));
          j--;
        }
        if (i <= j) {
          if (i < j) {
            steps.push(snapArray({
              kind: 'quick',
              title: `So sánh cặp dừng i = ${i}, j = ${j}`,
              note: `a[${i}] = ${items[i].val} ≥ ${x} và a[${j}] = ${items[j].val} ≤ ${x} (i ≤ j) → chuẩn bị hoán đổi.`,
              slots: items,
              vars: [`x = ${x}`, `i = ${i}`, `j = ${j}`],
              range: [left, right],
              pivotVal: x,
              compare: [i, j],
              sorted: Array.from(sortedIndices),
              pointers: { i, j }
            }));
            const tmp = items[i];
            items[i] = items[j];
            items[j] = tmp;
            steps.push(snapArray({
              kind: 'quick',
              title: `Hoán đổi a[${i}] và a[${j}]`,
              note: `Đổi chỗ ${items[j].val} và ${items[i].val}, sau đó i = ${i + 1}, j = ${j - 1}.`,
              slots: items,
              vars: [`x = ${x}`, `i = ${i}`, `j = ${j}`],
              range: [left, right],
              pivotVal: x,
              swap: [i, j],
              sorted: Array.from(sortedIndices),
              pointers: { i, j }
            }));
          } else {
            steps.push(snapArray({
              kind: 'quick',
              title: `i gặp j tại chỉ số ${i}`,
              note: `i = j = ${i} (a[${i}] = ${items[i].val} = mốc ${x}): tăng i = ${i + 1}, giảm j = ${j - 1}.`,
              slots: items,
              vars: [`x = ${x}`, `i = ${i}`, `j = ${j}`],
              range: [left, right],
              pivotVal: x,
              compare: [i],
              sorted: Array.from(sortedIndices),
              pointers: { i, j }
            }));
          }
          i++;
          j--;
        }
      } while (i < j);

      for (let k = j + 1; k < i; k++) sortedIndices.add(k);

      steps.push(snapArray({
        kind: 'quick',
        title: `Xong phân hoạch [${left} .. ${right}]`,
        note: `Đoạn trái [${left}..${j}] ≤ ${x}; đoạn phải [${i}..${right}] ≥ ${x}. Đệ quy tiếp hai đoạn con.`,
        slots: items,
        vars: [`x = ${x}`, `j = ${j}`, `i = ${i}`],
        range: [left, right],
        pivotVal: x,
        sorted: Array.from(sortedIndices),
        pointers: {}
      }));

      if (left < j) qs(left, j);
      else if (left === j) sortedIndices.add(left);

      if (i < right) qs(i, right);
      else if (i === right) sortedIndices.add(right);
    }

    qs(0, n - 1);
    steps.push(snapArray({
      kind: 'quick',
      title: 'Hoàn thành Quick Sort',
      note: 'Toàn bộ mảng đã sắp xếp tăng dần.',
      slots: items,
      vars: [`n = ${n}`],
      range: [0, n - 1],
      pivotVal: null,
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
      vars: [`left = ${lo}`, `right = ${hi}`, `key = ${target}`],
      low: lo,
      high: hi,
      mid: null,
      found: null,
      pointers: { left: lo, right: hi }
    }));

    while (lo <= hi) {
      const mid = lo + Math.floor((hi - lo) / 2);
      steps.push(snapArray({
        kind: 'binary',
        title: 'Xét phần tử giữa',
        note: `So ${target} với a[${mid}] = ${items[mid].val}.`,
        slots: items,
        vars: [`left = ${lo}`, `right = ${hi}`, `mid = ${mid}`, `key = ${target}`],
        active: [mid],
        low: lo,
        high: hi,
        mid,
        found: null,
        pointers: { left: lo, mid, right: hi }
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
          note: `${items[mid].val} < ${target} → bỏ nửa trái, đặt left = mid + 1 = ${lo}.`,
          slots: items,
          vars: [`left = ${lo}`, `right = ${hi}`, `key = ${target}`],
          low: lo,
          high: hi,
          mid: null,
          found: null,
          pointers: lo <= hi ? { left: lo, right: hi } : {}
        }));
      } else {
        hi = mid - 1;
        steps.push(snapArray({
          kind: 'binary',
          title: `Thu hẹp sang trái [${lo} .. ${hi}]`,
          note: `${items[mid].val} > ${target} → bỏ nửa phải, đặt right = mid - 1 = ${hi}.`,
          slots: items,
          vars: [`left = ${lo}`, `right = ${hi}`, `key = ${target}`],
          low: lo,
          high: hi,
          mid: null,
          found: null,
          pointers: lo <= hi ? { left: lo, right: hi } : {}
        }));
      }
    }

    steps.push(snapArray({
      kind: 'binary',
      title: 'Không tìm thấy',
      note: 'Đoạn tìm kiếm rỗng: left > right. Trả về -1.',
      slots: items,
      vars: [`left = ${lo}`, `right = ${hi}`, 'kết quả = -1'],
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

  // 9. LINKED LIST PAIRWISE DATA SWAP (2-step: Select Pair -> Swap Values)
  function linkedPairs(input) {
    const items = input.map((val, idx) => ({ uid: idx + 1, val }));
    const steps = [snapArray({
      kind: 'linked',
      title: 'Danh sách ban đầu',
      note: 'Đổi dữ liệu từng cặp nút, không đổi liên kết pNext.',
      slots: items,
      vars: items.length >= 2 ? ['p = nút 0', 'q = nút 1'] : ['Danh sách < 2 nút'],
      variables: 'p ở nút 0; q ở nút 1',
      pointers: items.length >= 2 ? { p: 0, q: 1 } : (items.length === 1 ? { p: 0 } : {})
    })];

    for (let i = 0; i + 1 < items.length; i += 2) {
      steps.push(snapArray({
        kind: 'linked',
        title: `Xét cặp nút (${i}, ${i + 1})`,
        note: `Đưa p tới nút ${i} (data = ${items[i].val}) và q tới nút ${i + 1} (data = ${items[i + 1].val}).`,
        slots: items,
        vars: [`p = ${i}`, `q = ${i + 1}`],
        variables: `p = ${i}; q = ${i + 1}`,
        active: [i, i + 1],
        compare: [i, i + 1],
        pointers: { p: i, q: i + 1 }
      }));

      const t = items[i];
      items[i] = items[i + 1];
      items[i + 1] = t;

      steps.push(snapArray({
        kind: 'linked',
        title: `Đổi cặp nút ${i}, ${i + 1}`,
        note: `Hoán đổi dữ liệu (${items[i + 1].val} ↔ ${items[i].val}); các con trỏ pNext giữ nguyên.`,
        slots: items,
        vars: [`p = ${i}`, `q = ${i + 1}`],
        variables: `p = ${i}; q = ${i + 1}`,
        active: [i, i + 1],
        swap: [i, i + 1],
        pointers: { p: i, q: i + 1 }
      }));
    }

    if (items.length % 2 === 1) {
      const last = items.length - 1;
      steps.push(snapArray({
        kind: 'linked',
        title: 'Giữ nguyên nút cuối lẻ',
        note: `Nút ${last} (data = ${items[last].val}) không có cặp ghép nên giữ nguyên.`,
        slots: items,
        vars: [`p = ${last}`, 'q = NULL'],
        variables: `p = ${last}; q = NULL`,
        sorted: [last],
        pointers: { p: last }
      }));
    }

    return steps;
  }

  // 10 & 11. BST & AVL TREE + SEARCH-PATH TRAVERSAL + ROTATIONS + 2-CHILD DELETE CHOICE
  function cloneTree(t) {
    return t ? { v: t.v, l: cloneTree(t.l), r: cloneTree(t.r) } : null;
  }

  function height(t) {
    return t ? 1 + Math.max(height(t.l), height(t.r)) : 0;
  }

  function bf(t) {
    return t ? height(t.l) - height(t.r) : 0;
  }

  function bfIuh(t) {
    return t ? height(t.r) - height(t.l) : 0;
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
      log.push(`Xoay phải tại ${t.v}.`);
      return rotRight(t);
    }
    if (b < -1) {
      if (bf(t.r) > 0) {
        log.push(`RL: xoay phải tại ${t.r.v}.`);
        t.r = rotRight(t.r);
      }
      log.push(`Xoay trái tại ${t.v}.`);
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

  function deleteNode(t, v, avl = false, log = [], replaceSide = 'right') {
    if (!t) {
      log.push(`Không có khóa ${v} trong cây.`);
      return null;
    }
    if (v < t.v) t.l = deleteNode(t.l, v, avl, log, replaceSide);
    else if (v > t.v) t.r = deleteNode(t.r, v, avl, log, replaceSide);
    else {
      if (!t.l) {
        log.push(`Xóa ${v}; nối lên cây con phải (có thể rỗng).`);
        return t.r;
      }
      if (!t.r) {
        log.push(`Xóa ${v}; nối lên cây con trái.`);
        return t.l;
      }
      if (replaceSide === 'left') {
        let n = t.l;
        while (n.r) n = n.r;
        log.push(`Thế mạng trái: lớn nhất cây trái = ${n.v}.`);
        t.v = n.v;
        t.l = deleteNode(t.l, n.v, avl, log, replaceSide);
      } else {
        let n = t.r;
        while (n.l) n = n.l;
        log.push(`Thế mạng phải: nhỏ nhất cây phải = ${n.v}.`);
        t.v = n.v;
        t.r = deleteNode(t.r, n.v, avl, log, replaceSide);
      }
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
    if (extra.extraVar) vars.push(extra.extraVar);
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
      probe: extra.probe ? { ...extra.probe } : null,
      deleteChoice: extra.deleteChoice ? { ...extra.deleteChoice } : null,
      replacedAnim: extra.replacedAnim ? { ...extra.replacedAnim } : null
    };
  }

  function treeTrace(input, avl = false, remove = null, opts = {}) {
    const replaceSide = opts.replaceSide === 'left' ? 'left' : 'right';
    let root = null;
    const steps = [treeStep(
      'Cây rỗng',
      'Chèn từng khóa từ trái sang phải, so sánh từ gốc đi xuống.' + (avl ? ' Tự cân bằng khi |CSCB| > 1.' : ''),
      root
    )];

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
          `Gắn ${v} làm con ${lastDir} của ${lastParent} theo quy tắc BST.${avl ? ' Kiểm tra cân bằng từ dưới lên.' : ''}`,
          root,
          { highlight: [v], visited: visitedPath }
        ));
        if (avl) root = rebalanceTrace(root, (x) => { root = x; });
      }
    }

    if (remove !== null && remove !== undefined) {
      let cur = root;
      const searchPath = [];
      let foundNode = null;

      while (cur) {
        searchPath.push(cur.v);
        if (cur.v === remove) {
          foundNode = cur;
          break;
        }
        const goLeft = remove < cur.v;
        const dir = goLeft ? 'left' : 'right';
        const cmpSymbol = goLeft ? '<' : '>';
        steps.push(treeStep(
          `Dò khóa xóa ${remove}: so với ${cur.v}`,
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

      if (foundNode && foundNode.l && foundNode.r) {
        let leftP = foundNode.l;
        while (leftP.r) leftP = leftP.r;
        let rightS = foundNode.r;
        while (rightS.l) rightS = rightS.l;

        steps.push(treeStep(
          `Định vị nút xóa ${remove} (có 2 con)`,
          `Nút ${remove} có đủ 2 cây con → có thể chọn thế mạng: Phải nhất cây trái (${leftP.v}) hoặc Trái nhất cây phải (${rightS.v}).`,
          root,
          {
            highlight: [remove],
            visited: searchPath,
            deleteChoice: { targetVal: remove, leftVal: leftP.v, rightVal: rightS.v, selected: replaceSide }
          }
        ));

        const candPath = [remove];
        let walker = replaceSide === 'left' ? foundNode.l : foundNode.r;
        const dirWord = replaceSide === 'left' ? 'phải' : 'trái';
        while (walker) {
          candPath.push(walker.v);
          const nextW = replaceSide === 'left' ? walker.r : walker.l;
          if (!nextW) break;
          steps.push(treeStep(
            `Tìm thế mạng ${replaceSide === 'left' ? 'trái' : 'phải'}: xét ${walker.v}`,
            `Đi hết sang ${dirWord} từ ${walker.v} tới ${nextW.v}.`,
            root,
            { highlight: [walker.v], visited: candPath }
          ));
          walker = nextW;
        }

        const chosenVal = replaceSide === 'left' ? leftP.v : rightS.v;
        steps.push(treeStep(
          `Chọn nút thế mạng: ${chosenVal}`,
          replaceSide === 'left'
            ? `${chosenVal} là phải nhất (lớn nhất) cây con trái → chuẩn bị đưa lên thay cho ${remove}.`
            : `${chosenVal} là trái nhất (nhỏ nhất) cây con phải → chuẩn bị đưa lên thay cho ${remove}.`,
          root,
          { highlight: [chosenVal, remove], visited: candPath }
        ));

        const log = [];
        root = deleteNode(root, remove, false, log, replaceSide);
        steps.push(treeStep(
          `Thay thế ${remove} bằng ${chosenVal}`,
          log.join('\n') + `\nĐưa ${chosenVal} lên thế chỗ ${remove} và nối lại nhánh con (nếu có).`,
          root,
          { highlight: [chosenVal], replacedAnim: { fromVal: chosenVal, oldTargetVal: remove } }
        ));
      } else {
        if (foundNode) {
          const childKind = (!foundNode.l && !foundNode.r) ? 'nút lá (0 con)' : 'nút có 1 con';
          steps.push(treeStep(
            `Định vị nút xóa ${remove} (${childKind})`,
            `Nút ${remove} chỉ có tối đa 1 con nên xóa trực tiếp, không cần chọn thế mạng.`,
            root,
            { highlight: [remove], visited: searchPath }
          ));
        }
        const log = [];
        root = deleteNode(root, remove, false, log, replaceSide);
        steps.push(treeStep(`Xóa ${remove}`, log.join('\n'), root, {}));
      }

      if (avl) root = rebalanceTrace(root, (x) => { root = x; });
    }

    steps.push(treeStep('Hoàn thành', `LNR: ${formatSeq(walk(root, 'LNR'))}`, root, {}));
    return steps;
  }

  // 13. RECURSION ON LINKED LIST (CALL STACK TRACE)
  function recursionListTrace(arr, printBefore) {
    const tokens = [];
    const tokenLabels = [];
    arr.forEach((v) => {
      tokens.push(v);
      tokenLabels.push(`f(${v})`);
    });
    tokens.push(-1);
    tokenLabels.push('p == NULL');
    for (let i = arr.length - 1; i >= 0; i--) {
      tokens.push(-1);
      tokenLabels.push(`Trả về f(${arr[i]})`);
    }

    const st = [];
    const printed = [];
    let uidCounter = 1;
    let tokIdx = -1;

    const makeStep = (title, note, extra = {}) => ({
      kind: 'stack',
      headerTitle: 'CALL STACK ĐỆ QUY TRÊN DSLK',
      tapeTitle: 'LỜI GỌI HÀM',
      bottomLabel: 'ĐÁY STACK',
      topPill: 'ĐỈNH',
      popLabel: extra.popLabel || 'Thoát khung',
      title,
      note,
      vars: extra.vars || [`Đã in: ${printed.length ? formatArr(printed) : '[]'}`],
      variables: `Đã in: ${formatArr(printed)}`,
      values: st.map((x) => x.val),
      items: cloneSlots(st),
      popped: extra.popped ? { ...extra.popped } : null,
      tokenIndex: tokIdx,
      tokens: tokens.slice(),
      tokenLabels: tokenLabels.slice()
    });

    const steps = [makeStep(
      'Bắt đầu gọi f(pHead)',
      printBefore
        ? `Danh sách ${formatArr(arr)}. Hàm in TRƯỚC khi gọi đệ quy và in SAU khi đệ quy trả về.`
        : `Danh sách ${formatArr(arr)}. Lệnh in nằm SAU lời gọi đệ quy f(p->next).`
    )];

    arr.forEach((v) => {
      tokIdx++;
      st.push({ uid: uidCounter++, val: `f(${v})` });
      if (printBefore) printed.push(v);
      steps.push(makeStep(
        `Gọi f(${v})`,
        printBefore
          ? `p != NULL: in ${v} ngay lúc đi xuống, rồi đẩy f(${v}) vào Call Stack để gọi f(p->next).`
          : `p != NULL: chưa in ${v}; đẩy khung f(${v}) vào Call Stack rồi gọi f(p->next).`,
        { vars: [`p->data = ${v}`, `Đã in: ${printed.length ? formatArr(printed) : '[]'}`] }
      ));
    });

    tokIdx++;
    steps.push(makeStep(
      'Chạm p == NULL → return',
      'Điều kiện dừng kích hoạt, bắt đầu quay ngược (unwind) từng khung từ đỉnh Call Stack.',
      { vars: ['p = NULL', `Đã in: ${printed.length ? formatArr(printed) : '[]'}`] }
    ));

    for (let i = arr.length - 1; i >= 0; i--) {
      tokIdx++;
      const popped = st.pop();
      printed.push(arr[i]);
      steps.push(makeStep(
        `Quay về f(${arr[i]}) → in ${arr[i]}`,
        `Lời gọi f(p->next) đã trả về nên chạy lệnh sau đệ quy: in ${arr[i]}.`,
        { popped, vars: [`In ra = ${arr[i]}`, `Đã in: ${formatArr(printed)}`] }
      ));
    }

    steps.push(makeStep(
      'Hoàn thành',
      `Thứ tự in ra cuối cùng: ${formatArr(printed)}.`,
      { vars: [`Kết quả = ${formatArr(printed)}`] }
    ));
    return steps;
  }

  // 14. STACK <-> QUEUE REVERSAL CYCLES
  function stackQueueCyclesTrace(arr, times) {
    let cur = arr.map((val, idx) => ({ uid: idx + 1, val }));
    const n = cur.length;
    const steps = [snapArray({
      title: 'Trạng thái ban đầu của Stack S',
      note: `S từ top → bottom là ${formatArr(arr)}, Queue Q ban đầu rỗng. Mỗi chu trình đảo ngược S đúng 1 lần.`,
      slots: cur,
      vars: [`S (top→bottom) = ${formatArr(arr)}`, 'Q = []'],
      pointers: n > 1 ? { top: 0, bottom: n - 1 } : (n === 1 ? { top: 0 } : {})
    })];
    steps[0].headerTitle = 'STACK S (TRÁI = TOP → PHẢI = BOTTOM)';

    for (let c = 1; c <= times; c++) {
      const qArr = cur.map((x) => x.val);
      const stepQ = snapArray({
        title: `Chu trình ${c} (1/2): Pop hết S → Enqueue vào Q`,
        note: `Pop từ top của S nên Q nhận theo thứ tự front → rear: ${formatArr(qArr)}.`,
        slots: cur,
        compare: cur.map((_, idx) => idx),
        vars: ['S = []', `Q (front→rear) = ${formatArr(qArr)}`],
        pointers: n > 1 ? { front: 0, rear: n - 1 } : (n === 1 ? { front: 0 } : {})
      });
      stepQ.headerTitle = 'HÀNG ĐỢI Q (TRÁI = FRONT → PHẢI = REAR)';
      steps.push(stepQ);

      cur = cur.slice().reverse();
      const sArr = cur.map((x) => x.val);
      const stepS = snapArray({
        title: `Chu trình ${c} (2/2): Dequeue hết Q → Push lại S`,
        note: `Dequeue từ front đưa vào S theo LIFO: phần tử lấy ra sau cùng nằm trên top → S bị đảo thành ${formatArr(sArr)}.`,
        slots: cur,
        sorted: cur.map((_, idx) => idx),
        vars: [`Xong chu trình ${c}`, `S (top→bottom) = ${formatArr(sArr)}`],
        pointers: n > 1 ? { top: 0, bottom: n - 1 } : (n === 1 ? { top: 0 } : {})
      });
      stepS.headerTitle = 'STACK S (TRÁI = TOP → PHẢI = BOTTOM)';
      steps.push(stepS);
    }
    return steps;
  }

  // 15. BALANCED BRACKETS CHECK WITH STACK
  function bracketsTrace(str) {
    const chars = String(str || '').split('');
    const tokens = chars.map((_, idx) => idx);
    const tokenLabels = chars.map((ch, idx) => `[${idx}]: '${ch}'`);
    const openToClose = { '(': ')', '[': ']', '{': '}' };
    const closeToOpen = { ')': '(', ']': '[', '}': '{' };

    const st = [];
    let uidCounter = 1;
    let failed = false;

    const makeStep = (tokIdx, title, note, extra = {}) => ({
      kind: 'stack',
      headerTitle: 'KIỂM TRA NGOẶC BẰNG STACK',
      tapeTitle: 'CHUỖI NGOẶC',
      popLabel: extra.popLabel || 'Khớp & Pop',
      title,
      note,
      vars: extra.vars || [`Chuỗi: ${str}`, `size = ${st.length}`],
      variables: `Stack: [${st.map((x) => x.val).join(', ')}]`,
      values: st.map((x) => x.val),
      items: cloneSlots(st),
      popped: extra.popped ? { ...extra.popped } : null,
      tokenIndex: tokIdx,
      tokens: tokens.slice(),
      tokenLabels: tokenLabels.slice()
    });

    const steps = [makeStep(
      -1,
      'Bắt đầu kiểm tra',
      `Chuỗi ${str}. Gặp ngoặc mở thì Push vào Stack; gặp ngoặc đóng thì phải khớp với ngoặc mở ở đỉnh Stack.`
    )];

    for (let i = 0; i < chars.length; i++) {
      const ch = chars[i];
      if (openToClose[ch]) {
        st.push({ uid: uidCounter++, val: ch });
        steps.push(makeStep(
          i,
          `Đọc '${ch}' → Push vào Stack`,
          `Gặp ngoặc mở '${ch}', đẩy lên đỉnh Stack (size = ${st.length}).`,
          { vars: [`Ký tự = '${ch}'`, `size = ${st.length}`] }
        ));
      } else if (closeToOpen[ch]) {
        if (st.length === 0) {
          failed = true;
          steps.push(makeStep(
            i,
            `Lỗi: Gặp '${ch}' khi Stack rỗng`,
            `Đọc ngoặc đóng '${ch}' nhưng Stack đang rỗng, không có ngoặc mở tương ứng → Kết luận: Gặp ngoặc đóng khi stack rỗng.`,
            { vars: [`Ký tự = '${ch}'`, 'LỖI: Stack rỗng'] }
          ));
          break;
        }
        const top = st[st.length - 1];
        if (top.val !== closeToOpen[ch]) {
          failed = true;
          steps.push(makeStep(
            i,
            `Lỗi: '${ch}' không khớp đỉnh '${top.val}'`,
            `Đỉnh Stack đang là '${top.val}' (cần '${openToClose[top.val]}'), nhưng lại gặp '${ch}' → Kết luận: Sai loại ngoặc khi đóng.`,
            { vars: [`Đỉnh = '${top.val}'`, `Gặp = '${ch}' (LỖI)`] }
          ));
          break;
        }
        const popped = st.pop();
        steps.push(makeStep(
          i,
          `Đọc '${ch}' → Khớp '${popped.val}'`,
          `Đỉnh Stack là '${popped.val}' khớp với '${ch}' → Pop khỏi Stack.`,
          { popped, vars: [`Khớp ${popped.val}${ch}`, `size = ${st.length}`] }
        ));
      }
    }

    if (!failed) {
      if (st.length === 0) {
        steps.push(makeStep(
          chars.length,
          'Kết luận: Hợp lệ',
          'Đã duyệt hết chuỗi, mọi cặp ngoặc đều khớp và Stack rỗng.',
          { vars: ['size = 0', 'Kết quả = Hợp lệ'] }
        ));
      } else {
        steps.push(makeStep(
          chars.length,
          'Lỗi: Còn ngoặc mở chưa đóng',
          `Đã hết chuỗi nhưng Stack vẫn còn [${st.map((x) => x.val).join(', ')}] chưa có ngoặc đóng → Kết luận: Kết thúc còn ngoặc mở chưa đóng.`,
          { vars: [`Còn dư: ${st.map((x) => x.val).join(' ')}`, 'Kết quả = Chưa đóng hết'] }
        ));
      }
    }
    return steps;
  }

  // 16. INFIX TO POSTFIX CONVERSION (OPERATOR STACK TRACE)
  function infixToPostfixTrace(exp) {
    const tokens = String(exp || '').replace(/\s+/g, '').split('').filter(Boolean);
    const tokenLabels = tokens.map((t) => `Token: ${t}`);
    const prec = { '+': 1, '-': 1, '*': 2, '/': 2 };
    const st = [];
    const out = [];
    let uidCounter = 1;

    const makeStep = (tokIdx, title, note, extra = {}) => ({
      kind: 'stack',
      headerTitle: 'STACK TOÁN TỬ (TRUNG TỐ → HẬU TỐ)',
      tapeTitle: 'BIỂU THỨC',
      popLabel: 'Ra hậu tố',
      title,
      note,
      vars: [`Hậu tố: ${out.length ? out.join(' ') : '(rỗng)'}`].concat(extra.vars || []),
      variables: `Hậu tố: ${out.join(' ')}`,
      values: st.map((x) => x.val),
      items: cloneSlots(st),
      popped: extra.popped ? { ...extra.popped } : null,
      tokenIndex: tokIdx,
      tokens: tokens.slice(),
      tokenLabels: tokenLabels.slice()
    });

    const steps = [makeStep(
      -1,
      'Bắt đầu chuyển Trung tố → Hậu tố',
      `Biểu thức ${exp}. Toán hạng xuất ngay ra hậu tố; ngoặc và toán tử xử lý qua Stack theo độ ưu tiên (* / cao hơn + -).`
    )];

    tokens.forEach((tok, idx) => {
      if (/^[a-zA-Z0-9]$/.test(tok)) {
        out.push(tok);
        steps.push(makeStep(
          idx,
          `Đọc toán hạng '${tok}'`,
          `Gặp toán hạng '${tok}' → đưa thẳng ra chuỗi hậu tố.`,
          { vars: [`Token = ${tok}`] }
        ));
      } else if (tok === '(') {
        st.push({ uid: uidCounter++, val: '(' });
        steps.push(makeStep(
          idx,
          "Đọc '(' → Push vào Stack",
          "Gặp ngoặc mở '(' → đẩy vào Stack để đánh dấu phạm vi ưu tiên trong ngoặc.",
          { vars: ['Token = ('] }
        ));
      } else if (tok === ')') {
        const poppedOps = [];
        let lastPopped = null;
        while (st.length && st[st.length - 1].val !== '(') {
          const p = st.pop();
          out.push(p.val);
          poppedOps.push(p.val);
          lastPopped = p;
        }
        if (st.length && st[st.length - 1].val === '(') st.pop();
        steps.push(makeStep(
          idx,
          "Đọc ')' → Pop toán tử trong ngoặc",
          `Pop toán tử (${poppedOps.length ? poppedOps.join(' ') : 'rỗng'}) ra hậu tố cho tới khi gặp '(' và loại bỏ '('.`,
          { popped: lastPopped, vars: ['Token = )'] }
        ));
      } else {
        const poppedOps = [];
        let lastPopped = null;
        while (st.length && st[st.length - 1].val !== '(' && (prec[st[st.length - 1].val] || 0) >= (prec[tok] || 0)) {
          const p = st.pop();
          out.push(p.val);
          poppedOps.push(p.val);
          lastPopped = p;
        }
        st.push({ uid: uidCounter++, val: tok });
        steps.push(makeStep(
          idx,
          `Đọc toán tử '${tok}'`,
          poppedOps.length
            ? `Pop toán tử ưu tiên ≥ '${tok}' (${poppedOps.join(' ')}) ra hậu tố trước, rồi Push '${tok}' vào Stack.`
            : `Đỉnh Stack rỗng, là '(' hoặc ưu tiên thấp hơn → Push '${tok}' vào Stack.`,
          { popped: lastPopped, vars: [`Token = ${tok}`] }
        ));
      }
    });

    if (st.length > 0) {
      const rem = [];
      let lastPopped = null;
      while (st.length) {
        const p = st.pop();
        out.push(p.val);
        rem.push(p.val);
        lastPopped = p;
      }
      steps.push(makeStep(
        tokens.length,
        'Hết chuỗi → Pop hết Stack',
        `Đưa các toán tử còn lại (${rem.join(' ')}) ra cuối → Kết quả: ${out.join(' ')}.`,
        { popped: lastPopped, vars: [`Kết quả = ${out.join(' ')}`] }
      ));
    } else {
      steps.push(makeStep(
        tokens.length,
        'Hoàn thành',
        `Kết quả hậu tố: ${out.join(' ')}.`,
        { vars: [`Kết quả = ${out.join(' ')}`] }
      ));
    }
    return steps;
  }

  // 17. DECIMAL TO BINARY CONVERSION VIA STACK
  function decimalToBinaryTrace(num) {
    const actions = [];
    let tmp = num;
    const rems = [];
    while (tmp > 0) {
      const q = Math.floor(tmp / 2);
      const rem = tmp % 2;
      rems.push(rem);
      actions.push({ kind: 'push', n: tmp, q, rem, label: `${tmp}÷2=${q} d ${rem}` });
      tmp = q;
    }
    for (let i = rems.length - 1; i >= 0; i--) {
      actions.push({ kind: 'pop', rem: rems[i], label: `Pop() → ${rems[i]}` });
    }

    const tokens = actions.map((_, i) => i);
    const tokenLabels = actions.map((a) => a.label);
    const st = [];
    const outBits = [];
    let uidCounter = 1;

    const makeStep = (tokIdx, title, note, extra = {}) => ({
      kind: 'stack',
      headerTitle: `ĐỔI ${num}₁₀ → NHỊ PHÂN BẰNG STACK`,
      tapeTitle: 'CHIA 2 / POP',
      popLabel: 'Bit in ra',
      title,
      note,
      vars: extra.vars || [`n = ${num}`],
      variables: `Push: ${rems.join(', ')}`,
      values: st.map((x) => x.val),
      items: cloneSlots(st),
      popped: extra.popped ? { ...extra.popped } : null,
      tokenIndex: tokIdx,
      tokens: tokens.slice(),
      tokenLabels: tokenLabels.slice()
    });

    const steps = [makeStep(
      -1,
      `Bắt đầu đổi n = ${num}`,
      'Giai đoạn 1: Chia 2 liên tiếp, đẩy phần dư vào Stack. Giai đoạn 2: Pop hết Stack theo LIFO để ghép số nhị phân.',
      { vars: [`n = ${num}`, 'Stack = []'] }
    )];

    actions.forEach((act, idx) => {
      if (act.kind === 'push') {
        st.push({ uid: uidCounter++, val: act.rem });
        steps.push(makeStep(
          idx,
          `Chia ${act.n} ÷ 2 = ${act.q} dư ${act.rem} → Push(${act.rem})`,
          `Đẩy bit dư ${act.rem} vào Stack. Thứ tự Push từ dưới lên đỉnh là [${st.map((x) => x.val).join(', ')}].`,
          { vars: [`n còn lại = ${act.q}`, `Đã Push: ${st.map((x) => x.val).join(', ')}`] }
        ));
      } else {
        const popped = st.pop();
        outBits.push(popped.val);
        steps.push(makeStep(
          idx,
          `Pop() → ${popped.val}`,
          `Lấy bit đỉnh Stack = ${popped.val} theo LIFO → chuỗi nhị phân hiện tại: ${outBits.join('')}.`,
          { popped, vars: [`Nhị phân: ${outBits.join('')}`, `Còn trong Stack = ${st.length}`] }
        ));
      }
    });

    steps.push(makeStep(
      actions.length,
      'Hoàn thành',
      `Thứ tự bit được Push vào: ${rems.join(', ')}. Khi Pop hết ra thu được: ${outBits.join('')}₂.`,
      { vars: [`Push: ${rems.join(', ')}`, `Kết quả: ${outBits.join('')}₂`] }
    ));
    return steps;
  }

  // 18. TREE TRAVERSAL & TREE SEARCH STEP TRACES
  function treeTraversalSteps(tree, order) {
    const seq = walk(tree, order);
    const orderLabel = order === 'Level' ? 'theo mức (BFS)' : order;
    return seq.map((val, idx) => {
      const visited = seq.slice(0, idx + 1);
      return treeStep(
        `Duyệt ${orderLabel}: thăm ${val}`,
        `Thăm nút ${val} (${idx + 1}/${seq.length}) → dãy hiện tại: ${formatArr(visited)}.`,
        tree,
        {
          highlight: [val],
          visited,
          extraVar: `${order}: ${formatArr(visited)}`
        }
      );
    });
  }

  function treeSearchSteps(tree, key) {
    const steps = [];
    const visited = [];
    let cur = tree;
    while (cur) {
      visited.push(cur.v);
      if (cur.v === key) {
        steps.push(treeStep(
          `Tìm thấy ${key} (qua ${visited.length} nút)`,
          `Đường tìm kiếm: ${visited.join(' → ')}. Tổng cộng đi qua ${visited.length} nút (${visited.length - 1} cạnh).`,
          tree,
          {
            highlight: [cur.v],
            visited: visited.slice(),
            extraVar: `Số nút đã qua = ${visited.length}`
          }
        ));
        break;
      }
      const goLeft = key < cur.v;
      const sym = goLeft ? '<' : '>';
      steps.push(treeStep(
        `So sánh ${key} với ${cur.v}`,
        `${key} ${sym} ${cur.v} → đi tiếp sang nhánh ${goLeft ? 'trái' : 'phải'}.`,
        tree,
        {
          highlight: [cur.v],
          visited: visited.slice(),
          probe: { v: key, atVal: cur.v, dir: goLeft ? 'left' : 'right', label: `${key} ${sym} ${cur.v} → ${goLeft ? 'Trái' : 'Phải'}` },
          extraVar: `Đã qua: ${visited.join(' → ')}`
        }
      ));
      cur = goLeft ? cur.l : cur.r;
    }
    return steps;
  }

  const Algo = {
    formatArr,
    formatSeq,
    snapArray,
    sort,
    quickSort,
    binary,
    operations,
    postfix,
    linkedPairs,
    cloneTree,
    height,
    bf,
    bfIuh,
    walk,
    leaves,
    rotRight,
    rotLeft,
    balance,
    insertNode,
    deleteNode,
    build,
    treeStep,
    treeTrace,
    recursionListTrace,
    stackQueueCyclesTrace,
    bracketsTrace,
    infixToPostfixTrace,
    decimalToBinaryTrace,
    treeTraversalSteps,
    treeSearchSteps
  };

  root.DSA_ALGO = Algo;
  if (typeof module !== 'undefined' && module.exports) module.exports = Algo;
})(typeof window !== 'undefined' ? window : globalThis);
