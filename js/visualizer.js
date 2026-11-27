// DSA Studio IUH — 60fps HTML5 Canvas Algorithm Visualizer
// Supports all 11 modes: Bubble, Selection, Insertion, Interchange, Binary Search,
// Stack, Queue, Postfix, Linked List, BST, and AVL (with search-path traversal & smooth rotations).

(function (root) {
  'use strict';

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function easeOutBack(t) {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function roundRectPath(ctx, x, y, w, h, r) {
    const rr = Math.max(0, Math.min(r, w / 2, h / 2));
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  }

  function drawPill(ctx, text, cx, cy, bg, border, fg, fontSize = 12) {
    ctx.save();
    ctx.font = `700 ${fontSize}px "Cascadia Code", Consolas, monospace`;
    const w = ctx.measureText(text).width + 16;
    const h = 22;
    roundRectPath(ctx, cx - w / 2, cy - h / 2, w, h, 8);
    ctx.fillStyle = bg;
    ctx.fill();
    if (border) {
      ctx.strokeStyle = border;
      ctx.lineWidth = 1.4;
      ctx.stroke();
    }
    ctx.fillStyle = fg;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, cx, cy + 0.5);
    ctx.restore();
  }

  function getPalette(theme) {
    if (theme === 'dark') {
      return {
        bg: '#0d1526',
        grid: 'rgba(148, 163, 184, 0.055)',
        tileBg: '#1e293b',
        tileBorder: '#334155',
        tileText: '#f8fafc',
        slotEmpty: 'rgba(148, 163, 184, 0.24)',
        muted: '#94a3b8',
        accent: '#14b8a6',
        accentBg: 'rgba(20, 184, 166, 0.22)',
        compareBg: 'rgba(245, 158, 11, 0.22)',
        compareBorder: '#f59e0b',
        compareText: '#fde68a',
        swapBg: 'rgba(244, 63, 94, 0.24)',
        swapBorder: '#f43f5e',
        swapText: '#fecdd3',
        sortedBg: 'rgba(16, 185, 129, 0.22)',
        sortedBorder: '#10b981',
        sortedText: '#a7f3d0',
        edge: '#475569',
        edgeHighlight: '#f59e0b',
        bracketBg: 'rgba(20, 184, 166, 0.10)',
        bracketBorder: 'rgba(20, 184, 166, 0.55)',
        containerBorder: '#334155',
        bfPillBg: '#1e293b'
      };
    }
    return {
      bg: '#f8fafc',
      grid: 'rgba(15, 23, 42, 0.045)',
      tileBg: '#ffffff',
      tileBorder: '#cbd5e1',
      tileText: '#0f172a',
      slotEmpty: '#cbd5e1',
      muted: '#64748b',
      accent: '#0d9488',
      accentBg: 'rgba(13, 148, 136, 0.14)',
      compareBg: '#fef3c7',
      compareBorder: '#d97706',
      compareText: '#92400e',
      swapBg: '#ffe4e6',
      swapBorder: '#e11d48',
      swapText: '#9f1239',
      sortedBg: '#d1fae5',
      sortedBorder: '#059669',
      sortedText: '#065f46',
      edge: '#94a3b8',
      edgeHighlight: '#d97706',
      bracketBg: 'rgba(13, 148, 136, 0.09)',
      bracketBorder: 'rgba(13, 148, 136, 0.50)',
      containerBorder: '#cbd5e1',
      bfPillBg: '#e2e8f0'
    };
  }

  class DsaVisualizer {
    constructor(canvas, wrapEl, getThemeFn) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.wrap = wrapEl;
      this.getTheme = getThemeFn || (() => 'dark');

      this.steps = [];
      this.currentIndex = 0;
      this.mode = 'bubble';
      this.avlBfMode = 'iuh';
      this.speed = 1;
      this.animState = null;
      this.rafId = null;

      this._resizeObserver = new ResizeObserver(() => {
        this.resize();
        this.renderCurrent();
      });
      if (this.wrap) this._resizeObserver.observe(this.wrap);
    }

    resize() {
      if (!this.wrap) return;
      const rect = this.wrap.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const dpr = Math.min(root.devicePixelRatio || 1, 2);
      this.canvas.width = Math.round(rect.width * dpr);
      this.canvas.height = Math.round(rect.height * dpr);
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    setData(mode, steps) {
      this.mode = mode;
      this.steps = steps || [];
      this.currentIndex = 0;
      this.animState = null;
      if (this.rafId) {
        cancelAnimationFrame(this.rafId);
        this.rafId = null;
      }
      this.renderCurrent();
    }

    transitionTo(fromIdx, toIdx, instant = false) {
      if (this.rafId) {
        cancelAnimationFrame(this.rafId);
        this.rafId = null;
      }
      this.currentIndex = toIdx;
      const fromStep = this.steps[fromIdx];
      const toStep = this.steps[toIdx];
      if (!fromStep || !toStep) return;

      if (instant || fromIdx === toIdx) {
        this.animState = null;
        this.renderFrame(toStep, toStep, 1, false);
        return;
      }

      const isSingle = Math.abs(toIdx - fromIdx) === 1;
      const isTree = toStep.kind === 'tree';
      const baseMs = isSingle ? (isTree ? 620 : 520) : 280;
      const duration = baseMs / this.speed;

      this.animState = {
        fromStep,
        toStep,
        fromIndex: fromIdx,
        toIndex: toIdx,
        startTime: performance.now(),
        duration
      };

      const tick = (now) => {
        if (!this.animState) return;
        const rawT = Math.min(1, (now - this.animState.startTime) / this.animState.duration);
        this.renderFrame(this.animState.fromStep, this.animState.toStep, rawT, isSingle);
        if (rawT < 1) {
          this.rafId = requestAnimationFrame(tick);
        } else {
          this.animState = null;
          this.rafId = null;
        }
      };
      this.rafId = requestAnimationFrame(tick);
    }

    renderCurrent() {
      if (!this.steps.length) return;
      if (this.animState) {
        const rawT = Math.min(1, (performance.now() - this.animState.startTime) / this.animState.duration);
        const isSingle = Math.abs(this.animState.toIndex - this.animState.fromIndex) === 1;
        this.renderFrame(this.animState.fromStep, this.animState.toStep, rawT, isSingle);
        if (rawT >= 1) this.animState = null;
      } else {
        const st = this.steps[this.currentIndex];
        if (st) this.renderFrame(st, st, 1, false);
      }
    }

    renderFrame(fromStep, toStep, rawT, singleStepDiff) {
      if (!this.wrap || !toStep) return;
      const rect = this.wrap.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const W = rect.width;
      const H = rect.height;
      const pal = getPalette(this.getTheme());

      this._drawGrid(W, H, pal);

      if (toStep.kind === 'tree') {
        this._drawTree(fromStep, toStep, rawT, W, H, pal);
      } else if (toStep.kind === 'stack') {
        this._drawStack(fromStep, toStep, rawT, W, H, pal);
      } else if (toStep.kind === 'queue') {
        this._drawQueue(fromStep, toStep, rawT, W, H, pal);
      } else if (toStep.kind === 'postfix') {
        this._drawPostfix(fromStep, toStep, rawT, W, H, pal);
      } else if (toStep.kind === 'linked') {
        this._drawLinked(fromStep, toStep, rawT, singleStepDiff, W, H, pal);
      } else {
        this._drawArray(fromStep, toStep, rawT, singleStepDiff, W, H, pal);
      }
    }

    _drawGrid(W, H, pal) {
      const ctx = this.ctx;
      ctx.fillStyle = pal.bg;
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = pal.grid;
      for (let x = 24; x < W; x += 24) {
        for (let y = 24; y < H; y += 24) {
          ctx.fillRect(x, y, 1.5, 1.5);
        }
      }
    }

    // ---------------------------------------------------------
    // ARRAY / SORTING / BINARY SEARCH
    // ---------------------------------------------------------
    _computeArrayLayout(step, W, H) {
      const slots = step.slots || (step.values || []).map((v, i) => ({ uid: i + 1, val: v }));
      const n = slots.length;
      const isNarrow = W < 520;
      const pad = isNarrow ? 24 : 96;
      const gap = isNarrow
        ? Math.min(10, Math.max(4, Math.floor(W / Math.max(n * 8, 1))))
        : Math.min(18, Math.max(7, Math.floor(Math.min(68, Math.max(40, Math.floor((W - pad) / Math.max(n, 1)) - 12)) * 0.24)));
      const tileW = isNarrow
        ? Math.min(54, Math.max(24, Math.floor((W - pad - Math.max(0, n - 1) * gap) / Math.max(n, 1))))
        : Math.min(68, Math.max(40, Math.floor((W - pad) / Math.max(n, 1)) - 12));
      const tileH = isNarrow ? Math.min(54, Math.max(40, tileW + 8)) : 58;
      const stepX = tileW + gap;
      const totalW = n * tileW + Math.max(0, n - 1) * gap;
      const startX = (W - totalW) / 2;
      const isInsertion = this.mode === 'insertion';
      const baseY = isInsertion ? Math.round(H * 0.58) : Math.round(H * 0.46);
      const heldY = Math.round(H * 0.23);

      const tiles = {};
      slots.forEach((item, idx) => {
        if (!item) return;
        const x = startX + idx * stepX;
        let state = 'default';
        if (step.kind === 'binary') {
          if (step.found === idx) state = 'sorted';
          else if (step.mid === idx) state = 'compare';
          else if (idx < step.low || idx > step.high) state = 'dim';
        } else {
          if (step.swap && step.swap.includes(idx)) state = 'swap';
          else if (step.compare && step.compare.includes(idx)) state = 'compare';
          else if (step.sorted && step.sorted.includes(idx)) state = 'sorted';
        }
        const lift = state === 'compare' ? -10 : (state === 'dim' ? 6 : 0);
        tiles[item.uid] = {
          uid: item.uid,
          val: item.val,
          idx,
          x,
          y: baseY + lift,
          alpha: state === 'dim' ? 0.34 : 1,
          scale: step.found === idx ? 1.07 : 1,
          state
        };
      });

      if (step.held) {
        const h = step.held;
        tiles[h.uid] = {
          uid: h.uid,
          val: h.val,
          idx: h.overSlot,
          x: startX + h.overSlot * stepX,
          y: heldY,
          alpha: 1,
          scale: 1.04,
          state: 'compare',
          isHeld: true
        };
      }

      const pointers = {};
      if (step.pointers) {
        Object.keys(step.pointers).forEach((k) => {
          const idx = step.pointers[k];
          if (idx >= 0 && idx < n) pointers[k] = startX + idx * stepX + tileW / 2;
        });
      }

      return { n, tileW, tileH, stepX, startX, baseY, heldY, tiles, pointers };
    }

    _drawArray(fromStep, toStep, rawT, singleStepDiff, W, H, pal) {
      const ctx = this.ctx;
      const t = easeInOutCubic(rawT);
      const isNarrow = W < 520;
      const fromL = this._computeArrayLayout(fromStep, W, H);
      const toL = this._computeArrayLayout(toStep, W, H);

      ctx.save();
      ctx.font = isNarrow ? '700 11px "Segoe UI", sans-serif' : '700 12px "Segoe UI", sans-serif';
      ctx.fillStyle = pal.muted;
      ctx.textAlign = 'left';
      const headerLabel = this.mode === 'insertion'
        ? (isNarrow ? 'BIẾN TẠM x & MẢNG' : 'VÙNG GIỮ TẠM (x)  &  MẢNG CHÍNH (chỉ số từ 0)')
        : (toStep.kind === 'binary'
          ? (isNarrow ? 'TÌM NHỊ PHÂN [left .. right]' : 'TÌM KIẾM NHỊ PHÂN • VÙNG [left .. right] THU HẸP MƯỢT')
          : (toStep.kind === 'quick'
            ? (isNarrow ? 'QUICK SORT (IUH)' : 'QUICK SORT (SLIDE IUH) • CHỌN MỐC GIỮA x = a[(left+right)/2] & PHÂN HOẠCH')
            : (isNarrow ? 'MẢNG (chỉ số 0)' : 'MẢNG • CHỈ SỐ TỪ 0')));
      ctx.fillText(headerLabel, isNarrow ? 14 : 24, isNarrow ? 24 : 28);
      if (toStep.kind === 'quick' && toStep.pivotVal !== null && toStep.pivotVal !== undefined) {
        drawPill(ctx, `Mốc x = ${toStep.pivotVal}`, isNarrow ? W - 56 : W - 80, isNarrow ? 22 : 26, pal.compareBg, pal.compareBorder, pal.compareText, isNarrow ? 11 : 12);
      }
      ctx.restore();

      if (toStep.kind === 'quick' && (fromStep.range || toStep.range)) {
        const fR = fromStep.range || toStep.range;
        const tR = toStep.range || fromStep.range;
        if (fR && tR) {
          const curLo = lerp(fR[0], tR[0], t);
          const curHi = lerp(fR[1], tR[1], t);
          const boxX = toL.startX + curLo * toL.stepX - 10;
          const boxW = Math.max(0, (curHi - curLo) * toL.stepX + toL.tileW + 20);
          if (boxW > 4) {
            ctx.save();
            roundRectPath(ctx, boxX, toL.baseY - 18, boxW, toL.tileH + 36, 16);
            ctx.fillStyle = pal.bracketBg;
            ctx.fill();
            ctx.strokeStyle = pal.bracketBorder;
            ctx.lineWidth = 1.6;
            ctx.stroke();
            ctx.restore();
          }
        }
      }

      if (this.mode === 'insertion' && toL.n > 0) {
        ctx.save();
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = pal.slotEmpty;
        ctx.lineWidth = 1.4;
        const laneW = toL.n * toL.stepX - (toL.stepX - toL.tileW) + 20;
        roundRectPath(ctx, toL.startX - 10, toL.heldY - 10, laneW, toL.tileH + 20, 14);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.font = '600 12px "Segoe UI", sans-serif';
        ctx.fillStyle = pal.muted;
        ctx.fillText('Biến tạm x', toL.startX - 4, toL.heldY - 16);
        ctx.restore();
      }

      if (toStep.kind === 'binary') {
        const validFrom = fromStep.low <= fromStep.high;
        const validTo = toStep.low <= toStep.high;
        if (validFrom || validTo) {
          const fLo = validFrom ? fromStep.low : toStep.low;
          const fHi = validFrom ? fromStep.high : toStep.high;
          const tLo = validTo ? toStep.low : fromStep.low;
          const tHi = validTo ? toStep.high : fromStep.high;
          const curLo = lerp(fLo, tLo, t);
          const curHi = lerp(fHi, tHi, t);
          const boxX = toL.startX + curLo * toL.stepX - 10;
          const boxW = Math.max(0, (curHi - curLo) * toL.stepX + toL.tileW + 20);
          const alpha = lerp(validFrom ? 1 : 0, validTo ? 1 : 0, t);
          if (boxW > 4 && alpha > 0.02) {
            ctx.save();
            ctx.globalAlpha = alpha;
            roundRectPath(ctx, boxX, toL.baseY - 18, boxW, toL.tileH + 36, 16);
            ctx.fillStyle = pal.bracketBg;
            ctx.fill();
            ctx.strokeStyle = pal.bracketBorder;
            ctx.lineWidth = 1.8;
            ctx.stroke();
            ctx.restore();
          }
        }
      }

      for (let idx = 0; idx < toL.n; idx++) {
        const sx = toL.startX + idx * toL.stepX;
        ctx.save();
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = pal.slotEmpty;
        ctx.lineWidth = 1.3;
        roundRectPath(ctx, sx, toL.baseY, toL.tileW, toL.tileH, 12);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.font = '600 12px "Cascadia Code", monospace';
        ctx.fillStyle = pal.muted;
        ctx.textAlign = 'center';
        ctx.fillText(String(idx), sx + toL.tileW / 2, toL.baseY + toL.tileH + 20);
        ctx.restore();
      }

      const allUids = new Set([...Object.keys(fromL.tiles), ...Object.keys(toL.tiles)]);
      const movedTiles = [];
      allUids.forEach((uid) => {
        const a = fromL.tiles[uid];
        const b = toL.tiles[uid];
        if (a && b && a.idx !== b.idx && !a.isHeld && !b.isHeld && this.mode !== 'insertion') {
          movedTiles.push({ uid, delta: b.idx - a.idx });
        }
      });

      const drawList = [];
      allUids.forEach((uid) => {
        const a = fromL.tiles[uid] || toL.tiles[uid];
        const b = toL.tiles[uid] || fromL.tiles[uid];
        const x = lerp(a.x, b.x, t);
        let y = lerp(a.y, b.y, t);

        if (singleStepDiff && movedTiles.length === 2 && a.idx !== b.idx && !a.isHeld && !b.isHeld && this.mode !== 'insertion') {
          const dist = Math.abs(b.idx - a.idx);
          const arcHeight = Math.min(54, 28 + dist * 6);
          const dir = b.idx > a.idx ? -1 : 1;
          y += dir * arcHeight * Math.sin(Math.PI * t);
        }

        const state = rawT < 0.5 ? a.state : b.state;
        const scale = lerp(a.scale, b.scale, t);
        const alpha = lerp(a.alpha, b.alpha, t);
        drawList.push({ val: b.val, x, y, state, scale, alpha, z: (a.idx !== b.idx || b.isHeld) ? 2 : 1 });
      });

      drawList.sort((p, q) => p.z - q.z);
      drawList.forEach((tile) => {
        this._drawTile(tile.x, tile.y, toL.tileW, toL.tileH, tile.val, tile.state, tile.scale, tile.alpha, pal);
      });

      this._drawPointerPills(fromL.pointers, toL.pointers, t, toL.baseY + toL.tileH + 46, pal);
    }

    _drawTile(x, y, w, h, val, state, scale, alpha, pal) {
      const ctx = this.ctx;
      ctx.save();
      ctx.globalAlpha = alpha;
      const cx = x + w / 2;
      const cy = y + h / 2;
      ctx.translate(cx, cy);
      ctx.scale(scale, scale);

      let bg = pal.tileBg, border = pal.tileBorder, fg = pal.tileText, lw = 1.6;
      if (state === 'compare') { bg = pal.compareBg; border = pal.compareBorder; fg = pal.compareText; lw = 2.2; }
      else if (state === 'swap') { bg = pal.swapBg; border = pal.swapBorder; fg = pal.swapText; lw = 2.4; }
      else if (state === 'sorted') { bg = pal.sortedBg; border = pal.sortedBorder; fg = pal.sortedText; lw = 2.0; }

      if (state === 'compare' || state === 'swap') {
        ctx.shadowColor = border;
        ctx.shadowBlur = 14;
      }

      roundRectPath(ctx, -w / 2, -h / 2, w, h, 12);
      ctx.fillStyle = bg;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = border;
      ctx.lineWidth = lw;
      ctx.stroke();

      ctx.fillStyle = fg;
      const tileFontSz = w < 36 ? 13 : (w < 46 ? 15 : 17);
      ctx.font = `700 ${tileFontSz}px "Segoe UI", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(val), 0, 1);
      ctx.restore();
    }

    _drawPointerPills(fromPtrs, toPtrs, t, basePillY, pal) {
      const ctx = this.ctx;
      const allKeys = Array.from(new Set([...Object.keys(fromPtrs), ...Object.keys(toPtrs)]));
      const stackOffsets = {};
      allKeys.forEach((key) => {
        const fx = fromPtrs[key];
        const tx = toPtrs[key];
        const px = fx !== undefined && tx !== undefined ? lerp(fx, tx, t) : (tx !== undefined ? tx : fx);
        const alpha = fx !== undefined && tx !== undefined ? 1 : (tx !== undefined ? t : 1 - t);
        if (alpha < 0.05) return;

        const bucket = Math.round(px / 22);
        const row = stackOffsets[bucket] || 0;
        stackOffsets[bucket] = row + 1;
        const py = basePillY + row * 26;

        let bg = pal.accentBg, border = pal.accent, fg = pal.accent;
        if (key === 'j' || key === 'j+1' || key === 'mid' || key === 'q') {
          bg = pal.compareBg; border = pal.compareBorder; fg = pal.compareText;
        } else if (key === 'min' || key === 'pos' || key === 'pos+1') {
          bg = pal.swapBg; border = pal.swapBorder; fg = pal.swapText;
        }
        ctx.save();
        ctx.globalAlpha = alpha;
        drawPill(ctx, key, px, py, bg, border, fg, 12);
        ctx.restore();
      });
    }

    // ---------------------------------------------------------
    // LINKED LIST PAIRWISE SWAP
    // ---------------------------------------------------------
    _drawLinked(fromStep, toStep, rawT, singleStepDiff, W, H, pal) {
      const ctx = this.ctx;
      const t = easeInOutCubic(rawT);
      const isNarrow = W < 520;
      const slots = toStep.slots || [];
      const n = slots.length;
      const nodeW = isNarrow
        ? Math.min(46, Math.max(26, Math.floor((W - 92) / Math.max(n, 1)) - 12))
        : Math.min(72, Math.max(46, Math.floor((W - 160) / Math.max(n, 1)) - 26));
      const arrowGap = isNarrow
        ? Math.max(10, Math.floor(nodeW * 0.34))
        : Math.min(32, Math.max(18, Math.floor(nodeW * 0.42)));
      const stepX = nodeW + arrowGap;
      const totalW = n * nodeW + Math.max(0, n - 1) * arrowGap;
      const startX = isNarrow
        ? Math.max(52, (W - totalW - 14) / 2)
        : Math.max(74, (W - totalW) / 2);
      const baseY = Math.round(H * 0.46);
      const nodeH = isNarrow ? 46 : 54;

      ctx.save();
      ctx.font = isNarrow ? '700 11px "Segoe UI", sans-serif' : '700 12px "Segoe UI", sans-serif';
      ctx.fillStyle = pal.muted;
      ctx.textAlign = 'left';
      ctx.fillText(isNarrow ? 'DSLK ĐƠN • ĐỔI DATA TỪNG CẶP' : 'DANH SÁCH LIÊN KẾT ĐƠN • ĐỔI DỮ LIỆU TỪNG CẶP (KHÔNG ĐỔI NEXT)', isNarrow ? 14 : 24, isNarrow ? 24 : 28);
      ctx.restore();

      const buildMap = (st) => {
        const m = {};
        const ptrs = {};
        (st.slots || []).forEach((it, idx) => {
          if (!it) return;
          let state = 'default';
          if (st.swap && st.swap.includes(idx)) state = 'swap';
          else if (st.compare && st.compare.includes(idx)) state = 'compare';
          else if (st.sorted && st.sorted.includes(idx)) state = 'sorted';
          else if (st.active && st.active.includes(idx)) state = 'compare';
          const lift = state === 'compare' ? -9 : 0;
          m[it.uid] = { uid: it.uid, val: it.val, idx, x: startX + idx * stepX, y: baseY + lift, state };
        });
        if (st.pointers) {
          Object.keys(st.pointers).forEach((k) => {
            const idx = st.pointers[k];
            if (idx >= 0 && idx < n) ptrs[k] = startX + idx * stepX + nodeW / 2;
          });
        }
        return { m, ptrs };
      };

      const fromL = buildMap(fromStep);
      const toL = buildMap(toStep);

      // Draw static linked containers & arrows (since next pointers never change!)
      if (n > 0) {
        drawPill(ctx, 'HEAD', startX - 36, baseY + nodeH / 2, pal.accentBg, pal.accent, pal.accent, 11);
        ctx.save();
        ctx.strokeStyle = pal.accent;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(startX - 12, baseY + nodeH / 2);
        ctx.lineTo(startX - 2, baseY + nodeH / 2);
        ctx.stroke();
        ctx.restore();
      }

      for (let i = 0; i < n; i++) {
        const nx = startX + i * stepX;
        const isLast = i === n - 1;
        // Arrow to next node or NULL
        ctx.save();
        ctx.strokeStyle = pal.muted;
        ctx.lineWidth = 2;
        const ay = baseY + nodeH / 2;
        const ax1 = nx + nodeW;
        const ax2 = isLast ? nx + nodeW + 24 : nx + stepX - 2;
        ctx.beginPath();
        ctx.moveTo(ax1, ay);
        ctx.lineTo(ax2, ay);
        ctx.stroke();
        ctx.fillStyle = pal.muted;
        ctx.beginPath();
        ctx.moveTo(ax2, ay);
        ctx.lineTo(ax2 - 6, ay - 4);
        ctx.lineTo(ax2 - 6, ay + 4);
        ctx.closePath();
        ctx.fill();
        if (isLast) {
          ctx.font = '700 12px "Cascadia Code", monospace';
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
          ctx.fillText('NULL', ax2 + 6, ay);
        }
        // Index label
        ctx.font = '600 12px "Cascadia Code", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(String(i), nx + nodeW / 2, baseY + nodeH + 18);
        ctx.restore();
      }

      // Draw moving value nodes with swap arcs
      const allUids = new Set([...Object.keys(fromL.m), ...Object.keys(toL.m)]);
      const moved = [];
      allUids.forEach((uid) => {
        const a = fromL.m[uid], b = toL.m[uid];
        if (a && b && a.idx !== b.idx) moved.push(uid);
      });

      const list = [];
      allUids.forEach((uid) => {
        const a = fromL.m[uid] || toL.m[uid];
        const b = toL.m[uid] || fromL.m[uid];
        const x = lerp(a.x, b.x, t);
        let y = lerp(a.y, b.y, t);
        if (singleStepDiff && moved.length === 2 && a.idx !== b.idx) {
          const dir = b.idx > a.idx ? -1 : 1;
          y += dir * 36 * Math.sin(Math.PI * t);
        }
        const state = rawT < 0.5 ? a.state : b.state;
        list.push({ val: b.val, x, y, state, z: a.idx !== b.idx ? 2 : 1 });
      });
      list.sort((p, q) => p.z - q.z);
      list.forEach((item) => {
        this._drawTile(item.x, item.y, nodeW, nodeH, item.val, item.state, 1, 1, pal);
      });

      this._drawPointerPills(fromL.ptrs, toL.ptrs, t, baseY + nodeH + 44, pal);
    }

    // ---------------------------------------------------------
    // STACK (3-COLUMN ZERO-OVERLAP LAYOUT)
    // ---------------------------------------------------------
    _computeStackLayout(step, W, H) {
      const stepItems = step.items || [];
      const isNarrow = W < 520;
      const maxVisible = Math.max(6, stepItems.length + 1);
      const boxW = isNarrow
        ? Math.min(116, Math.max(80, Math.round(W * 0.27)))
        : Math.min(164, Math.max(118, Math.round(W * 0.19)));
      const itemH = Math.min(isNarrow ? 34 : 44, Math.floor((H - (isNarrow ? 105 : 120)) / maxVisible));
      const gap = isNarrow ? 5 : 7;
      const cx = isNarrow
        ? Math.max(Math.round(boxW / 2) + 12, Math.round(W * 0.18))
        : Math.max(Math.round(boxW / 2) + 34, Math.round(W * 0.22));
      const bucketRight = cx + boxW / 2;
      const tapeW = isNarrow ? Math.min(116, Math.max(92, Math.round(W * 0.30))) : (W < 580 ? 132 : 152);
      const popZoneLeft = bucketRight + (isNarrow ? 44 : 78);
      const tapeX = isNarrow ? (W - tapeW - 10) : Math.max(popZoneLeft + 104, W - tapeW - 24);
      const popZoneRight = tapeX - (isNarrow ? 8 : 20);
      const popW = Math.min(boxW - (isNarrow ? 14 : 20), Math.max(isNarrow ? 52 : 76, popZoneRight - popZoneLeft));
      const popX = Math.round((popZoneLeft + popZoneRight - popW) / 2);
      const bottomY = H - (isNarrow ? 36 : 52);
      const topEntranceY = 46;

      const innerPad = isNarrow ? 14 : 22;
      const items = {};
      stepItems.forEach((it, i) => {
        const y = bottomY - (i + 1) * itemH - i * gap;
        items[it.uid] = {
          uid: it.uid,
          val: it.val,
          x: cx - (boxW - innerPad) / 2,
          y,
          w: boxW - innerPad,
          h: itemH,
          isTop: i === stepItems.length - 1
        };
      });

      let poppedPose = null;
      if (step.popped) {
        poppedPose = {
          uid: step.popped.uid,
          val: step.popped.val,
          x: popX,
          y: 112,
          w: popW,
          h: itemH
        };
      }
      return { cx, boxW, innerPad, bucketRight, tapeX, tapeW, popX, popW, bottomY, itemH, topEntranceY, items, poppedPose };
    }

    _drawStack(fromStep, toStep, rawT, W, H, pal) {
      const ctx = this.ctx;
      const t = easeInOutCubic(rawT);
      const isNarrow = W < 520;
      const fromL = this._computeStackLayout(fromStep, W, H);
      const toL = this._computeStackLayout(toStep, W, H);

      ctx.save();
      ctx.font = isNarrow ? '700 11px "Segoe UI", sans-serif' : '700 12px "Segoe UI", sans-serif';
      ctx.fillStyle = pal.muted;
      ctx.textAlign = 'left';
      ctx.fillText(isNarrow ? 'STACK (LIFO)' : 'STACK (LIFO) · VÀO TRÊN / RA TRÊN (BOTTOM → TOP)', isNarrow ? 14 : 24, isNarrow ? 24 : 28);
      ctx.fillText(isNarrow ? 'THAO TÁC' : 'CHUỖI THAO TÁC', toL.tapeX, 58);
      (toStep.tokens || []).forEach((tok, idx) => {
        const ty = 78 + idx * (isNarrow ? 30 : 34);
        if (ty > H - 28) return;
        const isCur = idx === toStep.tokenIndex;
        const isPast = idx < toStep.tokenIndex;
        const label = tok === -1 ? (isNarrow ? 'pop()' : 'pop()  [-1]') : `push(${tok})`;
        roundRectPath(ctx, toL.tapeX, ty, toL.tapeW, isNarrow ? 25 : 28, 8);
        ctx.fillStyle = isCur ? pal.accentBg : pal.tileBg;
        ctx.fill();
        ctx.strokeStyle = isCur ? pal.accent : pal.tileBorder;
        ctx.lineWidth = isCur ? 1.8 : 1;
        ctx.stroke();
        ctx.fillStyle = isCur ? pal.accent : (isPast ? pal.muted : pal.tileText);
        ctx.font = isNarrow ? '600 11px "Cascadia Code", monospace' : '600 12px "Cascadia Code", monospace';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, toL.tapeX + (isNarrow ? 8 : 12), ty + (isNarrow ? 12.5 : 14));
      });
      ctx.restore();

      const bucketTop = 76;
      const bucketLeft = toL.cx - toL.boxW / 2;
      const bucketRight = toL.bucketRight;
      const bucketBottom = toL.bottomY + 8;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(bucketLeft, bucketTop);
      ctx.lineTo(bucketLeft, bucketBottom);
      ctx.lineTo(bucketRight, bucketBottom);
      ctx.lineTo(bucketRight, bucketTop);
      ctx.strokeStyle = pal.containerBorder;
      ctx.lineWidth = 3;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.stroke();
      ctx.font = '700 12px "Segoe UI", sans-serif';
      ctx.fillStyle = pal.muted;
      ctx.textAlign = 'center';
      ctx.fillText('BOTTOM', toL.cx, bucketBottom + 20);
      ctx.restore();

      if (toL.poppedPose || fromL.poppedPose) {
        const refPop = toL.poppedPose || fromL.poppedPose;
        const slotAlpha = toL.poppedPose && fromL.poppedPose ? 1 : (toL.poppedPose ? t : 1 - t);
        ctx.save();
        ctx.globalAlpha = slotAlpha * 0.7;
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = pal.swapBorder;
        ctx.lineWidth = 1.4;
        roundRectPath(ctx, refPop.x - 4, refPop.y - 4, refPop.w + 8, refPop.h + 8, 12);
        ctx.stroke();
        ctx.restore();
      }

      const allUids = new Set([...Object.keys(fromL.items), ...Object.keys(toL.items)]);
      allUids.forEach((uid) => {
        const a = fromL.items[uid];
        const b = toL.items[uid];
        let x, y, w = toL.boxW - toL.innerPad, alpha = 1, val, isTop = false, isHighlight = false, isPopAnim = false;

        if (a && b) {
          x = lerp(a.x, b.x, t);
          y = lerp(a.y, b.y, t);
          val = b.val;
          isTop = b.isTop;
        } else if (b) {
          if (fromL.poppedPose && fromL.poppedPose.uid == uid) {
            x = lerp(fromL.poppedPose.x, b.x, t);
            y = lerp(fromL.poppedPose.y, b.y, t);
            w = lerp(fromL.poppedPose.w, b.w, t);
            isPopAnim = true;
          } else {
            x = b.x;
            y = lerp(toL.topEntranceY, b.y, easeOutBack(Math.min(1, rawT)));
            alpha = t;
          }
          val = b.val;
          isTop = b.isTop;
          isHighlight = !isPopAnim;
        } else if (a) {
          const hasPop = toL.poppedPose && toL.poppedPose.uid == uid;
          x = lerp(a.x, hasPop ? toL.poppedPose.x : toL.popX, t);
          y = lerp(a.y, hasPop ? toL.poppedPose.y : toL.topEntranceY, t);
          w = lerp(a.w, hasPop ? toL.poppedPose.w : a.w, t);
          alpha = hasPop ? 1 : (1 - t);
          val = a.val;
          isPopAnim = hasPop;
          isHighlight = !hasPop;
        }

        ctx.save();
        ctx.globalAlpha = alpha;
        roundRectPath(ctx, x, y, w, toL.itemH, 10);
        ctx.fillStyle = isPopAnim ? pal.swapBg : (isHighlight ? pal.accentBg : (isTop ? pal.compareBg : pal.tileBg));
        ctx.fill();
        ctx.strokeStyle = isPopAnim ? pal.swapBorder : (isHighlight ? pal.accent : (isTop ? pal.compareBorder : pal.tileBorder));
        ctx.lineWidth = isPopAnim || isHighlight || isTop ? 2 : 1.5;
        ctx.stroke();
        ctx.fillStyle = isPopAnim ? pal.swapText : (isHighlight ? pal.accent : (isTop ? pal.compareText : pal.tileText));
        ctx.font = '700 16px "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(val), x + w / 2, y + toL.itemH / 2 + 1);
        ctx.restore();
      });

      if (fromL.poppedPose && !toL.items[fromL.poppedPose.uid] && (!toL.poppedPose || toL.poppedPose.uid !== fromL.poppedPose.uid)) {
        const p = fromL.poppedPose;
        ctx.save();
        ctx.globalAlpha = 1 - t;
        roundRectPath(ctx, p.x, p.y - t * 20, p.w, p.h, 10);
        ctx.fillStyle = pal.swapBg;
        ctx.fill();
        ctx.strokeStyle = pal.swapBorder;
        ctx.lineWidth = 1.6;
        ctx.stroke();
        ctx.fillStyle = pal.swapText;
        ctx.font = '700 15px "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(p.val), p.x + p.w / 2, p.y - t * 20 + p.h / 2 + 1);
        ctx.restore();
      }
      if (toL.poppedPose) {
        const p = toL.poppedPose;
        ctx.save();
        ctx.globalAlpha = t;
        ctx.font = '700 12px "Segoe UI", sans-serif';
        ctx.fillStyle = pal.swapText;
        ctx.textAlign = 'center';
        ctx.fillText('Đã lấy ra (Pop)', p.x + p.w / 2, p.y - 16);
        ctx.restore();
      }

      const fromTopY = fromStep.items.length > 0 ? fromL.items[fromStep.items[fromStep.items.length - 1].uid].y + toL.itemH / 2 : bucketBottom - 16;
      const toTopY = toStep.items.length > 0 ? toL.items[toStep.items[toStep.items.length - 1].uid].y + toL.itemH / 2 : bucketBottom - 16;
      drawPill(ctx, isNarrow ? 'TOP' : '← TOP', bucketRight + (isNarrow ? 22 : 38), lerp(fromTopY, toTopY, t), pal.accentBg, pal.accent, pal.accent, isNarrow ? 10 : 12);
    }

    // ---------------------------------------------------------
    // QUEUE (HORIZONTAL FIFO PIPE + DEQUEUE SLOT + TAPE)
    // ---------------------------------------------------------
    _computeQueueLayout(step, W, H) {
      const itemsArr = step.items || [];
      const isNarrow = W < 520;
      const pipeX = isNarrow ? Math.max(72, Math.round(W * 0.24)) : Math.max(155, Math.round(W * 0.24));
      const pipeRight = isNarrow ? (W - 14) : Math.min(W - 44, Math.max(pipeX + 260, Math.round(W * 0.88)));
      const pipeW = pipeRight - pipeX;
      const gap = isNarrow ? 6 : 10;
      const tileW = isNarrow
        ? Math.min(46, Math.max(30, Math.floor((pipeW - 18) / Math.max(5, itemsArr.length + 1)) - gap))
        : Math.min(64, Math.max(44, Math.floor((pipeW - 36) / Math.max(6, itemsArr.length + 1)) - 8));
      const laneY = Math.round(H * 0.38);
      const tileH = isNarrow ? 46 : 56;

      const items = {};
      itemsArr.forEach((it, idx) => {
        items[it.uid] = {
          uid: it.uid,
          val: it.val,
          x: pipeX + (isNarrow ? 10 : 16) + idx * (tileW + gap),
          y: laneY,
          w: tileW,
          h: tileH,
          isFront: idx === 0,
          isRear: idx === itemsArr.length - 1
        };
      });

      const poppedPose = step.popped ? {
        uid: step.popped.uid,
        val: step.popped.val,
        x: Math.max(isNarrow ? 12 : 24, pipeX - tileW - (isNarrow ? 18 : 48)),
        y: laneY,
        w: tileW,
        h: tileH
      } : null;

      return { pipeX, pipeRight, pipeW, tileW, tileH, gap, laneY, items, poppedPose };
    }

    _drawQueue(fromStep, toStep, rawT, W, H, pal) {
      const ctx = this.ctx;
      const t = easeInOutCubic(rawT);
      const isNarrow = W < 520;
      const fromL = this._computeQueueLayout(fromStep, W, H);
      const toL = this._computeQueueLayout(toStep, W, H);

      ctx.save();
      ctx.font = isNarrow ? '700 11px "Segoe UI", sans-serif' : '700 12px "Segoe UI", sans-serif';
      ctx.fillStyle = pal.muted;
      ctx.textAlign = 'left';
      ctx.fillText(isNarrow ? 'QUEUE (FIFO) · RA FRONT ← | → VÀO REAR' : 'QUEUE (FIFO) · LẤY RA Ở FRONT ←  |  → THÊM VÀO Ở REAR', isNarrow ? 14 : 24, isNarrow ? 24 : 28);
      ctx.restore();

      // Open-ended Queue horizontal rails
      const railTop = toL.laneY - 12;
      const railBot = toL.laneY + toL.tileH + 12;
      ctx.save();
      ctx.strokeStyle = pal.containerBorder;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(toL.pipeX, railTop);
      ctx.lineTo(toL.pipeRight, railTop);
      ctx.moveTo(toL.pipeX, railBot);
      ctx.lineTo(toL.pipeRight, railBot);
      ctx.stroke();
      ctx.restore();

      // Dashed Dequeue slot on the left
      if (toL.poppedPose || fromL.poppedPose) {
        const ref = toL.poppedPose || fromL.poppedPose;
        const sa = toL.poppedPose && fromL.poppedPose ? 1 : (toL.poppedPose ? t : 1 - t);
        ctx.save();
        ctx.globalAlpha = sa * 0.7;
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = pal.swapBorder;
        ctx.lineWidth = 1.4;
        roundRectPath(ctx, ref.x - 4, ref.y - 4, ref.w + 8, ref.h + 8, 12);
        ctx.stroke();
        ctx.restore();
      }

      const allUids = new Set([...Object.keys(fromL.items), ...Object.keys(toL.items)]);
      allUids.forEach((uid) => {
        const a = fromL.items[uid];
        const b = toL.items[uid];
        let x, y = toL.laneY, alpha = 1, val, isHighlight = false, isDeq = false;

        if (a && b) {
          x = lerp(a.x, b.x, t);
          y = lerp(a.y, b.y, t);
          val = b.val;
        } else if (b) {
          if (fromL.poppedPose && fromL.poppedPose.uid == uid) {
            x = lerp(fromL.poppedPose.x, b.x, t);
            y = lerp(fromL.poppedPose.y, b.y, t);
            isDeq = true;
          } else {
            x = lerp(toL.pipeRight + 24, b.x, t);
            alpha = t;
            isHighlight = true;
          }
          val = b.val;
        } else if (a) {
          const hasDeq = toL.poppedPose && toL.poppedPose.uid == uid;
          x = lerp(a.x, hasDeq ? toL.poppedPose.x : Math.max(24, toL.pipeX - a.w - 40), t);
          alpha = hasDeq ? 1 : (1 - t);
          val = a.val;
          isDeq = hasDeq;
          isHighlight = !hasDeq;
        }

        ctx.save();
        ctx.globalAlpha = alpha;
        roundRectPath(ctx, x, y, toL.tileW, toL.tileH, 10);
        ctx.fillStyle = isDeq ? pal.swapBg : (isHighlight ? pal.accentBg : pal.tileBg);
        ctx.fill();
        ctx.strokeStyle = isDeq ? pal.swapBorder : (isHighlight ? pal.accent : pal.tileBorder);
        ctx.lineWidth = isDeq || isHighlight ? 2 : 1.5;
        ctx.stroke();
        ctx.fillStyle = isDeq ? pal.swapText : (isHighlight ? pal.accent : pal.tileText);
        ctx.font = '700 17px "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(val), x + toL.tileW / 2, y + toL.tileH / 2 + 1);
        ctx.restore();
      });

      if (toL.poppedPose) {
        const p = toL.poppedPose;
        ctx.save();
        ctx.globalAlpha = t;
        ctx.font = '700 12px "Segoe UI", sans-serif';
        ctx.fillStyle = pal.swapText;
        ctx.textAlign = 'center';
        ctx.fillText('Dequeue', p.x + p.w / 2, p.y - 16);
        ctx.restore();
      }

      // Gliding FRONT and REAR pills
      const fFront = fromStep.items.length > 0 ? fromL.items[fromStep.items[0].uid].x + toL.tileW / 2 : toL.pipeX + 44;
      const tFront = toStep.items.length > 0 ? toL.items[toStep.items[0].uid].x + toL.tileW / 2 : toL.pipeX + 44;
      const fRear = fromStep.items.length > 0 ? fromL.items[fromStep.items[fromStep.items.length - 1].uid].x + toL.tileW / 2 : toL.pipeX + 44;
      const tRear = toStep.items.length > 0 ? toL.items[toStep.items[toStep.items.length - 1].uid].x + toL.tileW / 2 : toL.pipeX + 44;

      if (fromStep.items.length > 0 || toStep.items.length > 0) {
        const ptrA = lerp(fromStep.items.length > 0 ? 1 : 0, toStep.items.length > 0 ? 1 : 0, t);
        ctx.save();
        ctx.globalAlpha = ptrA;
        drawPill(ctx, 'FRONT', lerp(fFront, tFront, t), railTop - 22, pal.compareBg, pal.compareBorder, pal.compareText, 12);
        drawPill(ctx, 'REAR', lerp(fRear, tRear, t), railBot + 24, pal.accentBg, pal.accent, pal.accent, 12);
        ctx.restore();
      }

      // Operation tape strip at bottom
      const tapeY = Math.min(H - 54, railBot + 64);
      const tokens = toStep.tokens || [];
      const chipW = 104, chipGap = 8;
      const totalTapeW = tokens.length * chipW + Math.max(0, tokens.length - 1) * chipGap;
      let tx = Math.max(24, (W - totalTapeW) / 2);
      ctx.save();
      tokens.forEach((tok, idx) => {
        if (tx + chipW > W - 16) return;
        const isCur = idx === toStep.tokenIndex;
        const isPast = idx < toStep.tokenIndex;
        const label = tok === -1 ? 'dequeue()' : `enq(${tok})`;
        roundRectPath(ctx, tx, tapeY, chipW, 28, 8);
        ctx.fillStyle = isCur ? pal.accentBg : pal.tileBg;
        ctx.fill();
        ctx.strokeStyle = isCur ? pal.accent : pal.tileBorder;
        ctx.lineWidth = isCur ? 1.8 : 1;
        ctx.stroke();
        ctx.fillStyle = isCur ? pal.accent : (isPast ? pal.muted : pal.tileText);
        ctx.font = '600 12px "Cascadia Code", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, tx + chipW / 2, tapeY + 14);
        tx += chipW + chipGap;
      });
      ctx.restore();
    }

    // ---------------------------------------------------------
    // POSTFIX EVALUATION (TOKEN RIBBON + STACK + COMPUTE BADGE)
    // ---------------------------------------------------------
    _drawPostfix(fromStep, toStep, rawT, W, H, pal) {
      const ctx = this.ctx;
      const t = easeInOutCubic(rawT);
      const isNarrow = W < 520;

      ctx.save();
      ctx.font = isNarrow ? '700 11px "Segoe UI", sans-serif' : '700 12px "Segoe UI", sans-serif';
      ctx.fillStyle = pal.muted;
      ctx.textAlign = 'left';
      ctx.fillText(isNarrow ? 'HẬU TỐ (RPN) · QUÉT TRÁI → PHẢI' : 'TÍNH BIỂU THỨC HẬU TỐ · QUÉT TRÁI SANG PHẢI', isNarrow ? 14 : 24, isNarrow ? 24 : 28);
      ctx.restore();

      // Token ribbon along top
      const tokens = toStep.tokens || [];
      const tokGap = isNarrow ? 4 : 8;
      const tokW = isNarrow
        ? Math.min(34, Math.max(22, Math.floor((W - 28 - Math.max(0, tokens.length - 1) * tokGap) / Math.max(tokens.length, 1))))
        : 42;
      const totalTokW = tokens.length * tokW + Math.max(0, tokens.length - 1) * tokGap;
      let rx = Math.max(isNarrow ? 14 : 24, (W - totalTokW) / 2);
      const ry = isNarrow ? 44 : 54;
      const tokH = isNarrow ? 30 : 34;
      ctx.save();
      tokens.forEach((tok, idx) => {
        const isCur = idx === toStep.tokenIndex;
        const isPast = idx < toStep.tokenIndex;
        roundRectPath(ctx, rx, ry, tokW, tokH, 8);
        ctx.fillStyle = isCur ? pal.compareBg : pal.tileBg;
        ctx.fill();
        ctx.strokeStyle = isCur ? pal.compareBorder : pal.tileBorder;
        ctx.lineWidth = isCur ? 2 : 1.2;
        ctx.stroke();
        ctx.fillStyle = isCur ? pal.compareText : (isPast ? pal.muted : pal.tileText);
        ctx.font = isNarrow ? '700 12px "Cascadia Code", monospace' : '700 14px "Cascadia Code", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(tok, rx + tokW / 2, ry + tokH / 2);
        rx += tokW + tokGap;
      });
      ctx.restore();

      // Stack bucket on left-center
      const maxVisible = Math.max(5, (toStep.items || []).length + 1);
      const boxW = isNarrow
        ? Math.min(112, Math.max(82, Math.round(W * 0.28)))
        : Math.min(164, Math.max(118, Math.round(W * 0.22)));
      const innerPad = isNarrow ? 14 : 22;
      const itemH = Math.min(isNarrow ? 32 : 40, Math.floor((H - (isNarrow ? 145 : 175)) / maxVisible));
      const gap = isNarrow ? 5 : 6;
      const cx = isNarrow
        ? Math.max(Math.round(boxW / 2) + 14, Math.round(W * 0.20))
        : Math.max(Math.round(boxW / 2) + 40, Math.round(W * 0.30));
      const bottomY = H - (isNarrow ? 36 : 46);
      const bucketLeft = cx - boxW / 2;
      const bucketRight = cx + boxW / 2;
      const bucketTop = isNarrow ? 98 : 118;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(bucketLeft, bucketTop);
      ctx.lineTo(bucketLeft, bottomY + 6);
      ctx.lineTo(bucketRight, bottomY + 6);
      ctx.lineTo(bucketRight, bucketTop);
      ctx.strokeStyle = pal.containerBorder;
      ctx.lineWidth = 3;
      ctx.lineJoin = 'round';
      ctx.stroke();
      ctx.font = isNarrow ? '700 11px "Segoe UI", sans-serif' : '700 12px "Segoe UI", sans-serif';
      ctx.fillStyle = pal.muted;
      ctx.textAlign = 'center';
      ctx.fillText('STACK', cx, bottomY + 22);
      ctx.restore();

      const mapItems = (st) => {
        const m = {};
        (st.items || []).forEach((it, i) => {
          m[it.uid] = {
            uid: it.uid,
            val: it.val,
            x: cx - (boxW - innerPad) / 2,
            y: bottomY - (i + 1) * itemH - i * gap,
            isTop: i === st.items.length - 1
          };
        });
        return m;
      };
      const fMap = mapItems(fromStep);
      const tMap = mapItems(toStep);
      const allUids = new Set([...Object.keys(fMap), ...Object.keys(tMap)]);

      allUids.forEach((uid) => {
        const a = fMap[uid], b = tMap[uid];
        let x, y, alpha = 1, val, isHi = false;
        if (a && b) {
          x = lerp(a.x, b.x, t);
          y = lerp(a.y, b.y, t);
          val = b.val;
        } else if (b) {
          x = b.x;
          y = lerp(bucketTop - 16, b.y, easeOutBack(Math.min(1, rawT)));
          alpha = t;
          val = b.val;
          isHi = true;
        } else if (a) {
          x = lerp(a.x, a.x + 120, t);
          y = lerp(a.y, bucketTop + 20, t);
          alpha = 1 - t;
          val = a.val;
        }
        ctx.save();
        ctx.globalAlpha = alpha;
        roundRectPath(ctx, x, y, boxW - innerPad, itemH, 9);
        ctx.fillStyle = isHi ? pal.accentBg : pal.tileBg;
        ctx.fill();
        ctx.strokeStyle = isHi ? pal.accent : pal.tileBorder;
        ctx.lineWidth = isHi ? 2 : 1.5;
        ctx.stroke();
        ctx.fillStyle = isHi ? pal.accent : pal.tileText;
        ctx.font = isNarrow ? '700 13px "Segoe UI", sans-serif' : '700 15px "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(val), x + (boxW - innerPad) / 2, y + itemH / 2 + 1);
        ctx.restore();
      });

      // Right calculation card when computing an operator
      const cardX = isNarrow ? (bucketRight + 16) : Math.max(bucketRight + 76, Math.round(W * 0.56));
      const cardW = isNarrow ? Math.min(240, W - cardX - 14) : Math.min(260, W - cardX - 24);
      if (cardW >= 120) {
        const c = toStep.calc;
        const cardY = isNarrow ? 110 : 134;
        const cardH = isNarrow ? 102 : 118;
        ctx.save();
        roundRectPath(ctx, cardX, cardY, cardW, cardH, 14);
        ctx.fillStyle = pal.tileBg;
        ctx.fill();
        ctx.strokeStyle = c ? pal.compareBorder : pal.tileBorder;
        ctx.lineWidth = c ? 2 : 1.3;
        ctx.stroke();

        ctx.font = isNarrow ? '700 11px "Segoe UI", sans-serif' : '700 12px "Segoe UI", sans-serif';
        ctx.fillStyle = pal.muted;
        ctx.textAlign = 'center';
        ctx.fillText('PHÉP TÍNH HIỆN TẠI', cardX + cardW / 2, cardY + 24);

        ctx.font = isNarrow ? '700 15px "Cascadia Code", monospace' : '700 18px "Cascadia Code", monospace';
        ctx.fillStyle = c ? pal.compareText : pal.muted;
        ctx.fillText(c ? `${c.left} ${c.op} ${c.right} = ${c.result}` : 'Đang đọc token...', cardX + cardW / 2, cardY + (isNarrow ? 56 : 64));

        ctx.font = isNarrow ? '600 11px "Segoe UI", sans-serif' : '600 12px "Segoe UI", sans-serif';
        ctx.fillStyle = pal.muted;
        ctx.fillText(c ? `Trái = ${c.left} · Phải = ${c.right}` : 'Pop đầu = toán hạng phải', cardX + cardW / 2, cardY + (isNarrow ? 82 : 94));
        ctx.restore();
      }
    }

    // ---------------------------------------------------------
    // BST & AVL TREE (SEARCH-PATH PROBE + SMOOTH ROTATIONS)
    // ---------------------------------------------------------
    _computeTreeLayout(step, W, H) {
      const nodes = {};
      const edges = {};
      if (!step.tree) return { nodes, edges, probe: null, radius: 22 };

      const isNarrow = W < 520;
      const lnr = root.DSA_ALGO.walk(step.tree, 'LNR');
      const count = lnr.length;
      const h = root.DSA_ALGO.height(step.tree);
      const padX = isNarrow ? 34 : 104;
      const slotW = isNarrow
        ? Math.min(64, Math.max(24, (W - padX) / Math.max(count, 1)))
        : Math.min(80, Math.max(40, (W - padX) / Math.max(count, 1)));
      const startX = W / 2 - ((count - 1) * slotW) / 2;
      const levelGap = isNarrow
        ? Math.min(68, Math.max(40, (H - 120) / Math.max(h, 1)))
        : Math.min(76, Math.max(46, (H - 152) / Math.max(h, 1)));
      const topY = isNarrow
        ? Math.max(72, (H - (h - 1) * levelGap) / 2 + 12)
        : Math.max(108, (H - (h - 1) * levelGap) / 2 + 16);
      const radius = isNarrow ? (count > 7 ? 14 : 17) : (count > 8 ? 19 : 22);

      let idx = 0;
      const assign = (n, depth) => {
        if (!n) return;
        assign(n.l, depth + 1);
        const x = startX + idx * slotW;
        const y = topY + depth * levelGap;
        const nodeBf = this.avlBfMode === 'iuh' ? root.DSA_ALGO.bfIuh(n) : root.DSA_ALGO.bf(n);
        const highlighted = step.highlight && step.highlight.includes(n.v);
        const visited = step.visited && step.visited.includes(n.v);
        nodes[n.v] = { v: n.v, x, y, bf: nodeBf, highlighted, visited, radius };
        idx++;
        assign(n.r, depth + 1);
      };
      assign(step.tree, 0);

      const collectEdges = (n) => {
        if (!n) return;
        [n.l, n.r].forEach((c) => {
          if (!c) return;
          const a = Math.min(n.v, c.v);
          const b = Math.max(n.v, c.v);
          const key = `${a}-${b}`;
          edges[key] = {
            key,
            u: n.v,
            v: c.v,
            highlight: step.highlight && step.highlight.includes(n.v) && step.highlight.includes(c.v)
          };
          collectEdges(c);
        });
      };
      collectEdges(step.tree);

      let probe = null;
      if (step.probe && nodes[step.probe.atVal]) {
        const target = nodes[step.probe.atVal];
        const offsetX = step.probe.dir === 'left' ? -30 : 30;
        probe = {
          v: step.probe.v,
          atVal: step.probe.atVal,
          dir: step.probe.dir,
          label: step.probe.label,
          x: Math.max(36, Math.min(W - 36, target.x + offsetX)),
          y: Math.max(48, target.y - target.radius * 2.65),
          radius: Math.max(17, radius - 2)
        };
      }
      return { nodes, edges, probe, radius };
    }

    _drawTree(fromStep, toStep, rawT, W, H, pal) {
      const ctx = this.ctx;
      const t = easeInOutCubic(rawT);
      const springT = easeOutBack(Math.min(1, rawT));
      const isNarrow = W < 520;
      const fromL = this._computeTreeLayout(fromStep, W, H);
      const toL = this._computeTreeLayout(toStep, W, H);
      const showBf = this.mode === 'avl';

      ctx.save();
      ctx.font = isNarrow ? '700 11px "Segoe UI", sans-serif' : '700 12px "Segoe UI", sans-serif';
      ctx.fillStyle = pal.muted;
      ctx.textAlign = 'left';
      ctx.fillText(
        showBf
          ? (this.avlBfMode === 'iuh'
            ? (isNarrow ? 'CÂY AVL (IUH) · CSCB = h(R) − h(L)' : 'CÂY AVL (IUH) • CSCB = h(Phải) - h(Trái)  [LH = -1 · EH = 0 · RH = +1]')
            : (isNarrow ? 'CÂY AVL · BF = h(L) − h(R)' : 'CÂY AVL • BF = h(Trái) - h(Phải)  [Dò đường → Chèn/Xóa → Xoay]'))
          : (isNarrow ? 'CÂY BST (Nhỏ trái · Lớn phải)' : 'CÂY BST • SO SÁNH TỪ GỐC (NHỎ SANG TRÁI, LỚN SANG PHẢI)'),
        isNarrow ? 14 : 24, isNarrow ? 24 : 28
      );
      ctx.restore();

      if (!fromStep.tree && !toStep.tree) {
        ctx.save();
        ctx.font = '600 15px "Segoe UI", sans-serif';
        ctx.fillStyle = pal.muted;
        ctx.textAlign = 'center';
        ctx.fillText('Cây đang rỗng — bấm Tiếp ▶ để chèn nút đầu tiên', W / 2, H / 2);
        ctx.restore();
        return;
      }

      const allVals = new Set([...Object.keys(fromL.nodes), ...Object.keys(toL.nodes)]);
      const curNodes = {};
      allVals.forEach((v) => {
        const fn = fromL.nodes[v];
        const tn = toL.nodes[v];
        if (fn && tn) {
          curNodes[v] = {
            v: tn.v,
            x: lerp(fn.x, tn.x, t),
            y: lerp(fn.y, tn.y, t),
            radius: lerp(fn.radius, tn.radius, t),
            alpha: 1,
            scale: 1,
            bf: rawT < 0.5 ? fn.bf : tn.bf,
            highlighted: tn.highlighted,
            visited: tn.visited
          };
        } else if (tn) {
          if (fromL.probe && fromL.probe.v === tn.v) {
            curNodes[v] = {
              v: tn.v,
              x: lerp(fromL.probe.x, tn.x, t),
              y: lerp(fromL.probe.y, tn.y, t),
              radius: lerp(fromL.probe.radius, tn.radius, t),
              alpha: 1,
              scale: 1,
              bf: tn.bf,
              highlighted: true,
              visited: tn.visited
            };
          } else {
            curNodes[v] = {
              v: tn.v,
              x: tn.x,
              y: lerp(tn.y - 24, tn.y, t),
              radius: tn.radius,
              alpha: t,
              scale: Math.max(0.01, springT),
              bf: tn.bf,
              highlighted: tn.highlighted,
              visited: tn.visited
            };
          }
        } else if (fn) {
          if (toL.probe && toL.probe.v === fn.v) {
            curNodes[v] = {
              v: fn.v,
              x: lerp(fn.x, toL.probe.x, t),
              y: lerp(fn.y, toL.probe.y, t),
              radius: fn.radius,
              alpha: 1,
              scale: 1,
              bf: fn.bf,
              highlighted: false,
              visited: false,
              skipDraw: true
            };
          } else {
            curNodes[v] = {
              v: fn.v,
              x: fn.x,
              y: lerp(fn.y, fn.y - 20, t),
              radius: fn.radius,
              alpha: 1 - t,
              scale: Math.max(0.01, 1 - t),
              bf: fn.bf,
              highlighted: fn.highlighted,
              visited: fn.visited
            };
          }
        }
      });

      const allEdges = new Set([...Object.keys(fromL.edges), ...Object.keys(toL.edges)]);
      allEdges.forEach((key) => {
        const fe = fromL.edges[key];
        const te = toL.edges[key];
        const ref = te || fe;
        const n1 = curNodes[ref.u];
        const n2 = curNodes[ref.v];
        if (!n1 || !n2) return;
        const edgePresence = (fe && te) ? 1 : (te ? t : 1 - t);
        const alpha = Math.min(edgePresence, n1.alpha, n2.alpha);
        if (alpha < 0.03) return;

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.moveTo(n1.x, n1.y);
        ctx.lineTo(n2.x, n2.y);
        ctx.strokeStyle = (te && te.highlight) ? pal.edgeHighlight : pal.edge;
        ctx.lineWidth = (te && te.highlight) ? 2.6 : 2.0;
        ctx.stroke();
        ctx.restore();
      });

      const repVal = toStep.replacedAnim ? toStep.replacedAnim.fromVal : null;
      const drawOrder = Object.values(curNodes).sort((a, b) => {
        if (repVal !== null) {
          if (a.v === repVal && b.v !== repVal) return 1;
          if (b.v === repVal && a.v !== repVal) return -1;
        }
        return a.alpha - b.alpha;
      });
      drawOrder.forEach((n) => {
        if (n.skipDraw || n.alpha < 0.02) return;
        ctx.save();
        ctx.globalAlpha = n.alpha;
        ctx.translate(n.x, n.y);
        ctx.scale(n.scale, n.scale);

        const unbalanced = showBf && Math.abs(n.bf) > 1;
        let bg = pal.tileBg, border = pal.accent, fg = pal.tileText;
        if (unbalanced) { bg = pal.swapBg; border = pal.swapBorder; fg = pal.swapText; }
        else if (n.highlighted) { bg = pal.compareBg; border = pal.compareBorder; fg = pal.compareText; }
        else if (n.visited) { bg = pal.accentBg; border = pal.accent; fg = pal.tileText; }

        if (n.highlighted || unbalanced) {
          ctx.shadowColor = border;
          ctx.shadowBlur = 14;
        }

        ctx.beginPath();
        ctx.arc(0, 0, n.radius, 0, Math.PI * 2);
        ctx.fillStyle = bg;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = border;
        ctx.lineWidth = 2.4;
        ctx.stroke();

        ctx.fillStyle = fg;
        ctx.font = n.radius < 18 ? '700 12px "Segoe UI", sans-serif' : '700 15px "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(n.v), 0, 1);

        if (showBf) {
          const bfStr = (n.bf > 0 ? '+' : '') + n.bf;
          const bx = n.radius * 0.78;
          const by = -n.radius * 0.78;
          const bfSmall = n.radius < 18;
          ctx.font = bfSmall ? '700 10px "Cascadia Code", monospace' : '700 12px "Cascadia Code", monospace';
          const bw = ctx.measureText(bfStr).width + (bfSmall ? 7 : 10);
          const bh = bfSmall ? 16 : 20;
          roundRectPath(ctx, bx - bw / 2, by - bh / 2, bw, bh, 6);
          ctx.fillStyle = unbalanced ? pal.swapBorder : pal.bfPillBg;
          ctx.fill();
          ctx.fillStyle = unbalanced ? '#ffffff' : pal.muted;
          ctx.fillText(bfStr, bx, by + 0.5);
        }

        ctx.restore();
      });

      const fp = fromL.probe;
      const tp = toL.probe;
      if (fp || tp) {
        let px, py, pr, pAlpha = 1, drawProbeCircle = true;
        const activeProbe = tp || fp;
        if (fp && tp && fp.v === tp.v) {
          px = lerp(fp.x, tp.x, t);
          py = lerp(fp.y, tp.y, t);
          pr = lerp(fp.radius, tp.radius, t);
        } else if (tp) {
          const backwardNode = fromL.nodes[tp.v];
          if (backwardNode) {
            px = lerp(backwardNode.x, tp.x, t);
            py = lerp(backwardNode.y, tp.y, t);
            pr = lerp(backwardNode.radius, tp.radius, t);
          } else {
            px = tp.x;
            py = lerp(tp.y - 24, tp.y, t);
            pr = tp.radius;
            pAlpha = t;
          }
        } else if (fp) {
          const forwardNode = toL.nodes[fp.v];
          if (forwardNode) {
            px = lerp(fp.x, forwardNode.x, t);
            py = lerp(fp.y, forwardNode.y, t);
            pr = fp.radius;
            pAlpha = 1 - t;
            drawProbeCircle = false;
          } else {
            px = fp.x;
            py = lerp(fp.y, fp.y - 20, t);
            pr = fp.radius;
            pAlpha = 1 - t;
          }
        }

        if (pAlpha > 0.03) {
          const comparedNode = curNodes[activeProbe.atVal];
          if (comparedNode) {
            ctx.save();
            ctx.globalAlpha = pAlpha * 0.85;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(comparedNode.x, comparedNode.y);
            ctx.strokeStyle = pal.compareBorder;
            ctx.lineWidth = 1.8;
            ctx.stroke();
            ctx.restore();
          }

          if (drawProbeCircle) {
            ctx.save();
            ctx.globalAlpha = pAlpha;
            ctx.translate(px, py);
            ctx.shadowColor = pal.compareBorder;
            ctx.shadowBlur = 14;
            ctx.beginPath();
            ctx.arc(0, 0, pr, 0, Math.PI * 2);
            ctx.fillStyle = pal.compareBg;
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.strokeStyle = pal.compareBorder;
            ctx.lineWidth = 2.4;
            ctx.stroke();
            ctx.fillStyle = pal.compareText;
            ctx.font = '700 14px "Segoe UI", sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(String(activeProbe.v), 0, 1);
            ctx.restore();
          }

          ctx.save();
          ctx.globalAlpha = pAlpha;
          ctx.font = '700 12px "Cascadia Code", Consolas, monospace';
          const pillW = ctx.measureText(activeProbe.label).width + 18;
          let pillCx = activeProbe.dir === 'left'
            ? px - pr - pillW / 2 - 10
            : px + pr + pillW / 2 + 10;
          pillCx = Math.max(pillW / 2 + 12, Math.min(W - pillW / 2 - 12, pillCx));
          drawPill(ctx, activeProbe.label, pillCx, py, pal.compareBg, pal.compareBorder, pal.compareText, 12);
          ctx.restore();
        }
      }
    }
  }

  root.DSA_VISUALIZER = DsaVisualizer;
})(typeof window !== 'undefined' ? window : globalThis);
