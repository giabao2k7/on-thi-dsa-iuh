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
  const sidebarPinBtn = document.getElementById('sidebar-pin-btn');
  const navButtons = Array.from(document.querySelectorAll('#sidebar-nav .nav-btn'));
  const mobileNavButtons = Array.from(document.querySelectorAll('#mobile-bottom-nav .mnav-btn'));
  const mobilePageTitleEl = document.getElementById('mobile-page-title');
  const mobileMistakeCountEl = document.getElementById('mobile-mistake-count');
  const mobileMistakesBtn = document.getElementById('mobile-mistakes-btn');
  const mobileThemeBtn = document.getElementById('mobile-theme-btn');
  const tabPanels = Array.from(document.querySelectorAll('.tab-panel'));
  const navMistakeCount = document.getElementById('nav-mistake-count');

  const TAB_TITLES = {
    home: 'Tổng quan',
    lessons: 'Học 32 dạng',
    sim: 'Mô phỏng 60fps',
    practice: 'Luyện biến thể',
    exam: 'Thi thử',
    mistakes: 'Sổ câu sai'
  };

  let currentTab = 'home';
  let simViz = null;
  let modalViz = null;
  let miniViz = null;
  let miniPlayTimer = null;
  const inlineVizSlots = { practice: null, exam: null };

  function destroyInlineViz(slotKey) {
    const slot = inlineVizSlots[slotKey];
    if (!slot) return;
    if (slot.stop) slot.stop();
    if (slot.viz && typeof slot.viz.destroy === 'function') slot.viz.destroy();
    inlineVizSlots[slotKey] = null;
  }

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
    const label = count > 99 ? '99+' : String(count);
    navMistakeCount.textContent = label;
    navMistakeCount.style.display = count > 0 ? 'inline-block' : 'none';
    if (mobileMistakeCountEl) mobileMistakeCountEl.textContent = label;
    if (mobileMistakesBtn) mobileMistakesBtn.style.opacity = count > 0 ? '1' : '0.68';
  }

  // =========================================================
  // THEME TOGGLE (DARK / LIGHT) & DESKTOP HOVER-RAIL PIN
  // =========================================================
  const themeIcon = document.getElementById('theme-icon');
  const themeLabel = document.getElementById('theme-label');
  const themeKnob = document.getElementById('theme-knob');
  const ICON_MOON = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
  const ICON_SUN = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';

  function applyTheme(next, save = true) {
    const theme = next === 'light' ? 'light' : 'dark';
    appEl.setAttribute('data-theme', theme);
    if (save) store.setTheme(theme);
    if (theme === 'dark') {
      themeLabel.textContent = 'Giao diện Tối';
      themeKnob.style.transform = 'translateX(18px)';
      themeIcon.innerHTML = ICON_MOON;
      if (mobileThemeBtn) mobileThemeBtn.innerHTML = ICON_MOON;
    } else {
      themeLabel.textContent = 'Giao diện Sáng';
      themeKnob.style.transform = 'translateX(2px)';
      themeIcon.innerHTML = ICON_SUN;
      if (mobileThemeBtn) mobileThemeBtn.innerHTML = ICON_SUN;
    }
    if (simViz) simViz.renderCurrent();
    if (modalViz) modalViz.renderCurrent();
    if (miniViz) miniViz.renderCurrent();
    if (inlineVizSlots.practice && inlineVizSlots.practice.viz) inlineVizSlots.practice.viz.renderCurrent();
    if (inlineVizSlots.exam && inlineVizSlots.exam.viz) inlineVizSlots.exam.viz.renderCurrent();
  }

  function applySidebarPinned(pinned, save = true) {
    const on = Boolean(pinned);
    sidebarEl.classList.toggle('pinned', on);
    appEl.classList.toggle('sidebar-pinned', on);
    if (sidebarPinBtn) {
      sidebarPinBtn.classList.toggle('active', on);
      sidebarPinBtn.title = on ? 'Bỏ ghim thanh bên (tự thu gọn)' : 'Ghim mở cố định thanh bên';
    }
    if (save) store.setPref('sidebarPinned', on);
    setTimeout(() => {
      if (currentTab === 'sim' && simViz) { simViz.resize(); simViz.renderCurrent(); }
      if (currentTab === 'lessons' && miniViz) { miniViz.resize(); miniViz.renderCurrent(); }
      if (currentTab === 'practice' && inlineVizSlots.practice && inlineVizSlots.practice.viz) {
        inlineVizSlots.practice.viz.resize();
        inlineVizSlots.practice.viz.renderCurrent();
      }
      if (currentTab === 'exam' && inlineVizSlots.exam && inlineVizSlots.exam.viz) {
        inlineVizSlots.exam.viz.resize();
        inlineVizSlots.exam.viz.renderCurrent();
      }
    }, 220);
  }

  document.getElementById('theme-toggle').addEventListener('click', () => {
    const cur = appEl.getAttribute('data-theme');
    applyTheme(cur === 'dark' ? 'light' : 'dark', true);
  });
  if (mobileThemeBtn) {
    mobileThemeBtn.addEventListener('click', () => {
      const cur = appEl.getAttribute('data-theme');
      applyTheme(cur === 'dark' ? 'light' : 'dark', true);
    });
  }
  if (mobileMistakesBtn) {
    mobileMistakesBtn.addEventListener('click', () => switchTab('mistakes'));
  }
  if (sidebarPinBtn) {
    sidebarPinBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const next = !sidebarEl.classList.contains('pinned');
      applySidebarPinned(next, true);
      if (!next) sidebarPinBtn.blur();
    });
  }

  // =========================================================
  // TAB NAVIGATION
  // =========================================================
  function switchTab(tabId) {
    if (examState.active && tabId !== 'exam') {
      if (!window.confirm('Bạn đang làm bài thi thử chưa nộp. Vẫn rời khỏi phòng thi (đồng hồ vẫn chạy)?')) {
        return;
      }
    }
    if (typeof openSimPanel === 'function') openSimPanel(null);
    if (tabId !== 'practice' && inlineVizSlots.practice && inlineVizSlots.practice.stop) inlineVizSlots.practice.stop();
    if (tabId !== 'exam' && inlineVizSlots.exam && inlineVizSlots.exam.stop) inlineVizSlots.exam.stop();
    currentTab = tabId;
    navButtons.forEach((btn) => btn.classList.toggle('active', btn.dataset.tab === tabId));
    mobileNavButtons.forEach((btn) => btn.classList.toggle('active', btn.dataset.tab === tabId));
    if (mobilePageTitleEl) mobilePageTitleEl.textContent = TAB_TITLES[tabId] || 'DSA Studio IUH';
    tabPanels.forEach((p) => p.classList.toggle('active', p.id === 'tab-' + tabId));

    if (tabId === 'home') renderHome();
    else if (tabId === 'mistakes') renderMistakes();
    else if (tabId === 'lessons') {
      requestAnimationFrame(() => {
        if (miniViz) { miniViz.resize(); miniViz.renderCurrent(); }
      });
    } else if (tabId === 'sim') {
      requestAnimationFrame(() => {
        simViz.resize();
        simViz.renderCurrent();
      });
    } else if (tabId === 'practice') {
      requestAnimationFrame(() => {
        if (inlineVizSlots.practice && inlineVizSlots.practice.viz) {
          inlineVizSlots.practice.viz.resize();
          inlineVizSlots.practice.viz.renderCurrent();
        }
      });
    } else if (tabId === 'exam') {
      requestAnimationFrame(() => {
        if (inlineVizSlots.exam && inlineVizSlots.exam.viz) {
          inlineVizSlots.exam.viz.resize();
          inlineVizSlots.exam.viz.renderCurrent();
        }
      });
    }
  }

  navButtons.forEach((btn) => btn.addEventListener('click', () => switchTab(btn.dataset.tab)));
  mobileNavButtons.forEach((btn) => btn.addEventListener('click', () => switchTab(btn.dataset.tab)));

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
      <div class="home-container">
        <div class="surface-card hero-card">
          <div>
            <span class="brand-pill">CTDL&amp;GT · ĐH Công nghiệp TP.HCM</span>
            <h1 class="page-title" style="margin-top:8px;">Ôn thi Trắc nghiệm DSA — Chuẩn 32 dạng Slide IUH</h1>
            <p class="page-sub">4 Chương chuẩn bài giảng · 12 chế độ mô phỏng 60fps · Luyện biến thể &amp; Thi thử offline</p>
          </div>
          <div class="hero-actions">
            <button type="button" class="btn btn-lg btn-primary" data-jump="sim">▶ Mở mô phỏng</button>
            <button type="button" class="btn btn-lg" data-jump="lessons">Học 32 dạng</button>
            <button type="button" class="btn btn-lg" data-jump="practice">Luyện câu mới</button>
          </div>
        </div>

        <div class="grid-3">
          <div class="surface-card stat-card">
            <div>
              <div class="stat-label">Đã luyện</div>
              <div class="stat-num">${total} <span style="font-size:13px;font-weight:500;color:var(--text-muted);">câu</span></div>
              <div style="font-size:11.5px;color:var(--text-muted);margin-top:3px;">${store.state.exams.length} đề thi thử</div>
            </div>
            <div class="stat-visual" style="width:44px;height:44px;border-radius:12px;background:var(--accent-soft);color:var(--accent);display:flex;align-items:center;justify-content:center;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>
            </div>
          </div>

          <div class="surface-card stat-card">
            <div>
              <div class="stat-label">Chính xác</div>
              <div class="stat-num" style="color:var(--accent);">${total === 0 ? '—' : pct + '%'}</div>
              <div style="font-size:11.5px;color:var(--text-muted);margin-top:3px;">${correct} / ${total} câu đúng</div>
            </div>
            <svg class="stat-visual" width="52" height="52" viewBox="0 0 36 36" style="transform:rotate(-90deg);">
              <circle cx="18" cy="18" r="15" fill="none" stroke="var(--border-strong)" stroke-width="3.5"></circle>
              <circle cx="18" cy="18" r="15" fill="none" stroke="var(--accent)" stroke-width="3.5" stroke-dasharray="${circ}" stroke-dashoffset="${total === 0 ? circ : offset}" stroke-linecap="round"></circle>
            </svg>
          </div>

          <button type="button" class="surface-card stat-card stat-card-btn" data-jump="mistakes">
            <div>
              <div class="stat-label" style="color:var(--amber-text);">Sổ câu sai</div>
              <div class="stat-num" style="color:var(--amber-text);">${wrong} <span style="font-size:13px;font-weight:500;color:var(--text-muted);">cần ôn</span></div>
              <div style="font-size:11.5px;color:var(--text-muted);margin-top:3px;">Mở sổ câu sai →</div>
            </div>
            <div class="stat-visual" style="width:44px;height:44px;border-radius:12px;background:var(--amber-soft);color:var(--amber-text);display:flex;align-items:center;justify-content:center;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
          </button>
        </div>

        <div class="grid-2">
          <div class="surface-card" style="padding:18px;display:flex;flex-direction:column;gap:9px;">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:2px;">
              <strong style="font-size:14.5px;">Lộ trình ôn thi 4 Chương IUH</strong>
              <span class="brand-pill">32 dạng chuẩn</span>
            </div>
            ${[
              ['Chương 2 · Tìm kiếm & Sắp xếp', 'Dạng 1–10, 30 · Big-O, Binary, Bubble (R→L), Quick Sort'],
              ['Chương 3 · Danh sách liên kết', 'Dạng 11–14 · DSLK đơn/đôi/vòng, pHead/pTail, Đổi cặp'],
              ['Chương 4 · Stack, Queue & Biểu thức', 'Dạng 15–20, 31 · LIFO/FIFO, Hàng vòng, Nhị phân, Hậu tố'],
              ['Chương 5 · Cây nhị phân, BST & AVL', 'Dạng 21–29, 32 · Duyệt cây, Lưu mảng 2i, Thế mạng, Xoay AVL']
            ].map(([chTitle, chDesc]) => `
              <button type="button" class="surface-sub chapter-link-btn" data-chapter-jump="${esc(chTitle)}">
                <div style="min-width:0;">
                  <div style="font-size:13px;font-weight:700;">${esc(chTitle)}</div>
                  <div style="font-size:11.5px;color:var(--text-muted);margin-top:2px;">${esc(chDesc)}</div>
                </div>
                <span style="color:var(--text-muted);font-size:16px;flex-shrink:0;">›</span>
              </button>
            `).join('')}
          </div>

          <div style="display:flex;flex-direction:column;gap:14px;">
            <div class="surface-card" style="padding:18px;display:flex;flex-direction:column;gap:12px;">
              <strong style="font-size:14.5px;">${topWeak.length ? 'Dạng nên luyện tiếp' : 'Cách dùng hiệu quả nhất'}</strong>
              ${topWeak.length ? `
                <div style="display:flex;flex-direction:column;gap:8px;">
                  ${topWeak.map((w) => `
                    <div class="surface-sub" style="padding:10px 12px;display:flex;align-items:center;justify-content:space-between;gap:10px;">
                      <div style="min-width:0;">
                        <div style="font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${esc(lessonLabel(w.id))}</div>
                        <div style="font-size:11.5px;color:var(--amber-text);">Đúng ${Math.round(w.rate * 100)}% (${w.count} lần làm)</div>
                      </div>
                      <button type="button" class="btn btn-primary" data-practice-type="${w.id}">Luyện</button>
                    </div>
                  `).join('')}
                </div>
              ` : `
                <div class="surface-sub" style="padding:13px;font-size:12.5px;line-height:1.65;color:var(--text-soft);">
                  1. Vào <strong>Học 32 dạng</strong> xem sơ đồ trực quan &amp; hướng dẫn đọc code chuẩn IUH.<br/>
                  2. Vào <strong>Mô phỏng 60fps</strong> chạy từng bước mượt (chọn được thế mạng Trái/Phải).<br/>
                  3. Vào <strong>Luyện biến thể</strong> làm câu sinh số ngẫu nhiên mới hoàn toàn.<br/>
                  4. Chạy <strong>Thi thử</strong> trước khi thi thật!
                </div>
              `}
              <div class="tip-box" style="font-size:12.5px;">
                <strong style="color:var(--amber-text);">Lưu ý đề thi:</strong> Chiều cao cây có thể đếm theo <em>số cạnh</em> hoặc <em>số mức</em>; giá trị <code>pos</code> trong Insertion Sort xét sau vòng <code>while</code>; chia <code>/</code> trong hậu tố dùng chia nguyên.
              </div>
            </div>

            <div class="surface-sub" style="padding:12px 14px;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px;">
              <span style="font-size:12px;color:var(--text-muted);">Lưu tiến độ cục bộ (<code>localStorage</code>)</span>
              <div style="display:flex;flex-wrap:wrap;gap:6px;">
                <button id="btn-export-progress" type="button" class="btn btn-ghost">Xuất JSON</button>
                <label class="btn btn-ghost" style="cursor:pointer;">
                  Nhập
                  <input id="input-import-progress" type="file" accept=".json,application/json" style="display:none;" />
                </label>
                <button id="btn-reset-progress" type="button" class="btn btn-ghost" style="color:var(--rose-text);">Xóa</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    el.querySelectorAll('[data-jump]').forEach((b) => {
      b.addEventListener('click', () => switchTab(b.dataset.jump));
    });
    el.querySelectorAll('[data-chapter-jump]').forEach((b) => {
      b.addEventListener('click', () => {
        selectedChapter = b.dataset.chapterJump;
        const firstInChapter = Lessons.find((l) => (l.chapter || l.group) === selectedChapter);
        if (firstInChapter && (Lessons[selectedLessonId - 1]?.chapter || Lessons[selectedLessonId - 1]?.group) !== selectedChapter) {
          selectedLessonId = firstInChapter.id;
          selectedLessonSubTab = 'overview';
          renderLessonDetail();
        }
        mobileLessonDetailOpen = false;
        syncLessonsMobileView();
        renderChapterChips();
        renderLessonList();
        switchTab('lessons');
      });
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
  // 2. LESSONS TAB (ALL 32 IUH LESSONS + VISUALS + MINI-SIM)
  // =========================================================
  const LESSON_SIM_MAP = {
    3: { mode: 'binary', arr: '2, 5, 8, 11, 14, 17, 20', key: '14' },
    4: { mode: 'selection', arr: '6, 2, 9, 1, 5, 3', key: '' },
    5: { mode: 'interchange', arr: '5, 3, 4, 1', key: '' },
    6: { mode: 'selection', arr: '27, 40, -7, 5, 57', key: '' },
    7: { mode: 'insertion', arr: '3, 7, 1, 8, 2, 5', key: '' },
    8: { mode: 'bubble', arr: '12, 2, 8, 5, 1, 6, 4, 15', key: '', bubbleDir: 'rtl' },
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
    29: { mode: 'avl', arr: '30, 20, 40, 10, 25', key: '40' },
    30: { mode: 'quick', arr: '12, 2, 8, 5, 1, 6, 4, 15', key: '' }
  };

  let selectedLessonId = 1;
  let selectedChapter = 'all';
  let selectedLessonSubTab = 'overview';
  let mobileLessonDetailOpen = false;
  const lessonsTabEl = document.getElementById('tab-lessons');
  const lessonSearch = document.getElementById('lesson-search');
  const lessonChapterChips = document.getElementById('lesson-chapter-chips');
  const lessonList = document.getElementById('lesson-list');
  const lessonDetail = document.getElementById('lesson-detail');

  function syncLessonsMobileView() {
    if (lessonsTabEl) {
      lessonsTabEl.classList.toggle('mobile-detail-open', mobileLessonDetailOpen);
    }
  }

  function renderChapterChips() {
    if (!lessonChapterChips) return;
    const chapters = Array.from(new Set(Lessons.map((l) => l.chapter || l.group)));
    const chips = [{ key: 'all', label: 'Tất cả' }].concat(
      chapters.map((ch, idx) => ({
        key: ch,
        label: ch.startsWith('Chương ') ? ch.split('·')[0].trim() : `Nhóm ${idx + 1}`
      }))
    );
    lessonChapterChips.innerHTML = chips.map((c) => `
      <button type="button" class="chapter-chip ${selectedChapter === c.key ? 'active' : ''}" data-ch="${esc(c.key)}">${esc(c.label)}</button>
    `).join('');
    lessonChapterChips.querySelectorAll('button[data-ch]').forEach((b) => {
      b.addEventListener('click', () => {
        selectedChapter = b.dataset.ch;
        renderChapterChips();
        renderLessonList();
      });
    });
  }

  function initLessonsControls() {
    renderChapterChips();
    lessonSearch.addEventListener('input', renderLessonList);
    renderLessonList();
    renderLessonDetail();
  }

  function renderLessonList() {
    const q = lessonSearch.value.trim().toLowerCase();
    const filtered = Lessons.filter((l) => {
      const ch = l.chapter || l.group;
      const grpOk = selectedChapter === 'all' || ch === selectedChapter;
      const textOk = (l.id + ' ' + l.title + ' ' + l.group + ' ' + ch).toLowerCase().includes(q);
      return grpOk && textOk;
    });
    lessonList.innerHTML = filtered.map((l) => {
      const active = l.id === selectedLessonId;
      const hasSim = Boolean(l.miniSim || LESSON_SIM_MAP[l.id]);
      return `
        <button type="button" class="lesson-item ${active ? 'active' : ''}" data-lid="${l.id}">
          <span style="display:flex;align-items:flex-start;gap:8px;min-width:0;">
            <span class="lesson-item-num">${String(l.id).padStart(2, '0')}</span>
            <span>${esc(l.title)}</span>
          </span>
          ${hasSim ? '<span class="lesson-sim-dot" title="Có mô phỏng 60fps"></span>' : ''}
        </button>
      `;
    }).join('') || '<div style="font-size:12px;color:var(--text-muted);padding:10px;">Không tìm thấy dạng phù hợp.</div>';

    lessonList.querySelectorAll('button[data-lid]').forEach((b) => {
      b.addEventListener('click', () => {
        selectedLessonId = parseInt(b.dataset.lid, 10);
        selectedLessonSubTab = 'overview';
        mobileLessonDetailOpen = true;
        syncLessonsMobileView();
        renderLessonList();
        renderLessonDetail();
        lessonDetail.scrollTop = 0;
        const sc = lessonDetail.querySelector('.lesson-detail-scroll');
        if (sc) sc.scrollTop = 0;
      });
    });
  }

  function renderLessonDiagramSvg(kind) {
    if (!kind) return '';
    const svgs = {
      bigo: `
        <svg viewBox="0 0 565 150" style="width:100%;max-width:565px;display:block;">
          <line x1="40" y1="125" x2="495" y2="125" stroke="var(--border-strong)" stroke-width="2"/>
          <line x1="40" y1="20" x2="40" y2="125" stroke="var(--border-strong)" stroke-width="2"/>
          <path d="M 40 118 L 495 118" stroke="#10b981" stroke-width="2.5" fill="none"/>
          <path d="M 40 120 Q 160 85 495 78" stroke="#14b8a6" stroke-width="2.5" fill="none"/>
          <path d="M 40 122 Q 260 65 495 38" stroke="#f59e0b" stroke-width="2.5" fill="none"/>
          <path d="M 40 124 Q 160 115 245 20" stroke="#f43f5e" stroke-width="2.8" fill="none"/>
          <text x="502" y="121" fill="#10b981" font-size="11" font-weight="700">O(1)</text>
          <text x="502" y="81" fill="#14b8a6" font-size="11" font-weight="700">O(log n)</text>
          <text x="502" y="42" fill="#f59e0b" font-size="11" font-weight="700">O(n)</text>
          <text x="255" y="28" fill="#f43f5e" font-size="11" font-weight="700">O(n²) · chậm rất nhanh khi n lớn</text>
          <text x="270" y="142" text-anchor="middle" fill="var(--text-muted)" font-size="11">Kích thước dữ liệu n →</text>
        </svg>`,
      linear: `
        <svg viewBox="0 0 540 120" style="width:100%;max-width:540px;display:block;">
          <text x="20" y="20" fill="var(--text-muted)" font-size="11" font-weight="700">Duyệt i = 0 → n-1 · gặp a[i] == 15 thì return i ngay</text>
          <g font-family="Segoe UI, sans-serif" font-weight="700" text-anchor="middle">
            <rect x="20" y="34" width="66" height="44" rx="10" fill="var(--bg-surface)" stroke="var(--border-strong)"/><text x="53" y="61" fill="var(--text-muted)" font-size="15">5</text><text x="53" y="96" fill="var(--text-muted)" font-size="11">i=0</text>
            <rect x="100" y="34" width="66" height="44" rx="10" fill="var(--bg-surface)" stroke="var(--border-strong)"/><text x="133" y="61" fill="var(--text-muted)" font-size="15">10</text><text x="133" y="96" fill="var(--text-muted)" font-size="11">i=1</text>
            <rect x="180" y="34" width="66" height="44" rx="10" fill="var(--emerald-soft)" stroke="#10b981" stroke-width="2"/><text x="213" y="61" fill="var(--emerald-text)" font-size="15">15</text><text x="213" y="96" fill="var(--emerald-text)" font-size="11">i=2 ✓ return 2</text>
            <rect x="260" y="34" width="66" height="44" rx="10" fill="var(--bg-surface)" stroke="var(--border-strong)" opacity="0.45"/><text x="293" y="61" fill="var(--text-muted)" font-size="15">20</text><text x="293" y="96" fill="var(--text-muted)" font-size="11">không xét</text>
          </g>
        </svg>`,
      inversions: `
        <svg viewBox="0 0 540 135" style="width:100%;max-width:540px;display:block;">
          <text x="20" y="18" fill="var(--text-muted)" font-size="11" font-weight="700">Nghịch thế (a[i] > a[j] với i &lt; j) — mỗi lần swap kề giảm đúng 1 nghịch thế</text>
          <g font-weight="700" text-anchor="middle">
            <rect x="30" y="48" width="52" height="40" rx="10" fill="var(--rose-soft)" stroke="#f43f5e"/><text x="56" y="73" fill="var(--rose-text)">4</text>
            <rect x="110" y="48" width="52" height="40" rx="10" fill="var(--bg-surface)" stroke="var(--border-strong)"/><text x="136" y="73" fill="var(--text-main)">1</text>
            <rect x="190" y="48" width="52" height="40" rx="10" fill="var(--amber-soft)" stroke="#f59e0b"/><text x="216" y="73" fill="var(--amber-text)">3</text>
            <rect x="270" y="48" width="52" height="40" rx="10" fill="var(--bg-surface)" stroke="var(--border-strong)"/><text x="296" y="73" fill="var(--text-main)">2</text>
          </g>
          <path d="M 56 46 Q 96 24 136 46" stroke="#f43f5e" fill="none" stroke-width="1.6"/>
          <path d="M 56 46 Q 136 14 216 46" stroke="#f43f5e" fill="none" stroke-width="1.6"/>
          <path d="M 56 46 Q 176 4 296 46" stroke="#f43f5e" fill="none" stroke-width="1.6"/>
          <path d="M 216 90 Q 256 112 296 90" stroke="#f59e0b" fill="none" stroke-width="1.8"/>
          <text x="355" y="64" fill="var(--rose-text)" font-size="12" font-weight="700">4 lớn hơn: (4,1), (4,3), (4,2) = 3</text>
          <text x="355" y="86" fill="var(--amber-text)" font-size="12" font-weight="700">3 lớn hơn: (3,2) = 1 → Tổng = 4</text>
        </svg>`,
      matrix2d: `
        <svg viewBox="0 0 540 140" style="width:100%;max-width:540px;display:block;">
          <text x="20" y="20" fill="var(--accent)" font-size="12" font-weight="700">Chỉ số i cố định → Sắp theo HÀNG</text>
          <text x="290" y="20" fill="#f59e0b" font-size="12" font-weight="700">Chỉ số j cố định → Sắp theo CỘT</text>
          <g font-family="Cascadia Code, monospace" font-size="12" text-anchor="middle" font-weight="700">
            <rect x="20" y="34" width="180" height="28" rx="6" fill="var(--accent-soft)" stroke="var(--accent)"/>
            <text x="110" y="52" fill="var(--accent)">arr[i][j] ↔ arr[i][k]  (Hàng i)</text>
            <rect x="20" y="68" width="180" height="28" rx="6" fill="var(--bg-surface)" stroke="var(--border-strong)"/>
            <text x="110" y="86" fill="var(--text-muted)">[1, 9, 4] → [1, 4, 9]</text>
            <rect x="290" y="34" width="84" height="86" rx="6" fill="var(--amber-soft)" stroke="#f59e0b"/>
            <text x="332" y="56" fill="var(--amber-text)">a[0][j]</text>
            <text x="332" y="78" fill="var(--amber-text)">a[1][j]</text>
            <text x="332" y="100" fill="var(--amber-text)">a[2][j]</text>
            <text x="455" y="78" fill="var(--text-soft)" font-size="11">So a[i][j] với a[k][j]</text>
          </g>
        </svg>`,
      slltypes: `
        <svg viewBox="0 0 560 148" style="width:100%;max-width:560px;display:block;">
          <g font-family="Segoe UI, sans-serif" font-size="11" font-weight="700">
            <text x="16" y="24" fill="var(--accent)">DSLK Đơn (pHead, pTail):</text>
            <rect x="175" y="8" width="44" height="26" rx="6" fill="var(--bg-surface)" stroke="var(--accent)"/><text x="197" y="25" text-anchor="middle" fill="var(--text-main)">A</text>
            <line x1="219" y1="21" x2="245" y2="21" stroke="var(--accent)" stroke-width="2"/>
            <rect x="245" y="8" width="44" height="26" rx="6" fill="var(--bg-surface)" stroke="var(--accent)"/><text x="267" y="25" text-anchor="middle" fill="var(--text-main)">B</text>
            <line x1="289" y1="21" x2="315" y2="21" stroke="var(--accent)" stroke-width="2"/>
            <text x="322" y="25" fill="var(--text-muted)">NULL</text>

            <text x="16" y="72" fill="#f59e0b">DSLK Đôi (pPrev ↔ pNext):</text>
            <text x="170" y="72" fill="var(--text-muted)">NULL ←</text>
            <rect x="215" y="54" width="44" height="26" rx="6" fill="var(--bg-surface)" stroke="#f59e0b"/><text x="237" y="71" text-anchor="middle" fill="var(--text-main)">A</text>
            <text x="268" y="71" fill="#f59e0b">⇄</text>
            <rect x="285" y="54" width="44" height="26" rx="6" fill="var(--bg-surface)" stroke="#f59e0b"/><text x="307" y="71" text-anchor="middle" fill="var(--text-main)">B</text>
            <text x="336" y="72" fill="var(--text-muted)">→ NULL</text>

            <text x="16" y="118" fill="#10b981">DSLK Vòng (pTail→pNext = pHead):</text>
            <rect x="225" y="100" width="44" height="26" rx="6" fill="var(--bg-surface)" stroke="#10b981"/><text x="247" y="117" text-anchor="middle" fill="var(--text-main)">A</text>
            <line x1="269" y1="113" x2="295" y2="113" stroke="#10b981" stroke-width="2"/>
            <rect x="295" y="100" width="44" height="26" rx="6" fill="var(--bg-surface)" stroke="#10b981"/><text x="317" y="117" text-anchor="middle" fill="var(--text-main)">B</text>
            <path d="M 339 113 L 360 113 L 360 138 L 247 138 L 247 128" stroke="#10b981" stroke-width="1.8" fill="none"/>
          </g>
        </svg>`,
      sllops: `
        <svg viewBox="0 0 540 132" style="width:100%;max-width:540px;display:block;">
          <text x="16" y="18" fill="var(--accent)" font-size="11" font-weight="700">Chèn X sau q: (1) X→pNext = q→pNext trước, (2) q→pNext = X sau</text>
          <g font-weight="700" text-anchor="middle" font-size="13">
            <rect x="40" y="58" width="60" height="36" rx="8" fill="var(--bg-surface)" stroke="var(--accent)"/><text x="70" y="81" fill="var(--text-main)">A</text>
            <rect x="150" y="58" width="60" height="36" rx="8" fill="var(--bg-surface)" stroke="var(--accent)"/><text x="180" y="81" fill="var(--text-main)">B (q)</text>
            <rect x="260" y="28" width="60" height="36" rx="8" fill="var(--emerald-soft)" stroke="#10b981"/><text x="290" y="51" fill="var(--emerald-text)">X mới</text>
            <rect x="370" y="58" width="60" height="36" rx="8" fill="var(--bg-surface)" stroke="var(--accent)"/><text x="400" y="81" fill="var(--text-main)">C</text>
          </g>
          <line x1="100" y1="76" x2="150" y2="76" stroke="var(--border-strong)" stroke-width="2"/>
          <path d="M 210 76 L 260 46" stroke="#f59e0b" stroke-width="2" fill="none"/>
          <path d="M 320 46 L 370 76" stroke="#10b981" stroke-width="2" fill="none"/>
          <line x1="210" y1="84" x2="370" y2="84" stroke="#f43f5e" stroke-dasharray="4 3" stroke-width="1.6"/>
          <text x="290" y="114" text-anchor="middle" fill="var(--amber-text)" font-size="11" font-weight="700">Bước 1: X→C  |  Bước 2: B→X  (nối trước rồi mới cắt liên kết cũ!)</text>
        </svg>`,
      dllrecursion: `
        <svg viewBox="0 0 540 130" style="width:100%;max-width:540px;display:block;">
          <g font-weight="700" font-size="12" text-anchor="middle">
            <rect x="40" y="34" width="54" height="34" rx="8" fill="var(--bg-surface)" stroke="var(--accent)"/><text x="67" y="55" fill="var(--text-main)">1</text>
            <rect x="135" y="34" width="54" height="34" rx="8" fill="var(--bg-surface)" stroke="var(--accent)"/><text x="162" y="55" fill="var(--text-main)">2</text>
            <rect x="230" y="34" width="54" height="34" rx="8" fill="var(--bg-surface)" stroke="var(--accent)"/><text x="257" y="55" fill="var(--text-main)">3</text>
            <text x="320" y="55" fill="var(--text-muted)">NULL</text>
          </g>
          <path d="M 55 24 L 285 24" stroke="var(--accent)" stroke-width="2" marker-end="none"/>
          <text x="170" y="16" text-anchor="middle" fill="var(--accent)" font-size="11" font-weight="700">Đi xuống (trước f(p→pNext)): in 1 → 2 → 3</text>
          <path d="M 285 88 L 55 88" stroke="#f59e0b" stroke-width="2"/>
          <text x="170" y="108" text-anchor="middle" fill="var(--amber-text)" font-size="11" font-weight="700">Quay về (sau f(p→pNext)): in 3 → 2 → 1</text>
        </svg>`,
      circqueue: `
        <svg viewBox="0 0 540 120" style="width:100%;max-width:540px;display:block;">
          <text x="20" y="18" fill="var(--text-muted)" font-size="11" font-weight="700">Hàng vòng mảng xoay (Slide C4 tr. 73-88): rear = (rear + 1) % max; front = (front + 1) % max</text>
          <g font-family="Cascadia Code, monospace" font-size="12" font-weight="700" text-anchor="middle">
            <rect x="30" y="36" width="68" height="40" rx="8" fill="var(--accent-soft)" stroke="var(--accent)"/><text x="64" y="61" fill="var(--accent)">0: D</text>
            <rect x="106" y="36" width="68" height="40" rx="8" fill="var(--accent-soft)" stroke="var(--accent)"/><text x="140" y="61" fill="var(--accent)">1 (rear)</text>
            <rect x="182" y="36" width="68" height="40" rx="8" fill="var(--bg-surface)" stroke="var(--border-strong)" stroke-dasharray="4 3"/><text x="216" y="61" fill="var(--text-muted)">2: trống</text>
            <rect x="258" y="36" width="68" height="40" rx="8" fill="var(--bg-surface)" stroke="var(--border-strong)" stroke-dasharray="4 3"/><text x="292" y="61" fill="var(--text-muted)">3: trống</text>
            <rect x="334" y="36" width="76" height="40" rx="8" fill="var(--amber-soft)" stroke="#f59e0b"/><text x="372" y="61" fill="var(--amber-text)">4 (front)</text>
          </g>
          <path d="M 372 78 Q 218 112 64 78" stroke="var(--accent)" stroke-width="1.8" fill="none" stroke-dasharray="4 3"/>
          <text x="218" y="109" text-anchor="middle" fill="var(--accent)" font-size="11" font-weight="700">Hết ô cuối (max-1) quay vòng lại ô 0</text>
        </svg>`,
      stackqueue: `
        <svg viewBox="0 0 540 120" style="width:100%;max-width:540px;display:block;">
          <g font-weight="700" font-size="12" text-anchor="middle">
            <rect x="20" y="34" width="110" height="42" rx="10" fill="var(--bg-surface)" stroke="var(--accent)"/><text x="75" y="59" fill="var(--text-main)">S: [2, 4, 6]</text>
            <path d="M 134 55 L 185 55" stroke="var(--accent)" stroke-width="2"/><text x="160" y="45" fill="var(--text-muted)" font-size="10">Pop→Enq</text>
            <rect x="190" y="34" width="120" height="42" rx="10" fill="var(--amber-soft)" stroke="#f59e0b"/><text x="250" y="59" fill="var(--amber-text)">Q: [2, 4, 6]</text>
            <path d="M 314 55 L 365 55" stroke="#f59e0b" stroke-width="2"/><text x="340" y="45" fill="var(--text-muted)" font-size="10">Deq→Push</text>
            <rect x="370" y="34" width="130" height="42" rx="10" fill="var(--emerald-soft)" stroke="#10b981"/><text x="435" y="59" fill="var(--emerald-text)">S mới: [6, 4, 2]</text>
          </g>
          <text x="260" y="102" text-anchor="middle" fill="var(--text-muted)" font-size="11" font-weight="600">1 chu trình đảo ngược Stack 1 lần · 2 chu trình trở lại ban đầu</text>
        </svg>`,
      brackets: `
        <svg viewBox="0 0 540 112" style="width:100%;max-width:540px;display:block;">
          <g font-family="Cascadia Code, monospace" font-weight="700" font-size="13">
            <rect x="20" y="18" width="230" height="70" rx="10" fill="var(--emerald-soft)" stroke="#10b981"/>
            <text x="135" y="44" text-anchor="middle" fill="var(--emerald-text)">( [ { } ] )  ✓ Hợp lệ</text>
            <text x="135" y="68" text-anchor="middle" fill="var(--text-soft)" font-size="11">Khớp đỉnh Stack &amp; cuối chuỗi rỗng</text>
            <rect x="275" y="18" width="245" height="70" rx="10" fill="var(--rose-soft)" stroke="#f43f5e"/>
            <text x="397" y="44" text-anchor="middle" fill="var(--rose-text)">( [ ) ]  ✕ Sai lồng nhau</text>
            <text x="397" y="68" text-anchor="middle" fill="var(--text-soft)" font-size="11">Gặp ")" nhưng đỉnh Stack đang là "["</text>
          </g>
        </svg>`,
      exptree: `
        <svg viewBox="0 0 540 156" style="width:100%;max-width:540px;display:block;">
          <line x1="150" y1="26" x2="88" y2="70" stroke="var(--border-strong)" stroke-width="2"/>
          <line x1="150" y1="26" x2="212" y2="70" stroke="var(--border-strong)" stroke-width="2"/>
          <line x1="88" y1="70" x2="52" y2="116" stroke="var(--border-strong)" stroke-width="2"/>
          <line x1="88" y1="70" x2="124" y2="116" stroke="var(--border-strong)" stroke-width="2"/>
          <line x1="212" y1="70" x2="180" y2="116" stroke="var(--border-strong)" stroke-width="2"/>
          <line x1="212" y1="70" x2="244" y2="116" stroke="var(--border-strong)" stroke-width="2"/>
          <g text-anchor="middle" font-weight="700" font-size="13">
            <circle cx="150" cy="26" r="16" fill="var(--amber-soft)" stroke="#f59e0b" stroke-width="2"/><text x="150" y="31" fill="var(--amber-text)">+</text>
            <circle cx="88" cy="70" r="15" fill="var(--bg-surface)" stroke="var(--accent)" stroke-width="2"/><text x="88" y="75" fill="var(--text-main)">/</text>
            <circle cx="212" cy="70" r="15" fill="var(--bg-surface)" stroke="var(--accent)" stroke-width="2"/><text x="212" y="75" fill="var(--text-main)">*</text>
            <circle cx="52" cy="116" r="14" fill="var(--bg-surface)" stroke="var(--border-strong)"/><text x="52" y="121" fill="var(--text-main)">a-b</text>
            <circle cx="124" cy="116" r="14" fill="var(--bg-surface)" stroke="var(--border-strong)"/><text x="124" y="121" fill="var(--text-main)">c</text>
            <circle cx="180" cy="116" r="14" fill="var(--bg-surface)" stroke="var(--border-strong)"/><text x="180" y="121" fill="var(--text-main)">d</text>
            <circle cx="244" cy="116" r="14" fill="var(--bg-surface)" stroke="var(--border-strong)"/><text x="244" y="121" fill="var(--text-main)">e</text>
          </g>
          <text x="295" y="48" fill="var(--accent)" font-size="12" font-weight="700">Gốc cây = phép toán làm CUỐI CÙNG (+)</text>
          <text x="295" y="76" fill="var(--text-main)" font-size="12">• Duyệt LRN → Hậu tố: a b - c / d e * +</text>
          <text x="295" y="102" fill="var(--text-main)" font-size="12">• Duyệt NLR → Tiền tố: + / - a b c * d e</text>
        </svg>`,
      treeheight: `
        <svg viewBox="0 0 540 138" style="width:100%;max-width:540px;display:block;">
          <line x1="120" y1="24" x2="75" y2="66" stroke="var(--border-strong)" stroke-width="2"/>
          <line x1="120" y1="24" x2="165" y2="66" stroke="var(--border-strong)" stroke-width="2"/>
          <line x1="75" y1="66" x2="50" y2="110" stroke="var(--border-strong)" stroke-width="2"/>
          <line x1="75" y1="66" x2="100" y2="110" stroke="var(--border-strong)" stroke-width="2"/>
          <g text-anchor="middle" font-weight="700" font-size="12">
            <circle cx="120" cy="24" r="14" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/><text x="120" y="28" fill="var(--accent)">Gốc</text>
            <circle cx="75" cy="66" r="13" fill="var(--bg-surface)" stroke="var(--accent)"/><text x="75" y="70" fill="var(--text-main)">B</text>
            <circle cx="165" cy="66" r="13" fill="var(--bg-surface)" stroke="var(--accent)"/><text x="165" y="70" fill="var(--text-main)">C</text>
            <circle cx="50" cy="110" r="12" fill="var(--bg-surface)" stroke="var(--border-strong)"/><text x="50" y="114" fill="var(--text-main)">D</text>
            <circle cx="100" cy="110" r="12" fill="var(--bg-surface)" stroke="var(--border-strong)"/><text x="100" y="114" fill="var(--text-main)">E</text>
          </g>
          <text x="220" y="34" fill="var(--accent)" font-size="12" font-weight="700">Slide C5 tr. 6, 40: Mức gốc = 0 → Cao = 2 (đếm cạnh)</text>
          <text x="220" y="64" fill="var(--amber-text)" font-size="12" font-weight="700">Slide C5 tr. 16: Mức gốc = 1 → Cao = 3 (đếm mức)</text>
          <text x="220" y="98" fill="var(--text-muted)" font-size="12">Cây hình bên: 5 nút · 3 lá (C, D, E)</text>
        </svg>`,
      treebuild: `
        <svg viewBox="0 0 540 120" style="width:100%;max-width:540px;display:block;">
          <text x="20" y="22" fill="var(--accent)" font-size="12" font-weight="700">NLR: [ B ,  A ,  D, C, F, E ]  →  Phần tử ĐẦU là gốc B</text>
          <text x="20" y="52" fill="#f59e0b" font-size="12" font-weight="700">LNR: [ A ]  |  B  |  [ C , D , E , F ]</text>
          <rect x="20" y="68" width="120" height="34" rx="8" fill="var(--accent-soft)" stroke="var(--accent)"/><text x="80" y="89" text-anchor="middle" fill="var(--accent)" font-size="12" font-weight="700">Cây trái: {A}</text>
          <rect x="180" y="68" width="220" height="34" rx="8" fill="var(--amber-soft)" stroke="#f59e0b"/><text x="290" y="89" text-anchor="middle" fill="var(--amber-text)" font-size="12" font-weight="700">Cây phải: tách tiếp gốc D</text>
        </svg>`,
      treerec: `
        <svg viewBox="0 0 540 112" style="width:100%;max-width:540px;display:block;">
          <g font-family="Cascadia Code, monospace" font-size="12" font-weight="700">
            <rect x="16" y="16" width="160" height="74" rx="10" fill="var(--bg-surface)" stroke="var(--accent)"/>
            <text x="96" y="42" text-anchor="middle" fill="var(--accent)">Đếm tổng nút</text>
            <text x="96" y="66" text-anchor="middle" fill="var(--text-main)">1 + f(L) + f(R)</text>
            <rect x="190" y="16" width="165" height="74" rx="10" fill="var(--bg-surface)" stroke="#f59e0b"/>
            <text x="272" y="42" text-anchor="middle" fill="var(--amber-text)">Đếm nút lá</text>
            <text x="272" y="66" text-anchor="middle" fill="var(--text-main)">lá→1; else f(L)+f(R)</text>
            <rect x="370" y="16" width="155" height="74" rx="10" fill="var(--bg-surface)" stroke="#10b981"/>
            <text x="447" y="42" text-anchor="middle" fill="var(--emerald-text)">Chiều cao</text>
            <text x="447" y="66" text-anchor="middle" fill="var(--text-main)">1 + max(f(L),f(R))</text>
          </g>
        </svg>`,
      baseconv: `
        <svg viewBox="0 0 540 130" style="width:100%;max-width:540px;display:block;">
          <text x="20" y="20" fill="var(--accent)" font-size="12" font-weight="700">Đổi 57₁₀ → nhị phân: Chia 2 lấy dư Push vào Stack rồi Pop ra</text>
          <g font-family="Cascadia Code, monospace" font-size="12" font-weight="700">
            <text x="20" y="48" fill="var(--text-main)">57÷2=28 dư 1 → Push(1)</text>
            <text x="20" y="70" fill="var(--text-main)">28÷2=14 dư 0 → Push(0)</text>
            <text x="20" y="92" fill="var(--text-main)">14÷2= 7 dư 0 → Push(0) ...</text>
            <rect x="255" y="34" width="265" height="74" rx="10" fill="var(--emerald-soft)" stroke="#10b981"/>
            <text x="387" y="60" text-anchor="middle" fill="var(--emerald-text)">Stack bottom→top: [1,0,0,1,1,1]</text>
            <text x="387" y="88" text-anchor="middle" fill="var(--text-main)">Pop hết ra (LIFO) → 111001₂</text>
          </g>
        </svg>`,
      treearray: `
        <svg viewBox="0 0 560 156" style="width:100%;max-width:560px;display:block;">
          <text x="16" y="18" fill="var(--accent)" font-size="12" font-weight="700">Mảng 1-based (gốc = 1): Trái = 2i · Phải = 2i+1 · Cha = j/2</text>
          <g font-family="Cascadia Code, monospace" font-size="12" font-weight="700" text-anchor="middle">
            <rect x="16" y="32" width="44" height="36" rx="6" fill="var(--accent-soft)" stroke="var(--accent)"/><text x="38" y="55" fill="var(--accent)">1:Gốc</text>
            <rect x="66" y="32" width="44" height="36" rx="6" fill="var(--bg-surface)" stroke="var(--border-strong)"/><text x="88" y="55" fill="var(--text-main)">2:B</text>
            <rect x="116" y="32" width="44" height="36" rx="6" fill="var(--bg-surface)" stroke="var(--border-strong)"/><text x="138" y="55" fill="var(--text-main)">3:C</text>
            <rect x="166" y="32" width="44" height="36" rx="6" fill="var(--amber-soft)" stroke="#f59e0b"/><text x="188" y="55" fill="var(--amber-text)">4:D</text>
            <rect x="216" y="32" width="44" height="36" rx="6" fill="var(--amber-soft)" stroke="#f59e0b"/><text x="238" y="55" fill="var(--amber-text)">5:E</text>
          </g>
          <text x="16" y="92" fill="var(--text-muted)" font-size="11">Nút i=2 (B) có con trái 2*2=4 (D), con phải 2*2+1=5 (E)</text>
          <rect x="16" y="106" width="525" height="38" rx="8" fill="var(--bg-surface)" stroke="var(--border-strong)"/>
          <text x="278" y="129" text-anchor="middle" fill="var(--text-main)" font-size="12" font-weight="700">Cây tổng quát → Nhị phân: pLeft = Con cực trái (CHILD) · pRight = Em kế phải (SIBLING)</text>
        </svg>`,
      badbst: `
        <svg width="260" height="150" viewBox="0 0 260 150" style="display:block;">
          <line x1="130" y1="26" x2="76" y2="74" stroke="var(--border-strong)" stroke-width="2"/>
          <line x1="130" y1="26" x2="184" y2="74" stroke="var(--border-strong)" stroke-width="2"/>
          <line x1="76" y1="74" x2="44" y2="122" stroke="var(--border-strong)" stroke-width="2"/>
          <line x1="76" y1="74" x2="108" y2="122" stroke="#f43f5e" stroke-width="2.2"/>
          <circle cx="130" cy="26" r="16" fill="var(--bg-surface)" stroke="var(--accent)" stroke-width="2"/><text x="130" y="31" text-anchor="middle" fill="var(--text-main)" font-size="13" font-weight="700">8</text>
          <circle cx="76" cy="74" r="16" fill="var(--bg-surface)" stroke="var(--accent)" stroke-width="2"/><text x="76" y="79" text-anchor="middle" fill="var(--text-main)" font-size="13" font-weight="700">3</text>
          <circle cx="184" cy="74" r="16" fill="var(--bg-surface)" stroke="var(--accent)" stroke-width="2"/><text x="184" y="79" text-anchor="middle" fill="var(--text-main)" font-size="13" font-weight="700">12</text>
          <circle cx="44" cy="122" r="16" fill="var(--bg-surface)" stroke="var(--accent)" stroke-width="2"/><text x="44" y="127" text-anchor="middle" fill="var(--text-main)" font-size="13" font-weight="700">1</text>
          <circle cx="108" cy="122" r="16" fill="var(--rose-soft)" stroke="#f43f5e" stroke-width="2.2"/><text x="108" y="127" text-anchor="middle" fill="var(--rose-text)" font-size="13" font-weight="700">10</text>
        </svg>`,
      bst: `
        <svg width="260" height="150" viewBox="0 0 260 150" style="display:block;">
          <line x1="130" y1="26" x2="76" y2="74" stroke="var(--border-strong)" stroke-width="2"/>
          <line x1="130" y1="26" x2="184" y2="74" stroke="var(--border-strong)" stroke-width="2"/>
          <line x1="76" y1="74" x2="44" y2="122" stroke="var(--border-strong)" stroke-width="2"/>
          <line x1="76" y1="74" x2="108" y2="122" stroke="var(--border-strong)" stroke-width="2"/>
          <line x1="184" y1="74" x2="216" y2="122" stroke="var(--border-strong)" stroke-width="2"/>
          <circle cx="130" cy="26" r="16" fill="var(--bg-surface)" stroke="var(--accent)" stroke-width="2"/><text x="130" y="31" text-anchor="middle" fill="var(--text-main)" font-size="13" font-weight="700">8</text>
          <circle cx="76" cy="74" r="16" fill="var(--bg-surface)" stroke="var(--accent)" stroke-width="2"/><text x="76" y="79" text-anchor="middle" fill="var(--text-main)" font-size="13" font-weight="700">3</text>
          <circle cx="184" cy="74" r="16" fill="var(--bg-surface)" stroke="var(--accent)" stroke-width="2"/><text x="184" y="79" text-anchor="middle" fill="var(--text-main)" font-size="13" font-weight="700">10</text>
          <circle cx="44" cy="122" r="16" fill="var(--bg-surface)" stroke="var(--accent)" stroke-width="2"/><text x="44" y="127" text-anchor="middle" fill="var(--text-main)" font-size="13" font-weight="700">1</text>
          <circle cx="108" cy="122" r="16" fill="var(--bg-surface)" stroke="var(--accent)" stroke-width="2"/><text x="108" y="127" text-anchor="middle" fill="var(--text-main)" font-size="13" font-weight="700">6</text>
          <circle cx="216" cy="122" r="16" fill="var(--bg-surface)" stroke="var(--accent)" stroke-width="2"/><text x="216" y="127" text-anchor="middle" fill="var(--text-main)" font-size="13" font-weight="700">14</text>
        </svg>`,
      avldelete: `
        <svg width="260" height="150" viewBox="0 0 260 150" style="display:block;">
          <line x1="130" y1="26" x2="76" y2="74" stroke="var(--border-strong)" stroke-width="2"/>
          <line x1="130" y1="26" x2="184" y2="74" stroke="#f43f5e" stroke-dasharray="4 3" stroke-width="2"/>
          <line x1="76" y1="74" x2="44" y2="122" stroke="var(--border-strong)" stroke-width="2"/>
          <line x1="76" y1="74" x2="108" y2="122" stroke="var(--border-strong)" stroke-width="2"/>
          <circle cx="130" cy="26" r="16" fill="var(--bg-surface)" stroke="var(--accent)" stroke-width="2"/><text x="130" y="31" text-anchor="middle" fill="var(--text-main)" font-size="13" font-weight="700">30</text>
          <circle cx="76" cy="74" r="16" fill="var(--bg-surface)" stroke="var(--accent)" stroke-width="2"/><text x="76" y="79" text-anchor="middle" fill="var(--text-main)" font-size="13" font-weight="700">20</text>
          <circle cx="184" cy="74" r="16" fill="var(--rose-soft)" stroke="#f43f5e" stroke-dasharray="4 3" stroke-width="2"/><text x="184" y="79" text-anchor="middle" fill="var(--rose-text)" font-size="13" font-weight="700">40</text>
          <circle cx="44" cy="122" r="16" fill="var(--bg-surface)" stroke="var(--accent)" stroke-width="2"/><text x="44" y="127" text-anchor="middle" fill="var(--text-main)" font-size="13" font-weight="700">10</text>
          <circle cx="108" cy="122" r="16" fill="var(--bg-surface)" stroke="var(--accent)" stroke-width="2"/><text x="108" y="127" text-anchor="middle" fill="var(--text-main)" font-size="13" font-weight="700">25</text>
        </svg>`
    };
    const svg = svgs[kind];
    return svg ? `<div class="svg-diagram-box">${svg}</div>` : '';
  }

  function buildStepsForPreset(preset) {
    if (!preset) return [];
    const { mode, arr, key, bubbleDir } = preset;
    if (mode === 'postfix') return Algo.postfix(arr);
    const nums = String(arr || '').split(/[\s,;]+/).filter(Boolean).map((x) => parseInt(x, 10));
    if (mode === 'binary') return Algo.binary(nums, parseInt(key, 10));
    if (mode === 'stack' || mode === 'queue') return Algo.operations(nums, mode === 'queue');
    if (mode === 'linked') return Algo.linkedPairs(nums);
    if (mode === 'quick') return Algo.quickSort(nums);
    if (mode === 'bst' || mode === 'avl') {
      const rem = (key !== undefined && key !== '') ? parseInt(key, 10) : null;
      return Algo.treeTrace(nums, mode === 'avl', rem, { replaceSide: store.getPref('treeReplaceSide') });
    }
    const cap = mode.charAt(0).toUpperCase() + mode.slice(1);
    return Algo.sort(nums, cap, { direction: bubbleDir || store.getPref('bubbleDir') });
  }

  function renderLessonDetail() {
    if (miniPlayTimer) { clearTimeout(miniPlayTimer); miniPlayTimer = null; }
    const l = Lessons[selectedLessonId - 1] || Lessons[0];
    if (!l) return;
    const simPreset = l.miniSim || LESSON_SIM_MAP[l.id];
    const hasOverviewMini = Boolean(l.miniSim) && selectedLessonSubTab === 'overview';
    const shortCh = (l.chapter || l.group || '').split('·')[0].trim();

    lessonDetail.innerHTML = `
      <div class="mobile-lesson-bar">
        <button id="btn-lesson-mob-back" type="button" class="btn btn-ghost" style="padding:5px 8px;">← 32 dạng</button>
        <span style="font-size:12.5px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">Dạng ${String(l.id).padStart(2, '0')} · ${esc(shortCh)}</span>
        <button id="btn-lesson-mob-prac" type="button" class="btn btn-primary" style="padding:5px 10px;">Luyện</button>
      </div>

      <div class="lesson-detail-scroll">
        <div class="lesson-detail-inner">
          <div style="display:flex;flex-wrap:wrap;align-items:flex-start;justify-content:space-between;gap:12px;">
            <div style="min-width:0;flex:1;">
              <span class="brand-pill">${esc(l.chapter || l.group)}</span>
              <h2 style="margin:6px 0 0;font-size:19px;font-weight:700;line-height:1.35;">${esc(lessonLabel(l.id))}</h2>
            </div>
            <div class="lesson-desktop-actions" style="display:flex;flex-wrap:wrap;gap:8px;flex-shrink:0;">
              <button id="btn-lesson-practice" type="button" class="btn btn-primary">Luyện dạng này</button>
              ${simPreset ? '<button id="btn-lesson-sim" type="button" class="btn">Mở mô phỏng ↗</button>' : ''}
            </div>
          </div>

          <div class="seg-group lesson-subtabs" role="tablist">
            <button type="button" class="seg-btn ${selectedLessonSubTab === 'overview' ? 'active' : ''}" data-lsub="overview">Bài mẫu &amp; Minh họa</button>
            <button type="button" class="seg-btn ${selectedLessonSubTab === 'code' ? 'active' : ''}" data-lsub="code">Code &amp; Bẫy thi</button>
            <button type="button" class="seg-btn ${selectedLessonSubTab === 'steps' ? 'active' : ''}" data-lsub="steps">Lời giải &amp; Kiểm tra</button>
          </div>

          ${selectedLessonSubTab === 'overview' ? `
            <div class="surface-card" style="padding:16px 18px;">
              <div class="section-tag">Bài mẫu &amp; Minh họa trực quan</div>
              <p style="margin:0;font-size:14px;line-height:1.65;">${esc(l.problem)}</p>
              ${l.diagram && l.diagram.length ? renderLessonDiagramSvg(l.diagram[0]) : ''}
            </div>

            ${l.miniSim ? `
              <div class="surface-card mini-sim-card">
                <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px;">
                  <div class="section-tag" style="margin:0;">Mô phỏng 60fps trực tiếp trong bài học</div>
                  <span id="mini-step-label" class="font-mono-code" style="font-size:12px;font-weight:700;color:var(--accent);">Bước 1</span>
                </div>
                <div id="mini-canvas-wrap" class="mini-sim-canvas-wrap">
                  <canvas id="mini-canvas"></canvas>
                </div>
                <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px;">
                  <span id="mini-note" style="font-size:12px;color:var(--text-soft);flex:1;min-width:180px;"></span>
                  <div style="display:flex;gap:6px;flex-shrink:0;">
                    <button id="mini-prev" type="button" class="btn">◀ Lùi</button>
                    <button id="mini-play" type="button" class="btn btn-primary">▶ Tự chạy</button>
                    <button id="mini-next" type="button" class="btn">Tiếp ▶</button>
                  </div>
                </div>
              </div>
            ` : (simPreset ? `
              <div class="surface-sub" style="padding:12px 14px;display:flex;align-items:center;justify-content:space-between;gap:10px;">
                <span style="font-size:12.5px;color:var(--text-soft);">Dạng này có mô phỏng tương tác từng bước 60fps.</span>
                <button type="button" class="btn" data-open-lesson-sim>Mở mô phỏng ↗</button>
              </div>
            ` : '')}

            <div class="surface-card" style="padding:16px 18px;">
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
          ` : ''}

          ${selectedLessonSubTab === 'code' ? `
            ${(l.code || l.codeNote) ? `
              <div class="surface-card" style="padding:16px 18px;">
                <div class="section-tag">Đọc hiểu code chuẩn Slide IUH</div>
                ${l.code ? `<pre class="code-block">${esc(l.code)}</pre>` : ''}
                ${l.codeNote ? `<div class="code-note-box"><strong>Điểm cần nhìn khi đọc đề:</strong> ${esc(l.codeNote)}</div>` : ''}
              </div>
            ` : ''}

            ${l.table && l.table.length ? `
              <div class="surface-card" style="padding:16px 18px;">
                <div class="section-tag">Bảng tổng hợp nhanh</div>
                <div class="table-scroll-wrap">
                  <table class="data-table">
                    <thead><tr>${l.table[0].map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead>
                    <tbody>${l.table.slice(1).map((row) => `<tr>${row.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody>
                  </table>
                </div>
              </div>
            ` : ''}

            <div class="tip-box">
              <strong style="color:var(--amber-text);">Mẹo nhanh và bẫy hay gặp:</strong> ${esc(l.tip)}
            </div>
          ` : ''}

          ${selectedLessonSubTab === 'steps' ? `
            <div class="surface-card" style="padding:16px 18px;">
              <div class="section-tag">Giải từng bước</div>
              <div style="display:flex;flex-direction:column;gap:8px;">
                ${l.solution.map((s, i) => `
                  <div class="surface-sub" style="padding:10px 12px;font-size:13px;">
                    <strong>Bước ${i + 1}:</strong> ${esc(s)}
                  </div>
                `).join('')}
              </div>
            </div>

            <div class="surface-card" style="padding:16px 18px;">
              <div class="section-tag">Tự kiểm tra</div>
              <p style="margin:0 0 10px;font-size:13.5px;">${esc(l.practice)}</p>
              <button id="btn-toggle-lesson-ans" type="button" class="btn">Hiện đáp án tự kiểm tra</button>
              <div id="lesson-ans-box" style="display:none;margin-top:10px;padding:12px 14px;border-radius:11px;background:var(--emerald-soft);color:var(--emerald-text);font-size:13px;font-weight:600;">
                ${esc(l.answer)}
              </div>
              <div style="font-size:11.5px;color:var(--text-muted);margin-top:12px;">Nguồn dạng bài: ${esc(l.source)}</div>
            </div>
          ` : ''}

          <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding-top:4px;">
            <button id="btn-lesson-prev" type="button" class="btn" ${l.id <= 1 ? 'disabled' : ''}>◀ Dạng trước</button>
            ${simPreset ? '<button type="button" class="btn btn-ghost mobile-only-btn" data-open-lesson-sim style="color:var(--accent);">Mô phỏng ↗</button>' : ''}
            <button id="btn-lesson-next" type="button" class="btn" ${l.id >= Lessons.length ? 'disabled' : ''}>Dạng tiếp ▶</button>
          </div>
        </div>
      </div>
    `;

    if (hasOverviewMini) {
      const mSteps = buildStepsForPreset(l.miniSim);
      let mIdx = 0;
      let mPlaying = false;
      const mWrap = document.getElementById('mini-canvas-wrap');
      const mCanvas = document.getElementById('mini-canvas');
      miniViz = new Visualizer(mCanvas, mWrap, () => appEl.getAttribute('data-theme'));
      miniViz.avlBfMode = store.getPref('avlBfMode');
      miniViz.setData(l.miniSim.mode, mSteps);

      const syncMini = () => {
        const st = mSteps[mIdx];
        if (!st) return;
        const lbl = document.getElementById('mini-step-label');
        const noteEl = document.getElementById('mini-note');
        if (lbl) lbl.textContent = `Bước ${mIdx + 1}/${mSteps.length} · ${st.title}`;
        if (noteEl) noteEl.textContent = st.note;
      };
      syncMini();
      requestAnimationFrame(() => { if (miniViz) { miniViz.resize(); miniViz.renderCurrent(); } });

      const stopMini = () => {
        mPlaying = false;
        if (miniPlayTimer) { clearTimeout(miniPlayTimer); miniPlayTimer = null; }
        const btn = document.getElementById('mini-play');
        if (btn) { btn.textContent = '▶ Tự chạy'; btn.className = 'btn btn-primary'; }
      };

      const tickMini = () => {
        if (!mPlaying) return;
        if (mIdx >= mSteps.length - 1) { stopMini(); return; }
        const prev = mIdx++;
        syncMini();
        miniViz.transitionTo(prev, mIdx);
        miniPlayTimer = setTimeout(tickMini, 1050);
      };

      document.getElementById('mini-prev').addEventListener('click', () => {
        stopMini();
        if (mIdx > 0) { const p = mIdx--; syncMini(); miniViz.transitionTo(p, mIdx); }
      });
      document.getElementById('mini-next').addEventListener('click', () => {
        stopMini();
        if (mIdx < mSteps.length - 1) { const p = mIdx++; syncMini(); miniViz.transitionTo(p, mIdx); }
      });
      document.getElementById('mini-play').addEventListener('click', () => {
        if (mPlaying) { stopMini(); return; }
        if (mIdx >= mSteps.length - 1) { mIdx = 0; syncMini(); miniViz.transitionTo(0, 0, true); }
        mPlaying = true;
        const btn = document.getElementById('mini-play');
        btn.textContent = '⏸ Tạm dừng';
        btn.className = 'btn btn-amber';
        tickMini();
      });
    } else {
      miniViz = null;
    }

    const mobBackBtn = document.getElementById('btn-lesson-mob-back');
    if (mobBackBtn) {
      mobBackBtn.addEventListener('click', () => {
        mobileLessonDetailOpen = false;
        syncLessonsMobileView();
      });
    }
    const mobPracBtn = document.getElementById('btn-lesson-mob-prac');
    if (mobPracBtn) mobPracBtn.addEventListener('click', () => openPractice(l.id, null));

    const pracBtn = document.getElementById('btn-lesson-practice');
    if (pracBtn) pracBtn.addEventListener('click', () => openPractice(l.id, null));

    const openSim = () => {
      if (!simPreset) return;
      if (simPreset.bubbleDir) store.setPref('bubbleDir', simPreset.bubbleDir);
      switchTab('sim');
      selectSimMode(simPreset.mode, simPreset.arr, simPreset.key);
    };
    const simBtn = document.getElementById('btn-lesson-sim');
    if (simBtn) simBtn.addEventListener('click', openSim);
    lessonDetail.querySelectorAll('[data-open-lesson-sim]').forEach((b) => b.addEventListener('click', openSim));

    lessonDetail.querySelectorAll('button[data-lsub]').forEach((b) => {
      b.addEventListener('click', () => {
        selectedLessonSubTab = b.dataset.lsub;
        renderLessonDetail();
      });
    });

    const ansBtn = document.getElementById('btn-toggle-lesson-ans');
    const ansBox = document.getElementById('lesson-ans-box');
    if (ansBtn && ansBox) {
      ansBtn.addEventListener('click', () => {
        const open = ansBox.style.display === 'block';
        ansBox.style.display = open ? 'none' : 'block';
        ansBtn.textContent = open ? 'Hiện đáp án tự kiểm tra' : 'Ẩn đáp án';
      });
    }

    const prevL = document.getElementById('btn-lesson-prev');
    const nextL = document.getElementById('btn-lesson-next');
    if (prevL) {
      prevL.addEventListener('click', () => {
        if (l.id > 1) {
          selectedLessonId = l.id - 1;
          selectedLessonSubTab = 'overview';
          renderLessonList();
          renderLessonDetail();
          lessonDetail.scrollTop = 0;
        }
      });
    }
    if (nextL) {
      nextL.addEventListener('click', () => {
        if (l.id < Lessons.length) {
          selectedLessonId = l.id + 1;
          selectedLessonSubTab = 'overview';
          renderLessonList();
          renderLessonDetail();
          lessonDetail.scrollTop = 0;
        }
      });
    }
  }

  // =========================================================
  // 3. SIMULATOR TAB (ALL 12 MODES, CANVAS-FIRST + POPOVER/SHEET)
  // =========================================================
  const SIM_MODES = [
    { id: 'avl', group: 'Cây BST & AVL', label: 'Cây AVL (Xoay)', help: 'Mặc định CSCB = h(Phải) − h(Trái) theo Slide IUH; hỗ trợ xoay LL/RR/LR/RL & chọn thế mạng 2 con.', keyLabel: 'Khóa xóa:' },
    { id: 'bst', group: 'Cây BST & AVL', label: 'Cây BST', help: 'Dò từ gốc xuống để chèn; khi xóa nút 2 con có thể chọn thế mạng Phải nhất cây trái / Trái nhất cây phải.', keyLabel: 'Khóa xóa:' },
    { id: 'bubble', group: 'Sắp xếp (5 thuật toán)', label: 'Bubble Sort', help: 'Nhập 1–12 số nguyên. Hỗ trợ chiều Phải → Trái (Slide IUH) và Trái → Phải, trượt vòng cung mượt mà.' },
    { id: 'quick', group: 'Sắp xếp (5 thuật toán)', label: 'Quick Sort', help: 'Quick Sort (Slide IUH): chọn mốc giữa x = a[(l+r)/2], phân hoạch và đệ quy hai đoạn.' },
    { id: 'selection', group: 'Sắp xếp (5 thuật toán)', label: 'Selection Sort', help: 'Quét tìm chỉ số min trong đoạn chưa sắp rồi đổi 1 lần cuối lượt.' },
    { id: 'insertion', group: 'Sắp xếp (5 thuật toán)', label: 'Insertion Sort', help: 'Phần tử x nhấc lên vùng tạm (pos), các số lớn hơn trượt sang phải rồi chèn vào pos + 1.' },
    { id: 'interchange', group: 'Sắp xếp (5 thuật toán)', label: 'Interchange Sort', help: 'Cố định i, tô sáng cặp so sánh (a[i], a[j]) trước rồi mới sang bước đổi chỗ nếu nghịch thế.' },
    { id: 'binary', group: 'Tìm kiếm & Tuyến tính', label: 'Tìm nhị phân', help: 'Nhập dãy tăng dần. Ô khóa: giá trị cần tìm trong đoạn đóng [left, right].', keyLabel: 'Khóa tìm:' },
    { id: 'stack', group: 'Tìm kiếm & Tuyến tính', label: 'Stack Push/Pop', help: 'Số ≥ 0: push(v) vào đỉnh · Số -1: pop() lấy phần tử trên đỉnh (LIFO).' },
    { id: 'queue', group: 'Tìm kiếm & Tuyến tính', label: 'Queue Enq/Deq', help: 'Số ≥ 0: enqueue(v) vào rear · Số -1: dequeue() lấy ở front (FIFO).' },
    { id: 'postfix', group: 'Tìm kiếm & Tuyến tính', label: 'Hậu tố', help: 'Nhập token cách bởi khoảng trắng (hỗ trợ + - * /, chia nguyên). VD: 8 3 2 * - 4 +' },
    { id: 'linked', group: 'Tìm kiếm & Tuyến tính', label: 'DSLK đổi cặp', help: 'Hiển thị cặp nút (i, i+1) trước rồi mới đổi dữ liệu từng cặp, không đổi liên kết next.' }
  ];

  const SIM_GROUP_ORDER = ['Cây BST & AVL', 'Sắp xếp (5 thuật toán)', 'Tìm kiếm & Tuyến tính'];
  const SIM_SPEEDS = [0.5, 1, 1.5, 2];

  let simMode = 'avl';
  let simSteps = [];
  let simIndex = 0;
  let simPlaying = false;
  let simPlayTimer = null;
  let openSimPanelName = null;

  const simModesEl = document.getElementById('sim-modes');
  const simModeLabelEl = document.getElementById('sim-mode-label');
  const simDataSummaryEl = document.getElementById('sim-data-summary');
  const simKeyChipEl = document.getElementById('sim-key-chip');
  const simOptBadgeEl = document.getElementById('sim-opt-badge');
  const simOptsBodyEl = document.getElementById('sim-opts-body');
  const simDeleteFloatEl = document.getElementById('sim-delete-float');
  const simOverlayBackdropEl = document.getElementById('sim-overlay-backdrop');
  const simPanels = {
    modes: document.getElementById('sim-mode-panel'),
    data: document.getElementById('sim-data-panel'),
    opts: document.getElementById('sim-opts-panel')
  };
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
  const btnSpeedCycleEl = document.getElementById('btn-speed-cycle');

  simViz = new Visualizer(
    document.getElementById('sim-canvas'),
    document.getElementById('canvas-wrap'),
    () => appEl.getAttribute('data-theme')
  );
  simViz.avlBfMode = store.getPref('avlBfMode');

  function openSimPanel(name) {
    openSimPanelName = name || null;
    Object.keys(simPanels).forEach((k) => {
      if (simPanels[k]) simPanels[k].classList.toggle('open', k === openSimPanelName);
    });
    if (simOverlayBackdropEl) simOverlayBackdropEl.classList.toggle('open', Boolean(openSimPanelName));
    if (openSimPanelName === 'data' && window.innerWidth > 768 && simInputEl) {
      setTimeout(() => simInputEl.focus(), 40);
    }
  }

  function toggleSimPanel(name) {
    openSimPanel(openSimPanelName === name ? null : name);
  }

  document.getElementById('sim-mode-trigger').addEventListener('click', () => toggleSimPanel('modes'));
  document.getElementById('sim-data-trigger').addEventListener('click', () => toggleSimPanel('data'));
  document.getElementById('sim-opts-trigger').addEventListener('click', () => toggleSimPanel('opts'));
  if (simOverlayBackdropEl) simOverlayBackdropEl.addEventListener('click', () => openSimPanel(null));
  document.querySelectorAll('[data-close-pop]').forEach((b) => b.addEventListener('click', () => openSimPanel(null)));

  function updateSimTopbarSummary() {
    const meta = SIM_MODES.find((m) => m.id === simMode) || SIM_MODES[0];
    if (simModeLabelEl) simModeLabelEl.textContent = meta.label;
    if (simDataSummaryEl) simDataSummaryEl.textContent = simInputEl.value.trim() || '...';
    if (simKeyChipEl) {
      const k = simKeyEl.value.trim();
      if (meta.keyLabel && k !== '') {
        simKeyChipEl.textContent = (simMode === 'binary' ? 'Tìm ' : 'Xóa ') + k;
        simKeyChipEl.style.display = 'inline-block';
      } else {
        simKeyChipEl.style.display = 'none';
      }
    }
    if (simOptBadgeEl) {
      if (simMode === 'avl') {
        const bfMode = store.getPref('avlBfMode') || 'iuh';
        simOptBadgeEl.textContent = bfMode === 'iuh' ? 'CSCB = h(R)−h(L)' : 'BF = h(L)−h(R)';
        simOptBadgeEl.style.display = 'inline-block';
      } else if (simMode === 'bubble') {
        const bdir = store.getPref('bubbleDir') || 'rtl';
        simOptBadgeEl.textContent = bdir === 'rtl' ? 'Phải → Trái (IUH)' : 'Trái → Phải';
        simOptBadgeEl.style.display = 'inline-block';
      } else {
        simOptBadgeEl.style.display = 'none';
      }
    }
  }

  function renderSimModePills() {
    simModesEl.innerHTML = SIM_GROUP_ORDER.map((groupName) => {
      const items = SIM_MODES.filter((m) => m.group === groupName);
      return `
        <div>
          <div class="sim-group-label">${esc(groupName)}</div>
          <div class="sim-mode-grid">
            ${items.map((m) => `<button type="button" data-mode="${m.id}" class="sim-mode-opt ${m.id === simMode ? 'active' : ''}">${esc(m.label)}</button>`).join('')}
          </div>
        </div>
      `;
    }).join('');
    simModesEl.querySelectorAll('button[data-mode]').forEach((b) => {
      b.addEventListener('click', () => {
        selectSimMode(b.dataset.mode);
        openSimPanel(null);
      });
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

  function buildSimSteps(keepIndex = 0) {
    store.setSimInput(simMode, simInputEl.value, simKeyEl.value);
    updateSimTopbarSummary();
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
          nextSteps = Algo.treeTrace(vals, simMode === 'avl', rem, {
            replaceSide: store.getPref('treeReplaceSide')
          });
        } else if (simMode === 'quick') {
          nextSteps = Algo.quickSort(vals);
        } else if (simMode === 'bubble') {
          nextSteps = Algo.sort(vals, 'Bubble', {
            direction: store.getPref('bubbleDir')
          });
        } else {
          const cap = simMode.charAt(0).toUpperCase() + simMode.slice(1);
          nextSteps = Algo.sort(vals, cap);
        }
      }

      stopSimPlay();
      simSteps = nextSteps;
      const targetIdx = typeof keepIndex === 'number' && Number.isFinite(keepIndex) ? keepIndex : 0;
      simIndex = Math.max(0, Math.min(targetIdx, Math.max(0, simSteps.length - 1)));
      stepSliderEl.min = 0;
      stepSliderEl.max = Math.max(0, simSteps.length - 1);
      stepSliderEl.value = simIndex;
      simViz.avlBfMode = store.getPref('avlBfMode');
      updateSimReadout();
      simViz.setData(simMode, simSteps);
      if (simIndex > 0) simViz.transitionTo(simIndex, simIndex, true);
      return true;
    } catch (err) {
      simErrorEl.textContent = err.message;
      simErrorEl.style.display = 'block';
      return false;
    }
  }

  function renderSimCtxBar() {
    updateSimTopbarSummary();
    const st = simSteps[simIndex];

    if (simOptsBodyEl) {
      const bdir = store.getPref('bubbleDir') || 'rtl';
      const bfMode = store.getPref('avlBfMode') || 'iuh';
      simOptsBodyEl.innerHTML = `
        <div>
          <div class="ctx-label" style="margin-bottom:6px;">Chỉ số cân bằng (Cây AVL)</div>
          <div class="seg-group" style="width:100%;">
            <button type="button" class="seg-btn ${bfMode === 'iuh' ? 'active' : ''}" data-bf="iuh" style="flex:1;">CSCB = h(R)−h(L) (IUH)</button>
            <button type="button" class="seg-btn ${bfMode === 'std' ? 'active' : ''}" data-bf="std" style="flex:1;">BF = h(L)−h(R)</button>
          </div>
        </div>
        <div>
          <div class="ctx-label" style="margin-bottom:6px;">Chiều nổi bọt (Bubble Sort)</div>
          <div class="seg-group" style="width:100%;">
            <button type="button" class="seg-btn ${bdir === 'rtl' ? 'active' : ''}" data-bdir="rtl" style="flex:1;">Phải → Trái (IUH)</button>
            <button type="button" class="seg-btn ${bdir === 'ltr' ? 'active' : ''}" data-bdir="ltr" style="flex:1;">Trái → Phải</button>
          </div>
        </div>
      `;

      simOptsBodyEl.querySelectorAll('[data-bdir]').forEach((b) => {
        b.addEventListener('click', () => {
          store.setPref('bubbleDir', b.dataset.bdir);
          buildSimSteps(simMode === 'bubble' ? 0 : simIndex);
        });
      });

      simOptsBodyEl.querySelectorAll('[data-bf]').forEach((b) => {
        b.addEventListener('click', () => {
          const mode = b.dataset.bf;
          store.setPref('avlBfMode', mode);
          simViz.avlBfMode = mode;
          renderSimCtxBar();
          simViz.renderCurrent();
        });
      });
    }

    if (simDeleteFloatEl) {
      if ((simMode === 'bst' || simMode === 'avl') && st && st.deleteChoice) {
        const dc = st.deleteChoice;
        simDeleteFloatEl.style.display = 'flex';
        simDeleteFloatEl.innerHTML = `
          <span class="ctx-label">Xóa ${dc.targetVal} (2 con) — Thế mạng:</span>
          <div class="seg-group">
            <button type="button" class="seg-btn ${dc.selected === 'left' ? 'active' : ''}" data-rside="left">Phải nhất trái (${dc.leftVal})</button>
            <button type="button" class="seg-btn ${dc.selected === 'right' ? 'active' : ''}" data-rside="right">Trái nhất phải (${dc.rightVal})</button>
          </div>
        `;
        simDeleteFloatEl.querySelectorAll('[data-rside]').forEach((b) => {
          b.addEventListener('click', () => {
            stopSimPlay();
            store.setPref('treeReplaceSide', b.dataset.rside);
            buildSimSteps(simIndex);
          });
        });
      } else {
        simDeleteFloatEl.style.display = 'none';
        simDeleteFloatEl.innerHTML = '';
      }
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
      `<span class="font-mono-code" style="font-size:11.5px;padding:2px 8px;border-radius:7px;background:var(--bg-surface-2);border:1px solid var(--border-subtle);color:var(--text-soft);">${esc(v)}</span>`
    ).join('');
    renderSimCtxBar();
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

  function randomizeSimInput() {
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
      const len = simMode === 'quick' ? 8 : 6;
      const arr = Array.from({ length: len }, () => Math.floor(Math.random() * 25) + 1);
      simInputEl.value = arr.join(', ');
    }
    buildSimSteps(0);
  }

  function setSimSpeed(nextSpeed) {
    simViz.speed = nextSpeed;
    document.querySelectorAll('.speed-pill').forEach((b) => {
      b.classList.toggle('active', parseFloat(b.dataset.speed) === nextSpeed);
    });
    if (btnSpeedCycleEl) btnSpeedCycleEl.textContent = nextSpeed + 'x';
    if (simPlaying) {
      clearTimeout(simPlayTimer);
      scheduleSimPlay();
    }
  }

  simInputEl.addEventListener('input', () => {
    store.setSimInput(simMode, simInputEl.value, simKeyEl.value);
    updateSimTopbarSummary();
  });
  simKeyEl.addEventListener('input', () => {
    store.setSimInput(simMode, simInputEl.value, simKeyEl.value);
    updateSimTopbarSummary();
  });
  simInputEl.addEventListener('keydown', (e) => { if (e.key === 'Enter' && buildSimSteps(0)) openSimPanel(null); });
  simKeyEl.addEventListener('keydown', (e) => { if (e.key === 'Enter' && buildSimSteps(0)) openSimPanel(null); });
  document.getElementById('sim-apply').addEventListener('click', () => {
    if (buildSimSteps(0)) openSimPanel(null);
  });
  document.getElementById('sim-random').addEventListener('click', randomizeSimInput);
  const simRandQuick = document.getElementById('sim-random-quick');
  const simRandMob = document.getElementById('sim-random-mob');
  if (simRandQuick) simRandQuick.addEventListener('click', randomizeSimInput);
  if (simRandMob) simRandMob.addEventListener('click', randomizeSimInput);

  document.getElementById('btn-first').addEventListener('click', () => { stopSimPlay(); goSimStep(0); });
  document.getElementById('btn-prev').addEventListener('click', () => { stopSimPlay(); goSimStep(simIndex - 1); });
  document.getElementById('btn-next').addEventListener('click', () => { stopSimPlay(); goSimStep(simIndex + 1); });
  document.getElementById('btn-last').addEventListener('click', () => { stopSimPlay(); goSimStep(simSteps.length - 1); });
  btnPlayEl.addEventListener('click', () => { if (simPlaying) stopSimPlay(); else startSimPlay(); });
  stepSliderEl.addEventListener('input', (e) => { stopSimPlay(); goSimStep(parseInt(e.target.value, 10), true); });

  document.querySelectorAll('.speed-pill').forEach((btn) => {
    btn.addEventListener('click', () => setSimSpeed(parseFloat(btn.dataset.speed)));
  });
  if (btnSpeedCycleEl) {
    btnSpeedCycleEl.addEventListener('click', () => {
      const idx = SIM_SPEEDS.indexOf(simViz.speed);
      const next = SIM_SPEEDS[(idx + 1) % SIM_SPEEDS.length];
      setSimSpeed(next);
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && openSimPanelName) {
      openSimPanel(null);
      return;
    }
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
  modalViz = new Visualizer(
    document.getElementById('modal-canvas'),
    document.getElementById('modal-canvas-wrap'),
    () => appEl.getAttribute('data-theme')
  );
  modalViz.avlBfMode = store.getPref('avlBfMode');
  let modalSteps = [];
  let modalIdx = 0;

  function openTraceModal(steps, title) {
    modalSteps = steps;
    modalIdx = 0;
    modalViz.avlBfMode = store.getPref('avlBfMode');
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
  // SHARED QUESTION EXPLANATION, MISCONCEPTION & INLINE SIM
  // =========================================================
  function renderCompareRefHtml(ref) {
    if (!ref || !Array.isArray(ref.headers) || !Array.isArray(ref.rows)) return '';
    return `
      <div class="compare-ref-card">
        <div class="section-tag" style="margin-bottom:8px;">${esc(ref.title)}</div>
        <div class="table-scroll-wrap">
          <table class="data-table">
            <thead><tr>${ref.headers.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead>
            <tbody>
              ${ref.rows.map((row, rIdx) => `
                <tr class="${rIdx === ref.highlightRow ? 'compare-row-active' : ''}">
                  ${row.map((c) => `<td>${esc(c)}</td>`).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  function renderQuestionExplanationHtml(q, chosen, prefix) {
    const isCorrect = chosen === q.correct;
    const isUnanswered = chosen === null || chosen === undefined || chosen === '';
    const hasSim = q.category === 'sim' && Array.isArray(q.trace) && q.trace.length > 0;
    const diagTitle = isUnanswered
      ? 'Bạn chưa chọn đáp án'
      : (q.category === 'sim' ? 'Bạn hình dung sai ở đâu?' : 'Bạn đang nhớ nhầm ở đâu?');

    return `
      <div class="explain-stack">
        ${!isCorrect ? `
          <div class="wrong-diagnosis-box ${isUnanswered ? 'is-missed' : ''}">
            <div class="wrong-diag-title">${esc(diagTitle)}</div>
            <div class="wrong-diag-text">${esc(Questions.diagnoseWrong(q, chosen))}</div>
          </div>
        ` : ''}

        ${hasSim ? `
          <div class="inline-sim-card">
            <div class="inline-sim-head">
              <div class="sim-stage-title-wrap">
                <span id="${prefix}-sim-badge" class="font-mono-code step-badge">Bước 1 / ${q.trace.length}</span>
                <strong id="${prefix}-sim-title" class="step-title"></strong>
              </div>
              ${q.simPreset ? `<button id="${prefix}-sim-openfull" type="button" class="btn btn-ghost" style="color:var(--accent);padding:4px 9px;">Mở mô phỏng 60fps ↗</button>` : ''}
            </div>
            <div id="${prefix}-sim-vars" class="step-vars inline-sim-vars"></div>
            <div id="${prefix}-sim-wrap" class="inline-sim-canvas-wrap">
              <canvas id="${prefix}-sim-canvas"></canvas>
            </div>
            <div class="inline-sim-foot">
              <div class="sim-note-wrap">
                <span class="note-dot"></span>
                <span id="${prefix}-sim-note" class="step-note"></span>
              </div>
            </div>
            <div class="inline-sim-controls">
              <input id="${prefix}-sim-slider" type="range" min="0" max="${Math.max(0, q.trace.length - 1)}" value="0" class="sim-slider" />
              <div class="inline-sim-btns">
                <button id="${prefix}-sim-first" type="button" class="btn btn-ghost" title="Bước đầu">|◀</button>
                <button id="${prefix}-sim-prev" type="button" class="btn">◀ Lùi</button>
                <button id="${prefix}-sim-play" type="button" class="btn btn-primary">▶ Tự chạy</button>
                <button id="${prefix}-sim-next" type="button" class="btn">Tiếp ▶</button>
                <button id="${prefix}-sim-last" type="button" class="btn btn-ghost" title="Bước cuối">▶|</button>
              </div>
            </div>
          </div>
        ` : ''}

        ${q.category === 'theory' && q.compareRef ? renderCompareRefHtml(q.compareRef) : ''}

        <div class="explanation-text-box">
          <div class="section-tag" style="margin-bottom:4px;">Giải thích chi tiết</div>
          <div style="font-size:13px;color:var(--text-soft);white-space:pre-wrap;line-height:1.65;">${esc(q.explanation)}</div>
        </div>

        ${q.category === 'sim' && q.compareRef ? renderCompareRefHtml(q.compareRef) : ''}
      </div>
    `;
  }

  function mountInlineQuestionViz(q, prefix, slotKey) {
    destroyInlineViz(slotKey);
    if (!q || q.category !== 'sim' || !Array.isArray(q.trace) || !q.trace.length) return;
    const wrap = document.getElementById(`${prefix}-sim-wrap`);
    const canvas = document.getElementById(`${prefix}-sim-canvas`);
    if (!wrap || !canvas) return;

    const viz = new Visualizer(canvas, wrap, () => appEl.getAttribute('data-theme'));
    viz.avlBfMode = store.getPref('avlBfMode');
    const steps = q.trace;
    const mode = q.simMode || 'array';
    viz.setData(mode, steps);

    let idx = Math.max(0, Math.min(q.simStartIndex || 0, steps.length - 1));
    let playing = false;
    let timer = null;

    const badgeEl = document.getElementById(`${prefix}-sim-badge`);
    const titleEl = document.getElementById(`${prefix}-sim-title`);
    const varsEl = document.getElementById(`${prefix}-sim-vars`);
    const noteEl = document.getElementById(`${prefix}-sim-note`);
    const sliderEl = document.getElementById(`${prefix}-sim-slider`);
    const firstBtn = document.getElementById(`${prefix}-sim-first`);
    const prevBtn = document.getElementById(`${prefix}-sim-prev`);
    const playBtn = document.getElementById(`${prefix}-sim-play`);
    const nextBtn = document.getElementById(`${prefix}-sim-next`);
    const lastBtn = document.getElementById(`${prefix}-sim-last`);
    const openFullBtn = document.getElementById(`${prefix}-sim-openfull`);

    const syncReadout = () => {
      const st = steps[idx];
      if (!st) return;
      if (badgeEl) badgeEl.textContent = `Bước ${idx + 1} / ${steps.length}`;
      if (titleEl) titleEl.textContent = st.title || '';
      if (noteEl) noteEl.textContent = st.note || '';
      if (sliderEl) sliderEl.value = idx;
      if (varsEl) {
        varsEl.innerHTML = (st.vars || []).map((v) =>
          `<span class="font-mono-code" style="font-size:11.5px;padding:2px 8px;border-radius:7px;background:var(--bg-surface-2);border:1px solid var(--border-subtle);color:var(--text-soft);">${esc(v)}</span>`
        ).join('');
      }
      if (firstBtn) firstBtn.disabled = idx <= 0;
      if (prevBtn) prevBtn.disabled = idx <= 0;
      if (nextBtn) nextBtn.disabled = idx >= steps.length - 1;
      if (lastBtn) lastBtn.disabled = idx >= steps.length - 1;
    };

    const stop = () => {
      playing = false;
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      if (playBtn) {
        playBtn.textContent = '▶ Tự chạy';
        playBtn.className = 'btn btn-primary';
      }
    };

    const goTo = (nextIdx, instant = false) => {
      const clamped = Math.max(0, Math.min(nextIdx, steps.length - 1));
      if (clamped === idx && !instant) return;
      const prev = idx;
      idx = clamped;
      syncReadout();
      viz.transitionTo(prev, idx, instant);
    };

    const tick = () => {
      if (!playing) return;
      if (idx >= steps.length - 1) {
        stop();
        return;
      }
      goTo(idx + 1);
      const delay = (mode === 'avl' || mode === 'bst') ? 1250 : 1050;
      timer = setTimeout(tick, delay);
    };

    if (firstBtn) firstBtn.addEventListener('click', () => { stop(); goTo(0); });
    if (prevBtn) prevBtn.addEventListener('click', () => { stop(); goTo(idx - 1); });
    if (nextBtn) nextBtn.addEventListener('click', () => { stop(); goTo(idx + 1); });
    if (lastBtn) lastBtn.addEventListener('click', () => { stop(); goTo(steps.length - 1); });
    if (sliderEl) {
      sliderEl.addEventListener('input', (e) => {
        stop();
        goTo(parseInt(e.target.value, 10), true);
      });
    }
    if (playBtn) {
      playBtn.addEventListener('click', () => {
        if (playing) {
          stop();
          return;
        }
        if (idx >= steps.length - 1) goTo(0, true);
        playing = true;
        playBtn.textContent = '⏸ Tạm dừng';
        playBtn.className = 'btn btn-amber';
        if (idx < steps.length - 1) goTo(idx + 1);
        const delay = (mode === 'avl' || mode === 'bst') ? 1250 : 1050;
        timer = setTimeout(tick, delay);
      });
    }
    if (openFullBtn && q.simPreset) {
      openFullBtn.addEventListener('click', () => {
        stop();
        if (q.simPreset.bubbleDir) store.setPref('bubbleDir', q.simPreset.bubbleDir);
        if (q.simPreset.replaceSide) store.setPref('treeReplaceSide', q.simPreset.replaceSide);
        switchTab('sim');
        selectSimMode(q.simPreset.mode, q.simPreset.arr, q.simPreset.key);
      });
    }

    inlineVizSlots[slotKey] = { viz, stop };
    syncReadout();
    requestAnimationFrame(() => {
      if (inlineVizSlots[slotKey] && inlineVizSlots[slotKey].viz === viz) {
        viz.resize();
        viz.transitionTo(idx, idx, true);
      }
    });
  }

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
    destroyInlineViz('practice');
    const el = document.getElementById('tab-practice');
    if (!practiceQ) practiceQ = makeQuestionForFilter(practiceFilter);
    const lesson = Lessons[practiceQ.type - 1];
    const maxHints = lesson ? lesson.reasoning.length : 0;

    el.innerHTML = `
      <div class="centered-container practice-shell" style="max-width:860px;">
        <div class="page-header">
          <div>
            <h1 class="page-title">Luyện câu hỏi biến thể</h1>
            <p class="page-sub">Chốt đáp án trước khi xem lời giải · Dữ liệu mới sinh và chấm tự động offline</p>
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;width:100%;max-width:440px;">
            <select id="pq-type-select" class="select-field" style="flex:1;min-width:0;">
              <option value="0" ${practiceFilter === 0 ? 'selected' : ''}>Tất cả 32 dạng · trộn ngẫu nhiên</option>
              ${Lessons.map((l) => `<option value="${l.id}" ${practiceFilter === l.id ? 'selected' : ''}>${esc(lessonLabel(l.id))}</option>`).join('')}
            </select>
            <button id="pq-new-btn" type="button" class="btn btn-lg">Câu mới ↻</button>
          </div>
        </div>

        <div class="surface-card practice-q-card" style="padding:20px;display:flex;flex-direction:column;gap:16px;">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;">
            <span class="brand-pill">${esc(lessonLabel(practiceQ.type))}</span>
            <span class="font-mono-code" style="font-size:11.5px;color:var(--text-muted);">#${practiceQ.seed}</span>
          </div>

          <div style="font-size:15px;font-weight:600;line-height:1.65;white-space:pre-wrap;">${esc(practiceQ.prompt)}</div>

          <div id="pq-options" class="options-grid">
            ${practiceQ.options.map((opt, idx) => {
              let cls = 'option-card';
              let tagHtml = '';
              if (practiceChecked) {
                if (opt === practiceQ.correct && opt === practiceSelected) {
                  cls += ' correct';
                  tagHtml = '<span class="option-tag tag-correct">✓ Bạn chọn · Đúng</span>';
                } else if (opt === practiceQ.correct) {
                  cls += ' correct';
                  tagHtml = '<span class="option-tag tag-correct">✓ Đáp án đúng</span>';
                } else if (opt === practiceSelected) {
                  cls += ' wrong';
                  tagHtml = '<span class="option-tag tag-wrong">✕ Bạn chọn</span>';
                } else {
                  cls += ' dimmed';
                }
              } else if (opt === practiceSelected) {
                cls += ' selected';
                tagHtml = '<span class="option-tag tag-selected">Đang chọn</span>';
              }
              return `
                <button type="button" class="${cls}" data-opt="${idx}" ${practiceChecked ? 'disabled' : ''}>
                  <span class="option-letter">${String.fromCharCode(65 + idx)}</span>
                  <span class="option-text" style="white-space:pre-wrap;">${esc(opt)}</span>
                  ${tagHtml}
                </button>
              `;
            }).join('')}
          </div>
        </div>

        <div class="practice-actions-bar">
          ${practiceChecked ? `
            <button id="pq-next-btn" type="button" class="btn btn-primary btn-lg">Câu tiếp theo →</button>
          ` : `
            <button id="pq-hint-btn" type="button" class="btn btn-lg" ${practiceHints >= maxHints ? 'disabled' : ''}>Gợi ý (${practiceHints}/${maxHints})</button>
            <button id="pq-check-btn" type="button" class="btn btn-primary btn-lg">Kiểm tra đáp án</button>
          `}
        </div>

        <div id="pq-feedback" class="surface-card practice-feedback" style="padding:18px 20px;display:${practiceChecked || practiceHints > 0 ? 'block' : 'none'};">
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

    const hintBtn = document.getElementById('pq-hint-btn');
    if (hintBtn) {
      hintBtn.addEventListener('click', () => {
        if (practiceChecked || !lesson || practiceHints >= lesson.reasoning.length) return;
        practiceHints++;
        renderPractice();
      });
    }

    const checkBtn = document.getElementById('pq-check-btn');
    if (checkBtn) {
      checkBtn.addEventListener('click', () => {
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
    }

    const nextBtn = document.getElementById('pq-next-btn');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => openPractice(practiceFilter, null));
    }

    if (practiceChecked) {
      mountInlineQuestionViz(practiceQ, 'pq', 'practice');
    }
  }

  function renderPracticeFeedbackHtml() {
    if (practiceChecked) {
      const ok = practiceSelected === practiceQ.correct;
      const correctIdx = practiceQ.options.indexOf(practiceQ.correct);
      const chosenIdx = practiceQ.options.indexOf(practiceSelected);
      const correctLetter = correctIdx >= 0 ? String.fromCharCode(65 + correctIdx) : '?';
      const chosenLetter = chosenIdx >= 0 ? String.fromCharCode(65 + chosenIdx) : '?';

      return `
        <div class="result-banner ${ok ? 'result-ok' : 'result-wrong'}" style="margin-bottom:14px;">
          ${ok
            ? `✓ ĐÚNG! Bạn đã chọn đáp án ${chosenLetter}`
            : `✕ CHƯA ĐÚNG — Đã lưu vào Sổ câu sai · Bạn chọn ${chosenLetter}, đáp án đúng là ${correctLetter}`}
        </div>
        ${renderQuestionExplanationHtml(practiceQ, practiceSelected, 'pq')}
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
    setupUntimed: false,
    paletteOpen: false
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
    examState.paletteOpen = false;
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
      if (clockEl) clockEl.textContent = `Tự do · ${examState.answers.filter(Boolean).length}/${examState.questions.length}`;
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
    if (clockEl) clockEl.textContent = `⏱ ${mm}:${ss}`;
  }

  function submitExam() {
    if (!examState.active) return;
    examState.active = false;
    examState.done = true;
    examState.paletteOpen = false;
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
    destroyInlineViz('exam');
    const el = document.getElementById('tab-exam');
    if (!examState.active && !examState.done) {
      const recent = store.state.exams.slice().reverse().slice(0, 8);
      el.innerHTML = `
        <div class="centered-container" style="max-width:760px;">
          <div class="page-header">
            <div>
              <h1 class="page-title">Thi thử trắc nghiệm</h1>
              <p class="page-sub">Chọn nhanh cấu hình đề chuẩn hoặc tùy chỉnh số câu &amp; thời gian</p>
            </div>
          </div>

          <div class="exam-preset-grid">
            <button type="button" class="surface-card exam-preset-card ${examState.setupCount === 29 && examState.setupMinutes === 30 && !examState.setupUntimed ? 'active' : ''}" data-preset="29-30">
              <div style="font-size:11.5px;font-weight:700;color:var(--accent);">ĐỀ CHUẨN IUH</div>
              <div style="font-size:16px;font-weight:700;margin-top:4px;">29 câu · 30 phút</div>
              <div style="font-size:12px;color:var(--text-muted);margin-top:2px;">Phủ đều các dạng thi cuối kì</div>
            </button>
            <button type="button" class="surface-card exam-preset-card ${examState.setupCount === 10 && examState.setupMinutes === 10 && !examState.setupUntimed ? 'active' : ''}" data-preset="10-10">
              <div style="font-size:11.5px;font-weight:700;color:var(--text-soft);">ÔN NHANH</div>
              <div style="font-size:16px;font-weight:700;margin-top:4px;">10 câu · 10 phút</div>
              <div style="font-size:12px;color:var(--text-muted);margin-top:2px;">Kiểm tra nhanh kiến thức</div>
            </button>
          </div>

          <div class="surface-card" style="padding:20px;display:flex;flex-direction:column;gap:16px;">
            <div class="grid-2">
              <div class="surface-sub" style="padding:14px;">
                <div style="display:flex;justify-content:space-between;font-size:13px;font-weight:600;margin-bottom:10px;">
                  <span>Số câu hỏi</span>
                  <span id="ex-cnt-readout" class="font-mono-code" style="color:var(--accent);">${examState.setupCount} câu</span>
                </div>
                <input id="ex-cnt-range" type="range" min="5" max="100" value="${examState.setupCount}" class="sim-slider" style="width:100%;" />
              </div>

              <div class="surface-sub" style="padding:14px;">
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
              <button id="ex-start-btn" type="button" class="btn btn-primary btn-lg" style="width:100%;">Bắt đầu đề mới →</button>
            </div>
          </div>

          <div class="surface-card" style="padding:18px 20px;">
            <strong style="font-size:14.5px;">Lịch sử thi thử gần đây</strong>
            ${recent.length ? `
              <div style="margin-top:10px;display:flex;flex-direction:column;gap:8px;">
                ${recent.map((x) => {
                  const grade = (10 * x.correct / x.total).toFixed(2);
                  return `<div class="surface-sub" style="padding:10px 13px;display:flex;justify-content:space-between;font-size:12.5px;">
                    <span>${esc(x.date)}</span>
                    <strong>${x.correct} / ${x.total} đúng · ${grade} / 10</strong>
                  </div>`;
                }).join('')}
              </div>
            ` : '<p style="margin:10px 0 0;font-size:12.5px;color:var(--text-muted);">Chưa có bài thi thử nào được nộp.</p>'}
          </div>
        </div>
      `;

      el.querySelectorAll('[data-preset]').forEach((b) => {
        b.addEventListener('click', () => {
          const parts = b.dataset.preset.split('-').map(Number);
          examState.setupCount = parts[0];
          examState.setupMinutes = parts[1];
          examState.setupUntimed = false;
          renderExam();
        });
      });
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
    const chosen = examState.answers[examState.index];
    const isUnanswered = chosen === null;
    const isCorrect = !isUnanswered && chosen === q.correct;
    const isWrong = !isUnanswered && chosen !== q.correct;
    const correctIdx = q.options.indexOf(q.correct);
    const chosenIdx = isUnanswered ? -1 : q.options.indexOf(chosen);
    const correctLetter = correctIdx >= 0 ? String.fromCharCode(65 + correctIdx) : '?';
    const chosenLetter = chosenIdx >= 0 ? String.fromCharCode(65 + chosenIdx) : '?';

    const answeredCount = examState.answers.filter((a) => a !== null).length;
    const correctCount = examState.done ? examState.questions.filter((item, idx) => examState.answers[idx] === item.correct).length : 0;
    const skippedCount = examState.done ? examState.answers.filter((a) => a === null).length : 0;
    const wrongCount = examState.done ? (examState.questions.length - correctCount - skippedCount) : 0;
    const grade = examState.done ? (10 * correctCount / examState.questions.length).toFixed(2) : '';

    el.innerHTML = `
      <div class="centered-container" style="max-width:960px;">
        <div class="surface-card" style="padding:11px 14px;display:flex;align-items:center;justify-content:space-between;gap:8px;">
          <div id="exam-clock" class="font-mono-code" style="font-size:12.5px;font-weight:700;padding:6px 10px;border-radius:9px;background:${examState.done ? 'var(--emerald-soft)' : 'var(--amber-soft)'};color:${examState.done ? 'var(--emerald-text)' : 'var(--amber-text)'};">
            ${examState.done ? `${correctCount}/${examState.questions.length} · ${grade}đ` : ''}
          </div>

          <button id="ex-palette-trigger" type="button" class="btn exam-palette-trigger">
            ${examState.done
              ? `Câu ${examState.index + 1}/${examState.questions.length} · ✓${correctCount} ✕${wrongCount + skippedCount} ▾`
              : `Câu ${examState.index + 1}/${examState.questions.length} (${answeredCount} đã chọn) ▾`}
          </button>

          <div style="display:flex;align-items:center;gap:6px;">
            <div class="exam-desktop-header-btns" style="display:flex;gap:6px;">
              <button id="ex-prev-q" type="button" class="btn" ${examState.index === 0 ? 'disabled' : ''}>◀ Câu trước</button>
              <button id="ex-next-q" type="button" class="btn" ${examState.index >= examState.questions.length - 1 ? 'disabled' : ''}>Câu tiếp ▶</button>
            </div>
            <button id="ex-submit-btn" type="button" class="btn btn-primary">${examState.done ? 'Đề mới' : 'Nộp bài'}</button>
          </div>
        </div>

        <div id="exam-sheet-backdrop" class="overlay-backdrop ${examState.paletteOpen ? 'open' : ''}"></div>

        <div class="exam-active-grid">
          <div class="surface-card" style="padding:20px;display:flex;flex-direction:column;gap:16px;">
            <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
              <span class="brand-pill">Câu ${examState.index + 1} / ${examState.questions.length} · ${esc(lessonLabel(q.type))}</span>
              <span class="hide-xs" style="font-size:12px;color:var(--text-muted);">Đã chọn ${answeredCount}/${examState.questions.length}</span>
            </div>
            <div style="font-size:15px;font-weight:600;line-height:1.65;white-space:pre-wrap;">${esc(q.prompt)}</div>

            ${examState.done ? `
              <div class="result-banner ${isCorrect ? 'result-ok' : (isUnanswered ? 'result-missed' : 'result-wrong')}">
                ${isCorrect
                  ? `✓ Bạn trả lời ĐÚNG · Đã chọn đáp án ${chosenLetter}`
                  : (isUnanswered
                    ? `✕ Bạn bỏ trống câu này (chưa chọn) — Tính sai · Đáp án đúng là ${correctLetter}`
                    : `✕ Bạn trả lời SAI · Bạn chọn ${chosenLetter}, đáp án đúng là ${correctLetter}`)}
              </div>
            ` : ''}

            <div class="options-grid">
              ${q.options.map((opt, idx) => {
                let cls = 'option-card';
                let tagHtml = '';
                if (examState.done) {
                  if (isUnanswered) {
                    if (opt === q.correct) {
                      cls += ' missed';
                      tagHtml = '<span class="option-tag tag-missed">Bỏ trống · Đáp án đúng</span>';
                    } else {
                      cls += ' dimmed';
                    }
                  } else if (isCorrect) {
                    if (opt === q.correct) {
                      cls += ' correct';
                      tagHtml = '<span class="option-tag tag-correct">✓ Bạn chọn · Đúng</span>';
                    } else {
                      cls += ' dimmed';
                    }
                  } else {
                    if (opt === chosen) {
                      cls += ' wrong';
                      tagHtml = '<span class="option-tag tag-wrong">✕ Bạn chọn</span>';
                    } else if (opt === q.correct) {
                      cls += ' correct';
                      tagHtml = '<span class="option-tag tag-correct">✓ Đáp án đúng</span>';
                    } else {
                      cls += ' dimmed';
                    }
                  }
                } else if (chosen === opt) {
                  cls += ' selected';
                  tagHtml = '<span class="option-tag tag-selected">Đang chọn</span>';
                }
                return `
                  <button type="button" class="${cls}" data-exopt="${idx}" ${examState.done ? 'disabled' : ''}>
                    <span class="option-letter">${String.fromCharCode(65 + idx)}</span>
                    <span class="option-text" style="white-space:pre-wrap;">${esc(opt)}</span>
                    ${tagHtml}
                  </button>
                `;
              }).join('')}
            </div>

            ${examState.done ? `
              <div class="exam-review-explain">
                ${renderQuestionExplanationHtml(q, chosen, 'ex')}
              </div>
            ` : ''}
          </div>

          <div id="exam-palette-panel" class="surface-card exam-palette-panel ${examState.paletteOpen ? 'sheet-open' : ''}" style="padding:14px 16px;">
            <div class="exam-sheet-head">
              <strong style="font-size:14px;">Danh sách ${examState.questions.length} câu hỏi</strong>
              <button id="ex-palette-close" type="button" class="btn btn-ghost" style="padding:4px 8px;">✕ Đóng</button>
            </div>
            <div class="hide-xs" style="font-size:12px;font-weight:700;color:var(--text-muted);margin-bottom:8px;">Bảng câu hỏi</div>
            ${examState.done ? `
              <div class="exam-palette-summary">
                <span class="sum-ok">✓ Đúng: ${correctCount}</span>
                <span class="sum-bad">✕ Sai: ${wrongCount}</span>
                <span class="sum-skip">○ Bỏ trống: ${skippedCount}</span>
              </div>
            ` : ''}
            <div class="exam-palette">
              ${examState.questions.map((item, idx) => {
                let cls = 'exam-num-btn';
                let title = `Câu ${idx + 1}`;
                if (idx === examState.index) cls += ' current';
                if (examState.done) {
                  const ansVal = examState.answers[idx];
                  if (ansVal === item.correct) {
                    cls += ' ok';
                    title += ': Đúng';
                  } else if (ansVal === null) {
                    cls += ' bad skipped';
                    title += ': Bỏ trống (tính sai)';
                  } else {
                    cls += ' bad';
                    title += ': Sai';
                  }
                } else if (examState.answers[idx] !== null) {
                  cls += ' answered';
                }
                return `<button type="button" class="${cls}" data-exq="${idx}" title="${esc(title)}">${idx + 1}</button>`;
              }).join('')}
            </div>
          </div>
        </div>

        <div class="exam-mobile-footer">
          <button id="ex-prev-q-mob" type="button" class="btn btn-lg" ${examState.index === 0 ? 'disabled' : ''}>◀ Câu trước</button>
          <button id="ex-next-q-mob" type="button" class="btn btn-primary btn-lg" ${examState.index >= examState.questions.length - 1 ? 'disabled' : ''}>Câu tiếp ▶</button>
        </div>
      </div>
    `;

    if (!examState.done) tickExamClock();
    else mountInlineQuestionViz(q, 'ex', 'exam');

    const goPrevQ = () => { examState.index = Math.max(0, examState.index - 1); renderExam(); };
    const goNextQ = () => { examState.index = Math.min(examState.questions.length - 1, examState.index + 1); renderExam(); };
    document.getElementById('ex-prev-q').addEventListener('click', goPrevQ);
    document.getElementById('ex-next-q').addEventListener('click', goNextQ);
    document.getElementById('ex-prev-q-mob').addEventListener('click', goPrevQ);
    document.getElementById('ex-next-q-mob').addEventListener('click', goNextQ);

    const openPalette = (open) => {
      examState.paletteOpen = open;
      const p = document.getElementById('exam-palette-panel');
      const bd = document.getElementById('exam-sheet-backdrop');
      if (p) p.classList.toggle('sheet-open', open);
      if (bd) bd.classList.toggle('open', open);
    };
    document.getElementById('ex-palette-trigger').addEventListener('click', () => openPalette(!examState.paletteOpen));
    document.getElementById('ex-palette-close').addEventListener('click', () => openPalette(false));
    document.getElementById('exam-sheet-backdrop').addEventListener('click', () => openPalette(false));

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
        examState.paletteOpen = false;
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
        let q = { ...m.question, trace: m.question.trace || [] };
        if (m.question.type && m.question.seed) {
          try {
            const fresh = Questions.make(m.question.type, m.question.seed, 2);
            if (fresh && fresh.prompt === m.question.prompt && fresh.correct === m.question.correct) {
              q = { ...fresh, id: m.question.id };
            }
          } catch (err) {
            // Keep stored question fallback
          }
        }
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
  applySidebarPinned(store.getPref('sidebarPinned'), false);

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
    selectLesson: (id) => {
      selectedLessonId = id;
      selectedLessonSubTab = 'overview';
      renderLessonList();
      renderLessonDetail();
    },
    setBubbleDir: (dir) => {
      store.setPref('bubbleDir', dir);
      buildSimSteps(0);
    },
    setAvlBfMode: (mode) => {
      store.setPref('avlBfMode', mode);
      simViz.avlBfMode = mode;
      renderSimCtxBar();
      simViz.renderCurrent();
    },
    setTreeReplaceSide: (side, keepIdx = simIndex) => {
      store.setPref('treeReplaceSide', side);
      buildSimSteps(keepIdx);
    },
    getSimState: () => ({ mode: simMode, index: simIndex, count: simSteps.length, steps: simSteps }),
    renderSimAtProgress: (fromIdx, toIdx, rawT) => {
      simIndex = toIdx;
      updateSimReadout();
      if (fromIdx === toIdx && rawT >= 1) {
        simViz.transitionTo(toIdx, toIdx, true);
      } else {
        simViz.renderFrame(simSteps[fromIdx], simSteps[toIdx], rawT, Math.abs(toIdx - fromIdx) === 1);
      }
    }
  };
})();
