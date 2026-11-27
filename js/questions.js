// DSA Studio IUH — Complete 29-Type Question Generator
// Faithfully ported from DSA_Studio/src/Questions.cs with deterministic seeded PRNG and simulator presets.

(function (root) {
  'use strict';

  const Algo = root.DSA_ALGO || (typeof require === 'function' ? require('./algorithms.js') : null);
  const Lessons = root.DSA_LESSONS || (typeof require === 'function' ? require('./lessons.js') : null);

  function createRng(seed) {
    let s = (seed >>> 0) || 1;
    function rand() {
      s += 0x6D2B79F5;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
    return {
      next(minOrMax, maxOpt) {
        if (maxOpt === undefined) return Math.floor(rand() * minOrMax);
        return minOrMax + Math.floor(rand() * (maxOpt - minOrMax));
      },
      shuffle(arr) {
        const a = arr.slice();
        for (let i = a.length - 1; i > 0; i--) {
          const j = Math.floor(rand() * (i + 1));
          const tmp = a[i]; a[i] = a[j]; a[j] = tmp;
        }
        return a;
      }
    };
  }

  function finish(q, r, correct, ...wrong) {
    q.correct = String(correct);
    const all = [q.correct];
    for (const w of wrong) {
      const ws = String(w);
      if (ws !== q.correct && !all.includes(ws)) all.push(ws);
    }
    if (all.length < 4) throw new Error('Thiếu đáp án nhiễu dạng ' + q.type);
    q.options = r.shuffle(all.slice(0, 4));
  }

  function distinct(r, n) {
    const pool = Array.from({ length: 40 }, (_, i) => i + 1);
    return r.shuffle(pool).slice(0, n);
  }

  function explainTrace(trace) {
    return trace
      .filter((x) =>
        x.title.startsWith('Xong lượt') ||
        x.title.startsWith('Xoay') ||
        x.title.startsWith('Tìm') ||
        x.title === 'Kết quả'
      )
      .map((x) => `${x.title}: ${x.values && x.values.length > 0 ? Algo.formatArr(x.values) + '. ' : ''}${x.variables}. ${x.note}`)
      .join('\n\n');
  }

  function reverseArrStr(a) {
    return Algo.formatArr(a.slice().reverse());
  }

  function make(type, seed, difficulty = 2) {
    const r = createRng(seed);
    const n = r.next(4, 7) + (difficulty > 1 ? 1 : 0);
    let a = distinct(r, n);
    const q = {
      id: `q${type}_${seed >>> 0}_${Math.floor(Math.random() * 1e6).toString(36)}`,
      type,
      seed: seed >>> 0,
      prompt: '',
      correct: '',
      options: [],
      explanation: '',
      trace: [],
      simPreset: null
    };
    const basev = r.next(2, 12) * 5;

    switch (type) {
      case 1: {
        const variant = r.next(5);
        const prompts = [
          'Truy cập a[k] trong mảng có truy cập ngẫu nhiên, k hợp lệ.',
          'Tìm một khóa trong cây AVL có n nút, xét trường hợp xấu nhất.',
          'Đếm lá bằng duyệt một BST n nút, không lưu sẵn số lá.',
          'Chèn nút sau p trong DSLK đơn khi đã có con trỏ p, không tính cấp phát.',
          'Quick Sort với phân hoạch cực lệch ở mỗi lần, xét trường hợp xấu nhất.'
        ];
        const ans = ['O(1)', 'O(log n)', 'O(n)', 'O(1)', 'O(n²)'];
        const reasons = [
          'Mảng tính trực tiếp địa chỉ phần tử theo chỉ số.',
          'AVL có chiều cao O(log n), tìm kiếm đi một nhánh.',
          'Muốn đếm đầy đủ phải xét mọi nút.',
          'Chỉ cập nhật số hữu hạn liên kết. Nếu phải tìm p trước thì có thể tốn O(n).',
          'Kích thước các lần phân hoạch là n, n-1,...; tổng bậc hai.'
        ];
        q.prompt = prompts[variant] + '\nĐộ phức tạp là gì?';
        q.explanation = reasons[variant];
        finish(q, r, ans[variant], ...['O(1)', 'O(log n)', 'O(n)', 'O(n²)'].filter((x) => x !== ans[variant]));
        break;
      }

      case 2: {
        const index = r.next(n);
        const key = a[index];
        q.prompt = `Tìm kiếm tuyến tính từ i=0 trong ${Algo.formatArr(a)}. Gặp a[i]==${key} thì return i ngay. Hàm trả về gì?`;
        q.explanation = `Đi từ trái sang phải. ${key} nằm tại chỉ số ${index}, tức phần tử thứ ${index + 1}. Cần ${index + 1} lần so sánh khóa.`;
        finish(q, r, String(index), String(index + 1), '-1', String(index + 2), String(index + 3));
        for (let i = 0; i <= index; i++) {
          q.trace.push(Algo.snapArray({
            title: `Xét a[${i}]`,
            note: a[i] === key ? `Tìm thấy; trả về ${i}` : 'Chưa bằng khóa; đi tiếp.',
            values: a,
            vars: [`key = ${key}`, `i = ${i}`],
            variables: `key = ${key}`,
            active: [i],
            compare: a[i] === key ? [] : [i],
            sorted: a[i] === key ? [i] : [],
            pointers: { i }
          }));
        }
        break;
      }

      case 3: {
        const sortedA = a.slice().sort((x, y) => x - y);
        const key = sortedA[r.next(n)];
        q.trace = Algo.binary(sortedA, key);
        const mids = q.trace.filter((x) => x.title === 'Xét phần tử giữa').map((x) => x.active[0]);
        q.prompt = `Binary Search tìm ${key} trong ${Algo.formatArr(sortedA)}. Dùng [low,high] đóng, mid=(low+high)/2 lấy phần nguyên. Có bao nhiêu lần xét mid?`;
        const c = mids.length;
        q.explanation = `Các chỉ số mid: ${Algo.formatSeq(mids)}. Mỗi lần bỏ nửa không thể chứa khóa. Với đoạn đóng, điều kiện lặp là low<=high.`;
        finish(q, r, String(c), String(c + 1), String(c + 2), String(c + 3));
        q.simPreset = { mode: 'binary', arr: sortedA.join(', '), key: String(key) };
        break;
      }

      case 4: {
        const names = ['Selection Sort', 'Insertion Sort', 'Bubble Sort', 'Interchange Sort'];
        const snippets = [
          'min=i;\nfor(j=i+1; j<n; j++)\n  if(a[j]<a[min]) min=j;\nswap(a[i],a[min]);',
          'x=a[i]; pos=i-1;\nwhile(pos>=0 && a[pos]>x) {\n  a[pos+1]=a[pos]; pos--;\n}\na[pos+1]=x;',
          'for(j=0; j<n-i-1; j++)\n  if(a[j]>a[j+1]) swap(a[j],a[j+1]);',
          'for(j=i+1; j<n; j++)\n  if(a[i]>a[j]) swap(a[i],a[j]);'
        ];
        const expls = [
          'Quét tìm min rồi chỉ đổi một lần cuối lượt.',
          'Giữ x, dịch phần tử lớn hơn sang phải rồi chèn x.',
          'So sánh và đổi hai phần tử kề nhau.',
          'Giữ vị trí i và đổi ngay mỗi khi gặp a[j] nhỏ hơn.'
        ];
        const ix = r.next(4);
        q.prompt = 'Đoạn xử lý bên trong lượt sắp xếp thuộc thuật toán nào?\n\n' + snippets[ix];
        q.explanation = expls[ix];
        finish(q, r, names[ix], ...names.filter((x) => x !== names[ix]));
        const modeName = names[ix].split(' ')[0];
        q.trace = Algo.sort(a, modeName);
        q.simPreset = { mode: modeName.toLowerCase(), arr: a.join(', '), key: '' };
        break;
      }

      case 5:
      case 6:
      case 8: {
        const mode = type === 5 ? 'Interchange' : (type === 6 ? 'Selection' : 'Bubble');
        q.trace = Algo.sort(a, mode);
        const pass = r.next(0, Math.min(3, n - 1));
        const end = q.trace.find((step) => step.title === `Xong lượt i = ${pass}`).values;
        const sorted = a.slice().sort((x, y) => x - y);
        const hintDesc = type === 8
          ? 'Quét j từ trái sang phải, đổi a[j],a[j+1]. '
          : (type === 5
            ? 'Cố định i, quét j=i+1..n-1 và đổi a[i],a[j] ngay khi a[i]>a[j]. '
            : 'Chọn min của đoạn i..n-1, đổi với a[i] ở cuối lượt. ');
        q.prompt = `${mode} Sort tăng dần trên ${Algo.formatArr(a)}. ${hintDesc}\nMảng sau khi hoàn thành vòng ngoài i=${pass} (i bắt đầu từ 0)?`;
        const upToPass = q.trace.filter((x) => {
          if (!x.title.startsWith('Xong lượt')) return true;
          const pIdx = parseInt(x.title.slice(x.title.lastIndexOf(' ') + 1), 10);
          return pIdx <= pass;
        });
        q.explanation = `${explainTrace(upToPass)}\n\nChỉ chạy đến hết lượt yêu cầu. Kết quả: ${Algo.formatArr(end)}`;
        finish(
          q, r,
          Algo.formatArr(end),
          Algo.formatArr(a),
          Algo.formatArr(sorted),
          reverseArrStr(end),
          Algo.formatArr(end.map((x) => x + 1)),
          Algo.formatArr(end.map((x) => x + 2))
        );
        q.simPreset = { mode: mode.toLowerCase(), arr: a.join(', '), key: '' };
        break;
      }

      case 7: {
        q.trace = Algo.sort(a, 'Insertion');
        const pass = r.next(1, n);
        const end = q.trace.find((step) => step.title === `Xong lượt i = ${pass}`);
        const x = a[pass];
        const pos = end.active[0] - 1;
        q.prompt = `Insertion Sort trên ${Algo.formatArr(a)}. Code giữ x=a[i], đặt pos=i-1, dịch khi a[pos]>x và giảm pos; cuối cùng a[pos+1]=x.\nSau TOÀN BỘ lượt i=${pass}, x và pos bằng gì?`;
        q.explanation = `x giữ giá trị a[i] ban đầu là ${x}. Sau dịch, vị trí chèn là ${pos + 1}, nên pos=${pos}. Mảng cuối lượt: ${Algo.formatArr(end.values)}. Không dùng pos lúc bắt đầu lượt.`;
        const ans = `x=${x}, pos=${pos}`;
        finish(q, r, ans, `x=${x}, pos=${pos + 1}`, `x=${x}, pos=${pos + 2}`, `x=${x + 1}, pos=${pos}`);
        q.simPreset = { mode: 'insertion', arr: a.join(', '), key: '' };
        break;
      }

      case 9: {
        let inv = 0;
        const counts = [];
        for (let i = 0; i < n; i++) {
          let c = 0;
          for (let j = i + 1; j < n; j++) if (a[j] < a[i]) c++;
          inv += c;
          counts.push(`${a[i]}: ${c} số nhỏ hơn ở bên phải`);
        }
        q.prompt = `Bubble Sort tăng dần ${Algo.formatArr(a)}. Chỉ đổi cặp kề khi trái > phải. Tổng số lần swap?`;
        q.explanation = `${counts.join('\n')}\nTổng nghịch thế = ${inv}. Mỗi swap kề giảm đúng một nghịch thế.`;
        finish(q, r, String(inv), String(inv + 1), String(inv + 2), String(inv + 3));
        q.trace = Algo.sort(a, 'Bubble');
        q.simPreset = { mode: 'bubble', arr: a.join(', '), key: '' };
        break;
      }

      case 10: {
        const col = r.next(2) === 0;
        const desc = r.next(2) === 0;
        const left = 'a[i][j]';
        const right = col ? 'a[k][j]' : 'a[i][k]';
        const ans = `${desc ? 'Giảm' : 'Tăng'} dần theo ${col ? 'cột' : 'hàng'}`;
        q.prompt = `Với mọi cặp chỉ số thích hợp (k lớn hơn chỉ số đang xét), code:\nif (${left}${desc ? ' < ' : ' > '}${right})\n    swap(${left}, ${right});\n\nChức năng là gì?`;
        q.explanation = `Chỉ số ${col ? 'cột j' : 'hàng i'} cố định trong cặp ô, nên chỉ sắp theo ${col ? 'cột' : 'hàng'}. Đổi khi ${desc ? 'giá trị trước nhỏ hơn: đưa số lớn về trước.' : 'giá trị trước lớn hơn: đưa số nhỏ về trước.'}`;
        const pool = ['Tăng dần theo cột', 'Giảm dần theo cột', 'Tăng dần theo hàng', 'Giảm dần theo hàng'];
        finish(q, r, ans, ...pool.filter((z) => z !== ans));
        break;
      }

      case 11: {
        const v = r.next(4);
        const ps = [
          'DSLK đơn không vòng, không nút giả. Điều kiện danh sách rỗng?',
          'DSLK đơn vòng không rỗng: next của nút cuối trỏ đâu?',
          'DSLK đôi không vòng, không nút giả: prev của nút đầu bằng gì?',
          'DSLK đơn không vòng có đúng một nút X. Mô tả đúng?'
        ];
        const ans = ['head == NULL', 'Nút đầu (head)', 'NULL', 'head = tail = X; X.next = NULL'];
        q.prompt = ps[v];
        q.explanation = 'Xem loại liên kết và việc có nút giả hay không. Đơn vòng nối đuôi về đầu; danh sách đôi không vòng kết thúc hai đầu bằng NULL. Danh sách một nút có head và tail cùng trỏ X.';
        finish(q, r, ans[v], 'head->next == head', 'Nút cuối luôn trỏ chính nó', 'Mọi danh sách đều có nút giả', 'head = NULL, tail = X');
        break;
      }

      case 12: {
        const x = String.fromCharCode(68 + r.next(12));
        q.prompt = `A → B → C → NULL, p trỏ B, ${x} là nút mới. Cặp lệnh nào chèn ${x} ngay sau B mà giữ nguyên phần đuôi?`;
        const ans = `${x}->next = p->next; p->next = ${x};`;
        q.explanation = 'Lưu liên kết đến C vào nút mới trước, rồi mới thay next của B. Nếu đổi thứ tự hai lệnh, nút mới tự trỏ chính nó.';
        finish(q, r, ans, `p->next = ${x}; ${x}->next = p->next;`, `${x}->next = p; p = ${x};`, `p->next = NULL; ${x}->next = p;`);
        break;
      }

      case 13: {
        q.trace = Algo.linkedPairs(a);
        const end = q.trace[q.trace.length - 1].values;
        q.prompt = `DSLK chứa ${Algo.formatArr(a)}. Đổi dữ liệu từng cặp nút (1,2), (3,4),...; nút cuối lẻ giữ nguyên. Dãy cuối?`;
        q.explanation = 'Hai con trỏ tiến qua hai nút sau mỗi lượt; chỉ đổi dữ liệu, không đổi next.\n' +
          q.trace.map((s) => `${s.title}: ${Algo.formatArr(s.values)}`).join('\n');
        finish(
          q, r,
          Algo.formatArr(end),
          Algo.formatArr(a),
          reverseArrStr(a),
          Algo.formatArr(a.slice().sort((x, y) => x - y)),
          Algo.formatArr(end.map((x) => x + 1))
        );
        q.simPreset = { mode: 'linked', arr: a.join(', '), key: '' };
        break;
      }

      case 14: {
        a = a.slice(0, 3);
        const both = r.next(2) === 0;
        const rev = a.slice().reverse();
        const result = both ? a.concat(rev) : rev;
        q.prompt = `Danh sách ${Algo.formatArr(a)}. Hàm f có kiểm tra p==NULL thì return.\n${both ? 'in(p->data);\n' : ''}f(p->next);\nin(p->data);\n\nThứ tự các giá trị in ra?`;
        q.explanation = `${both ? 'Lúc đi xuống in ' + Algo.formatSeq(a) + '. ' : ''}Lệnh sau lời gọi đệ quy chạy khi quay về, nên in ${Algo.formatSeq(rev)}. Hàm chỉ in, không đảo next.`;
        finish(
          q, r,
          Algo.formatArr(result),
          Algo.formatArr(a),
          Algo.formatArr(a.concat(a)),
          Algo.formatArr(a.concat(a.slice(1))),
          Algo.formatArr(rev.concat(a))
        );
        break;
      }

      case 15:
      case 16: {
        const isQueue = type === 16;
        const ops = [a[0], a[1], -1, a[2], a[3], -1, a[1]];
        q.trace = Algo.operations(ops, isQueue);
        const end = q.trace[q.trace.length - 1].values;
        const desired = isQueue ? end : end.slice().reverse();
        const opStr = ops.map((v) => v === -1 ? (isQueue ? 'dequeue()' : 'pop()') : ((isQueue ? 'enqueue(' : 'push(') + v + ')')).join(', ');
        q.prompt = `${isQueue ? 'Queue' : 'Stack'} ban đầu rỗng.\n${opStr}.\nDãy còn lại từ ${isQueue ? 'front đến rear' : 'top đến bottom'}?`;
        q.explanation = q.trace.map((s) => `${s.title}: ${Algo.formatArr(s.values)} — ${s.note}`).join('\n') +
          '\nTrong mô phỏng, stack ghi bottom → top. Đáp án phải đọc theo chiều đề hỏi.';
        finish(
          q, r,
          Algo.formatArr(desired),
          reverseArrStr(desired),
          Algo.formatArr(a.slice(0, 3)),
          Algo.formatArr(a.slice(1, 4)),
          Algo.formatArr(desired.map((x) => x + 1))
        );
        q.simPreset = { mode: isQueue ? 'queue' : 'stack', arr: ops.join(', '), key: '' };
        break;
      }

      case 17: {
        a = a.slice(0, 4);
        const times = r.next(1, 4);
        const end = times % 2 === 0 ? a.slice() : a.slice().reverse();
        q.prompt = `S top→bottom: ${Algo.formatArr(a)}; Q rỗng. Một chu trình: pop hết S đưa vào Q, rồi dequeue hết Q push lại S.\nSau ${times} chu trình, S top→bottom là gì?`;
        q.explanation = `Mỗi chu trình đảo thứ tự stack một lần. Số chu trình ${times} là ${times % 2 === 0 ? 'chẵn nên trở lại ban đầu.' : 'lẻ nên dãy bị đảo.'}`;
        finish(
          q, r,
          Algo.formatArr(end),
          reverseArrStr(end),
          Algo.formatArr(a.slice().sort((x, y) => x - y)),
          Algo.formatArr(end.map((x) => x + 1)),
          Algo.formatArr(end.map((x) => x + 2))
        );
        break;
      }

      case 18: {
        const patterns = ['([{}])', '([)]', '(()', '())(', '{[()()]}', '[({})]'];
        const ix = r.next(patterns.length);
        const str = patterns[ix];
        const ok = ix === 0 || ix === 4 || ix === 5;
        const ans = ok
          ? 'Hợp lệ; kết thúc stack rỗng.'
          : (ix === 1 ? 'Sai loại ngoặc khi đóng.' : (ix === 2 ? 'Kết thúc còn ngoặc mở chưa đóng.' : 'Gặp ngoặc đóng khi stack rỗng.'));
        q.prompt = `Kiểm tra chuỗi ngoặc ${str} bằng stack. Kết luận đúng?`;
        q.explanation = `Ngoặc đóng phải khớp ngoặc mở ở đỉnh stack. Số lượng mở=đóng chưa đủ; thứ tự lồng cũng phải hợp lệ.\nKết luận: ${ans}`;
        const pool = ['Hợp lệ; kết thúc stack rỗng.', 'Sai loại ngoặc khi đóng.', 'Kết thúc còn ngoặc mở chưa đóng.', 'Gặp ngoặc đóng khi stack rỗng.'];
        finish(q, r, ans, ...pool.filter((x) => x !== ans));
        break;
      }

      case 19: {
        const ch = 97 + r.next(0, 20);
        const u = String.fromCharCode(ch);
        const v = String.fromCharCode(ch + 1);
        const w = String.fromCharCode(ch + 2);
        const plus = r.next(2) === 0;
        const exp = plus ? `${u}*(${v}+${w})` : `(${u}-${v})/${w}`;
        const ans = plus ? `${u} ${v} ${w} + *` : `${u} ${v} - ${w} /`;
        q.prompt = `Hậu tố của ${exp} là gì?`;
        q.explanation = `Xử lý biểu thức trong ngoặc trước; mỗi phép toán hậu tố viết hai toán hạng trước rồi toán tử. Kết quả: ${ans}`;
        finish(
          q, r, ans,
          plus ? `${u} ${v} * ${w} +` : `${u} ${v} ${w} / -`,
          `* ${u} + ${v} ${w}`,
          `/ - ${u} ${v} ${w}`,
          `${u} ${v} + ${w} *`
        );
        break;
      }

      case 20: {
        const x = r.next(4, 14);
        const y = r.next(1, 5);
        const z = r.next(2, 6);
        const exp = `${x} ${y} - ${z} *`;
        q.trace = Algo.postfix(exp);
        const ans = (x - y) * z;
        q.prompt = `Giá trị hậu tố: ${exp} ?`;
        q.explanation = `Gặp -: pop ${y} trước (phải), rồi ${x} (trái). Tính ${x}-${y}=${x - y}. Sau đó nhân ${z} cho kết quả ${ans}.`;
        finish(q, r, String(ans), String(-ans), String(x - y * z), String(ans + z), String(ans + z + 1));
        q.simPreset = { mode: 'postfix', arr: exp, key: '' };
        break;
      }

      case 21: {
        const b = basev;
        const t = {
          v: b,
          l: { v: b - 5, l: { v: b - 8, l: null, r: null }, r: { v: b + 2, l: null, r: null } },
          r: { v: b + 10, l: null, r: null }
        };
        q.prompt = `Cây gốc ${b}, trái ${b - 5}, phải ${b + 10}; nút ${b - 5} có trái ${b - 8}, phải ${b + 2}. Cây có phải BST (khóa phân biệt) không?`;
        q.trace.push(Algo.treeStep('Cây đang xét', 'Kiểm tra mọi nút trong cây con so với tổ tiên.', t, { highlight: [b + 2, b] }));
        q.explanation = `${b + 2} nằm trong cây con TRÁI của ${b} nhưng lại lớn hơn ${b}. Chỉ kiểm tra cha-con trực tiếp là chưa đủ.`;
        finish(
          q, r,
          'Không; có khóa cây trái lớn hơn gốc.',
          'Có; mỗi nút có tối đa hai con.',
          'Có; chỉ cần so với cha trực tiếp.',
          'Không; BST bắt buộc mọi nút có hai con.'
        );
        break;
      }

      case 22: {
        const h = r.next(2, 6);
        const leaf = r.next(2) === 0;
        const ans = leaf ? (1 << h) : ((1 << (h + 1)) - 1);
        q.prompt = `Cây nhị phân perfect có chiều cao ${h} CẠNH (gốc sâu 0). ${leaf ? 'Có bao nhiêu nút lá?' : 'Có tổng bao nhiêu nút?'}`;
        q.explanation = `Có ${h + 1} mức. ${leaf ? 'Lá = 2^h = ' + ans : 'Tổng nút = 2^(h+1)-1 = ' + ans}. Nếu chiều cao được đếm bằng mức thì phải đổi công thức.`;
        finish(q, r, String(ans), String(ans + 1), String(ans - 1), String(ans * 2));
        break;
      }

      case 23: {
        const t = Algo.build(a, false);
        const orders = ['NLR', 'LNR', 'LRN', 'Level'];
        const order = orders[r.next(4)];
        const name = order === 'Level' ? 'theo mức, trái sang phải' : order;
        const ans = Algo.formatArr(Algo.walk(t, order));
        q.prompt = `BST tạo bằng chèn lần lượt ${Algo.formatArr(a)}, không cân bằng. Dãy duyệt ${name}?`;
        q.explanation = `NLR: nút-trái-phải; LNR: trái-nút-phải; LRN: trái-phải-nút; theo mức dùng queue. Kết quả: ${ans}`;
        finish(
          q, r, ans,
          ...orders.map((o) => Algo.formatArr(Algo.walk(t, o))),
          reverseArrStr(a),
          Algo.formatArr(a.map((x) => x + 1)),
          Algo.formatArr(a.map((x) => x + 2))
        );
        q.trace = Algo.treeTrace(a, false, null);
        q.trace.push(Algo.treeStep(`Duyệt ${name}`, `Thứ tự: ${ans}`, t));
        q.simPreset = { mode: 'bst', arr: a.join(', '), key: '' };
        break;
      }

      case 24: {
        const t = Algo.build(a, false);
        const pre = Algo.walk(t, 'NLR');
        const ino = Algo.walk(t, 'LNR');
        const post = Algo.walk(t, 'LRN');
        q.prompt = `Nhãn phân biệt. NLR = ${Algo.formatArr(pre)}; LNR = ${Algo.formatArr(ino)}. Dãy LRN là gì?`;
        q.explanation = `Gốc là phần tử đầu NLR: ${pre[0]}. Tách LNR tại gốc, lặp cho hai cây con. Sau đó đọc trái-phải-gốc. Kết quả: ${Algo.formatArr(post)}`;
        finish(
          q, r,
          Algo.formatArr(post),
          Algo.formatArr(pre),
          Algo.formatArr(ino),
          reverseArrStr(post),
          Algo.formatArr(post.map((x) => x + 1)),
          Algo.formatArr(post.map((x) => x + 2))
        );
        q.trace = Algo.treeTrace(a, false, null);
        q.simPreset = { mode: 'bst', arr: a.join(', '), key: '' };
        break;
      }

      case 25: {
        const t = Algo.build(a, false);
        const key = a[r.next(n)];
        const path = [];
        let cur = t;
        while (cur) {
          path.push(cur.v);
          if (cur.v === key) break;
          cur = key < cur.v ? cur.l : cur.r;
        }
        q.prompt = `BST chèn lần lượt ${Algo.formatArr(a)}, không cân bằng. Tìm ${key} đi qua bao nhiêu NÚT (tính cả gốc và nút tìm thấy)?`;
        q.explanation = `Đường tìm: ${Algo.formatSeq(path)}. Có ${path.length} nút, tương ứng ${path.length - 1} cạnh.`;
        finish(q, r, String(path.length), String(path.length + 1), String(path.length + 2), String(path.length + 3));
        q.trace = Algo.treeTrace(a, false, null);
        q.simPreset = { mode: 'bst', arr: a.join(', '), key: '' };
        break;
      }

      case 26: {
        const b = basev;
        const vals = [b, b - 6, b + 10, b + 4, b + 7, b - 9, b - 2];
        const right = r.next(2) === 0;
        const ans = right ? b + 4 : b - 2;
        q.prompt = `BST chèn ${Algo.formatArr(vals)}. Xóa gốc ${b}, chọn phần tử thế mạng bên ${right ? 'PHẢI' : 'TRÁI'}. Chọn khóa nào?`;
        q.explanation = right
          ? `Sang cây phải rồi đi trái tối đa: nhỏ nhất cây phải là ${ans}.`
          : `Sang cây trái rồi đi phải tối đa: lớn nhất cây trái là ${ans}.`;
        finish(q, r, String(ans), String(b), String(b + 10), String(b - 9), String(b - 6));
        q.trace = Algo.treeTrace(vals, false, right ? b : null);
        q.simPreset = { mode: 'bst', arr: vals.join(', '), key: String(b) };
        break;
      }

      case 27: {
        const t = Algo.build(a, false);
        const ans = Algo.leaves(t);
        q.prompt = `BST chèn ${Algo.formatArr(a)}. Hàm f(NULL)=0; nếu nút có cả hai con NULL thì trả 1; còn lại trả f(left)+f(right). Giá trị f(root)?`;
        q.explanation = `Hàm đếm lá: chỉ nút không có con đóng góp 1. Cây này có ${ans} lá. Đếm mọi nút phải có +1 tại mỗi nút; tính cao dùng max.`;
        finish(q, r, String(ans), String(ans + 1), String(ans + 2), String(ans + 3));
        q.trace = Algo.treeTrace(a, false, null);
        q.simPreset = { mode: 'bst', arr: a.join(', '), key: '' };
        break;
      }

      case 28: {
        const b = basev;
        const variant = r.next(4);
        const seqs = [
          [b + 20, b + 10, b],
          [b, b + 10, b + 20],
          [b + 20, b, b + 10],
          [b, b + 20, b + 10]
        ];
        const names = [
          `LL: xoay phải tại ${b + 20}`,
          `RR: xoay trái tại ${b}`,
          `LR: trái tại ${b}, rồi phải tại ${b + 20}`,
          `RL: phải tại ${b + 20}, rồi trái tại ${b}`
        ];
        q.prompt = `Chèn ${Algo.formatArr(seqs[variant])} vào AVL rỗng. Cần cân bằng bằng phép xoay nào?`;
        q.trace = Algo.treeTrace(seqs[variant], true, null);
        q.explanation = `Xác định hai hướng từ nút mất cân bằng đến nút vừa chèn. ${names[variant]}. Gốc cuối = ${b + 10}.\n${explainTrace(q.trace)}`;
        finish(q, r, names[variant], ...names.filter((x) => x !== names[variant]));
        q.simPreset = { mode: 'avl', arr: seqs[variant].join(', '), key: '' };
        break;
      }

      case 29: {
        const b = basev;
        const left = r.next(2) === 0;
        const vals = left
          ? [b + 20, b + 10, b + 30, b, b + 15]
          : [b + 10, b, b + 20, b + 15, b + 30];
        const remove = left ? b + 30 : b;
        const ans = left ? b + 10 : b + 20;
        q.prompt = `AVL được tạo bằng chèn ${Algo.formatArr(vals)}. Xóa ${remove}, cân bằng lại. Khóa gốc cuối?`;
        q.trace = Algo.treeTrace(vals, true, remove);
        q.explanation = `Sau xóa, gốc có |BF|=2; cây con phía cao có BF=0. Dùng xoay đơn ${left ? 'phải' : 'trái'}. Gốc cuối ${ans}.\n${explainTrace(q.trace)}`;
        finish(q, r, String(ans), String(b + 15), String(b + 30), String(b), String(b + 10), String(b + 20));
        q.simPreset = { mode: 'avl', arr: vals.join(', '), key: String(remove) };
        break;
      }

      default:
        throw new Error('Unknown question type: ' + type);
    }

    let tip = Lessons && Lessons[type - 1] ? Lessons[type - 1].tip : '';
    if (type === 7) tip = 'Xác định thời điểm được hỏi. Đầu lượt pos=i-1; sau mỗi lần dịch pos giảm 1. Vị trí chèn cuối là pos+1. Không trộn pos đầu lượt với mảng cuối lượt.';
    if (type === 2) tip = 'Chỉ số bắt đầu từ 0. Phần tử thứ k có chỉ số k-1. Đừng chọn giá trị phần tử khi hàm trả về chỉ số. Return ngay sẽ dừng ở lần xuất hiện đầu tiên.';
    q.explanation += '\n\nMẹo của dạng: ' + tip;
    return q;
  }

  root.DSA_QUESTIONS = { make, explainTrace };
  if (typeof module !== 'undefined' && module.exports) module.exports = root.DSA_QUESTIONS;
})(typeof window !== 'undefined' ? window : globalThis);
