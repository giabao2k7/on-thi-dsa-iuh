// DSA Studio IUH — LocalStorage Persistence & Backup/Restore Store

(function (root) {
  'use strict';

  const STORAGE_KEY = 'dsa_studio_iuh_v2';

  const DEFAULT_SIM_STATE = {
    bubble: { arr: '8, 3, 7, 1, 6, 2', key: '' },
    selection: { arr: '6, 2, 9, 1, 5, 3', key: '' },
    insertion: { arr: '7, 3, 5, 1, 6, 2', key: '' },
    interchange: { arr: '5, 3, 4, 1, 6, 2', key: '' },
    quick: { arr: '12, 2, 8, 5, 1, 6, 4, 15', key: '' },
    binary: { arr: '2, 5, 8, 11, 14, 17, 20', key: '14' },
    stack: { arr: '5, 8, -1, 2, 7, -1', key: '' },
    queue: { arr: '5, 8, -1, 2, 7, -1', key: '' },
    postfix: { arr: '8 3 2 * - 4 +', key: '' },
    linked: { arr: '1, 2, 3, 4, 5, 6, 7', key: '' },
    bst: { arr: '8, 3, 12, 1, 6, 10, 14', key: '' },
    avl: { arr: '30, 10, 20, 40, 50', key: '' }
  };

  function cloneDefaults() {
    const out = {};
    Object.keys(DEFAULT_SIM_STATE).forEach((k) => {
      out[k] = { ...DEFAULT_SIM_STATE[k] };
    });
    return out;
  }

  function defaultPrefs() {
    return {
      bubbleDir: 'rtl',
      avlBfMode: 'iuh',
      treeReplaceSide: 'right',
      sidebarPinned: false
    };
  }

  function defaultState() {
    return {
      version: 2,
      theme: 'dark',
      attempts: [],
      mistakes: [],
      exams: [],
      prefs: defaultPrefs(),
      simModeState: cloneDefaults()
    };
  }

  function sanitizeQuestionForSave(q) {
    return {
      id: q.id,
      type: q.type,
      seed: q.seed,
      prompt: q.prompt,
      correct: q.correct,
      options: Array.isArray(q.options) ? q.options.slice() : [],
      explanation: q.explanation || '',
      simPreset: q.simPreset ? { ...q.simPreset } : null
    };
  }

  class Store {
    constructor() {
      this.state = defaultState();
      this.load();
    }

    load() {
      try {
        const raw = root.localStorage ? root.localStorage.getItem(STORAGE_KEY) : null;
        if (!raw) return;
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object') return;
        this.state = {
          version: 2,
          theme: parsed.theme === 'light' ? 'light' : 'dark',
          attempts: Array.isArray(parsed.attempts) ? parsed.attempts : [],
          mistakes: Array.isArray(parsed.mistakes) ? parsed.mistakes : [],
          exams: Array.isArray(parsed.exams) ? parsed.exams : [],
          prefs: { ...defaultPrefs(), ...(parsed.prefs || {}) },
          simModeState: { ...cloneDefaults(), ...(parsed.simModeState || {}) }
        };
      } catch (e) {
        this.state = defaultState();
      }
    }

    save() {
      try {
        if (root.localStorage) {
          root.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
        }
      } catch (e) {
        // Ignore quota errors gracefully
      }
    }

    setTheme(theme) {
      this.state.theme = theme === 'light' ? 'light' : 'dark';
      this.save();
    }

    getPref(key) {
      return (this.state.prefs && this.state.prefs[key]) || defaultPrefs()[key];
    }

    setPref(key, val) {
      if (!this.state.prefs) this.state.prefs = defaultPrefs();
      this.state.prefs[key] = val;
      this.save();
    }

    getSimInput(mode) {
      return this.state.simModeState[mode] || DEFAULT_SIM_STATE[mode] || { arr: '', key: '' };
    }

    setSimInput(mode, arr, key) {
      if (!this.state.simModeState[mode]) {
        this.state.simModeState[mode] = { arr: '', key: '' };
      }
      this.state.simModeState[mode].arr = String(arr || '');
      this.state.simModeState[mode].key = String(key || '');
      this.save();
    }

    recordAttempt(q, chosen) {
      const ok = chosen === q.correct;
      const nowIso = new Date().toISOString();
      this.state.attempts.push({ id: q.id, type: q.type, correct: ok, date: nowIso });
      const old = this.state.mistakes.find((x) => x.question && x.question.id === q.id);
      if (old) {
        old.reviews = (old.reviews || 0) + 1;
        old.resolved = ok;
        if (!ok) old.chosen = chosen || 'Chưa trả lời';
      } else if (!ok) {
        this.state.mistakes.push({
          question: sanitizeQuestionForSave(q),
          chosen: chosen || 'Chưa trả lời',
          date: nowIso,
          resolved: false,
          reviews: 0
        });
      }
      this.save();
    }

    recordExam(correct, total, seconds) {
      const d = new Date();
      const pad = (n) => String(n).padStart(2, '0');
      const label = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
      this.state.exams.push({ date: label, correct, total, seconds });
      this.save();
    }

    exportJson() {
      return JSON.stringify(this.state, null, 2);
    }

    importJson(jsonText) {
      const parsed = JSON.parse(jsonText);
      if (!parsed || !Array.isArray(parsed.attempts) || !Array.isArray(parsed.mistakes) || !Array.isArray(parsed.exams)) {
        throw new Error('File sao lưu không đúng định dạng DSA Studio.');
      }
      this.state = {
        version: 2,
        theme: parsed.theme === 'light' ? 'light' : 'dark',
        attempts: parsed.attempts,
        mistakes: parsed.mistakes,
        exams: parsed.exams,
        prefs: { ...defaultPrefs(), ...(parsed.prefs || {}) },
        simModeState: { ...cloneDefaults(), ...(parsed.simModeState || {}) }
      };
      this.save();
    }

    resetAll() {
      this.state = defaultState();
      this.save();
    }
  }

  root.DSA_STORE = Store;
})(typeof window !== 'undefined' ? window : globalThis);
