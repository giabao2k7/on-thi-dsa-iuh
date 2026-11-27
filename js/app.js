// DSA Studio IUH — Main Application Controller

(function () {
  'use strict';

  const Lessons = window.DSA_LESSONS || [];
  const Algo = window.DSA_ALGO;
  const Questions = window.DSA_QUESTIONS;
  const Visualizer = window.DSA_VISUALIZER;
  const Store = window.DSA_STORE;

  const store = new Store();
  const appEl = document.getElementById('app');
  const sidebarEl = document.getElementById('sidebar');
  const navButtons = Array.from(document.querySelectorAll('#sidebar-nav .nav-btn'));
  const tabPanels = Array.from(document.querySelectorAll('.tab-panel'));
  const navMistakeCount = document.getElementById('nav-mistake-count');

  let currentTab = 'home';

  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function lessonLabel(id) {
    const l = Lessons[id - 1];
    return String(id).padStart(2, '0') + ' · ' + (l ? l.title : '');
  }

  function updateMistakeBadge() {
    const count = store.state.mistakes.filter((x) => !x.resolved).length;
    navMistakeCount.textContent = count > 99 ? '99+' : String(count);
    navMistakeCount.style.display = count > 0 ? 'inline-block' : 'none';
  }

  // =========================================================
  // THEME TOGGLE (DARK / LIGHT)
  // =========================================================
  const themeIcon = document.getElementById('theme-icon');
  const themeLabel = document.getElementById('theme-label');
  const themeKnob = document.getElementById('theme-knob');

  function applyTheme(next, save = true) {
    const theme = next === 'light' ? 'light' : 'dark';
    appEl.setAttribute('data-theme', theme);
    if (save) store.setTheme(theme);
    if (theme === 'dark') {
      themeLabel.textContent = 'Giao diện Tối';
      themeKnob.style.transform = 'translateX(18px)';
      themeIcon.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
    } else {
      themeLabel.textContent = 'Giao diện Sáng';
      themeKnob.style.transform = 'translateX(2px)';
      themeIcon.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';
    }
    if (simViz) simViz.renderCurrent();
    if (modalViz) modalViz.renderCurrent();
  }

  document.getElementById('theme-toggle').addEventListener('click', () => {
    const cur = appEl.getAttribute('data-theme');
    applyTheme(cur === 'dark' ? 'light' : 'dark', true);
  });

  // Mobile sidebar drawer
  document.getElementById('mobile-menu-btn').addEventListener('click', () => {
    sidebarEl.classList.toggle('open');
  });
  document.getElementById('mobile-sim-btn').addEventListener('click', () => switchTab('sim'));

  // =========================================================
  // TAB NAVIGATION
  // =========================================================
  function switchTab(tabId) {
    if (examState.active && tabId !== 'exam') {
      if (!window.confirm('Bạn đang làm bài thi thử chưa nộp. Vẫn rời khỏi phòng thi (đồng hồ vẫn chạy)?')) {
        return;
      }
    }
    currentTab = tabId;
    sidebarEl.classList.remove('open');
    navButtons.forEach((btn) => btn.classList.toggle('active', btn.dataset.tab === tabId));
    tabPanels.forEach((p) => p.classList.toggle('active', p.id === 'tab-' + tabId));

    if (tabId === 'home') renderHome();
    else if (tabId === 'mistakes') renderMistakes();
    else if (tabId === 'sim') {
      requestAnimationFrame(() => {
        simViz.resize();
        simViz.renderCurrent();
      });
    }
  }

  navButtons.forEach((btn) => btn.addEventListener('click', () => switchTab(btn.dataset.tab)));

  // =========================================================
  // 1. HOME / DASHBOARD TAB
  // =========================================================
  function renderHome() {
    const el = document.getElementById('tab-home');
    const total = store.state.attempts.length;
    const correct = store.state.attempts.filter((x) => x.correct).length;
    const pct = total === 0 ? 0 : Math.round((correct * 100) / total);
    const wrong = store.state.mistakes.filter((x) => !x.resolved).length;
    const circ = 94.247;
    const offset = circ - (circ * pct) / 100;

    const weak = [];
    for (let id = 1; id <= Lessons.length; id++) {
      const items = store.state.attempts.filter((x) => x.type === id);
      if (items.length > 0) {
        const rate = items.filter((x) => x.correct).length / items.length;
        weak.push({ id, rate, count: items.length });
      }
    }
    weak.sort((a, b) => a.rate - b.rate);
    const topWeak = weak.slice(0, 4);

    el.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">Ôn thi Trắc nghiệm DSA — Chuẩn 29 dạng IUH</h1>
          <p class="page-sub">Học cách giải · Mô phỏng 60fps từng bước · Luyện biến thể không giới hạn · Thi thử offline & web</p>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:8px;">
          <button class="btn btn-lg btn-primary" data-jump="lessons">Học 29 dạng</button>
          <button class="btn btn-lg" data-jump="sim">Mô phỏng 60fps ▶</button>
          <button class="btn btn-lg" data-jump="practice">Luyện câu mới</button>
        </div>
      </div>

      <div class="grid-3">
        <div class="surface-card stat-card">
          <div>
            <div class="stat-label">Đã luyện tập</div>
            <div class="stat-num">${total} <span style="font-size:14px;font-weight:500;color:var(--text-muted);">câu</span></div>
            <div style="font-size:12px;color:var(--text-muted);margin-top:4px;">${store.state.exams.length} đề thi thử đã nộp</div>
          </div>
          <div style="width:48px;height:48px;border-radius:14px;background:var(--accent-soft);color:var(--accent);display:flex;align-items:center;justify-content:center;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>
          </div>
        </div>

        <div class="surface-card stat-card">
          <div>
            <div class="stat-label">Độ chính xác</div>
            <div class="stat-num">${total === 0 ? '—' : pct + '%'}</div>
            <div style="font-size:12px;color:var(--text-muted);margin-top:4px;">${correct} / ${total} câu trả lời đúng</div>
          </div>
          <svg width="56" height="56" viewBox="0 0 36 36" style="transform:rotate(-90deg);">
            <circle cx="18" cy="18" r="15" fill="none" stroke="var(--border-strong)" stroke-width="3.5"></circle>
            <circle cx="18" cy="18" r="15" fill="none" stroke="var(--accent)" stroke-width="3.5" stroke-dasharray="${circ}" stroke-dashoffset="${total === 0 ? circ : offset}" stroke-linecap="round"></circle>
          </svg>
        </div>

        <div class="surface-card stat-card">
          <div>
            <div class="stat-label">Sổ câu sai</div>
            <div class="stat-num" style="color:var(--amber-text);">${wrong} <span style="font-size:14px;font-weight:500;color:var(--text-muted);">câu cần ôn</span></div>
            <button class="btn" data-jump="mistakes" style="margin-top:8px;padding:4px 10px;">Mở sổ câu sai →</button>
          </div>
          <div style="width:48px;height:48px;border-radius:14px;background:var(--amber-soft);color:var(--amber-text);display:flex;align-items:center;justify-content:center;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </div>
        </div>
      </div>

      <div class="grid-2" style="margin-bottom:18px;">
        <div class="surface-card" style="padding:20px;display:flex;flex-direction:column;gap:12px;">
          <div style="display:flex;align-items:center;justify-content:space-between;">
            <strong style="font-size:15px;">Lộ trình ôn thi 4 chặng</strong>
            <span class="brand-pill">29 dạng chuẩn</span>
          </div>
          <div class="surface-sub" style="padding:12px 14px;">
            <strong>Chặng 1 · Tìm kiếm, Sắp xếp & Độ phức tạp (Dạng 1–10)</strong>
            <div style="font-size:12px;color:var(--text-muted);margin-top:2px;">Big-O, Binary Search, Bubble, Selection, Insertion, Interchange, Nghịch thế</div>
          </div>
          <div class="surface-sub" style="padding:12px 14px;">
            <strong>Chặng 2 · DSLK, Stack/Queue & Biểu thức (Dạng 11–20)</strong>
            <div style="font-size:12px;color:var(--text-muted);margin-top:2px;">Đổi cặp con trỏ, Đệ quy, LIFO/FIFO, Hàng vòng, Hậu tố / Tiền tố</div>
          </div>
          <div class="surface-sub" style="padding:12px 14px;">
            <strong>Chặng 3 · Cây nhị phân, BST & Cây AVL (Dạng 21–29)</strong>
            <div style="font-size:12px;color:var(--text-muted);margin-top:2px;">NLR/LNR/LRN/Level, Dựng cây, Thế mạng xóa BST, Xoay LL/RR/LR/RL trên AVL</div>
          </div>
          <div class="surface-sub" style="padding:12px 14px;">
            <strong>Chặng 4 · Thi thử tổng hợp & Chữa sổ câu sai</strong>
            <div style="font-size:12px;color:var(--text-muted);margin-top:2px;">Làm đề trộn ngẫu nhiên và tự động kiểm tra lại các câu từng làm nhầm</div>
          </div>
        </div>

        <div class="surface-card" style="padding:20px;display:flex;flex-direction:column;gap:14px;">
          <strong style="font-size:15px;">${topWeak.length ? 'Dạng nên luyện tiếp theo dữ liệu của bạn' : 'Cách dùng hiệu quả nhất'}</strong>
          ${topWeak.length ? `
            <div style="display:flex;flex-direction:column;gap:8px;">
              ${topWeak.map((w) => `
                <div class="surface-sub" style="padding:10px 12px;display:flex;align-items:center;justify-content:space-between;gap:10px;">
                  <div>
                    <div style="font-size:13px;font-weight:600;">${esc(lessonLabel(w.id))}</div>
                    <div style="font-size:12px;color:var(--text-muted);">Đúng ${Math.round(w.rate * 100)}% (${w.count} lần làm)</div>
                  </div>
                  <button class="btn btn-primary" data-practice-type="${w.id}">Luyện ngay</button>
                </div>
              `).join('')}
            </div>
          ` : `
            <div class="surface-sub" style="padding:14px;font-size:13px;line-height:1.65;">
              1. Vào <strong>Học 29 dạng</strong> đọc bài mẫu, suy luận và mẹo bẫy.<br/>
              2. Vào <strong>Mô phỏng 60fps</strong> xem từng bước chuyển động mượt (so sánh, đổi chỗ, xoay AVL).<br/>
              3. Vào <strong>Luyện biến thể</strong> để làm các câu sinh số ngẫu nhiên mới hoàn toàn.<br/>
              4. Chạy <strong>Thi thử</strong> trước khi đi thi thật!
            </div>
          `}
          <div class="tip-box">
            <strong style="color:var(--amber-text);">Lưu ý đề thi:</strong> Chiều cao cây có thể đếm theo <em>số cạnh</em> hoặc <em>số mức</em>; giá trị <code>pos</code> trong Insertion Sort xét sau vòng <code>while</code>; chia <code>/</code> trong hậu tố dùng chia nguyên.
          </div>
        </div>
      </div>

      <div class="surface-card" style="padding:16px 20px;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;">
        <div style="font-size:13px;color:var(--text-muted);">
          Tiến độ được lưu cục bộ trên trình duyệt (<code>localStorage</code>). Bạn có thể sao lưu ra file JSON hoặc khôi phục sang máy khác.
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:8px;">
          <button id="btn-export-progress" class="btn">Xuất tiến độ (.json)</button>
          <label class="btn" style="cursor:pointer;">
            Nhập tiến độ
            <input id="input-import-progress" type="file" accept=".json,application/json" style="display:none;" />
          </label>
          <button id="btn-reset-progress" class="btn" style="color:var(--rose-text);">Xóa tiến độ</button>
        </div>
      </div>
    `;

    el.querySelectorAll('[data-jump]').forEach((b) => {
      b.addEventListener('click', () => switchTab(b.dataset.jump));
    });
    el.querySelectorAll('[data-practice-type]').forEach((b) => {
      b.addEventListener('click', () => openPractice(parseInt(b.dataset.practiceType, 10), null));
    });
    document.getElementById('btn-export-progress').addEventListener('click', () => {
      const blob = new Blob([store.exportJson()], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'dsa-studio-progress.json';
      a.click();
      URL.revokeObjectURL(url);
    });
    document.getElementById('input-import-progress').addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          store.importJson(String(reader.result));
          applyTheme(store.state.theme, false);
          updateMistakeBadge();
          renderHome();
        } catch (err) {
          window.alert(err.message);
        }
      };
      reader.readAsText(file);
    });
    document.getElementById('btn-reset-progress').addEventListener('click', () => {
      if (window.confirm('Xóa toàn bộ lịch sử luyện tập, điểm thi và sổ câu sai trên máy này?')) {
        store.resetAll();
        updateMistakeBadge();
        renderHome();
      }
    });
  }

  // =========================================================
  // 2. LESSONS TAB (ALL 29 LESSONS)
  // =========================================================
  const LESSON_SIM_MAP = {
    3: { mode: 'binary', arr: '2, 5, 8, 11, 14, 17, 20', key: '14' },
    4: { mode: 'selection', arr: '6, 2, 9, 1, 5, 3', key: '' },
    5: { mode: 'interchange', arr: '5, 3, 4, 1', key: '' },
    6: { mode: 'selection', arr: '27, 40, -7, 5, 57', key: '' },
    7: { mode: 'insertion', arr: '3, 7, 1, 8, 2, 5', key: '' },
    8: { mode: 'bubble', arr: '5, 13, 12, 2, 13, 8', key: '' },
    9: { mode: 'bubble', arr: '4, 1, 3, 2', key: '' },
    13: { mode: 'linked', arr: '1, 2, 3, 4, 5, 6, 7', key: '' },
    15: { mode: 'stack', arr: '1, 2, -1, 3, 2, -1, 2', key: '' },
    16: { mode: 'queue', arr: '5, 8, -1, 2, 7, -1', key: '' },
    20: { mode: 'postfix', arr: '8 3 2 * - 4 +', key: '' },
    21: { mode: 'bst', arr: '8, 3, 12, 1, 10', key: '' },
    23: { mode: 'bst', arr: '8, 3, 1, 6, 10, 14', key: '' },
    25: { mode: 'bst', arr: '3, 6, 5, 2, 4, 7, 1', key: '' },
    26: { mode: 'bst', arr: '8, 3, 12, 1, 5, 6', key: '8' },
    27: { mode: 'bst', arr: '8, 3, 1, 6, 10, 14', key: '' },
    28: { mode: 'avl', arr: '30, 10, 20, 40, 50', key: '' },
    29: { mode: 'avl', arr: '30, 20, 40, 10, 25', key: '40' }
  };

  let selectedLessonId = 1;
  const lessonSearch = document.getElementById('lesson-search');
  const lessonGroup = document.getElementById('lesson-group');
  const lessonList = document.getElementById('lesson-list');
  const lessonDetail = document.getElementById('lesson-detail');

  function initLessonsControls() {
    const groups = ['Tất cả nhóm', ...Array.from(new Set(Lessons.map((l) => l.group)))];
    lessonGroup.innerHTML = groups.map((g) => `<option value="${esc(g)}">${esc(g)}</option>`).join('');
    lessonSearch.addEventListener('input', renderLessonList);
    lessonGroup.addEventListener('change', renderLessonList);
    renderLessonList();
    renderLessonDetail();
  }

  function renderLessonList() {
    const q = lessonSearch.value.trim().toLowerCase();
    const grp = lessonGroup.value;
    const filtered = Lessons.filter((l) => {
      const grpOk = !grp || grp === 'Tất cả nhóm' || l.group === grp;
      const textOk = (l.id + ' ' + l.title + ' ' + l.group).toLowerCase().includes(q);
      return grpOk && textOk;
    });
    lessonList.innerHTML = filtered.map((l) => {
      const active = l.id === selectedLessonId;
      return `
        <button class="lesson-item ${active ? 'active' : ''}" data-lid="${l.id}">
          <div style="font-size:13px;font-weight:700;">${esc(lessonLabel(l.id))}</div>
          <div style="font-size:12px;color:var(--text-muted);margin-top:2px;">${esc(l.group)}</div>
        </button>
      `;
    }).join('') || '<div style="font-size:12px;color:var(--text-muted);padding:10px;">Không tìm thấy dạng phù hợp.</div>';

    lessonList.querySelectorAll('button[data-lid]').forEach((b) => {
      b.addEventListener('click', () => {
        selectedLessonId = parseInt(b.dataset.lid, 10);
        renderLessonList();
        renderLessonDetail();
        lessonDetail.scrollTop = 0;
      });
    });
  }

  function renderLessonDiagramSvg(kind) {
    if (!kind) return '';
    if (kind === 'badbst') {
      return `
        <svg width="260" height="150" viewBox="0 0 260 150" style="display:block;margin-top:8px;">
          <line x1="130" y1="26" x2="76" y2="74" stroke="var(--border-strong)" stroke-width="2"/>
          <line x1="130" y1="26" x2="184" y2="74" stroke="var(--border-strong)" stroke-width="2"/>
          <line x1="76" y1="74" x2="44" y2="122" stroke="var(--border-strong)" stroke-width="2"/>
          <line x1="76" y1="74" x2="108" y2="122" stroke="#f43f5e" stroke-width="2.2"/>
          <circle cx="130" cy="26" r="16" fill="var(--bg-surface-2)" stroke="var(--accent)" stroke-width="2"/><text x="130" y="31" text-anchor="middle" fill="var(--text-main)" font-size="13" font-weight="700">8</text>
          <circle cx="76" cy="74" r="16" fill="var(--bg-surface-2)" stroke="var(--accent)" stroke-width="2"/><text x="76" y="79" text-anchor="middle" fill="var(--text-main)" font-size="13" font-weight="700">3</text>
          <circle cx="184" cy="74" r="16" fill="var(--bg-surface-2)" stroke="var(--accent)" stroke-width="2"/><text x="184" y="79" text-anchor="middle" fill="var(--text-main)" font-size="13" font-weight="700">12</text>
          <circle cx="44" cy="122" r="16" fill="var(--bg-surface-2)" stroke="var(--accent)" stroke-width="2"/><text x="44" y="127" text-anchor="middle" fill="var(--text-main)" font-size="13" font-weight="700">1</text>
          <circle cx="108" cy="122" r="16" fill="var(--rose-soft)" stroke="#f43f5e" stroke-width="2.2"/><text x="108" y="127" text-anchor="middle" fill="var(--rose-text)" font-size="13" font-weight="700">10</text>
        </svg>
      `;
    }
    if (kind === 'bst') {
      return `
        <svg width="260" height="150" viewBox="0 0 260 150" style="display:block;margin-top:8px;">
          <line x1="130" y1="26" x2="76" y2="74" stroke="var(--border-strong)" stroke-width="2"/>
          <line x1="130" y1="26" x2="184" y2="74" stroke="var(--border-strong)" stroke-width="2"/>
          <line x1="76" y1="74" x2="44" y2="122" stroke="var(--border-strong)" stroke-width="2"/>
          <line x1="76" y1="74" x2="108" y2="122" stroke="var(--border-strong)" stroke-width="2"/>
          <line x1="184" y1="74" x2="216" y2="122" stroke="var(--border-strong)" stroke-width="2"/>
          <circle cx="130" cy="26" r="16" fill="var(--bg-surface-2)" stroke="var(--accent)" stroke-width="2"/><text x="130" y="31" text-anchor="middle" fill="var(--text-main)" font-size="13" font-weight="700">8</text>
          <circle cx="76" cy="74" r="16" fill="var(--bg-surface-2)" stroke="var(--accent)" stroke-width="2"/><text x="76" y="79" text-anchor="middle" fill="var(--text-main)" font-size="13" font-weight="700">3</text>
          <circle cx="184" cy="74" r="16" fill="var(--bg-surface-2)" stroke="var(--accent)" stroke-width="2"/><text x="184" y="79" text-anchor="middle" fill="var(--text-main)" font-size="13" font-weight="700">10</text>
          <circle cx="44" cy="122" r="16" fill="var(--bg-surface-2)" stroke="var(--accent)" stroke-width="2"/><text x="44" y="127" text-anchor="middle" fill="var(--text-main)" font-size="13" font-weight="700">1</text>
          <circle cx="108" cy="122" r="16" fill="var(--bg-surface-2)" stroke="var(--accent)" stroke-width="2"/><text x="108" y="127" text-anchor="middle" fill="var(--text-main)" font-size="13" font-weight="700">6</text>
          <circle cx="216" cy="122" r="16" fill="var(--bg-surface-2)" stroke="var(--accent)" stroke-width="2"/><text x="216" y="127" text-anchor="middle" fill="var(--text-main)" font-size="13" font-weight="700">14</text>
        </svg>
      `;
    }
    if (kind === 'avldelete') {
      return `
        <svg width="260" height="150" viewBox="0 0 260 150" style="display:block;margin-top:8px;">
          <line x1="130" y1="26" x2="76" y2="74" stroke="var(--border-strong)" stroke-width="2"/>
          <line x1="130" y1="26" x2="184" y2="74" stroke="#f43f5e" stroke-dasharray="4 3" stroke-width="2"/>
          <line x1="76" y1="74" x2="44" y2="122" stroke="var(--border-strong)" stroke-width="2"/>
          <line x1="76" y1="74" x2="108" y2="122" stroke="var(--border-strong)" stroke-width="2"/>
          <circle cx="130" cy="26" r="16" fill="var(--bg-surface-2)" stroke="var(--accent)" stroke-width="2"/><text x="130" y="31" text-anchor="middle" fill="var(--text-main)" font-size="13" font-weight="700">30</text>
          <circle cx="76" cy="74" r="16" fill="var(--bg-surface-2)" stroke="var(--accent)" stroke-width="2"/><text x="76" y="79" text-anchor="middle" fill="var(--text-main)" font-size="13" font-weight="700">20</text>
          <circle cx="184" cy="74" r="16" fill="var(--rose-soft)" stroke="#f43f5e" stroke-dasharray="4 3" stroke-width="2"/><text x="184" y="79" text-anchor="middle" fill="var(--rose-text)" font-size="13" font-weight="700">40</text>
          <circle cx="44" cy="122" r="16" fill="var(--bg-surface-2)" stroke="var(--accent)" stroke-width="2"/><text x="44" y="127" text-anchor="middle" fill="var(--text-main)" font-size="13" font-weight="700">10</text>
          <circle cx="108" cy="122" r="16" fill="var(--bg-surface-2)" stroke="var(--accent)" stroke-width="2"/><text x="108" y="127" text-anchor="middle" fill="var(--text-main)" font-size="13" font-weight="700">25</text>
        </svg>
      `;
    }
    return '';
  }

  function renderLessonDetail() {
    const l = Lessons[selectedLessonId - 1] || Lessons[0];
    if (!l) return;
    const simPreset = LESSON_SIM_MAP[l.id];

    lessonDetail.innerHTML = `
      <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;">
        <div>
          <span class="brand-pill">${esc(l.group)}</span>
          <h2 style="margin:6px 0 0;font-size:21px;font-weight:700;">${esc(lessonLabel(l.id))}</h2>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:8px;">
          <button id="btn-lesson-practice" class="btn btn-primary">Luyện dạng này</button>
          ${simPreset ? '<button id="btn-lesson-sim" class="btn">Chạy mô phỏng 60fps ▶</button>' : ''}
        </div>
      </div>

      <div class="surface-card" style="padding:18px 20px;">
        <div class="section-tag">Bài mẫu</div>
        <p style="margin:0;font-size:14px;line-height:1.65;">${esc(l.problem)}</p>
        ${l.diagram && l.diagram.length ? renderLessonDiagramSvg(l.diagram[0]) : ''}
      </div>

      ${l.code ? `
        <div class="surface-card" style="padding:18px 20px;">
          <div class="section-tag">Đoạn mã minh họa</div>
          <pre class="code-block">${esc(l.code)}</pre>
        </div>
      ` : ''}

      ${l.table && l.table.length ? `
        <div class="surface-card" style="padding:18px 20px;">
          <div class="section-tag">Bảng tổng hợp nhanh</div>
          <table class="data-table">
            <thead><tr>${l.table[0].map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead>
            <tbody>${l.table.slice(1).map((row) => `<tr>${row.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody>
          </table>
        </div>
      ` : ''}

      <div class="grid-2">
        <div class="surface-card" style="padding:18px 20px;">
          <div class="section-tag">Bắt đầu suy luận</div>
          <div style="display:flex;flex-direction:column;gap:8px;">
            ${l.reasoning.map((r, i) => `
              <div style="display:flex;gap:10px;align-items:flex-start;font-size:13px;">
                <span style="width:22px;height:22px;border-radius:999px;background:var(--accent-soft);color:var(--accent);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:12px;flex-shrink:0;">${i + 1}</span>
                <span>${esc(r)}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="surface-card" style="padding:18px 20px;">
          <div class="section-tag">Giải từng bước</div>
          <div style="display:flex;flex-direction:column;gap:8px;">
            ${l.solution.map((s, i) => `
              <div class="surface-sub" style="padding:10px 12px;font-size:13px;">
                <strong>Bước ${i + 1}:</strong> ${esc(s)}
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <div class="tip-box">
        <strong style="color:var(--amber-text);">Mẹo nhanh và bẫy hay gặp:</strong> ${esc(l.tip)}
      </div>

      <div class="surface-card" style="padding:18px 20px;">
        <div class="section-tag">Tự kiểm tra</div>
        <p style="margin:0 0 10px;font-size:14px;">${esc(l.practice)}</p>
        <button id="btn-toggle-lesson-ans" class="btn">Hiện đáp án tự kiểm tra</button>
        <div id="lesson-ans-box" style="display:none;margin-top:10px;padding:12px 14px;border-radius:12px;background:var(--emerald-soft);color:var(--emerald-text);font-size:13px;font-weight:600;">
          ${esc(l.answer)}
        </div>
        <div style="font-size:12px;color:var(--text-muted);margin-top:12px;">Nguồn dạng bài: ${esc(l.source)}</div>
      </div>
    `;

    document.getElementById('btn-lesson-practice').addEventListener('click', () => openPractice(l.id, null));
    if (simPreset) {
      document.getElementById('btn-lesson-sim').addEventListener('click', () => {
        switchTab('sim');
        selectSimMode(simPreset.mode, simPreset.arr, simPreset.key);
      });
    }
    const ansBtn = document.getElementById('btn-toggle-lesson-ans');
    const ansBox = document.getElementById('lesson-ans-box');
    ansBtn.addEventListener('click', () => {
      const open = ansBox.style.display === 'block';
      ansBox.style.display = open ? 'none' : 'block';
      ansBtn.textContent = open ? 'Hiện đáp án tự kiểm tra' : 'Ẩn đáp án';
    });
  }

  // =========================================================
  // 3. SIMULATOR TAB (ALL 11 MODES, 60FPS)
  // =========================================================
  const SIM_MODES = [
    { id: 'bubble', label: 'Bubble Sort', help: 'Nhập 1–12 số nguyên. Hai phần tử hoán đổi sẽ trượt vòng cung mượt mà.' },
    { id: 'selection', label: 'Selection Sort', help: 'Quét tìm chỉ số min trong đoạn chưa sắp rồi đổi 1 lần cuối lượt.' },
    { id: 'insertion', label: 'Insertion Sort', help: 'Phần tử x nhấc lên vùng tạm, các số lớn hơn trượt sang phải rồi chèn vào pos + 1.' },
    { id: 'interchange', label: 'Interchange Sort', help: 'Cố định i, so từng j > i và đổi chỗ ngay với a[i] nếu a[i] > a[j].' },
    { id: 'binary', label: 'Tìm nhị phân', help: 'Nhập dãy tăng dần. Ô khóa: giá trị cần tìm trong đoạn đóng [low, high].', keyLabel: 'Khóa tìm:' },
    { id: 'stack', label: 'Stack Push/Pop', help: 'Số ≥ 0: push(v) vào đỉnh · Số -1: pop() lấy phần tử trên đỉnh (LIFO).' },
    { id: 'queue', label: 'Queue Enq/Deq', help: 'Số ≥ 0: enqueue(v) vào rear · Số -1: dequeue() lấy ở front (FIFO).' },
    { id: 'postfix', label: 'Hậu tố', help: 'Nhập token cách bởi khoảng trắng (hỗ trợ + - * /, chia nguyên). VD: 8 3 2 * - 4 +' },
    { id: 'linked', label: 'DSLK đổi cặp', help: 'Đổi dữ liệu từng cặp nút (0,1), (2,3)... không đổi liên kết next.' },
    { id: 'bst', label: 'Cây BST', help: 'Khóa phân biệt chèn trái→phải. Ô nhỏ (tùy chọn): khóa xóa sau khi chèn.', keyLabel: 'Khóa xóa:' },
    { id: 'avl', label: 'Cây AVL (Xoay)', help: 'Dò từ gốc xuống để chèn, theo dõi BF và xem xoay LL/RR/LR/RL trượt mượt.', keyLabel: 'Khóa xóa:' }
  ];

  let simMode = 'avl';
  let simSteps = [];
  let simIndex = 0;
  let simPlaying = false;
  let simPlayTimer = null;

  const simModesEl = document.getElementById('sim-modes');
  const simHelpEl = document.getElementById('sim-help');
  const simInputEl = document.getElementById('sim-input');
  const simKeyWrapEl = document.getElementById('sim-key-wrap');
  const simKeyLabelEl = document.getElementById('sim-key-label');
  const simKeyEl = document.getElementById('sim-key');
  const simErrorEl = document.getElementById('sim-error');
  const stepBadgeEl = document.getElementById('step-badge');
  const stepTitleEl = document.getElementById('step-title');
  const stepVarsEl = document.getElementById('step-vars');
  const stepNoteEl = document.getElementById('step-note');
  const stepSliderEl = document.getElementById('step-slider');
  const btnPlayEl = document.getElementById('btn-play');

  const simViz = new Visualizer(
    document.getElementById('sim-canvas'),
    document.getElementById('canvas-wrap'),
    () => appEl.getAttribute('data-theme')
  );

  function renderSimModePills() {
    simModesEl.innerHTML = SIM_MODES.map((m) =>
      `<button data-mode="${m.id}" class="pill-btn ${m.id === simMode ? 'active' : ''}">${m.label}</button>`
    ).join('');
    simModesEl.querySelectorAll('button').forEach((b) => {
      b.addEventListener('click', () => selectSimMode(b.dataset.mode));
    });
  }

  function parseNums(text, allowNegOne = false) {
    const tokens = String(text || '').split(/[\s,;]+/).filter(Boolean);
    if (tokens.length < 1 || tokens.length > 12) {
      throw new Error('Nhập từ 1 đến 12 số nguyên để hình mô phỏng dễ đọc.');
    }
    return tokens.map((tok) => {
      if (!/^-?\d+$/.test(tok)) throw new Error(`Giá trị không hợp lệ: "${tok}"`);
      const n = parseInt(tok, 10);
      if (n < -999 || n > 999) throw new Error('Mỗi giá trị phải nằm trong khoảng -999 đến 999.');
      if (allowNegOne && n < -1) throw new Error('Chỉ dùng số ≥ 0 để thêm hoặc -1 để lấy phần tử.');
      return n;
    });
  }

  function buildSimSteps() {
    store.setSimInput(simMode, simInputEl.value, simKeyEl.value);
    simErrorEl.style.display = 'none';
    try {
      let nextSteps;
      if (simMode === 'postfix') {
        nextSteps = Algo.postfix(simInputEl.value);
      } else {
        const vals = parseNums(simInputEl.value, simMode === 'stack' || simMode === 'queue');
        if (simMode === 'binary') {
          if (!/^-?\d+$/.test(simKeyEl.value.trim())) throw new Error('Nhập khóa nguyên cần tìm vào ô nhỏ.');
          for (let i = 1; i < vals.length; i++) {
            if (vals[i] < vals[i - 1]) throw new Error('Tìm kiếm nhị phân cần dãy tăng dần.');
          }
          nextSteps = Algo.binary(vals, parseInt(simKeyEl.value.trim(), 10));
        } else if (simMode === 'stack' || simMode === 'queue') {
          nextSteps = Algo.operations(vals, simMode === 'queue');
        } else if (simMode === 'linked') {
          nextSteps = Algo.linkedPairs(vals);
        } else if (simMode === 'bst' || simMode === 'avl') {
          let rem = null;
          const rawKey = simKeyEl.value.trim();
          if (rawKey !== '') {
            if (!/^-?\d+$/.test(rawKey)) throw new Error('Khóa xóa phải là số nguyên.');
            rem = parseInt(rawKey, 10);
          }
          if (new Set(vals).size !== vals.length) throw new Error('Các khóa cây phải phân biệt.');
          nextSteps = Algo.treeTrace(vals, simMode === 'avl', rem);
        } else {
          const cap = simMode.charAt(0).toUpperCase() + simMode.slice(1);
          nextSteps = Algo.sort(vals, cap);
        }
      }

      stopSimPlay();
      simSteps = nextSteps;
      simIndex = 0;
      stepSliderEl.min = 0;
      stepSliderEl.max = Math.max(0, simSteps.length - 1);
      stepSliderEl.value = 0;
      simViz.setData(simMode, simSteps);
      updateSimReadout();
    } catch (err) {
      simErrorEl.textContent = err.message;
      simErrorEl.style.display = 'inline';
    }
  }

  function updateSimReadout() {
    const st = simSteps[simIndex];
    if (!st) return;
    stepBadgeEl.textContent = `Bước ${simIndex + 1} / ${simSteps.length}`;
    stepTitleEl.textContent = st.title;
    stepNoteEl.textContent = st.note;
    stepSliderEl.value = simIndex;
    stepVarsEl.innerHTML = (st.vars || []).map((v) =>
      `<span class="font-mono-code" style="font-size:12px;padding:3px 9px;border-radius:8px;background:var(--bg-surface-2);border:1px solid var(--border-subtle);color:var(--text-soft);">${esc(v)}</span>`
    ).join('');
  }

  function goSimStep(nextIdx, instant = false) {
    if (!simSteps.length) return;
    const clamped = Math.max(0, Math.min(nextIdx, simSteps.length - 1));
    if (clamped === simIndex && !instant) return;
    const prev = simIndex;
    simIndex = clamped;
    updateSimReadout();
    simViz.transitionTo(prev, simIndex, instant);
  }

  function scheduleSimPlay() {
    if (!simPlaying) return;
    if (simIndex >= simSteps.length - 1) {
      stopSimPlay();
      return;
    }
    const baseDelay = (simMode === 'avl' || simMode === 'bst') ? 1280 : 1120;
    simPlayTimer = setTimeout(() => {
      if (!simPlaying) return;
      goSimStep(simIndex + 1);
      scheduleSimPlay();
    }, Math.round(baseDelay / simViz.speed));
  }

  function startSimPlay() {
    if (simIndex >= simSteps.length - 1) goSimStep(0, true);
    simPlaying = true;
    btnPlayEl.textContent = '⏸ Tạm dừng';
    btnPlayEl.className = 'btn btn-amber';
    if (simIndex < simSteps.length - 1) goSimStep(simIndex + 1);
    scheduleSimPlay();
  }

  function stopSimPlay() {
    simPlaying = false;
    if (simPlayTimer) {
      clearTimeout(simPlayTimer);
      simPlayTimer = null;
    }
    btnPlayEl.textContent = '▶ Tự chạy';
    btnPlayEl.className = 'btn btn-primary';
  }

  let simInitialized = false;
  function selectSimMode(mode, customArr = null, customKey = null) {
    if (simInitialized) store.setSimInput(simMode, simInputEl.value, simKeyEl.value);
    simMode = mode;
    simInitialized = true;
    const meta = SIM_MODES.find((m) => m.id === mode) || SIM_MODES[0];
    renderSimModePills();
    simHelpEl.textContent = meta.help;

    if (customArr !== null) store.setSimInput(mode, customArr, customKey !== null ? customKey : store.getSimInput(mode).key);
    else if (customKey !== null) store.setSimInput(mode, store.getSimInput(mode).arr, customKey);

    const saved = store.getSimInput(mode);
    simInputEl.value = saved.arr;
    simKeyEl.value = saved.key;

    if (meta.keyLabel) {
      simKeyLabelEl.textContent = meta.keyLabel;
      simKeyWrapEl.style.display = 'flex';
    } else {
      simKeyWrapEl.style.display = 'none';
    }

    buildSimSteps();
  }

  simInputEl.addEventListener('input', () => store.setSimInput(simMode, simInputEl.value, simKeyEl.value));
  simKeyEl.addEventListener('input', () => store.setSimInput(simMode, simInputEl.value, simKeyEl.value));
  simInputEl.addEventListener('keydown', (e) => { if (e.key === 'Enter') buildSimSteps(); });
  simKeyEl.addEventListener('keydown', (e) => { if (e.key === 'Enter') buildSimSteps(); });
  document.getElementById('sim-apply').addEventListener('click', buildSimSteps);

  document.getElementById('sim-random').addEventListener('click', () => {
    if (simMode === 'binary') {
      const arr = [];
      let v = Math.floor(Math.random() * 5) + 1;
      for (let i = 0; i < 7; i++) { arr.push(v); v += Math.floor(Math.random() * 5) + 2; }
      simInputEl.value = arr.join(', ');
      simKeyEl.value = String(arr[Math.floor(Math.random() * arr.length)]);
    } else if (simMode === 'stack' || simMode === 'queue') {
      const seq = [];
      let cnt = 0;
      for (let i = 0; i < 6; i++) {
        if (cnt > 0 && Math.random() < 0.36) { seq.push(-1); cnt--; }
        else { seq.push(Math.floor(Math.random() * 20) + 1); cnt++; }
      }
      simInputEl.value = seq.join(', ');
    } else if (simMode === 'postfix') {
      const samples = ['8 3 2 * - 4 +', '9 4 - 2 * 3 +', '15 3 / 4 2 * +', '6 2 + 5 3 - *'];
      simInputEl.value = samples[Math.floor(Math.random() * samples.length)];
    } else if (simMode === 'bst' || simMode === 'avl') {
      const set = new Set();
      while (set.size < 6) set.add((Math.floor(Math.random() * 9) + 1) * 10 + Math.floor(Math.random() * 9));
      simInputEl.value = Array.from(set).join(', ');
      simKeyEl.value = '';
    } else {
      const arr = Array.from({ length: 6 }, () => Math.floor(Math.random() * 25) + 1);
      simInputEl.value = arr.join(', ');
    }
    buildSimSteps();
  });

  document.getElementById('btn-first').addEventListener('click', () => { stopSimPlay(); goSimStep(0); });
  document.getElementById('btn-prev').addEventListener('click', () => { stopSimPlay(); goSimStep(simIndex - 1); });
  document.getElementById('btn-next').addEventListener('click', () => { stopSimPlay(); goSimStep(simIndex + 1); });
  document.getElementById('btn-last').addEventListener('click', () => { stopSimPlay(); goSimStep(simSteps.length - 1); });
  btnPlayEl.addEventListener('click', () => { if (simPlaying) stopSimPlay(); else startSimPlay(); });
  stepSliderEl.addEventListener('input', (e) => { stopSimPlay(); goSimStep(parseInt(e.target.value, 10), true); });

  document.querySelectorAll('.speed-pill').forEach((btn) => {
    btn.addEventListener('click', () => {
      simViz.speed = parseFloat(btn.dataset.speed);
      document.querySelectorAll('.speed-pill').forEach((b) => b.classList.toggle('active', b === btn));
      if (simPlaying) {
        clearTimeout(simPlayTimer);
        scheduleSimPlay();
      }
    });
  });

  window.addEventListener('keydown', (e) => {
    const tag = (document.activeElement && document.activeElement.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    if (currentTab !== 'sim') return;
    if (e.key === 'ArrowRight') { e.preventDefault(); stopSimPlay(); goSimStep(simIndex + 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); stopSimPlay(); goSimStep(simIndex - 1); }
    else if (e.key === ' ') { e.preventDefault(); if (simPlaying) stopSimPlay(); else startSimPlay(); }
  });

  // =========================================================
  // TRACE MODAL (for non-simulator traces like Linear Search)
  // =========================================================
  const traceModal = document.getElementById('trace-modal');
  const modalViz = new Visualizer(
    document.getElementById('modal-canvas'),
    document.getElementById('modal-canvas-wrap'),
    () => appEl.getAttribute('data-theme')
  );
  let modalSteps = [];
  let modalIdx = 0;

  function openTraceModal(steps, title) {
    modalSteps = steps;
    modalIdx = 0;
    document.getElementById('modal-title').textContent = title || 'Mô phỏng lời giải';
    traceModal.classList.add('open');
    requestAnimationFrame(() => {
      modalViz.resize();
      modalViz.setData('array', modalSteps);
      updateModalReadout();
    });
  }

  function updateModalReadout() {
    const st = modalSteps[modalIdx];
    if (!st) return;
    document.getElementById('modal-note').textContent = `Bước ${modalIdx + 1}/${modalSteps.length}: ${st.title} — ${st.note}`;
  }

  document.getElementById('modal-close').addEventListener('click', () => traceModal.classList.remove('open'));
  document.getElementById('modal-prev').addEventListener('click', () => {
    if (modalIdx > 0) {
      const prev = modalIdx--;
      updateModalReadout();
      modalViz.transitionTo(prev, modalIdx);
    }
  });
  document.getElementById('modal-next').addEventListener('click', () => {
    if (modalIdx < modalSteps.length - 1) {
      const prev = modalIdx++;
      updateModalReadout();
      modalViz.transitionTo(prev, modalIdx);
    }
  });

  // =========================================================
  // 4. PRACTICE TAB
  // =========================================================
  let practiceFilter = 0;
  let practiceQ = null;
  let practiceSelected = null;
  let practiceChecked = false;
  let practiceHints = 0;

  function randomSeed() {
    return (Math.floor(Math.random() * 0x7fffffff) + 1) >>> 0;
  }

  function makeQuestionForFilter(typeFilter) {
    const t = typeFilter === 0 ? (Math.floor(Math.random() * Lessons.length) + 1) : typeFilter;
    return Questions.make(t, randomSeed(), 2);
  }

  function openPractice(typeFilter, existingQ) {
    practiceFilter = typeFilter || 0;
    practiceQ = existingQ || makeQuestionForFilter(practiceFilter);
    practiceSelected = null;
    practiceChecked = false;
    practiceHints = 0;
    switchTab('practice');
    renderPractice();
  }

  function renderPractice() {
    const el = document.getElementById('tab-practice');
    if (!practiceQ) practiceQ = makeQuestionForFilter(practiceFilter);
    const lesson = Lessons[practiceQ.type - 1];
    const maxHints = lesson ? lesson.reasoning.length : 0;

    el.innerHTML = `
      <div style="max-width:920px;margin:0 auto;display:flex;flex-direction:column;gap:16px;">
        <div class="page-header" style="margin-bottom:0;">
          <div>
            <h1 class="page-title">Luyện câu hỏi biến thể</h1>
            <p class="page-sub">Chốt đáp án trước khi xem lời giải · Dữ liệu mới được sinh và chấm tự động offline</p>
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;">
            <select id="pq-type-select" class="select-field" style="max-width:340px;">
              <option value="0" ${practiceFilter === 0 ? 'selected' : ''}>Tất cả 29 dạng · trộn ngẫu nhiên</option>
              ${Lessons.map((l) => `<option value="${l.id}" ${practiceFilter === l.id ? 'selected' : ''}>${esc(lessonLabel(l.id))}</option>`).join('')}
            </select>
            <button id="pq-new-btn" class="btn btn-primary btn-lg">Câu mới</button>
          </div>
        </div>

        <div class="surface-card" style="padding:24px;display:flex;flex-direction:column;gap:18px;">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;">
            <span class="brand-pill">${esc(lessonLabel(practiceQ.type))}</span>
            <span style="font-size:12px;color:var(--text-muted);">Seed #${practiceQ.seed}</span>
          </div>

          <div style="font-size:15px;font-weight:600;line-height:1.65;white-space:pre-wrap;">${esc(practiceQ.prompt)}</div>

          <div id="pq-options" class="options-grid">
            ${practiceQ.options.map((opt, idx) => {
              let cls = 'option-card';
              if (practiceChecked) {
                if (opt === practiceQ.correct) cls += ' correct';
                else if (opt === practiceSelected) cls += ' wrong';
              } else if (opt === practiceSelected) {
                cls += ' selected';
              }
              return `
                <button class="${cls}" data-opt="${idx}" ${practiceChecked ? 'disabled' : ''}>
                  <span class="option-letter">${String.fromCharCode(65 + idx)}</span>
                  <span style="white-space:pre-wrap;">${esc(opt)}</span>
                </button>
              `;
            }).join('')}
          </div>

          <div style="display:flex;flex-wrap:wrap;gap:10px;">
            <button id="pq-check-btn" class="btn btn-primary btn-lg" ${practiceChecked ? 'disabled' : ''}>Kiểm tra đáp án</button>
            <button id="pq-hint-btn" class="btn btn-lg" ${practiceChecked || practiceHints >= maxHints ? 'disabled' : ''}>Gợi ý (${practiceHints}/${maxHints})</button>
            <button id="pq-sim-btn" class="btn btn-lg" style="color:var(--accent);border-color:var(--accent-border);" ${!practiceChecked || (!practiceQ.simPreset && (!practiceQ.trace || !practiceQ.trace.length)) ? 'disabled' : ''}>Xem từng bước ▶</button>
          </div>
        </div>

        <div id="pq-feedback" class="surface-card" style="padding:20px;display:${practiceChecked || practiceHints > 0 ? 'block' : 'none'};">
          ${renderPracticeFeedbackHtml()}
        </div>
      </div>
    `;

    document.getElementById('pq-type-select').addEventListener('change', (e) => {
      practiceFilter = parseInt(e.target.value, 10);
      openPractice(practiceFilter, null);
    });
    document.getElementById('pq-new-btn').addEventListener('click', () => openPractice(practiceFilter, null));

    el.querySelectorAll('#pq-options .option-card').forEach((b) => {
      b.addEventListener('click', () => {
        if (practiceChecked) return;
        practiceSelected = practiceQ.options[parseInt(b.dataset.opt, 10)];
        renderPractice();
      });
    });

    document.getElementById('pq-hint-btn').addEventListener('click', () => {
      if (practiceChecked || !lesson || practiceHints >= lesson.reasoning.length) return;
      practiceHints++;
      renderPractice();
    });

    document.getElementById('pq-check-btn').addEventListener('click', () => {
      if (practiceChecked) return;
      if (practiceSelected === null) {
        const fb = document.getElementById('pq-feedback');
        fb.style.display = 'block';
        fb.innerHTML = '<div style="color:var(--amber-text);font-weight:600;">Hãy chọn một đáp án A, B, C hoặc D trước khi kiểm tra.</div>';
        return;
      }
      practiceChecked = true;
      store.recordAttempt(practiceQ, practiceSelected);
      updateMistakeBadge();
      renderPractice();
    });

    document.getElementById('pq-sim-btn').addEventListener('click', () => {
      if (!practiceChecked) return;
      if (practiceQ.simPreset) {
        switchTab('sim');
        selectSimMode(practiceQ.simPreset.mode, practiceQ.simPreset.arr, practiceQ.simPreset.key);
      } else if (practiceQ.trace && practiceQ.trace.length) {
        openTraceModal(practiceQ.trace, lessonLabel(practiceQ.type));
      }
    });
  }

  function renderPracticeFeedbackHtml() {
    if (practiceChecked) {
      const ok = practiceSelected === practiceQ.correct;
      return `
        <div style="font-size:15px;font-weight:700;color:${ok ? 'var(--emerald-text)' : 'var(--rose-text)'};margin-bottom:8px;">
          ${ok ? '✓ ĐÚNG!' : '✕ CHƯA ĐÚNG — Đã lưu vào Sổ câu sai'}
        </div>
        <div style="font-size:13px;font-weight:700;margin-bottom:10px;">Đáp án đúng: ${esc(practiceQ.correct)}</div>
        <div style="font-size:13px;color:var(--text-soft);white-space:pre-wrap;line-height:1.65;">${esc(practiceQ.explanation)}</div>
      `;
    }
    if (practiceHints > 0) {
      const lesson = Lessons[practiceQ.type - 1];
      return `
        <div style="font-size:12px;font-weight:700;color:var(--amber-text);text-transform:uppercase;margin-bottom:6px;">Gợi ý ${practiceHints}</div>
        ${lesson.reasoning.slice(0, practiceHints).map((h, i) => `<div style="font-size:13px;margin-top:4px;">${i + 1}. ${esc(h)}</div>`).join('')}
      `;
    }
    return '';
  }

  // =========================================================
  // 5. MOCK EXAM TAB
  // =========================================================
  const examState = {
    active: false,
    done: false,
    questions: [],
    answers: [],
    index: 0,
    untimed: false,
    startedAt: 0,
    deadlineAt: 0,
    timer: null,
    setupCount: 29,
    setupMinutes: 30,
    setupUntimed: false
  };

  function startExam(count, minutes, untimed) {
    const qs = [];
    while (qs.length < count) {
      const order = Array.from({ length: Lessons.length }, (_, i) => i + 1).sort(() => Math.random() - 0.5);
      for (const type of order) {
        qs.push(Questions.make(type, randomSeed(), 2));
        if (qs.length === count) break;
      }
    }
    examState.questions = qs;
    examState.answers = new Array(count).fill(null);
    examState.index = 0;
    examState.active = true;
    examState.done = false;
    examState.untimed = untimed;
    examState.startedAt = Date.now();
    examState.deadlineAt = examState.startedAt + minutes * 60000;
    if (examState.timer) clearInterval(examState.timer);
    if (!untimed) {
      examState.timer = setInterval(tickExamClock, 1000);
    }
    renderExam();
  }

  function tickExamClock() {
    const clockEl = document.getElementById('exam-clock');
    if (!examState.active) return;
    if (examState.untimed) {
      if (clockEl) clockEl.textContent = `Không giới hạn · ${examState.answers.filter(Boolean).length}/${examState.questions.length} đã chọn`;
      return;
    }
    const leftMs = examState.deadlineAt - Date.now();
    if (leftMs <= 0) {
      submitExam();
      return;
    }
    const totalSec = Math.floor(leftMs / 1000);
    const mm = String(Math.floor(totalSec / 60)).padStart(2, '0');
    const ss = String(totalSec % 60).padStart(2, '0');
    if (clockEl) clockEl.textContent = `⏱ Còn ${mm}:${ss} · ${examState.answers.filter(Boolean).length}/${examState.questions.length} đã chọn`;
  }

  function submitExam() {
    if (!examState.active) return;
    examState.active = false;
    examState.done = true;
    if (examState.timer) {
      clearInterval(examState.timer);
      examState.timer = null;
    }
    let score = 0;
    examState.questions.forEach((q, i) => {
      if (examState.answers[i] === q.correct) score++;
      store.recordAttempt(q, examState.answers[i]);
    });
    const elapsedSec = Math.max(1, Math.round((Date.now() - examState.startedAt) / 1000));
    store.recordExam(score, examState.questions.length, elapsedSec);
    updateMistakeBadge();
    renderExam();
  }

  function renderExam() {
    const el = document.getElementById('tab-exam');
    if (!examState.active && !examState.done) {
      const recent = store.state.exams.slice().reverse().slice(0, 8);
      el.innerHTML = `
        <div style="max-width:860px;margin:0 auto;display:flex;flex-direction:column;gap:18px;">
          <div class="page-header" style="margin-bottom:0;">
            <div>
              <h1 class="page-title">Thi thử trắc nghiệm</h1>
              <p class="page-sub">Đề trộn ngẫu nhiên các dạng · Giấu đáp án đến khi nộp bài · Chuyển câu tự do</p>
            </div>
          </div>

          <div class="surface-card" style="padding:24px;display:flex;flex-direction:column;gap:18px;">
            <div class="grid-2">
              <div class="surface-sub" style="padding:16px;">
                <div style="display:flex;justify-content:space-between;font-size:13px;font-weight:600;margin-bottom:10px;">
                  <span>Số câu hỏi</span>
                  <span id="ex-cnt-readout" class="font-mono-code" style="color:var(--accent);">${examState.setupCount} câu</span>
                </div>
                <input id="ex-cnt-range" type="range" min="5" max="100" value="${examState.setupCount}" class="sim-slider" style="width:100%;" />
              </div>

              <div class="surface-sub" style="padding:16px;">
                <div style="display:flex;justify-content:space-between;font-size:13px;font-weight:600;margin-bottom:10px;">
                  <span>Thời gian làm bài</span>
                  <span id="ex-min-readout" class="font-mono-code" style="color:var(--accent);">${examState.setupMinutes} phút</span>
                </div>
                <input id="ex-min-range" type="range" min="1" max="120" value="${examState.setupMinutes}" class="sim-slider" style="width:100%;" />
              </div>
            </div>

            <label style="display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer;">
              <input id="ex-untimed" type="checkbox" ${examState.setupUntimed ? 'checked' : ''} />
              <span>Không giới hạn thời gian</span>
            </label>

            <div>
              <button id="ex-start-btn" class="btn btn-primary btn-lg">Bắt đầu đề mới</button>
            </div>
          </div>

          <div class="surface-card" style="padding:20px;">
            <strong style="font-size:15px;">Lịch sử thi thử gần đây</strong>
            ${recent.length ? `
              <div style="margin-top:12px;display:flex;flex-direction:column;gap:8px;">
                ${recent.map((x) => {
                  const grade = (10 * x.correct / x.total).toFixed(2);
                  return `<div class="surface-sub" style="padding:10px 14px;display:flex;justify-content:space-between;font-size:13px;">
                    <span>${esc(x.date)}</span>
                    <strong>${x.correct} / ${x.total} đúng · ${grade} / 10</strong>
                  </div>`;
                }).join('')}
              </div>
            ` : '<p style="margin:10px 0 0;font-size:13px;color:var(--text-muted);">Chưa có bài thi thử nào được nộp.</p>'}
          </div>
        </div>
      `;

      document.getElementById('ex-cnt-range').addEventListener('input', (e) => {
        examState.setupCount = parseInt(e.target.value, 10);
        document.getElementById('ex-cnt-readout').textContent = `${examState.setupCount} câu`;
      });
      document.getElementById('ex-min-range').addEventListener('input', (e) => {
        examState.setupMinutes = parseInt(e.target.value, 10);
        document.getElementById('ex-min-readout').textContent = `${examState.setupMinutes} phút`;
      });
      document.getElementById('ex-untimed').addEventListener('change', (e) => {
        examState.setupUntimed = e.target.checked;
      });
      document.getElementById('ex-start-btn').addEventListener('click', () => {
        startExam(examState.setupCount, examState.setupMinutes, examState.setupUntimed);
      });
      return;
    }

    // Active or Review mode
    const q = examState.questions[examState.index];
    const score = examState.done ? examState.questions.filter((item, idx) => examState.answers[idx] === item.correct).length : 0;
    const grade = examState.done ? (10 * score / examState.questions.length).toFixed(2) : '';

    el.innerHTML = `
      <div style="max-width:960px;margin:0 auto;display:flex;flex-direction:column;gap:14px;">
        <div class="surface-card" style="padding:14px 18px;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px;">
          <div id="exam-clock" class="font-mono-code" style="font-size:13px;font-weight:700;padding:6px 12px;border-radius:10px;background:${examState.done ? 'var(--emerald-soft)' : 'var(--amber-soft)'};color:${examState.done ? 'var(--emerald-text)' : 'var(--amber-text)'};">
            ${examState.done ? `Kết quả: ${score} / ${examState.questions.length} đúng · ${grade} / 10` : ''}
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:8px;">
            <button id="ex-prev-q" class="btn" ${examState.index === 0 ? 'disabled' : ''}>◀ Câu trước</button>
            <button id="ex-next-q" class="btn" ${examState.index >= examState.questions.length - 1 ? 'disabled' : ''}>Câu tiếp ▶</button>
            <button id="ex-submit-btn" class="btn btn-primary">${examState.done ? 'Làm đề mới' : 'Nộp bài'}</button>
          </div>
        </div>

        <div class="surface-card" style="padding:14px 18px;">
          <div class="exam-palette">
            ${examState.questions.map((item, idx) => {
              let cls = 'exam-num-btn';
              if (idx === examState.index) cls += ' current';
              if (examState.done) cls += examState.answers[idx] === item.correct ? ' ok' : ' bad';
              else if (examState.answers[idx] !== null) cls += ' answered';
              return `<button class="${cls}" data-exq="${idx}">${idx + 1}</button>`;
            }).join('')}
          </div>
        </div>

        <div class="surface-card" style="padding:22px;display:flex;flex-direction:column;gap:16px;">
          <div style="display:flex;align-items:center;justify-content:space-between;">
            <span class="brand-pill">Câu ${examState.index + 1} / ${examState.questions.length} · ${esc(lessonLabel(q.type))}</span>
          </div>
          <div style="font-size:15px;font-weight:600;line-height:1.65;white-space:pre-wrap;">${esc(q.prompt)}</div>
          <div class="options-grid">
            ${q.options.map((opt, idx) => {
              let cls = 'option-card';
              if (examState.done) {
                if (opt === q.correct) cls += ' correct';
                else if (examState.answers[examState.index] === opt) cls += ' wrong';
              } else if (examState.answers[examState.index] === opt) {
                cls += ' selected';
              }
              return `
                <button class="${cls}" data-exopt="${idx}" ${examState.done ? 'disabled' : ''}>
                  <span class="option-letter">${String.fromCharCode(65 + idx)}</span>
                  <span style="white-space:pre-wrap;">${esc(opt)}</span>
                </button>
              `;
            }).join('')}
          </div>

          ${examState.done ? `
            <div class="surface-sub" style="padding:14px 16px;font-size:13px;line-height:1.65;white-space:pre-wrap;">
              <strong>Đáp án đúng: ${esc(q.correct)}</strong>\n\n${esc(q.explanation)}
            </div>
          ` : ''}
        </div>
      </div>
    `;

    if (!examState.done) tickExamClock();
    document.getElementById('ex-prev-q').addEventListener('click', () => {
      examState.index = Math.max(0, examState.index - 1);
      renderExam();
    });
    document.getElementById('ex-next-q').addEventListener('click', () => {
      examState.index = Math.min(examState.questions.length - 1, examState.index + 1);
      renderExam();
    });
    document.getElementById('ex-submit-btn').addEventListener('click', () => {
      if (examState.done) {
        examState.done = false;
        examState.questions = [];
        renderExam();
      } else if (window.confirm('Nộp bài ngay? Câu chưa chọn sẽ tính là chưa đúng.')) {
        submitExam();
      }
    });
    el.querySelectorAll('[data-exq]').forEach((b) => {
      b.addEventListener('click', () => {
        examState.index = parseInt(b.dataset.exq, 10);
        renderExam();
      });
    });
    el.querySelectorAll('[data-exopt]').forEach((b) => {
      b.addEventListener('click', () => {
        if (examState.done) return;
        examState.answers[examState.index] = q.options[parseInt(b.dataset.exopt, 10)];
        renderExam();
      });
    });
  }

  // =========================================================
  // 6. MISTAKE BOOK TAB
  // =========================================================
  let mistakeShowResolved = false;

  function renderMistakes() {
    const el = document.getElementById('tab-mistakes');
    const pending = store.state.mistakes.filter((x) => !x.resolved).slice().reverse();
    const resolved = store.state.mistakes.filter((x) => x.resolved).slice().reverse();
    const list = mistakeShowResolved ? resolved : pending;

    el.innerHTML = `
      <div style="max-width:920px;margin:0 auto;display:flex;flex-direction:column;gap:16px;">
        <div class="page-header" style="margin-bottom:0;">
          <div>
            <h1 class="page-title">Sổ câu sai</h1>
            <p class="page-sub">${pending.length} câu cần ôn lại · ${resolved.length} câu đã làm đúng lại</p>
          </div>
          <div class="pill-group">
            <button id="mk-pending-tab" class="pill-btn ${!mistakeShowResolved ? 'active' : ''}">Cần ôn (${pending.length})</button>
            <button id="mk-resolved-tab" class="pill-btn ${mistakeShowResolved ? 'active' : ''}">Đã sửa (${resolved.length})</button>
          </div>
        </div>

        ${list.length === 0 ? `
          <div class="surface-card" style="padding:32px;text-align:center;">
            <p style="margin:0 0 14px;color:var(--text-muted);">${mistakeShowResolved ? 'Chưa có câu nào được đánh dấu đã sửa.' : 'Tuyệt vời! Hiện không có câu sai nào cần ôn.'}</p>
            <button id="mk-go-practice" class="btn btn-primary btn-lg">Luyện câu mới ngay</button>
          </div>
        ` : list.slice(0, 100).map((item, idx) => `
          <div class="surface-card" style="padding:18px 20px;display:flex;flex-direction:column;gap:10px;">
            <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;">
              <span class="brand-pill">${esc(lessonLabel(item.question.type))}</span>
              <span style="font-size:12px;color:${item.resolved ? 'var(--emerald-text)' : 'var(--rose-text)'};font-weight:600;">
                ${item.resolved ? 'Đã sửa' : 'Đã chọn nhầm: ' + esc(item.chosen)}
              </span>
            </div>
            <div style="font-size:14px;font-weight:600;white-space:pre-wrap;line-height:1.55;">${esc(item.question.prompt)}</div>
            <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:4px;">
              <button class="btn btn-primary" data-retry="${idx}">Làm lại câu này</button>
              <button class="btn" data-variant="${item.question.type}">Bài biến thể cùng dạng</button>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    document.getElementById('mk-pending-tab').addEventListener('click', () => { mistakeShowResolved = false; renderMistakes(); });
    document.getElementById('mk-resolved-tab').addEventListener('click', () => { mistakeShowResolved = true; renderMistakes(); });
    const goBtn = document.getElementById('mk-go-practice');
    if (goBtn) goBtn.addEventListener('click', () => openPractice(0, null));

    el.querySelectorAll('[data-retry]').forEach((b) => {
      b.addEventListener('click', () => {
        const m = list[parseInt(b.dataset.retry, 10)];
        if (!m) return;
        const q = { ...m.question, trace: m.question.trace || [] };
        openPractice(q.type, q);
      });
    });
    el.querySelectorAll('[data-variant]').forEach((b) => {
      b.addEventListener('click', () => openPractice(parseInt(b.dataset.variant, 10), null));
    });
  }

  // =========================================================
  // BOOTSTRAP & URL DEEP LINK SUPPORT (?tab=sim&mode=avl&theme=dark)
  // =========================================================
  const params = new URLSearchParams(window.location.search);
  const urlTheme = params.get('theme');
  applyTheme(urlTheme || store.state.theme, !urlTheme);

  const urlMode = params.get('mode');
  const urlArr = params.get('arr');
  const urlKey = params.get('key');
  selectSimMode(
    SIM_MODES.some((m) => m.id === urlMode) ? urlMode : 'avl',
    urlArr !== null ? urlArr : null,
    urlKey !== null ? urlKey : null
  );

  initLessonsControls();
  renderHome();
  renderPractice();
  renderExam();
  renderMistakes();
  updateMistakeBadge();

  const urlTab = params.get('tab');
  if (urlTab && ['home', 'lessons', 'sim', 'practice', 'exam', 'mistakes'].includes(urlTab)) {
    switchTab(urlTab);
  } else {
    switchTab('home');
  }

  // Expose automation hooks for headless verification & GIF demo capture
  window.__DSA_APP__ = {
    switchTab,
    selectSimMode,
    applyTheme,
    goSimStep,
    getSimState: () => ({ mode: simMode, index: simIndex, count: simSteps.length, steps: simSteps }),
    renderSimAtProgress: (fromIdx, toIdx, rawT) => {
      simIndex = toIdx;
      updateSimReadout();
      simViz.renderFrame(simSteps[fromIdx], simSteps[toIdx], rawT, Math.abs(toIdx - fromIdx) === 1);
    }
  };
})();
