// DSA Studio IUH — Complete 32-Type Question Generator
// Simulation-first explanations, misconception diagnosis, and comparative theory tables (no tips).

(function (root) {
  'use strict';

  const Algo = root.DSA_ALGO || (typeof require === 'function' ? require('./algorithms.js') : null);

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

  function getSortingBigORef(highlightRow) {
    return {
      title: 'Bảng đối chiếu độ phức tạp các thuật toán Sắp xếp (dễ nhớ nhầm)',
      headers: ['Thuật toán', 'Tốt nhất', 'Trung bình', 'Xấu nhất', 'Điểm dễ nhầm lẫn'],
      rows: [
        ['Quick Sort', 'O(n log n)', 'O(n log n)', 'O(n²)', 'Mốc cực đại/cực tiểu chia lệch (1 và n−1) → O(n²)'],
        ['Merge Sort', 'O(n log n)', 'O(n log n)', 'O(n log n)', 'Luôn O(n log n) mọi trường hợp, tốn bộ nhớ phụ O(n)'],
        ['Heap Sort', 'O(n log n)', 'O(n log n)', 'O(n log n)', 'Luôn O(n log n) mọi trường hợp, không cần mảng phụ'],
        ['Insertion Sort', 'O(n)', 'O(n²)', 'O(n²)', 'Mảng đã sắp hoặc gần sắp chạy nhanh O(n)'],
        ['Bubble Sort', 'O(n) / O(n²)', 'O(n²)', 'O(n²)', 'Chuẩn vòng lặp kép cơ bản không cờ dừng là O(n²)'],
        ['Selection Sort', 'O(n²)', 'O(n²)', 'O(n²)', 'Luôn quét tìm min hết đoạn, kể cả mảng đã sắp sẵn'],
        ['Interchange Sort', 'O(n²)', 'O(n²)', 'O(n²)', 'So và đổi trực tiếp với a[i] qua n(n−1)/2 cặp']
      ],
      highlightRow
    };
  }

  function getDsOpsBigORef(highlightRow) {
    return {
      title: 'Bảng đối chiếu độ phức tạp các thao tác CTDL cơ bản',
      headers: ['Thao tác / Cấu trúc', 'Trung bình', 'Xấu nhất', 'Khái niệm hay bị nhầm'],
      rows: [
        ['Truy cập mảng a[k]', 'O(1)', 'O(1)', 'Nhầm với truy cập phần tử thứ k trong DSLK: O(n)'],
        ['Tìm kiếm trên cây AVL', 'O(log n)', 'O(log n)', 'Nhầm với BST thường (cây lệch thẳng): xấu nhất O(n)'],
        ['Duyệt toàn cây / đếm lá', 'O(n)', 'O(n)', 'Nhầm với tìm 1 khóa trên cây cân bằng O(log n)'],
        ['Chèn sau con trỏ p (DSLK)', 'O(1)', 'O(1)', 'Nhầm với chèn theo giá trị phải tìm p từ đầu: O(n)'],
        ['Quick Sort phân hoạch lệch', 'O(n log n)', 'O(n²)', 'Nhầm trường hợp trung bình O(n log n) với xấu nhất O(n²)']
      ],
      highlightRow
    };
  }

  function diagnoseWrong(q, chosen) {
    if (!q) return '';
    if (chosen === null || chosen === undefined || chosen === '') {
      return q.category === 'sim'
        ? 'Bạn chưa chọn đáp án cho câu này. Hãy bấm chạy mô phỏng từng bước bên dưới để hình dung lại toàn bộ quá trình.'
        : 'Bạn chưa chọn đáp án cho câu này. Hãy đối chiếu bảng kiến thức dễ nhầm lẫn bên dưới để ghi nhớ lại quy tắc.';
    }
    if (q.wrongHints && Object.prototype.hasOwnProperty.call(q.wrongHints, chosen)) {
      return q.wrongHints[chosen];
    }
    return q.wrongDefault || (q.category === 'sim'
      ? 'Hãy chạy mô phỏng từng bước bên dưới để xem lại bước nào bạn đang hình dung lệch so với thuật toán.'
      : 'Hãy xem bảng đối chiếu bên dưới để nhận ra phần lý thuyết bạn đang nhớ nhầm.');
  }

  function make(type, seed, difficulty = 2) {
    const r = createRng(seed);
    const n = r.next(4, 7) + (difficulty > 1 ? 1 : 0);
    let a = distinct(r, n);
    const q = {
      id: `q${type}_${seed >>> 0}_${Math.floor(Math.random() * 1e6).toString(36)}`,
      type,
      seed: seed >>> 0,
      category: 'sim',
      simMode: null,
      simStartIndex: 0,
      prompt: '',
      correct: '',
      options: [],
      explanation: '',
      compareRef: null,
      wrongHints: {},
      wrongDefault: '',
      trace: [],
      simPreset: null
    };
    const basev = r.next(2, 12) * 5;

    switch (type) {
      case 1: {
        q.category = 'theory';
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
          'Mảng tính trực tiếp địa chỉ phần tử từ địa chỉ nền + k × kích thước phần tử nên chỉ tốn hằng số bước O(1).',
          'Cây AVL luôn cân bằng chiều cao O(log n), tìm kiếm chỉ đi dọc theo một nhánh từ gốc xuống lá nên xấu nhất vẫn là O(log n).',
          'Để đếm chính xác số lá mà không lưu sẵn biến đếm, hàm đệ quy bắt buộc phải đi qua toàn bộ n nút của cây → O(n).',
          'Đã có sẵn con trỏ p nên chỉ cần đổi 2 liên kết (newNode->next = p->next; p->next = newNode) với số bước cố định → O(1).',
          'Mỗi lần phân hoạch đều chia mảng thành (1 phần tử và n−1 phần tử), tạo ra n tầng gọi lồng nhau có tổng chi phí n + (n−1) + ... + 1 = O(n²).'
        ];
        q.prompt = prompts[variant] + '\nĐộ phức tạp là gì?';
        q.explanation = reasons[variant];
        q.compareRef = variant === 4 ? getSortingBigORef(0) : getDsOpsBigORef(variant);
        const allBigO = ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'];
        const variantWrongHints = [
          {
            'O(log n)': 'Bạn có thể nhầm truy cập mảng theo chỉ số với tìm kiếm nhị phân (Binary Search) trên mảng đã sắp xếp.',
            'O(n)': 'Bạn đang nhớ nhầm sang thao tác truy cập phần tử thứ k trong Danh sách liên kết (phải duyệt tuần tự từ đầu).',
            'O(n²)': 'O(n²) là độ phức tạp của các vòng lặp lồng nhau (Bubble/Selection/Insertion Sort), không phải truy cập mảng 1 bước.'
          },
          {
            'O(1)': 'Chỉ có bảng băm (Hash Table) hoặc truy cập mảng theo chỉ số mới đạt O(1); tìm trong cây phải đi từ gốc xuống.',
            'O(n)': 'Bạn đang nhớ nhầm sang BST KHÔNG cân bằng (khi chèn dãy tăng/giảm dần tạo cây lệch thẳng). AVL luôn tự xoay nên cao tối đa O(log n).',
            'O(n²)': 'Tìm kiếm 1 khóa trên cây không bao giờ tốn O(n²); ngay cả cây lệch hẳn cũng chỉ đi tối đa qua n nút.'
          },
          {
            'O(1)': 'Cấu trúc không lưu sẵn bộ đếm số lá thì không thể trả về ngay trong 1 bước mà phải duyệt đệ quy cả cây.',
            'O(log n)': 'O(log n) chỉ đúng khi TÌM 1 khóa (chỉ đi 1 nhánh). Muốn đếm TẤT CẢ lá phải rẽ cả hai nhánh trái và phải → thăm n nút.',
            'O(n²)': 'Mỗi nút trong cây chỉ được hàm đệ quy thăm đúng 1 lần nên độ phức tạp tuyến tính O(n), không phải O(n²).'
          },
          {
            'O(log n)': 'Danh sách liên kết không hỗ trợ chia đôi như mảng/cây nên không có thao tác O(log n).',
            'O(n)': 'Bạn đang nhớ nhầm sang trường hợp chưa có con trỏ p (phải duyệt từ pHead để tìm p trước rồi mới chèn). Đề cho sẵn p nên chỉ nối con trỏ O(1).',
            'O(n²)': 'Chèn 1 nút khi đã có con trỏ p chỉ cần 2 phép gán con trỏ, không dùng vòng lặp lồng nhau.'
          },
          {
            'O(1)': 'Không có thuật toán sắp xếp so sánh nào chạy được trong thời gian hằng số O(1).',
            'O(log n)': 'O(log n) là tìm kiếm nhị phân hoặc tìm trên AVL, không đủ thời gian để duyệt qua n phần tử khi sắp xếp.',
            'O(n)': 'Chỉ Insertion Sort trong trường hợp TỐT NHẤT (mảng đã sắp sẵn) mới đạt O(n). Quick Sort xấu nhất là O(n²).'
          }
        ];
        q.wrongHints = variantWrongHints[variant];
        finish(q, r, ans[variant], ...allBigO.filter((x) => x !== ans[variant]));
        break;
      }

      case 2: {
        q.category = 'sim';
        q.simMode = 'array';
        const index = r.next(n);
        const key = a[index];
        q.prompt = `Tìm kiếm tuyến tính từ i=0 trong ${Algo.formatArr(a)}. Gặp a[i]==${key} thì return i ngay. Hàm trả về gì?`;
        q.explanation = `Duyệt từ trái sang phải (chỉ số i bắt đầu từ 0). Giá trị ${key} nằm tại chỉ số ${index} (tức phần tử thứ ${index + 1}), nên hàm dừng sau ${index + 1} lần so sánh và return ${index}.`;
        q.wrongHints = {
          [String(index + 1)]: `Bạn đang đếm vị trí từ 1 (phần tử thứ ${index + 1}) hoặc đếm số lần so sánh thay vì chỉ số mảng i (bắt đầu từ 0).`,
          '-1': `Hàm chỉ trả về -1 khi không tìm thấy. Ở đây ${key} có xuất hiện tại chỉ số ${index}.`,
          [String(index + 2)]: `Bạn đang hình dung lệch vị trí chỉ số (chỉ số bắt đầu từ 0 nên a[${index}] == ${key} dừng ngay tại i=${index}).`,
          [String(index + 3)]: `Bạn đếm dư bước; vòng lặp gặp a[${index}] == ${key} sẽ return ${index} ngay lập tức.`
        };
        q.wrongDefault = `Kiểm tra lại chỉ số 0-based: a[0]..a[${index}], phần tử ${key} ở đúng chỉ số ${index}.`;
        finish(q, r, String(index), String(index + 1), '-1', String(index + 2), String(index + 3));
        for (let i = 0; i <= index; i++) {
          q.trace.push(Algo.snapArray({
            title: `Xét a[${i}]`,
            note: a[i] === key ? `Tìm thấy a[${i}] == ${key} → return ${i} ngay!` : `${a[i]} ≠ ${key} → chưa khớp, tăng i lên ${i + 1}.`,
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
        q.category = 'sim';
        q.simMode = 'binary';
        const sortedA = a.slice().sort((x, y) => x - y);
        const key = sortedA[r.next(n)];
        q.trace = Algo.binary(sortedA, key);
        const mids = q.trace.filter((x) => x.title === 'Xét phần tử giữa').map((x) => x.active[0]);
        q.prompt = `Binary Search tìm ${key} trong ${Algo.formatArr(sortedA)}. Dùng [low,high] đóng, mid=(low+high)/2 lấy phần nguyên. Có bao nhiêu lần xét mid?`;
        const c = mids.length;
        q.explanation = `Các chỉ số mid được xét lần lượt là: ${Algo.formatSeq(mids)} (tổng ${c} lần). Mỗi lần so sánh loại bỏ nửa mảng không chứa khóa bằng left = mid + 1 hoặc right = mid - 1.`;
        q.wrongHints = {
          [String(c + 1)]: `Bạn có thể quên cộng/trừ 1 khi thu hẹp đoạn (mid ± 1) hoặc cộng dư 1 bước kết thúc. Thực tế chỉ xét mid đúng ${c} lần tại chỉ số [${Algo.formatSeq(mids)}].`,
          [String(c + 2)]: `Bạn ước lượng dư 2 bước so với phép chia đôi đoạn đóng [low, high]. Hãy bấm mô phỏng từng bước để thấy chính xác ${c} lần xét mid.`,
          [String(c + 3)]: `Với ${n} phần tử, tối đa không quá ${Math.ceil(Math.log2(n + 1))} lần xét mid. Thực tế ở đây là ${c} lần.`
        };
        finish(q, r, String(c), String(c + 1), String(c + 2), String(c + 3));
        q.simPreset = { mode: 'binary', arr: sortedA.join(', '), key: String(key) };
        break;
      }

      case 4: {
        q.category = 'theory';
        const names = ['Selection Sort', 'Insertion Sort', 'Bubble Sort', 'Interchange Sort'];
        const snippets = [
          'min=i;\nfor(j=i+1; j<n; j++)\n  if(a[j]<a[min]) min=j;\nswap(a[i],a[min]);',
          'x=a[i]; pos=i-1;\nwhile(pos>=0 && a[pos]>x) {\n  a[pos+1]=a[pos]; pos--;\n}\na[pos+1]=x;',
          'for(j=0; j<n-i-1; j++)\n  if(a[j]>a[j+1]) swap(a[j],a[j+1]);',
          'for(j=i+1; j<n; j++)\n  if(a[i]>a[j]) swap(a[i],a[j]);'
        ];
        const expls = [
          'Selection Sort: khởi tạo min=i, vòng j chỉ cập nhật chỉ số min, rồi gọi swap(a[i], a[min]) duy nhất một lần ở cuối lượt.',
          'Insertion Sort: giữ x=a[i], dùng vòng while dịch các phần tử lớn hơn x sang phải (a[pos+1]=a[pos]) rồi chèn x vào a[pos+1].',
          'Bubble Sort: vòng lặp j luôn so sánh và hoán đổi hai phần tử liền kề nhau a[j] và a[j+1] (hoặc a[j] và a[j-1] nếu duyệt phải → trái).',
          'Interchange Sort: giữ cố định vị trí i, duyệt j=i+1..n-1 và gọi swap(a[i], a[j]) NGAY LẬP TỨC mỗi khi gặp phần tử nhỏ hơn.'
        ];
        const ix = r.next(4);
        q.prompt = 'Đoạn xử lý bên trong lượt sắp xếp thuộc thuật toán nào?\n\n' + snippets[ix];
        q.explanation = expls[ix];
        q.compareRef = {
          title: 'Bảng đối chiếu dấu hiệu code 4 thuật toán sắp xếp cơ bản',
          headers: ['Thuật toán', 'Dấu hiệu vòng lặp trong', 'Cách đưa phần tử về chỗ'],
          rows: [
            ['Selection Sort', 'if (a[j] < a[min]) min = j;', 'Chỉ 1 lần swap(a[i], a[min]) sau vòng for j'],
            ['Insertion Sort', 'while (pos >= 0 && a[pos] > x)', 'Không swap; dịch a[pos+1]=a[pos] rồi a[pos+1]=x'],
            ['Bubble Sort', 'if (a[j] > a[j+1]) swap(a[j], a[j+1])', 'Đổi hai phần tử KỀ NHAU (chỉ số j và j±1)'],
            ['Interchange Sort', 'if (a[i] > a[j]) swap(a[i], a[j])', 'Đổi trực tiếp a[i] với a[j] ngay trong vòng for j']
          ],
          highlightRow: ix
        };
        const wrongDiffs = [
          {
            'Insertion Sort': 'Insertion Sort không dùng biến min và không gọi swap(); nó dùng biến tạm x và vòng while dịch phần tử sang phải.',
            'Bubble Sort': 'Bubble Sort so sánh hai phần tử kề nhau (j và j+1), không dùng biến chỉ số min để dò toàn đoạn i+1..n-1.',
            'Interchange Sort': 'Điểm dễ nhầm nhất: Interchange Sort gọi swap(a[i], a[j]) NGAY bên trong vòng j, còn đoạn code trên chỉ cập nhật min=j rồi swap 1 lần ngoài vòng j.'
          },
          {
            'Selection Sort': 'Selection Sort duyệt for(j=i+1..n-1) tìm min rồi swap; code trên dùng while dịch phần tử lớn hơn x sang phải.',
            'Bubble Sort': 'Bubble Sort đổi chỗ hai phần tử kề nhau; code trên không có swap mà chỉ gán dịch a[pos+1]=a[pos] và chèn x.',
            'Interchange Sort': 'Interchange Sort đổi chỗ a[i] và a[j] ngay trong vòng for; code trên giữ x=a[i] và dịch phần tử bằng while.'
          },
          {
            'Selection Sort': 'Selection Sort so a[j] với a[min] và hoán đổi 1 lần cuối lượt; code trên so cặp liền kề a[j] và a[j+1].',
            'Insertion Sort': 'Insertion Sort dịch mảng bằng vòng while với biến tạm x, không so sánh kề a[j] > a[j+1].',
            'Interchange Sort': 'Interchange Sort so a[i] với a[j] (j từ i+1), còn đoạn code trên so cặp kề a[j] với a[j+1].'
          },
          {
            'Selection Sort': 'Điểm dễ nhầm nhất: Selection Sort chỉ cập nhật min=j trong vòng j và swap 1 lần cuối lượt; đoạn code trên swap(a[i], a[j]) NGAY mỗi khi a[i] > a[j].',
            'Insertion Sort': 'Insertion Sort giữ x=a[i] và dịch bằng vòng while; không hoán đổi trực tiếp a[i] với a[j].',
            'Bubble Sort': 'Bubble Sort chỉ đổi hai phần tử kề nhau (j và j+1); đoạn code trên cố định i và đổi với j xa hơn (j=i+1..n-1).'
          }
        ];
        q.wrongHints = wrongDiffs[ix];
        finish(q, r, names[ix], ...names.filter((x) => x !== names[ix]));
        break;
      }

      case 5:
      case 6:
      case 8: {
        q.category = 'sim';
        const mode = type === 5 ? 'Interchange' : (type === 6 ? 'Selection' : 'Bubble');
        q.simMode = mode.toLowerCase();
        const fullTrace = Algo.sort(a, mode, mode === 'Bubble' ? { direction: 'ltr' } : {});
        const pass = r.next(0, Math.min(3, n - 1));
        const passIdx = fullTrace.findIndex((step) => step.title === `Xong lượt i = ${pass}`);
        q.trace = passIdx >= 0 ? fullTrace.slice(0, passIdx + 1) : fullTrace;
        const end = q.trace[q.trace.length - 1].values;
        const sorted = a.slice().sort((x, y) => x - y);
        const hintDesc = type === 8
          ? 'Quét j từ trái sang phải, đổi a[j],a[j+1]. '
          : (type === 5
            ? 'Cố định i, quét j=i+1..n-1 và đổi a[i],a[j] ngay khi a[i]>a[j]. '
            : 'Chọn min của đoạn i..n-1, đổi với a[i] ở cuối lượt. ');
        q.prompt = `${mode} Sort tăng dần trên ${Algo.formatArr(a)}. ${hintDesc}\nMảng sau khi hoàn thành vòng ngoài i=${pass} (i bắt đầu từ 0)?`;
        q.explanation = `${explainTrace(q.trace)}\n\nChỉ chạy hết lượt i=${pass}. Kết quả: ${Algo.formatArr(end)}.`;
        q.wrongHints = {
          [Algo.formatArr(a)]: `Đây là mảng gốc ban đầu. Sau lượt i=${pass}, thuật toán đã đổi chỗ để đưa phần tử đúng vị trí.`,
          [Algo.formatArr(sorted)]: `Bạn đã chạy hết thuật toán cho tới khi mảng sắp xếp xong hoàn toàn, trong khi đề chỉ hỏi trạng thái ngay sau lượt i=${pass}.`,
          [reverseArrStr(end)]: `Bạn đang sắp xếp ngược chiều (giảm dần) hoặc đặt sai đầu chốt của ${mode} Sort. Đề yêu cầu sắp xếp TĂNG DẦN.`
        };
        q.wrongDefault = `Ở một bước trong lượt i=${pass}, bạn đã hình dung nhầm cách ${mode} Sort hoán đổi phần tử. Hãy chạy mô phỏng bên dưới để đối chiếu từng bước.`;
        finish(
          q, r,
          Algo.formatArr(end),
          Algo.formatArr(a),
          Algo.formatArr(sorted),
          reverseArrStr(end),
          Algo.formatArr(end.map((x) => x + 1)),
          Algo.formatArr(end.map((x) => x + 2))
        );
        q.simPreset = mode === 'Bubble'
          ? { mode: 'bubble', arr: a.join(', '), key: '', bubbleDir: 'ltr' }
          : { mode: mode.toLowerCase(), arr: a.join(', '), key: '' };
        break;
      }

      case 7: {
        q.category = 'sim';
        q.simMode = 'insertion';
        const fullTrace = Algo.sort(a, 'Insertion');
        const pass = r.next(1, n);
        const passIdx = fullTrace.findIndex((step) => step.title === `Xong lượt i = ${pass}`);
        q.trace = passIdx >= 0 ? fullTrace.slice(0, passIdx + 1) : fullTrace;
        const end = q.trace[q.trace.length - 1];
        const x = a[pass];
        const pos = end.active[0] - 1;
        q.prompt = `Insertion Sort trên ${Algo.formatArr(a)}. Code giữ x=a[i], đặt pos=i-1, dịch khi a[pos]>x và giảm pos; cuối cùng a[pos+1]=x.\nSau TOÀN BỘ lượt i=${pass}, x và pos bằng gì?`;
        q.explanation = `Đầu lượt i=${pass}, giữ x = a[${pass}] = ${x}. Sau khi dịch các số lớn hơn x sang phải, vị trí chèn x là pos + 1 = ${pos + 1}, nên biến pos dừng ở ${pos}. Mảng cuối lượt: ${Algo.formatArr(end.values)}.`;
        const ans = `x=${x}, pos=${pos}`;
        q.wrongHints = {
          [`x=${x}, pos=${pos + 1}`]: `Bạn đang lấy vị trí CHÈN (pos + 1 = ${pos + 1}) làm giá trị của pos. Vì câu lệnh chèn là a[pos + 1] = x nên biến pos phải nhỏ hơn vị trí chèn 1 đơn vị (pos = ${pos}).`,
          [`x=${x}, pos=${pos + 2}`]: `Bạn quên trừ pos-- ở lần dịch hoặc đang nhớ giá trị pos lúc chưa chạy hết vòng while.`,
          [`x=${x + 1}, pos=${pos}`]: `Biến x giữ nguyên giá trị a[${pass}] = ${x} suốt cả lượt i=${pass}, không bị tăng hay đổi giá trị.`
        };
        finish(q, r, ans, `x=${x}, pos=${pos + 1}`, `x=${x}, pos=${pos + 2}`, `x=${x + 1}, pos=${pos}`);
        q.simPreset = { mode: 'insertion', arr: a.join(', '), key: '' };
        break;
      }

      case 9: {
        q.category = 'sim';
        q.simMode = 'bubble';
        let inv = 0;
        const counts = [];
        for (let i = 0; i < n; i++) {
          let c = 0;
          for (let j = i + 1; j < n; j++) if (a[j] < a[i]) c++;
          inv += c;
          counts.push(`${a[i]}: ${c} số nhỏ hơn ở bên phải`);
        }
        q.prompt = `Bubble Sort tăng dần ${Algo.formatArr(a)}. Chỉ đổi cặp kề khi trái > phải. Tổng số lần swap?`;
        q.explanation = `${counts.join('\n')}\nTổng số cặp nghịch thế = ${inv}. Vì mỗi lần đổi cặp kề chỉ làm giảm đúng 1 nghịch thế nên tổng số lần swap luôn bằng ${inv}.`;
        q.wrongHints = {
          [String(inv + 1)]: `Bạn đếm dư 1 cặp nghịch thế (có thể nhầm cả số lần so sánh bằng nhau hoặc tính thêm 1 cặp đã đúng thứ tự). Thực tế có ${inv} cặp nghịch thế.`,
          [String(inv + 2)]: `Bạn đếm dư 2 lần swap. Chú ý Bubble Sort chỉ đổi khi trái > phải, không đổi khi đã có thứ tự.`,
          [String(inv + 3)]: `Số lần swap bằng chính xác số cặp (a[i] > a[j] với i < j) = ${inv}. Hãy xem từng bước swap trên mô phỏng.`
        };
        finish(q, r, String(inv), String(inv + 1), String(inv + 2), String(inv + 3));
        q.trace = Algo.sort(a, 'Bubble', { direction: 'ltr' });
        q.simPreset = { mode: 'bubble', arr: a.join(', '), key: '', bubbleDir: 'ltr' };
        break;
      }

      case 10: {
        q.category = 'theory';
        const col = r.next(2) === 0;
        const desc = r.next(2) === 0;
        const left = 'a[i][j]';
        const right = col ? 'a[k][j]' : 'a[i][k]';
        const ans = `${desc ? 'Giảm' : 'Tăng'} dần theo ${col ? 'cột' : 'hàng'}`;
        q.prompt = `Với mọi cặp chỉ số thích hợp (k lớn hơn chỉ số đang xét), code:\nif (${left}${desc ? ' < ' : ' > '}${right})\n    swap(${left}, ${right});\n\nChức năng là gì?`;
        q.explanation = `Chỉ số ${col ? 'cột j' : 'hàng i'} đứng yên ở cả hai vế nên phép đổi chỉ diễn ra trong cùng một ${col ? 'cột' : 'hàng'}. Điều kiện ${desc ? '< đổi khi số trước nhỏ hơn (đưa số LỚN về trước → giảm dần)' : '> đổi khi số trước lớn hơn (đưa số NHỎ về trước → tăng dần)'}.`;
        const pool = ['Tăng dần theo cột', 'Giảm dần theo cột', 'Tăng dần theo hàng', 'Giảm dần theo hàng'];
        q.compareRef = {
          title: 'Bảng phân biệt nhanh 4 dạng sắp xếp ma trận 2 chiều',
          headers: ['Biểu thức so sánh', 'Chỉ số cố định', 'Chiều sắp xếp', 'Lý giải'],
          rows: [
            ['a[i][j] > a[i][k]  (j < k)', 'Hàng i', 'Tăng dần theo hàng', 'Số đứng trước lớn hơn thì đẩy ra sau'],
            ['a[i][j] < a[i][k]  (j < k)', 'Hàng i', 'Giảm dần theo hàng', 'Số đứng trước nhỏ hơn thì đẩy ra sau'],
            ['a[i][j] > a[k][j]  (i < k)', 'Cột j', 'Tăng dần theo cột', 'Cùng cột j; số ở hàng trên lớn hơn thì đẩy xuống'],
            ['a[i][j] < a[k][j]  (i < k)', 'Cột j', 'Giảm dần theo cột', 'Cùng cột j; số ở hàng trên nhỏ hơn thì đẩy xuống']
          ],
          highlightRow: (col ? 2 : 0) + (desc ? 1 : 0)
        };
        const wrongHints = {};
        pool.filter((z) => z !== ans).forEach((w) => {
          const wCol = w.includes('cột');
          const wDesc = w.includes('Giảm');
          if (wCol !== col && wDesc === desc) {
            wrongHints[w] = `Bạn đọc đúng chiều ${desc ? 'giảm' : 'tăng'} dần nhưng NHẦM HÀNG/CỘT: trong ${left} và ${right}, chỉ số ${col ? 'cột j' : 'hàng i'} cố định nên phải sắp theo ${col ? 'cột' : 'hàng'}.`;
          } else if (wCol === col && wDesc !== desc) {
            wrongHints[w] = `Bạn xác định đúng theo ${col ? 'cột' : 'hàng'} nhưng NHẦM DẤU so sánh: "${left}${desc ? ' < ' : ' > '}${right}" có nghĩa là ${desc ? 'số trước nhỏ hơn số sau thì đổi → đưa số lớn lên trước (GIẢM dần)' : 'số trước lớn hơn số sau thì đổi → đưa số nhỏ lên trước (TĂNG dần)'}.`;
          } else {
            wrongHints[w] = `Bạn đang nhầm cả chỉ số cố định (${col ? 'cột j' : 'hàng i'}) lẫn chiều của dấu so sánh "${desc ? '<' : '>'}".`;
          }
        });
        q.wrongHints = wrongHints;
        finish(q, r, ans, ...pool.filter((z) => z !== ans));
        break;
      }

      case 11: {
        q.category = 'theory';
        const v = r.next(4);
        const ps = [
          'DSLK đơn không vòng, không nút giả. Điều kiện danh sách rỗng?',
          'DSLK đơn vòng không rỗng: next của nút cuối trỏ đâu?',
          'DSLK đôi không vòng, không nút giả: prev của nút đầu bằng gì?',
          'DSLK đơn không vòng có đúng một nút X. Mô tả đúng?'
        ];
        const ans = ['head == NULL', 'Nút đầu (head)', 'NULL', 'head = tail = X; X.next = NULL'];
        const reasons = [
          'Với DSLK đơn chuẩn (không nút giả/sentinel), khi chưa có phần tử nào thì con trỏ quản lý đầu danh sách head bằng NULL.',
          'Trong DSLK đơn vòng không rỗng, thay vì trỏ NULL thì tail->next nối khép kín về nút đầu head.',
          'Trong DSLK đôi không vòng, cả hai đầu danh sách đều kết thúc bằng NULL: nút đầu có prev = NULL, nút cuối có next = NULL.',
          'Khi danh sách chỉ có duy nhất 1 nút X, X vừa là nút đầu (head = X) vừa là nút cuối (tail = X), và sau X không còn nút nào nên X.next = NULL.'
        ];
        q.prompt = ps[v];
        q.explanation = reasons[v];
        q.compareRef = {
          title: 'Bảng đối chiếu 4 biến thể Danh sách liên kết (dễ nhầm lẫn)',
          headers: ['Loại DSLK', 'Kiểm tra rỗng', 'Con trỏ hai đầu', 'Trường hợp 1 nút X'],
          rows: [
            ['Đơn không vòng (chuẩn)', 'head == NULL', 'tail->next = NULL', 'head = tail = X; X->next = NULL'],
            ['Đơn vòng (không nút giả)', 'head == NULL', 'tail->next = head', 'head = tail = X; X->next = head'],
            ['Đôi không vòng', 'head == NULL', 'head->prev = NULL; tail->next = NULL', 'head = tail = X; prev = next = NULL'],
            ['DSLK có nút giả (header)', 'head->next == NULL', 'head trỏ tới nút giả cố định', 'tail = X; head->next = X']
          ],
          highlightRow: v === 0 || v === 3 ? 0 : v
        };
        q.wrongHints = {
          'head->next == head': 'Điều kiện "head->next == head" chỉ xảy ra ở DSLK VÒNG (có nút giả hoặc có đúng 1 nút), không phải câu hỏi này.',
          'Nút cuối luôn trỏ chính nó': 'Nút cuối chỉ trỏ chính nó khi danh sách VÒNG có đúng 1 nút. Nếu nhiều nút ở DSLK vòng, tail->next trỏ về nút đầu head; còn không vòng thì trỏ NULL.',
          'Mọi danh sách đều có nút giả': 'Đề nêu rõ không nút giả (và không phải DSLK nào cũng dùng nút giả); danh sách chuẩn quản lý trực tiếp nút đầu bằng head.',
          'head = NULL, tail = X': 'Nếu danh sách có 1 nút X mà head == NULL thì danh sách đang bị coi là rỗng và mất liên kết tới phần tử đầu tiên X.'
        };
        finish(q, r, ans[v], 'head->next == head', 'Nút cuối luôn trỏ chính nó', 'Mọi danh sách đều có nút giả', 'head = NULL, tail = X');
        break;
      }

      case 12: {
        q.category = 'theory';
        const x = String.fromCharCode(68 + r.next(12));
        q.prompt = `A → B → C → NULL, p trỏ B, ${x} là nút mới. Cặp lệnh nào chèn ${x} ngay sau B mà giữ nguyên phần đuôi?`;
        const ans = `${x}->next = p->next; p->next = ${x};`;
        const w1 = `p->next = ${x}; ${x}->next = p->next;`;
        const w2 = `${x}->next = p; p = ${x};`;
        const w3 = `p->next = NULL; ${x}->next = p;`;
        q.explanation = `Phải giữ lại địa chỉ của C (đang nằm trong p->next) bằng cách gán ${x}->next = p->next trước, rồi mới cập nhật p->next = ${x}.`;
        q.compareRef = {
          title: 'So sánh tác động của 4 cặp lệnh con trỏ khi chèn sau B (p)',
          headers: ['Cặp lệnh', 'Kết quả liên kết', 'Lỗi xảy ra (nếu sai)'],
          rows: [
            [ans, `A → B → ${x} → C → NULL`, 'Đúng: giữ được đuôi C trước khi đổi p->next'],
            [w1, `A → B → ${x} ↺ (tự trỏ chính nó)`, 'Mất liên kết tới C và gây vòng lặp vô hạn tại ' + x],
            [w2, `${x} → B → C (B không trỏ ${x})`, 'Chèn ngược ra trước B và chỉ đổi biến p cục bộ'],
            [w3, `A → B → NULL; ${x} → B → NULL`, 'Cắt đứt phần đuôi C khỏi danh sách']
          ],
          highlightRow: 0
        };
        q.wrongHints = {
          [w1]: `Lỗi kinh điển đảo ngược thứ tự lệnh! Khi chạy "p->next = ${x}" trước thì địa chỉ nút C đã bị ghi đè mất; lệnh sau "${x}->next = p->next" làm ${x} tự trỏ vào chính ${x}.`,
          [w2]: `Lệnh "${x}->next = p" nối ${x} trỏ ngược về B thay vì C, còn "p = ${x}" chỉ dịch con trỏ tạm p mà không móc B vào ${x}.`,
          [w3]: `Gán "p->next = NULL" làm đứt hoàn toàn phần đuôi C → NULL phía sau B.`
        };
        finish(q, r, ans, w1, w2, w3);
        break;
      }

      case 13: {
        q.category = 'sim';
        q.simMode = 'linked';
        q.trace = Algo.linkedPairs(a);
        const end = q.trace[q.trace.length - 1].values;
        q.prompt = `DSLK chứa ${Algo.formatArr(a)}. Đổi dữ liệu từng cặp nút (1,2), (3,4),...; nút cuối lẻ giữ nguyên. Dãy cuối?`;
        q.explanation = 'Con trỏ p, q bước nhảy 2 nút sau mỗi lượt; chỉ hoán đổi giá trị data trong cặp (0,1), (2,3)... mà không đổi liên kết pNext.\n' +
          q.trace.map((s) => `${s.title}: ${Algo.formatArr(s.values)}`).join('\n');
        q.wrongHints = {
          [Algo.formatArr(a)]: 'Bạn giữ nguyên dãy ban đầu; các cặp (0,1), (2,3)... đều phải đổi giá trị cho nhau.',
          [reverseArrStr(a)]: 'Đổi dữ liệu TỪNG CẶP kề (1,2), (3,4) khác với đảo ngược toàn bộ danh sách từ cuối lên đầu.',
          [Algo.formatArr(a.slice().sort((x, y) => x - y))]: 'Thuật toán chỉ đổi chỗ từng cặp liền kề theo vị trí, không phải sắp xếp tăng dần.'
        };
        q.wrongDefault = `Kiểm tra lại từng cặp (0,1), (2,3)... và chú ý nếu số nút lẻ thì nút cuối cùng không có cặp nên giữ nguyên. Kết quả: ${Algo.formatArr(end)}.`;
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
        q.category = 'sim';
        q.simMode = 'stack';
        a = a.slice(0, 3);
        const both = r.next(2) === 0;
        const rev = a.slice().reverse();
        const result = both ? a.concat(rev) : rev;
        q.prompt = `Danh sách ${Algo.formatArr(a)}. Hàm f có kiểm tra p==NULL thì return.\n${both ? 'in(p->data);\n' : ''}f(p->next);\nin(p->data);\n\nThứ tự các giá trị in ra?`;
        q.explanation = `${both ? 'Lúc đi xuống (trước lời gọi đệ quy) in ' + Algo.formatSeq(a) + '. ' : ''}Lệnh in đặt SAU f(p->next) chỉ chạy khi đệ quy trả về (Call Stack quay ngược từ cuối lên đầu), nên in ${Algo.formatSeq(rev)}.`;
        q.trace = Algo.recursionListTrace(a, both);
        q.wrongHints = {
          [Algo.formatArr(a)]: both
            ? `Bạn mới đọc lệnh in trước f(p->next) mà quên lệnh in thứ hai đặt SAU f(p->next) chạy khi quay về.`
            : `Bạn đang đọc nhầm thành in TRƯỚC khi gọi đệ quy. Vì lệnh in nằm SAU f(p->next) nên phải đi hết tới NULL rồi mới in ngược từ cuối lên đầu.`,
          [Algo.formatArr(a.concat(a))]: `Lệnh thứ hai nằm SAU đệ quy nên khi quay về phải in ngược ${Algo.formatArr(rev)}, không phải lặp lại xuôi ${Algo.formatArr(a)}.`,
          [Algo.formatArr(rev.concat(a))]: `Bạn bị đảo ngược thứ tự lúc đi xuống và lúc quay về: in trước đệ quy ra ${Algo.formatArr(a)} trước, quay về mới ra ${Algo.formatArr(rev)}.`
        };
        q.wrongDefault = `Hãy xem Call Stack mô phỏng bên dưới để thấy rõ thứ tự đẩy vào (đi xuống) và thoát ra (quay về).`;
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
        q.category = 'sim';
        const isQueue = type === 16;
        q.simMode = isQueue ? 'queue' : 'stack';
        const ops = [a[0], a[1], -1, a[2], a[3], -1, a[1]];
        q.trace = Algo.operations(ops, isQueue);
        const end = q.trace[q.trace.length - 1].values;
        const desired = isQueue ? end : end.slice().reverse();
        const opStr = ops.map((v) => v === -1 ? (isQueue ? 'dequeue()' : 'pop()') : ((isQueue ? 'enqueue(' : 'push(') + v + ')')).join(', ');
        q.prompt = `${isQueue ? 'Queue' : 'Stack'} ban đầu rỗng.\n${opStr}.\nDãy còn lại từ ${isQueue ? 'front đến rear' : 'top đến bottom'}?`;
        q.explanation = q.trace.map((s) => `${s.title}: ${Algo.formatArr(s.values)} — ${s.note}`).join('\n') +
          `\nKết quả đọc từ ${isQueue ? 'front đến rear' : 'top đến bottom'}: ${Algo.formatArr(desired)}.`;
        q.wrongHints = {
          [reverseArrStr(desired)]: `Bạn tính đúng các phần tử còn lại nhưng đọc NGƯỢC CHIỀU đề hỏi! Đề yêu cầu đọc từ ${isQueue ? 'front đến rear' : 'top đến bottom'} là ${Algo.formatArr(desired)}.`
        };
        q.wrongDefault = `Bạn có thể nhầm phần tử bị lấy ra ở ${isQueue ? 'dequeue() (FIFO: lấy phần tử ở ĐẦU front)' : 'pop() (LIFO: lấy phần tử ở ĐỈNH top)'}. Hãy chạy mô phỏng từng thao tác bên dưới.`;
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
        q.category = 'sim';
        q.simMode = 'array';
        a = a.slice(0, 4);
        const times = r.next(1, 4);
        const end = times % 2 === 0 ? a.slice() : a.slice().reverse();
        q.prompt = `S top→bottom: ${Algo.formatArr(a)}; Q rỗng. Một chu trình: pop hết S đưa vào Q, rồi dequeue hết Q push lại S.\nSau ${times} chu trình, S top→bottom là gì?`;
        q.explanation = `Mỗi chu trình chuyển qua Queue rồi đẩy lại vào Stack làm đảo ngược thứ tự S đúng 1 lần. Vì ${times} là số ${times % 2 === 0 ? 'chẵn nên sau ' + times + ' lần đảo, S quay lại đúng như ban đầu' : 'lẻ nên S bị đảo ngược lại'}.`;
        q.trace = Algo.stackQueueCyclesTrace(a, times);
        q.wrongHints = {
          [reverseArrStr(end)]: `Bạn bị nhầm tính chẵn/lẻ của số chu trình (${times}). Mỗi chu trình đảo ngược Stack đúng 1 lần, nên ${times} chu trình (${times % 2 === 0 ? 'chẵn' : 'lẻ'}) cho kết quả ${Algo.formatArr(end)}.`,
          [Algo.formatArr(a.slice().sort((x, y) => x - y))]: 'Stack và Queue chỉ thay đổi thứ tự vào/ra chứ không thực hiện sắp xếp tăng dần.'
        };
        q.wrongDefault = `Xem mô phỏng từng chu trình để thấy cách Pop → Enqueue rồi Dequeue → Push làm đảo ngược toàn bộ Stack S.`;
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
        q.category = 'sim';
        q.simMode = 'stack';
        const patterns = ['([{}])', '([)]', '(()', '())(', '{[()()]}', '[({})]'];
        const ix = r.next(patterns.length);
        const str = patterns[ix];
        const ok = ix === 0 || ix === 4 || ix === 5;
        const ans = ok
          ? 'Hợp lệ; kết thúc stack rỗng.'
          : (ix === 1 ? 'Sai loại ngoặc khi đóng.' : (ix === 2 ? 'Kết thúc còn ngoặc mở chưa đóng.' : 'Gặp ngoặc đóng khi stack rỗng.'));
        q.prompt = `Kiểm tra chuỗi ngoặc ${str} bằng stack. Kết luận đúng?`;
        q.explanation = `Duyệt chuỗi ${str} bằng Stack: ngoặc mở Push vào, ngoặc đóng phải khớp đúng đỉnh Stack và cuối chuỗi Stack phải rỗng.\nKết luận: ${ans}`;
        q.trace = Algo.bracketsTrace(str);
        const pool = ['Hợp lệ; kết thúc stack rỗng.', 'Sai loại ngoặc khi đóng.', 'Kết thúc còn ngoặc mở chưa đóng.', 'Gặp ngoặc đóng khi stack rỗng.'];
        q.wrongHints = {
          'Hợp lệ; kết thúc stack rỗng.': `Chuỗi ${str} KHÔNG hợp lệ! Nếu chỉ đếm số lượng mở = đóng rất dễ bị lừa (nhất là dạng xen kẽ hoặc đóng trước khi mở).`,
          'Sai loại ngoặc khi đóng.': ok
            ? `Trong ${str}, mọi ngoặc đóng đều khớp đúng loại với đỉnh Stack.`
            : (ix === 2 ? `Trong ${str} các cặp đóng đều khớp loại, lỗi nằm ở chỗ hết chuỗi mà còn ngoặc '(' chưa đóng.` : `Khi gặp ')' thứ hai ở ${str}, Stack đã rỗng chứ không chứa sai loại ngoặc.`),
          'Kết thúc còn ngoặc mở chưa đóng.': ok
            ? `Cuối chuỗi ${str} mọi ngoặc mở đều đã được Pop sạch nên Stack rỗng.`
            : (ix === 1 ? `Thuật toán dừng báo lỗi ngay tại ')' khi đỉnh Stack đang là '[' (sai loại ngoặc), không chạy tới cuối.` : `Thuật toán báo lỗi ngay tại ')' thứ hai khi Stack đang rỗng.`),
          'Gặp ngoặc đóng khi stack rỗng.': ok
            ? `Mỗi ngoặc đóng trong ${str} đều tìm thấy ngoặc mở tương ứng trên đỉnh Stack.`
            : (ix === 1 ? `Tại thời điểm gặp ')' trong ${str}, Stack không rỗng mà đang có '[' ở đỉnh.` : `Trong ${str}, Stack không bao giờ rỗng khi gặp ngoặc đóng, chỉ là cuối chuỗi còn dư '(' chưa đóng.`)
        };
        finish(q, r, ans, ...pool.filter((x) => x !== ans));
        break;
      }

      case 19: {
        q.category = 'sim';
        q.simMode = 'stack';
        const ch = 97 + r.next(0, 20);
        const u = String.fromCharCode(ch);
        const v = String.fromCharCode(ch + 1);
        const w = String.fromCharCode(ch + 2);
        const plus = r.next(2) === 0;
        const exp = plus ? `${u}*(${v}+${w})` : `(${u}-${v})/${w}`;
        const ans = plus ? `${u} ${v} ${w} + *` : `${u} ${v} - ${w} /`;
        const wNoParen = plus ? `${u} ${v} * ${w} +` : `${u} ${v} ${w} / -`;
        const wPrefix1 = `* ${u} + ${v} ${w}`;
        const wPrefix2 = `/ - ${u} ${v} ${w}`;
        const wSwapOp = `${u} ${v} + ${w} *`;
        q.prompt = `Hậu tố của ${exp} là gì?`;
        q.explanation = `Thực hiện biểu thức trong ngoặc trước rồi mới tới phép toán bên ngoài; mỗi phép toán dạng hậu tố viết hai toán hạng trước rồi tới toán tử. Kết quả: ${ans}.`;
        q.trace = Algo.infixToPostfixTrace(exp);
        q.wrongHints = {
          [wNoParen]: `Bạn đang bỏ qua cặp ngoặc ưu tiên! Trong ${exp}, phép ${plus ? `(${v}+${w})` : `(${u}-${v})`} nằm trong ngoặc nên phải hoàn tất ra hậu tố trước phép ${plus ? '*' : '/'}.`,
          [wPrefix1]: 'Đây là dạng TIỀN TỐ (toán tử đặt trước), không phải hậu tố (toán tử đặt sau hai toán hạng).',
          [wPrefix2]: 'Đây là dạng TIỀN TỐ (toán tử đặt trước), không phải hậu tố (toán tử đặt sau hai toán hạng).',
          [wSwapOp]: `Thứ tự toán hạng và toán tử không khớp biểu thức ${exp}. Hãy chạy từng bước Stack toán tử bên dưới.`
        };
        finish(q, r, ans, wNoParen, wPrefix1, wPrefix2, wSwapOp);
        break;
      }

      case 20: {
        q.category = 'sim';
        q.simMode = 'postfix';
        const x = r.next(4, 14);
        const y = r.next(1, 5);
        const z = r.next(2, 6);
        const exp = `${x} ${y} - ${z} *`;
        q.trace = Algo.postfix(exp);
        const ans = (x - y) * z;
        q.prompt = `Giá trị hậu tố: ${exp} ?`;
        q.explanation = `Đẩy ${x}, rồi ${y}. Gặp dấu "-": Pop ${y} làm toán hạng PHẢI, Pop ${x} làm toán hạng TRÁI → tính ${x} - ${y} = ${x - y} rồi đẩy lại Stack. Gặp "${z}" và "*": tính (${x - y}) × ${z} = ${ans}.`;
        q.wrongHints = {
          [String(-ans)]: `Bạn bị ĐẢO NGƯỢC hai toán hạng khi trừ! Phần tử Pop ra đầu tiên (${y}) là toán hạng PHẢI, phần tử Pop thứ hai (${x}) là toán hạng TRÁI nên tính ${x} - ${y}, không phải ${y} - ${x}.`,
          [String(x - y * z)]: `Bạn đang tính nhầm như biểu thức trung tố ${x} - ${y} × ${z}. Trong hậu tố "${exp}", phép trừ hoàn tất trước rồi kết quả mới nhân với ${z}.`
        };
        q.wrongDefault = `Kiểm tra lại phép trừ (${x} - ${y} = ${x - y}) rồi nhân ${z} ở bước cuối trong mô phỏng bên dưới.`;
        finish(q, r, String(ans), String(-ans), String(x - y * z), String(ans + z), String(ans + z + 1));
        q.simPreset = { mode: 'postfix', arr: exp, key: '' };
        break;
      }

      case 21: {
        q.category = 'sim';
        q.simMode = 'bst';
        const b = basev;
        const t = {
          v: b,
          l: { v: b - 5, l: { v: b - 8, l: null, r: null }, r: { v: b + 2, l: null, r: null } },
          r: { v: b + 10, l: null, r: null }
        };
        q.prompt = `Cây gốc ${b}, trái ${b - 5}, phải ${b + 10}; nút ${b - 5} có trái ${b - 8}, phải ${b + 2}. Cây có phải BST (khóa phân biệt) không?`;
        q.trace = [
          Algo.treeStep(
            'Kiểm tra cha-con trực tiếp',
            `Nếu chỉ nhìn cha trực tiếp ${b - 5}: ${b - 8} < ${b - 5} < ${b + 2} tưởng như đúng, nên rất dễ kết luận nhầm là BST.`,
            t,
            { highlight: [b - 5, b + 2] }
          ),
          Algo.treeStep(
            `Vi phạm BST với tổ tiên ${b}`,
            `Nút ${b + 2} nằm trong cây con TRÁI của gốc ${b} nhưng ${b + 2} > ${b} → VI PHẠM tính chất BST!`,
            t,
            { highlight: [b, b + 2], extraVar: `Sai tại: ${b + 2} > gốc ${b}` }
          )
        ];
        q.simStartIndex = 1;
        q.explanation = `Nút ${b + 2} nằm bên cây con TRÁI của gốc ${b} nhưng giá trị ${b + 2} > ${b}. BST yêu cầu mọi nút bên trái đều nhỏ hơn tổ tiên, không chỉ kiểm tra mỗi cha trực tiếp.`;
        q.compareRef = {
          title: 'Phân biệt nhanh các điều kiện cây (hay nhầm lẫn)',
          headers: ['Loại cây', 'Điều kiện bắt buộc', 'Cây trong đề'],
          rows: [
            ['Cây nhị phân thường', 'Mỗi nút có tối đa 2 con', 'Thỏa, nhưng chưa đủ để là BST'],
            ['Cây tìm kiếm nhị phân (BST)', 'MỌI nút cây trái < nút gốc < MỌI nút cây phải', `VI PHẠM vì ${b + 2} ở nhánh trái nhưng > ${b}`],
            ['Cây nhị phân đầy đủ', 'Mỗi nút có 0 hoặc 2 con', 'Không bắt buộc đối với mọi BST']
          ],
          highlightRow: 1
        };
        q.wrongHints = {
          'Có; mỗi nút có tối đa hai con.': 'Đó chỉ là điều kiện của cây nhị phân thông thường, chưa kiểm tra quy tắc thứ tự khóa của BST.',
          'Có; chỉ cần so với cha trực tiếp.': `Đây là bẫy phổ biến nhất: ${b + 2} > ${b - 5} (đúng với cha trực tiếp), nhưng ${b + 2} vẫn nằm trong nhánh TRÁI của gốc ${b} mà lại lớn hơn ${b}!`,
          'Không; BST bắt buộc mọi nút có hai con.': 'BST KHÔNG bắt buộc nút nào cũng phải có 2 con; cây này không phải BST vì sai thứ tự khóa với gốc tổ tiên.'
        };
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
        q.category = 'theory';
        const h = r.next(2, 6);
        const leaf = r.next(2) === 0;
        const ans = leaf ? (1 << h) : ((1 << (h + 1)) - 1);
        q.prompt = `Cây nhị phân perfect có chiều cao ${h} CẠNH (gốc sâu 0). ${leaf ? 'Có bao nhiêu nút lá?' : 'Có tổng bao nhiêu nút?'}`;
        q.explanation = `Chiều cao ${h} cạnh tương ứng ${h + 1} mức (từ mức 0 đến mức ${h}). ${leaf ? `Mức lá nằm ở tầng sâu ${h} nên có 2^${h} = ${ans} nút lá.` : `Tổng số nút từ mức 0 đến mức ${h} là 2^(${h}+1) - 1 = ${ans} nút.`}`;
        q.compareRef = {
          title: 'Bảng đối chiếu 2 quy ước chiều cao cây (dễ nhầm công thức ±1)',
          headers: ['Quy ước chiều cao h', 'Số mức của cây', 'Số nút lá (perfect)', 'Tổng số nút tối đa'],
          rows: [
            ['Đếm theo SỐ CẠNH (gốc = 0)', `${h + 1} mức (0 .. ${h})`, `2^h = ${1 << h}`, `2^(h+1) - 1 = ${(1 << (h + 1)) - 1}`],
            ['Đếm theo SỐ MỨC (gốc = 1)', `${h} mức (1 .. ${h})`, `2^(h-1) = ${1 << (h - 1)}`, `2^h - 1 = ${(1 << h) - 1}`]
          ],
          highlightRow: 0
        };
        const oppositeVal = leaf ? ((1 << (h + 1)) - 1) : (1 << h);
        q.wrongHints = {
          [String(ans + 1)]: leaf
            ? 'Số nút lá là lũy thừa chẵn của 2 (2^h), không cộng thêm 1.'
            : 'Bạn có thể quên trừ 1 ở công thức 2^(h+1) - 1 hoặc cộng nhầm gốc.',
          [String(ans - 1)]: leaf
            ? `Công thức 2^h - 1 (lẻ) không phải số nút lá; 2^${h} = ${ans} lá.`
            : 'Kiểm tra lại phép tính 2^(h+1) - 1 với h = ' + h + '.',
          [String(ans * 2)]: `Bạn đang nhân dư thêm 1 bậc lũy thừa (nhầm giữa h=${h} cạnh với h=${h + 1} mức, hoặc nhầm số lá với tổng số nút).`,
          [String(oppositeVal)]: leaf
            ? `Bạn đang tính TỔNG SỐ NÚT của cả cây (2^(h+1) - 1) thay vì số nút LÁ (2^h = ${ans}).`
            : `Bạn đang tính số nút LÁ (2^h) thay vì TỔNG SỐ NÚT của cả cây (2^(h+1) - 1 = ${ans}).`
        };
        finish(q, r, String(ans), String(ans + 1), String(ans - 1), String(ans * 2));
        break;
      }

      case 23: {
        q.category = 'sim';
        q.simMode = 'bst';
        const t = Algo.build(a, false);
        const orders = ['NLR', 'LNR', 'LRN', 'Level'];
        const order = orders[r.next(4)];
        const name = order === 'Level' ? 'theo mức, trái sang phải' : order;
        const ans = Algo.formatArr(Algo.walk(t, order));
        q.prompt = `BST tạo bằng chèn lần lượt ${Algo.formatArr(a)}, không cân bằng. Dãy duyệt ${name}?`;
        q.explanation = `Dựng cây BST trước, sau đó duyệt theo thứ tự ${name} (NLR: Gốc-Trái-Phải; LNR: Trái-Gốc-Phải; LRN: Trái-Phải-Gốc; Theo mức: từng tầng từ trên xuống, trái sang phải). Kết quả: ${ans}.`;
        const buildSteps = Algo.treeTrace(a, false, null);
        const travSteps = Algo.treeTraversalSteps(t, order);
        q.trace = buildSteps.concat(travSteps);
        q.simStartIndex = buildSteps.length;
        const orderDesc = {
          NLR: 'NLR (tiền tự: Gốc → Trái → Phải)',
          LNR: 'LNR (trung tự: Trái → Gốc → Phải — cho dãy tăng dần)',
          LRN: 'LRN (hậu tự: Trái → Phải → Gốc)',
          Level: 'theo mức (BFS: từng tầng từ trên xuống, trái sang phải)'
        };
        const wrongHints = {};
        orders.forEach((o) => {
          const s = Algo.formatArr(Algo.walk(t, o));
          if (s !== ans) {
            wrongHints[s] = `Bạn đã chọn nhầm sang kết quả của phép duyệt ${orderDesc[o]}! Đề bài yêu cầu duyệt ${orderDesc[order]}.`;
          }
        });
        wrongHints[reverseArrStr(a)] = 'Duyệt cây phải dựng cấu trúc cây BST trước chứ không phải đảo ngược mảng đầu vào.';
        q.wrongHints = wrongHints;
        q.wrongDefault = `Kiểm tra lại hình cây BST và thứ tự duyệt ${name} từng nút trong mô phỏng bên dưới.`;
        finish(
          q, r, ans,
          ...orders.map((o) => Algo.formatArr(Algo.walk(t, o))),
          reverseArrStr(a),
          Algo.formatArr(a.map((x) => x + 1)),
          Algo.formatArr(a.map((x) => x + 2))
        );
        q.simPreset = { mode: 'bst', arr: a.join(', '), key: '' };
        break;
      }

      case 24: {
        q.category = 'sim';
        q.simMode = 'bst';
        const t = Algo.build(a, false);
        const pre = Algo.walk(t, 'NLR');
        const ino = Algo.walk(t, 'LNR');
        const post = Algo.walk(t, 'LRN');
        q.prompt = `Nhãn phân biệt. NLR = ${Algo.formatArr(pre)}; LNR = ${Algo.formatArr(ino)}. Dãy LRN là gì?`;
        q.explanation = `Phần tử đầu của NLR (${pre[0]}) là gốc cây. Tìm ${pre[0]} trong LNR để chia dãy thành cây con trái và cây con phải, lặp lại đệ quy để dựng cây, rồi đọc theo LRN (Trái → Phải → Gốc): ${Algo.formatArr(post)}.`;
        const buildSteps = Algo.treeTrace(a, false, null);
        const lrnSteps = Algo.treeTraversalSteps(t, 'LRN');
        q.trace = buildSteps.concat(lrnSteps);
        q.simStartIndex = buildSteps.length;
        q.wrongHints = {
          [Algo.formatArr(pre)]: 'Bạn đang chọn lại dãy NLR (Gốc đứng đầu), còn LRN (Trái-Phải-Gốc) phải đặt gốc ở CUỐI cùng.',
          [Algo.formatArr(ino)]: 'Bạn đang chọn lại dãy LNR (trung tự), không phải dãy LRN (hậu tự).',
          [reverseArrStr(post)]: 'Bạn đọc bị NGƯỢC chiều thành NRL (Gốc trước, rồi Phải, rồi Trái). LRN đọc Trái → Phải → Gốc.'
        };
        q.wrongDefault = `Tách gốc ${pre[0]} từ LNR rồi xem mô phỏng bước duyệt LRN trên cây dựng được bên dưới.`;
        finish(
          q, r,
          Algo.formatArr(post),
          Algo.formatArr(pre),
          Algo.formatArr(ino),
          reverseArrStr(post),
          Algo.formatArr(post.map((x) => x + 1)),
          Algo.formatArr(post.map((x) => x + 2))
        );
        q.simPreset = { mode: 'bst', arr: a.join(', '), key: '' };
        break;
      }

      case 25: {
        q.category = 'sim';
        q.simMode = 'bst';
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
        q.explanation = `Bắt đầu từ gốc ${t.v}, đường đi tìm ${key} lần lượt qua: ${path.join(' → ')}. Tổng cộng đi qua ${path.length} nút (tương ứng ${path.length - 1} cạnh).`;
        const buildSteps = Algo.treeTrace(a, false, null);
        const searchSteps = Algo.treeSearchSteps(t, key);
        q.trace = buildSteps.concat(searchSteps);
        q.simStartIndex = buildSteps.length;
        q.wrongHints = {
          [String(path.length + 1)]: `Bạn đếm dư 1 nút (hoặc nhầm quy tắc trái < gốc < phải tại một nhánh). Đường đi chính xác chỉ qua ${path.length} nút: ${path.join(' → ')}.`
        };
        q.wrongDefault = `Đề yêu cầu đếm SỐ NÚT trên đường tìm (tính cả gốc và đích): ${path.join(' → ')} có đúng ${path.length} nút (nếu đếm số cạnh mới là ${path.length - 1}).`;
        finish(q, r, String(path.length), String(path.length + 1), String(path.length + 2), String(path.length + 3));
        q.simPreset = { mode: 'bst', arr: a.join(', '), key: '' };
        break;
      }

      case 26: {
        q.category = 'sim';
        q.simMode = 'bst';
        const b = basev;
        const vals = [b, b - 6, b + 10, b + 4, b + 7, b - 9, b - 2];
        const right = r.next(2) === 0;
        const ans = right ? b + 4 : b - 2;
        q.prompt = `BST chèn ${Algo.formatArr(vals)}. Xóa gốc ${b}, chọn phần tử thế mạng bên ${right ? 'PHẢI' : 'TRÁI'}. Chọn khóa nào?`;
        q.explanation = right
          ? `Thế mạng bên PHẢI: sang cây con phải (gốc ${b + 10}) rồi đi CỰC TRÁI để lấy khóa nhỏ nhất cây phải → ${ans}.`
          : `Thế mạng bên TRÁI: sang cây con trái (gốc ${b - 6}) rồi đi CỰC PHẢI để lấy khóa lớn nhất cây trái → ${ans}.`;
        q.trace = Algo.treeTrace(vals, false, b, { replaceSide: right ? 'right' : 'left' });
        const locIdx = q.trace.findIndex((s) => s.title.startsWith('Định vị nút xóa'));
        q.simStartIndex = locIdx >= 0 ? locIdx : 0;
        q.wrongHints = {
          [String(b)]: `${b} là nút đang bị xóa, không thể chọn chính nó làm nút thế mạng.`,
          [String(b + 10)]: right
            ? `Bạn mới bước sang con phải trực tiếp (${b + 10}) mà chưa đi hết sang TRÁI để tìm khóa nhỏ nhất cây phải (${ans}).`
            : `${b + 10} nằm bên cây con PHẢI, trong khi đề hỏi thế mạng bên TRÁI (${ans}).`,
          [String(b - 9)]: `${b - 9} là nút nhỏ nhất (cực trái) của cây trái. Muốn thế mạng bên trái phải lấy LỚN NHẤT (cực phải) của cây trái là ${b - 2}.`,
          [String(b - 6)]: right
            ? `${b - 6} nằm bên cây con TRÁI, trong khi đề yêu cầu chọn thế mạng bên PHẢI (${ans}).`
            : `Bạn mới dừng ở con trái trực tiếp (${b - 6}), chưa đi hết sang PHẢI để tìm khóa lớn nhất cây trái (${ans}).`
        };
        finish(q, r, String(ans), String(b), String(b + 10), String(b - 9), String(b - 6));
        q.simPreset = { mode: 'bst', arr: vals.join(', '), key: String(b), replaceSide: right ? 'right' : 'left' };
        break;
      }

      case 27: {
        q.category = 'sim';
        q.simMode = 'bst';
        const t = Algo.build(a, false);
        const ans = Algo.leaves(t);
        const leafVals = [];
        (function collectLeaves(node) {
          if (!node) return;
          if (!node.l && !node.r) { leafVals.push(node.v); return; }
          collectLeaves(node.l);
          collectLeaves(node.r);
        })(t);
        q.prompt = `BST chèn ${Algo.formatArr(a)}. Hàm f(NULL)=0; nếu nút có cả hai con NULL thì trả 1; còn lại trả f(left)+f(right). Giá trị f(root)?`;
        q.explanation = `Hàm chỉ trả về 1 tại nút không có con nào (nút lá), các nút trung gian chỉ cộng kết quả từ hai con. Cây có ${ans} nút lá là [${leafVals.join(', ')}].`;
        const buildSteps = Algo.treeTrace(a, false, null);
        const leafStep = Algo.treeStep(
          `Đếm nút lá: có ${ans} lá`,
          `Các nút được tô sáng [${leafVals.join(', ')}] có cả hai con NULL nên mỗi nút đóng góp 1 → Tổng = ${ans}.`,
          t,
          { highlight: leafVals, extraVar: `Số lá = ${ans}` }
        );
        q.trace = buildSteps.concat([leafStep]);
        q.simStartIndex = buildSteps.length;
        q.compareRef = {
          title: 'Phân biệt 3 hàm đệ quy trên cây nhị phân (hay nhầm lẫn)',
          headers: ['Chức năng hàm', 'Điều kiện lá', 'Công thức nút trong'],
          rows: [
            ['Đếm số nút LÁ', 'Trả về 1', 'f(left) + f(right)  (không cộng 1)'],
            ['Đếm TỔNG số nút', 'Trả về 1', '1 + f(left) + f(right)'],
            ['Tính CHIỀU CAO (số mức)', 'Trả về 1', '1 + max(f(left), f(right))']
          ],
          highlightRow: 0
        };
        q.wrongDefault = `Đừng đếm nhầm cả nút có 1 con hoặc cộng thêm 1 tại nút gốc! Chỉ những nút không có con nào ([${leafVals.join(', ')}]) mới được tính là 1 lá.`;
        finish(q, r, String(ans), String(ans + 1), String(ans + 2), String(ans + 3));
        q.simPreset = { mode: 'bst', arr: a.join(', '), key: '' };
        break;
      }

      case 28: {
        q.category = 'sim';
        q.simMode = 'avl';
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
        const thirdInsertIdx = q.trace.findIndex((s) => s.title === `Chèn ${seqs[variant][2]}`);
        q.simStartIndex = thirdInsertIdx >= 0 ? thirdInsertIdx : 0;
        q.explanation = `Từ nút mất cân bằng đi hai bước theo hướng vừa chèn ${seqs[variant][2]} ta có dạng ${names[variant]}. Sau xoay, nút giữa ${b + 10} lên làm gốc mới.\n${explainTrace(q.trace)}`;
        const wrongHints = {};
        names.forEach((nm, idx) => {
          if (idx !== variant) {
            const kind = nm.split(':')[0];
            wrongHints[nm] = `Bạn xác định nhầm hướng lệch thành ${kind}. Hãy xem mô phỏng tại bước chèn ${seqs[variant][2]}: từ gốc mất cân bằng đi theo đường chèn tạo dáng ${names[variant].split(':')[0]}.`;
          }
        });
        q.wrongHints = wrongHints;
        finish(q, r, names[variant], ...names.filter((x) => x !== names[variant]));
        q.simPreset = { mode: 'avl', arr: seqs[variant].join(', '), key: '' };
        break;
      }

      case 29: {
        q.category = 'sim';
        q.simMode = 'avl';
        const b = basev;
        const left = r.next(2) === 0;
        const vals = left
          ? [b + 20, b + 10, b + 30, b, b + 15]
          : [b + 10, b, b + 20, b + 15, b + 30];
        const remove = left ? b + 30 : b;
        const ans = left ? b + 10 : b + 20;
        q.prompt = `AVL được tạo bằng chèn ${Algo.formatArr(vals)}. Xóa ${remove}, cân bằng lại. Khóa gốc cuối?`;
        q.trace = Algo.treeTrace(vals, true, remove);
        const delLocIdx = q.trace.findIndex((s) => s.title.startsWith('Định vị nút xóa'));
        q.simStartIndex = delLocIdx >= 0 ? delLocIdx : 0;
        q.explanation = `Sau khi xóa ${remove}, gốc cũ (${left ? b + 20 : b + 10}) bị mất cân bằng |CSCB| = 2. Xoay đơn ${left ? 'PHẢI' : 'TRÁI'} tại gốc cũ sẽ đưa ${ans} lên làm gốc mới.\n${explainTrace(q.trace)}`;
        q.wrongHints = {
          [String(b + 15)]: `Nút ${b + 15} chỉ được chuyển nhánh làm con của gốc cũ sau khi xoay đơn ${left ? 'phải' : 'trái'}, không lên làm gốc (vì đây là xoay đơn ${left ? 'LL' : 'RR'}, không phải xoay kép).`,
          [String(remove)]: `Nút ${remove} đã bị xóa khỏi cây.`,
          [String(left ? b + 20 : b + 10)]: `Bạn quên bước tái cân bằng AVL sau khi xóa! Xóa ${remove} làm gốc cũ bị lệch |CSCB| = 2 nên bắt buộc phải xoay để ${ans} lên làm gốc.`
        };
        q.wrongDefault = `Hãy chạy mô phỏng từ bước xóa ${remove} để quan sát phép xoay đưa ${ans} lên làm gốc.`;
        finish(q, r, String(ans), String(b + 15), String(b + 30), String(b), String(b + 10), String(b + 20));
        q.simPreset = { mode: 'avl', arr: vals.join(', '), key: String(remove) };
        break;
      }

      case 30: {
        if (r.next(3) === 0) {
          q.category = 'theory';
          const worst = r.next(2) === 0;
          q.prompt = worst
            ? 'Theo Slide IUH, khi chọn mốc giữa trong Quick Sort mà mọi lần phân hoạch mốc đều rơi vào cực đại hoặc cực tiểu, độ phức tạp xấu nhất là gì?'
            : 'Theo Slide IUH, khi mọi lần phân hoạch Quick Sort đều chọn được mốc trùng trung vị (chia đều 2 nửa), độ phức tạp là gì?';
          const ans = worst ? 'O(n²)' : 'O(n log n)';
          q.explanation = worst
            ? 'Mốc cực đại/cực tiểu chia mảng thành 1 phần tử và n−1 phần tử ở mỗi bước, tạo n tầng đệ quy có tổng phép so sánh bậc hai → O(n²).'
            : 'Chia đều thành 2 nửa kích thước n/2 tạo log₂n tầng đệ quy, mỗi tầng quét O(n) → O(n log n).';
          q.compareRef = getSortingBigORef(0);
          q.wrongHints = worst
            ? {
              'O(n log n)': 'Bạn đang nhớ nhầm sang độ phức tạp TRUNG BÌNH / TỐT NHẤT của Quick Sort (hoặc độ phức tạp luôn ổn định của Merge Sort / Heap Sort). Khi mốc lệch cực trị, Quick Sort bị thoái hóa thành O(n²).',
              'O(log n)': 'O(log n) chỉ là số tầng đệ quy khi chia đều (hoặc độ phức tạp tìm kiếm nhị phân), chưa nhân với O(n) bước quét phân hoạch mỗi tầng.',
              'O(1)': 'Không có thuật toán sắp xếp nào đạt O(1).'
            }
            : {
              'O(n²)': 'O(n²) là trường hợp XẤU NHẤT của Quick Sort (khi mốc lệch cực trị), hoặc của Bubble/Selection/Insertion Sort. Khi mốc trùng trung vị chia đôi đều, Quick Sort đạt O(n log n).',
              'O(log n)': 'O(log n) mới là chiều cao cây đệ quy; tại mỗi tầng vẫn phải duyệt phân hoạch hết O(n) phần tử nên tổng là O(n log n).',
              'O(1)': 'Không có thuật toán sắp xếp nào đạt O(1).'
            };
          finish(q, r, ans, ...['O(1)', 'O(log n)', 'O(n log n)', 'O(n²)'].filter((x) => x !== ans));
        } else {
          q.category = 'sim';
          q.simMode = 'quick';
          const mid = Math.floor((a.length - 1) / 2);
          const x = a[mid];
          const fullTrace = Algo.quickSort(a);
          const partIdx = fullTrace.findIndex((s) => s.title.startsWith(`Xong phân hoạch [0 .. ${a.length - 1}]`));
          q.trace = partIdx >= 0 ? fullTrace.slice(0, partIdx + 1) : fullTrace;
          const end = q.trace[q.trace.length - 1].values;
          const ans = `x=${x}, ${Algo.formatArr(end)}`;
          q.prompt = `Quick Sort chuẩn Slide IUH trên ${Algo.formatArr(a)}: chọn mốc giữa x = a[(left+right)/2], dùng 2 con trỏ i, j. Sau lần phân hoạch đầu tiên trên [0..${a.length - 1}], mốc x và mảng là gì?`;
          q.explanation = `mid = (0 + ${a.length - 1}) / 2 = ${mid} → x = a[${mid}] = ${x}. Con trỏ i tiến từ trái (dừng khi a[i] ≥ ${x}), j lùi từ phải (dừng khi a[j] ≤ ${x}), đổi chỗ nếu i ≤ j cho tới khi i > j. Mảng sau phân hoạch 1: ${Algo.formatArr(end)}.`;
          q.wrongHints = {
            [`x=${a[0]}, ${Algo.formatArr(end)}`]: `Bạn chọn phần tử ĐẦU mảng a[0]=${a[0]} làm mốc. Theo Slide IUH, Quick Sort luôn chọn phần tử GIỮA x = a[(left+right)/2] = a[${mid}] = ${x}.`,
            [`x=${x}, ${reverseArrStr(end)}`]: `Mốc x=${x} đúng nhưng bạn đang phân hoạch ngược chiều (đưa phần tử lớn sang trái, nhỏ sang phải).`,
            [`x=${x + 2}, ${Algo.formatArr(a)}`]: 'Chú ý x phải là GIÁ TRỊ phần tử tại chỉ số mid, và sau phân hoạch mảng đã bị hoán đổi các cặp nghịch thế so với mốc x.'
          };
          q.wrongDefault = `Kiểm tra lại từng bước dịch i, j và hoán đổi so với mốc giữa x=${x} trong mô phỏng bên dưới.`;
          finish(
            q, r, ans,
            `x=${a[0]}, ${Algo.formatArr(end)}`,
            `x=${x}, ${reverseArrStr(end)}`,
            `x=${x + 1}, ${Algo.formatArr(end)}`,
            `x=${x + 2}, ${Algo.formatArr(a)}`,
            `x=${x}, ${Algo.formatArr(end.map((v) => v + 1))}`
          );
          q.simPreset = { mode: 'quick', arr: a.join(', '), key: '' };
        }
        break;
      }

      case 31: {
        q.category = 'sim';
        q.simMode = 'stack';
        const num = r.next(11, 62);
        const rems = [];
        let tmp = num;
        while (tmp > 0) {
          rems.push(tmp % 2);
          tmp = Math.floor(tmp / 2);
        }
        const binStr = rems.slice().reverse().join('');
        const askPush = r.next(2) === 0;
        q.trace = Algo.decimalToBinaryTrace(num);
        if (askPush) {
          const ans = rems.join(', ');
          q.prompt = `Đổi số thập phân n = ${num} sang nhị phân bằng Stack (lần lượt chia 2 lấy dư rồi Push vào Stack). Thứ tự các bit được Push vào từ đầu đến cuối?`;
          q.explanation = `Chia liên tiếp ${num} cho 2 thu được phần dư từ bit thấp (LSB) đến bit cao (MSB): ${ans}. Chỉ khi Pop hết Stack ra mới đảo thành chuỗi nhị phân ${binStr}₂.`;
          q.wrongHints = {
            [rems.slice().reverse().join(', ')]: `Bạn đang đọc theo thứ tự SAU KHI POP ra (MSB → LSB = ${binStr}₂). Đề bài hỏi thứ tự các bit được PUSH VÀO Stack từ phép chia đầu tiên!`
          };
          q.wrongDefault = `Kiểm tra lại từng phép chia ${num} ÷ 2 lấy dư ở phần mô phỏng bên dưới.`;
          finish(
            q, r, ans,
            rems.slice().reverse().join(', '),
            (num + 1).toString(2).split('').join(', '),
            (num + 2).toString(2).split('').join(', '),
            (num ^ 1).toString(2).split('').join(', '),
            (num + 3).toString(2).split('').join(', ')
          );
        } else {
          const ans = binStr;
          q.prompt = `Dùng Stack đổi số n = ${num} (hệ 10) sang hệ nhị phân (Push(n % 2), n /= 2 rồi Pop hết ra). Kết quả in ra là gì?`;
          q.explanation = `Các số dư lần lượt đẩy vào Stack là [${rems.join(', ')}]. Nhờ cơ chế LIFO của Stack, khi Pop hết ra sẽ đảo ngược lại thành ${binStr}₂.`;
          q.wrongHints = {
            [rems.join('')]: `Bạn quên đảo ngược dãy dư khi Pop khỏi Stack! Số dư từ trên xuống là ${rems.join(', ')}, nhưng Pop theo LIFO phải đọc ngược từ đáy lên/đỉnh xuống thành ${binStr}₂.`
          };
          q.wrongDefault = `Kiểm tra lại phép chia lấy dư và thứ tự Pop từ đỉnh Stack trong mô phỏng bên dưới.`;
          finish(
            q, r, ans,
            rems.join(''),
            (num + 1).toString(2),
            (num + 2).toString(2),
            (num ^ 1).toString(2),
            (num + 3).toString(2)
          );
        }
        break;
      }

      case 32: {
        q.category = 'theory';
        const variant = r.next(3);
        if (variant === 0) {
          q.prompt = 'Khi biểu diễn cây tổng quát thành cây nhị phân tương đương theo quy tắc Slide IUH (CHILD / SIBLING), con trái (pLeft) và con phải (pRight) của nút X trỏ tới đâu?';
          const ans = 'Con cực trái (con cả) của X và em ruột kế bên phải của X';
          q.explanation = 'Theo quy ước CHILD–SIBLING (Slide C5): pLeft giữ liên kết xuống con đầu tiên bên trái của X (CHILD), còn pRight trỏ ngang sang anh/em kế tiếp bên phải cùng cha với X (SIBLING).';
          q.compareRef = {
            title: 'So sánh cây nhị phân chuẩn vs biểu diễn Cây tổng quát (CHILD / SIBLING)',
            headers: ['Con trỏ của nút X', 'Trong cây nhị phân chuẩn', 'Trong biểu diễn CHILD / SIBLING (IUH)'],
            rows: [
              ['pLeft', 'Con trái của X', 'Con cực trái (con cả) của X (CHILD)'],
              ['pRight', 'Con phải của X', 'Anh/em ruột kế bên phải của X (SIBLING)']
            ],
            highlightRow: 0
          };
          q.wrongHints = {
            'Con thứ nhất của X và con thứ hai của X': 'Bạn đang hiểu nhầm như cây nhị phân thông thường (2 nhánh đều trỏ xuống con). Trong cây tổng quát có thể có ≥3 con nên pRight phải dùng để móc sang EM RUỘT kế bên phải của X.',
            'Nút cha của X và con cực phải của X': 'Các liên kết vẫn đi từ trên xuống / sang ngang cùng tầng chứ pLeft không trỏ ngược lên cha.',
            'Anh bên trái của X và con cực phải của X': 'Bạn bị đảo chiều cả hai con trỏ: pLeft là con cả (trái nhất), còn pRight mới là em kế bên phải.'
          };
          finish(
            q, r, ans,
            'Con thứ nhất của X và con thứ hai của X',
            'Nút cha của X và con cực phải của X',
            'Anh bên trái của X và con cực phải của X'
          );
        } else if (variant === 1) {
          const idx = r.next(2, 12);
          const ans = `${2 * idx} và ${2 * idx + 1}`;
          q.prompt = `Cây nhị phân lưu bằng mảng 1 chiều đánh chỉ số từ 1 (gốc ở vị trí 1). Nút tại vị trí i = ${idx} có con trái và con phải ở chỉ số nào?`;
          q.explanation = `Khi gốc đặt ở vị trí 1 (1-based, chuẩn Slide C5 tr. 20), con trái của nút i nằm ở 2 × i = ${2 * idx}, con phải ở 2 × i + 1 = ${2 * idx + 1}.`;
          q.compareRef = {
            title: 'So sánh công thức mảng 1-based (IUH) vs 0-based (rất dễ nhớ nhầm ±1)',
            headers: ['Quy ước chỉ số gốc', 'Con trái của nút i', 'Con phải của nút i', 'Nút cha của j'],
            rows: [
              ['Đánh số từ 1 (Slide IUH)', '2*i', '2*i + 1', 'floor(j / 2)'],
              ['Đánh số từ 0 (Heap C/C++)', '2*i + 1', '2*i + 2', 'floor((j - 1) / 2)']
            ],
            highlightRow: 0
          };
          q.wrongHints = {
            [`${2 * idx + 1} và ${2 * idx + 2}`]: `Bạn đang nhớ nhầm sang công thức ĐÁNH CHỈ SỐ TỪ 0 (0-based: 2i+1 và 2i+2). Đề nêu rõ gốc ở vị trí 1 nên phải dùng 2i=${2 * idx} và 2i+1=${2 * idx + 1}!`,
            [`${2 * idx} và ${2 * idx + 2}`]: 'Con phải luôn đứng ngay kề sau con trái (2i + 1), không cách 2 đơn vị.',
            [`${2 * idx - 2} và ${2 * idx - 1}`]: 'Bạn bị trừ nhầm chỉ số; với gốc ở vị trí 1, công thức chuẩn là 2i và 2i+1.'
          };
          finish(
            q, r, ans,
            `${2 * idx + 1} và ${2 * idx + 2}`,
            `${2 * idx} và ${2 * idx + 2}`,
            `${2 * idx - 2} và ${2 * idx - 1}`,
            `${idx + 1} và ${idx + 2}`
          );
        } else {
          const j = r.next(4, 18);
          const parent = Math.floor(j / 2);
          const ans = String(parent);
          q.prompt = `Cây nhị phân lưu bằng mảng đánh chỉ số từ 1 (gốc ở vị trí 1). Nút tại chỉ số j = ${j} có nút cha ở chỉ số nào?`;
          q.explanation = `Vì hai con của nút i là 2i và 2i + 1 nên với mọi nút ở vị trí j (1-based), nút cha luôn ở vị trí phần nguyên floor(j / 2) = floor(${j} / 2) = ${parent}.`;
          q.compareRef = {
            title: 'So sánh công thức mảng 1-based (IUH) vs 0-based (rất dễ nhớ nhầm ±1)',
            headers: ['Quy ước chỉ số gốc', 'Con trái của nút i', 'Con phải của nút i', 'Nút cha của j'],
            rows: [
              ['Đánh số từ 1 (Slide IUH)', '2*i', '2*i + 1', 'floor(j / 2)'],
              ['Đánh số từ 0 (Heap C/C++)', '2*i + 1', '2*i + 2', 'floor((j - 1) / 2)']
            ],
            highlightRow: 0
          };
          q.wrongHints = {
            [String(parent + 1)]: `Bạn đang làm tròn lên thay vì lấy phần nguyên floor(${j}/2), hoặc tính nhầm sang công thức khác. Phép chia nguyên ${j}/2 = ${parent}.`,
            [String(j - 1)]: 'j - 1 là phần tử đứng ngay trước trong mảng (có thể là anh em cùng tầng), không phải nút cha.',
            [String(j * 2)]: '2 × j là chỉ số của CON TRÁI của j, không phải nút CHA (cha phải đi ngược lên bằng phép chia 2).'
          };
          finish(
            q, r, ans,
            String(parent + 1),
            String(j - 1),
            String(j * 2),
            String(j + 1)
          );
        }
        break;
      }

      default:
        throw new Error('Unknown question type: ' + type);
    }

    return q;
  }

  root.DSA_QUESTIONS = { make, explainTrace, diagnoseWrong };
  if (typeof module !== 'undefined' && module.exports) module.exports = root.DSA_QUESTIONS;
})(typeof window !== 'undefined' ? window : globalThis);
