import { useState, useCallback } from 'react'
import { useAuth }    from './hooks/useAuth.js'
import { useAppData } from './hooks/useAppData.js'
import { useTimer }   from './hooks/useTimer.js'
import { supabaseConfigured } from './lib/supabase.js'
import Auth      from './components/Auth.jsx'
import Feed      from './components/Feed.jsx'
import Tracker   from './components/Tracker.jsx'
import Schedule  from './components/Schedule.jsx'
import Savings   from './components/Savings.jsx'
import LogModal  from './components/LogModal.jsx'
import {
  LeafIllustration, TrackerIllustration,
  ScheduleIllustration, SavingsIllustration,
  BellIllustration,
} from './icons.jsx'

const css = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,opsz,wght@0,5..1200,400;0,5..1200,600;0,5..1200,700;1,5..1200,400;1,5..1200,600&family=Mulish:wght@400;500;600;700;800&display=swap');

* { margin: 0; padding: 0; box-sizing: border-box; }

:root {
  --parch:      #f5ead8;
  --parch2:     #ede0c8;
  --parch3:     #e0d0b0;
  --parch4:     #d4c098;
  --emerald:    #0a4a38;
  --emerald-l:  #16755c;
  --emerald-bg: rgba(10,74,56,0.1);
  --violet:     #3a1660;
  --violet-l:   #5e2d99;
  --violet-bg:  rgba(58,22,96,0.1);
  --gold:       #7a4d00;
  --gold-l:     #b07218;
  --gold-ll:    #d4a030;
  --gold-bg:    rgba(122,77,0,0.1);
  --gold-bright:#e8b820;
  --ink:        #0e0a06;
  --ink3:       #3a2c1e;
  --ink4:       #5a4a38;
  --ink5:       #7a6a58;
  --border:     rgba(14,10,6,0.15);
  --border2:    rgba(14,10,6,0.25);
  --shadow:     0 2px 16px rgba(58,22,96,0.12);
  --shadow2:    0 4px 32px rgba(58,22,96,0.2);
}

body { background: var(--parch); color: var(--ink); font-family: 'Mulish', sans-serif; min-height: 100vh; overflow-x: hidden; }

.paper-bg {
  position: fixed; inset: 0; z-index: 0; pointer-events: none; opacity: 0.06;
  background-image:
    url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"),
    repeating-linear-gradient(0deg, rgba(122,77,0,0.04) 0px, rgba(122,77,0,0.04) 1px, transparent 1px, transparent 24px);
  background-size: 200px, 100% 100%;
}
.vignette { position: fixed; inset: 0; z-index: 0; pointer-events: none; background: radial-gradient(ellipse at 50% 50%, transparent 60%, rgba(14,10,6,0.06) 100%); }

.app { position: relative; z-index: 1; max-width: 430px; margin: 0 auto; min-height: 100vh; display: flex; flex-direction: column; padding-bottom: 88px; }

.header { padding: 22px 20px 0; display: flex; justify-content: space-between; align-items: center; }
.logo { font-family: 'Playfair Display', serif; font-weight: 700; font-size: 27px; letter-spacing: -0.3px; background: linear-gradient(135deg, var(--emerald-l), var(--violet-l), var(--gold-bright)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.logo em { font-style: italic; font-weight: 400; }
.header-right { display: flex; align-items: center; gap: 10px; }
.notif-btn { width: 36px; height: 36px; border-radius: 50%; background: var(--parch2); border: 1.5px solid var(--border2); display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: var(--shadow); position: relative; }
.notif-dot { position: absolute; top: 4px; right: 4px; width: 8px; height: 8px; border-radius: 50%; background: var(--violet-l); border: 1.5px solid var(--parch); }
.avatar { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, var(--emerald-l), var(--violet-l)); display: flex; align-items: center; justify-content: center; font-family: 'Playfair Display', serif; font-size: 14px; color: var(--parch); font-weight: 700; box-shadow: var(--shadow); cursor: pointer; }

.tabs { display: flex; padding: 14px 20px 0; border-bottom: 1.5px solid var(--border2); }
.tab { flex: 1; padding: 8px 2px 12px; background: none; border: none; border-bottom: 2.5px solid transparent; margin-bottom: -1.5px; color: var(--gold-bright); font-family: 'Mulish', sans-serif; font-size: 9px; font-weight: 800; cursor: pointer; transition: all 0.22s; letter-spacing: 0.06em; text-transform: uppercase; display: flex; flex-direction: column; align-items: center; gap: 5px; }
.tab.active { color: var(--violet-l); border-bottom-color: var(--violet-l); }

.content { flex: 1; padding: 18px 20px; }
.s-label { font-size: 10px; font-weight: 800; letter-spacing: 0.16em; text-transform: uppercase; color: var(--ink3); margin-bottom: 12px; font-family: 'Playfair Display', serif; font-style: italic; }

/* STORIES */
.stories-row { display: flex; gap: 10px; margin-bottom: 20px; overflow-x: auto; scrollbar-width: none; padding-bottom: 4px; }
.story { flex-shrink: 0; display: flex; flex-direction: column; align-items: center; gap: 6px; cursor: pointer; }
.story-ring { width: 60px; height: 60px; border-radius: 50%; padding: 2.5px; background: conic-gradient(var(--emerald-l), var(--violet-l), var(--gold-ll), var(--emerald-l)); box-shadow: 0 2px 10px rgba(58,22,96,0.2); }
.story-ring.yours { background: conic-gradient(var(--violet-l), var(--emerald-l), var(--violet-l)); }
.story-inner { width: 100%; height: 100%; border-radius: 50%; border: 2.5px solid var(--parch); display: flex; align-items: center; justify-content: center; background: var(--parch2); }
.story-add-inner { background: linear-gradient(135deg, var(--emerald-bg), var(--violet-bg)); font-size: 18px; font-weight: 800; color: var(--violet); font-family: 'Playfair Display', serif; }
.story-name { font-size: 9px; font-weight: 800; color: var(--ink3); max-width: 60px; text-align: center; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }

/* POST */
.post { background: var(--parch2); border: 1.5px solid var(--border2); border-radius: 22px; margin-bottom: 14px; overflow: hidden; box-shadow: var(--shadow); }
.post-header { display: flex; align-items: center; gap: 10px; padding: 14px 16px 10px; }
.p-av { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; border: 1.5px solid var(--border2); background: var(--parch); }
.p-name { font-size: 13px; font-weight: 800; color: var(--ink); }
.p-sub { font-size: 11px; color: var(--ink4); margin-top: 1px; font-weight: 600; }
.tol-badge { margin-left: auto; border-radius: 20px; padding: 4px 11px; font-size: 11px; font-weight: 800; font-family: 'Playfair Display', serif; }
.tol-badge.hi { background: rgba(122,77,0,0.15); color: var(--gold); border: 1.5px solid rgba(122,77,0,0.3); }
.tol-badge.md { background: rgba(10,74,56,0.12); color: var(--emerald); border: 1.5px solid rgba(10,74,56,0.25); }
.tol-badge.lo { background: rgba(58,22,96,0.1); color: var(--violet); border: 1.5px solid rgba(58,22,96,0.2); }
.post-caption { padding: 0 16px 12px; font-size: 13px; color: var(--ink3); line-height: 1.68; font-weight: 600; }
.post-actions { padding: 10px 16px 14px; display: flex; gap: 4px; border-top: 1.5px solid var(--border2); align-items: center; }
.pact { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 700; color: var(--ink3); background: none; border: none; cursor: pointer; font-family: 'Mulish', sans-serif; padding: 6px 8px; border-radius: 8px; transition: all 0.18s; }
.pact:hover { background: var(--violet-bg); color: var(--violet); }
.pact.liked { color: var(--gold-l); }
.pact-spacer { flex: 1; }

/* TRACKER */
.tol-hero { border-radius: 28px; padding: 24px; margin-bottom: 14px; position: relative; overflow: hidden; background: linear-gradient(145deg, #e8d8f8 0%, #c8e8dc 45%, #f0e4c8 100%); border: 1.5px solid rgba(58,22,96,0.2); box-shadow: var(--shadow2); }
.tol-hero-glow { position: absolute; top: -60px; right: -60px; width: 200px; height: 200px; border-radius: 50%; background: conic-gradient(from 0deg, rgba(58,22,96,0.18), rgba(10,74,56,0.14), rgba(212,160,23,0.16), rgba(58,22,96,0.18)); filter: blur(30px); pointer-events: none; }
.tol-hero-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 18px; position: relative; z-index: 1; }
.tol-eyebrow { font-family: 'Playfair Display', serif; font-style: italic; font-size: 12px; font-weight: 400; letter-spacing: 0.06em; color: var(--ink3); }
.tol-status { border-radius: 20px; padding: 5px 14px; font-size: 10px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; }
.tol-status.hi { background: rgba(122,77,0,0.18); color: var(--gold); border: 1.5px solid rgba(122,77,0,0.3); }
.tol-status.md { background: rgba(58,22,96,0.12); color: var(--violet); border: 1.5px solid rgba(58,22,96,0.25); }
.tol-status.lo { background: rgba(10,74,56,0.15); color: var(--emerald); border: 1.5px solid rgba(10,74,56,0.3); }
.tol-main { display: flex; align-items: center; gap: 20px; margin-bottom: 20px; position: relative; z-index: 1; }
.radial-wrap { position: relative; width: 96px; height: 96px; flex-shrink: 0; }
.radial-svg { width: 96px; height: 96px; transform: rotate(-90deg); }
.radial-bg { fill: none; stroke: rgba(14,10,6,0.1); stroke-width: 7; }
.radial-fill { fill: none; stroke-width: 7; stroke-linecap: round; stroke-dasharray: 251.2; }
.radial-label { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.radial-num { font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 700; background: linear-gradient(135deg, var(--emerald), var(--violet)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; line-height: 1; }
.radial-of { font-size: 9px; color: var(--ink4); font-weight: 800; }
.tol-big { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 600; color: var(--ink); line-height: 1.2; margin-bottom: 6px; }
.tol-big em { font-style: italic; color: var(--violet-l); }
.tol-delta { font-size: 13px; color: var(--ink4); font-weight: 700; }
.tol-bar-row { position: relative; z-index: 1; }
.tol-bar-bg { height: 7px; background: rgba(14,10,6,0.1); border-radius: 6px; overflow: hidden; margin-bottom: 8px; }
.tol-bar-fill { height: 100%; border-radius: 6px; background: linear-gradient(90deg, var(--emerald-l), var(--violet-l), var(--gold-l)); }
.tol-bar-ticks { display: flex; justify-content: space-between; font-size: 9px; color: var(--ink4); font-weight: 800; letter-spacing: 0.04em; }

.stat-row { display: flex; gap: 10px; margin-bottom: 14px; }
.stat-card { flex: 1; background: var(--parch2); border: 1.5px solid var(--border2); border-radius: 18px; padding: 14px 12px; box-shadow: var(--shadow); }
.stat-card-label { font-size: 9px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; color: var(--ink4); margin-bottom: 7px; }
.stat-card-val { font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 700; line-height: 1; margin-bottom: 4px; }
.stat-card-val.emerald { color: var(--emerald); }
.stat-card-val.violet  { color: var(--violet); }
.stat-card-val.gold    { color: var(--gold-l); }
.stat-card-sub { font-size: 11px; color: var(--ink4); font-weight: 700; }

.heatmap-card { background: var(--parch2); border: 1.5px solid var(--border2); border-radius: 22px; padding: 18px; margin-bottom: 14px; box-shadow: var(--shadow); }
.heatmap { display: grid; grid-template-columns: repeat(26, 1fr); gap: 3px; margin-top: 10px; }
.hm { aspect-ratio: 1; border-radius: 3px; background: var(--parch3); }
.hm.l1 { background: rgba(10,74,56,0.28); }
.hm.l2 { background: rgba(10,74,56,0.56); }
.hm.l3 { background: rgba(58,22,96,0.45); }
.hm.l4 { background: var(--violet-l); }

.chart-card { background: var(--parch2); border: 1.5px solid var(--border2); border-radius: 22px; padding: 18px; margin-bottom: 14px; box-shadow: var(--shadow); }
.chart-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
.chart-ranges { display: flex; gap: 3px; }
.rng { background: none; border: 1px solid transparent; border-radius: 8px; color: var(--ink4); font-size: 10px; font-weight: 800; padding: 3px 8px; cursor: pointer; font-family: 'Mulish', sans-serif; }
.rng.active { background: var(--violet-bg); border-color: rgba(58,22,96,0.3); color: var(--violet); }
.bars { display: flex; align-items: flex-end; gap: 4px; height: 80px; }
.bc { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; }
.bb { width: 100%; border-radius: 4px 4px 2px 2px; min-height: 4px; }
.bt { font-size: 9px; color: var(--ink4); font-weight: 800; }

.method-row { display: flex; gap: 8px; margin-bottom: 14px; overflow-x: auto; scrollbar-width: none; }
.mchip { flex-shrink: 0; background: var(--parch2); border: 1.5px solid var(--border2); border-radius: 20px; padding: 8px 14px; font-size: 12px; font-weight: 700; color: var(--gold-bright); cursor: pointer; font-family: 'Mulish', sans-serif; display: flex; align-items: center; gap: 8px; box-shadow: 0 1px 4px rgba(58,22,96,0.08); transition: all 0.18s; }
.mchip.sel { background: linear-gradient(135deg, var(--violet-bg), var(--emerald-bg)); border-color: rgba(58,22,96,0.4); color: var(--violet-l); }

.log-btn { width: 100%; padding: 17px; background: linear-gradient(135deg, var(--emerald-l), var(--violet-l)); border: none; border-radius: 18px; color: var(--gold-bright); font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 600; cursor: pointer; transition: all 0.2s; margin-bottom: 14px; box-shadow: 0 4px 20px rgba(58,22,96,0.3); font-style: italic; }
.log-btn:hover { transform: translateY(-2px); }
.log-btn:disabled { opacity: 0.6; transform: none; cursor: default; }

/* SCHEDULE */
.schedule-section { margin-bottom: 20px; }
.schedule-section-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.sched-legend { display: flex; gap: 12px; }
.legend-item { display: flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 700; color: var(--ink3); }
.legend-dot { width: 8px; height: 8px; border-radius: 50%; }
.week-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; margin-bottom: 8px; }
.wday { background: var(--parch2); border: 1.5px solid var(--border2); border-radius: 14px; padding: 10px 4px; text-align: center; cursor: pointer; }
.wday.target { background: linear-gradient(145deg, #e8d8f8, #d8ede8); border-color: rgba(58,22,96,0.3); }
.wday.logged { background: linear-gradient(145deg, #d0eadc, #c8e4d8); border-color: rgba(10,74,56,0.3); }
.wday.both   { background: linear-gradient(145deg, #dcd0f0, #c8e4d8); border-color: rgba(58,22,96,0.3); }
.wday-lbl { font-size: 9px; font-weight: 800; letter-spacing: 0.08em; color: var(--gold-bright); margin-bottom: 6px; text-transform: uppercase; }
.wday-dots { display: flex; justify-content: center; gap: 3px; }
.wdot { width: 8px; height: 8px; border-radius: 50%; background: var(--parch3); }
.wdot.target { background: var(--violet-l); box-shadow: 0 0 5px rgba(58,22,96,0.45); }
.wdot.logged { background: var(--emerald-l); box-shadow: 0 0 5px rgba(10,74,56,0.45); }
.schedule-note { font-size: 12px; color: var(--gold-bright); font-weight: 700; text-align: center; padding: 8px 0 4px; }
.schedule-note b { color: var(--violet); font-weight: 800; }
.week-target-row { display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; margin-bottom: 16px; }
.target-toggle { background: var(--parch2); border: 1.5px solid var(--border2); border-radius: 14px; padding: 10px 4px; text-align: center; cursor: pointer; }
.target-toggle.on { background: linear-gradient(145deg, #e8d8f8, #d8ede8); border-color: rgba(58,22,96,0.4); }
.target-toggle-lbl { font-size: 9px; font-weight: 800; letter-spacing: 0.08em; color: var(--gold-bright); margin-bottom: 6px; text-transform: uppercase; }
.target-toggle-dot { width: 10px; height: 10px; border-radius: 50%; margin: 0 auto; background: var(--parch3); }
.target-toggle.on .target-toggle-dot { background: var(--violet-l); box-shadow: 0 0 6px rgba(58,22,96,0.45); }
.cmp-label { font-size: 10px; font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase; color: var(--ink3); margin-bottom: 10px; }
.cmp-row { display: flex; align-items: center; gap: 10px; margin-bottom: 7px; }
.cmp-name { font-size: 12px; font-weight: 700; color: var(--ink3); width: 50px; flex-shrink: 0; }
.cmp-track { flex: 1; height: 8px; background: var(--parch3); border-radius: 4px; overflow: hidden; }
.cmp-fill { height: 100%; border-radius: 4px; }
.cmp-num { font-family: 'Playfair Display', serif; font-size: 14px; font-weight: 700; width: 26px; text-align: right; }

/* SAVINGS */
.savings-hero { border-radius: 28px; padding: 26px; margin-bottom: 14px; position: relative; overflow: hidden; background: linear-gradient(145deg, #f0e4c0, #e8d8a8, #f0e0b8); border: 1.5px solid rgba(122,77,0,0.3); box-shadow: 0 4px 32px rgba(122,77,0,0.18); }
.savings-glow { position: absolute; top: -60px; right: -60px; width: 200px; height: 200px; border-radius: 50%; background: conic-gradient(from 0deg, rgba(122,77,0,0.2), rgba(58,22,96,0.12), rgba(10,74,56,0.12), rgba(122,77,0,0.2)); filter: blur(28px); pointer-events: none; }
.sav-eyebrow { font-family: 'Playfair Display', serif; font-style: italic; font-size: 11px; color: var(--gold); margin-bottom: 6px; position: relative; z-index: 1; letter-spacing: 0.06em; }
.sav-big { font-family: 'Playfair Display', serif; font-size: 54px; font-weight: 700; color: var(--gold); line-height: 1; margin-bottom: 4px; position: relative; z-index: 1; }
.sav-sub { font-size: 13px; color: var(--ink3); font-weight: 700; margin-bottom: 20px; position: relative; z-index: 1; }
.sav-tiles { display: flex; gap: 8px; position: relative; z-index: 1; }
.sav-tile { flex: 1; background: rgba(245,234,216,0.75); border-radius: 14px; padding: 12px; border: 1px solid rgba(122,77,0,0.2); }
.sav-tile-lbl { font-size: 9px; color: var(--ink4); font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 5px; }
.sav-tile-val { font-family: 'Playfair Display', serif; font-size: 19px; font-weight: 700; color: var(--gold); }

/* BOTTOM NAV */
.bottom-nav { position: fixed; bottom: 0; left: 50%; transform: translateX(-50%); width: 430px; max-width: 100%; background: rgba(245,234,216,0.97); backdrop-filter: blur(20px); border-top: 1.5px solid var(--border2); display: flex; z-index: 100; padding: 10px 0 18px; box-shadow: 0 -4px 24px rgba(58,22,96,0.1); }
.nbtn { flex: 1; padding: 4px 6px; display: flex; flex-direction: column; align-items: center; gap: 5px; background: none; border: none; cursor: pointer; transition: all 0.18s; }
.nbtn-lbl { font-size: 9px; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase; color: var(--gold-bright); font-family: 'Mulish', sans-serif; transition: color 0.18s; }
.nbtn.active .nbtn-lbl { color: var(--violet-l); }
.nbtn.active::after { content: ''; display: block; width: 4px; height: 4px; border-radius: 50%; background: var(--violet-l); margin: 0 auto; }

/* MODAL / SHEET */
.overlay { position: fixed; inset: 0; background: rgba(14,10,6,0.65); backdrop-filter: blur(6px); z-index: 200; display: flex; align-items: flex-end; justify-content: center; }
.sheet { background: var(--parch); border: 1.5px solid var(--border2); border-radius: 28px 28px 0 0; padding: 12px 22px 36px; width: 100%; max-width: 430px; position: relative; animation: sheetUp 0.32s cubic-bezier(0.34,1.4,0.64,1); overflow-y: auto; max-height: 92vh; }
@keyframes sheetUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
.sheet-handle { width: 40px; height: 4px; background: var(--parch3); border-radius: 2px; margin: 0 auto 20px; }
.sheet-title { font-family: 'Playfair Display', serif; font-size: 26px; font-weight: 600; color: var(--ink); margin-bottom: 4px; }
.sheet-title em { font-style: italic; color: var(--violet-l); }
.sheet-sub { font-size: 12px; color: var(--ink4); font-weight: 700; margin-bottom: 22px; }
.sheet-close { position: absolute; top: 18px; right: 20px; background: var(--parch2); border: 1.5px solid var(--border2); border-radius: 50%; width: 30px; height: 30px; color: var(--ink3); font-size: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 2; }
.form-block { margin-bottom: 22px; }
.form-lbl { font-family: 'Playfair Display', serif; font-style: italic; font-size: 12px; color: var(--ink3); margin-bottom: 10px; display: block; }
.sheet-methods { display: flex; gap: 8px; overflow-x: auto; scrollbar-width: none; padding-bottom: 2px; }
.sm-chip { flex-shrink: 0; background: var(--parch2); border: 1.5px solid var(--border2); border-radius: 20px; padding: 8px 14px; font-size: 12px; font-weight: 700; color: var(--gold-bright); cursor: pointer; font-family: 'Mulish', sans-serif; display: flex; align-items: center; gap: 7px; transition: all 0.18s; }
.sm-chip.sel { background: linear-gradient(135deg, var(--violet-bg), var(--emerald-bg)); border-color: rgba(58,22,96,0.4); color: var(--violet-l); }
.slider-disp { font-family: 'Playfair Display', serif; font-size: 36px; font-weight: 700; color: var(--violet); line-height: 1; margin-bottom: 10px; }
input[type=range] { width: 100%; -webkit-appearance: none; height: 6px; border-radius: 3px; outline: none; background: linear-gradient(90deg, var(--violet-l) var(--pct, 15%), var(--parch3) var(--pct, 15%)); }
input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 24px; height: 24px; border-radius: 50%; background: linear-gradient(135deg, var(--violet-l), var(--emerald-l)); cursor: pointer; box-shadow: 0 2px 10px rgba(58,22,96,0.4); }
.size-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 8px; }
.size-tile { background: var(--parch2); border: 1.5px solid var(--border2); border-radius: 14px; padding: 14px 6px 10px; text-align: center; cursor: pointer; transition: all 0.18s; display: flex; flex-direction: column; align-items: center; gap: 6px; }
.size-tile.sel { background: linear-gradient(145deg, #e8d8f8, #d8ede8); border-color: rgba(58,22,96,0.4); }
.size-tile-lbl { font-size: 11px; font-weight: 800; color: var(--gold-bright); letter-spacing: 0.04em; }
.size-tile.sel .size-tile-lbl { color: var(--violet-l); }
.feel-row { display: flex; gap: 7px; flex-wrap: wrap; }
.fchip { background: var(--parch2); border: 1.5px solid var(--border2); border-radius: 20px; padding: 8px 14px; font-size: 12px; font-weight: 700; color: var(--ink3); cursor: pointer; font-family: 'Mulish', sans-serif; transition: all 0.18s; }
.fchip.on { background: linear-gradient(135deg, var(--violet-bg), var(--emerald-bg)); border-color: rgba(58,22,96,0.4); color: var(--violet-l); }
.input-divider { height: 1px; background: var(--border2); margin: 4px 0 20px; }

/* TOAST */
.toast { position: fixed; top: 20px; left: 50%; transform: translateX(-50%); z-index: 9999; padding: 12px 22px; border-radius: 40px; font-family: 'Mulish', sans-serif; font-size: 13px; font-weight: 800; box-shadow: 0 4px 24px rgba(58,22,96,0.25); animation: toastIn 0.3s cubic-bezier(0.34,1.4,0.64,1); white-space: nowrap; }
.toast.success { background: linear-gradient(135deg, var(--emerald-l), var(--violet-l)); color: var(--parch); }
.toast.error   { background: #c0392b; color: #fff; }
@keyframes toastIn { from { transform: translateX(-50%) translateY(-16px); opacity: 0; } to { transform: translateX(-50%) translateY(0); opacity: 1; } }
`

const navIconColor = (key, tab) => tab === key ? '#5e2d99' : '#3a2c1e'

export default function Threshold() {
  const { user, profile, loading: authLoading, signUp, signIn, signOut, updateProfile } = useAuth()
  const appData = useAppData(user, profile)
  const timer   = useTimer()
  const [tab,         setTab]         = useState('feed')
  const [method,      setMethod]      = useState('flower')
  const [showLog,     setShowLog]     = useState(false)
  const [showSignOut, setShowSignOut] = useState(false)

  // Log a session then auto-start the count-up timer
  const handleLogSession = useCallback(async (sessionData) => {
    await appData.logSession(sessionData)
    // Start timer in count-up mode so they can track time since last session
    timer.start('up')
  }, [appData, timer])

  if (!supabaseConfigured) {
    return (
      <>
        <style>{css}</style>
        <div className="paper-bg" /><div className="vignette" />
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--parch)', padding: 28 }}>
          <div className="logo" style={{ fontSize: 36, marginBottom: 12 }}>thresh<em>old</em></div>
          <p style={{ color: 'var(--ink4)', fontSize: 13, fontWeight: 700, textAlign: 'center', lineHeight: 1.7, marginBottom: 24 }}>
            This app needs a Supabase project to work.<br />
            Add your credentials to get started.
          </p>
          <div style={{ width: '100%', maxWidth: 360, background: 'var(--parch2)', border: '1.5px solid var(--border2)', borderRadius: 20, padding: '20px 20px', boxShadow: 'var(--shadow2)', fontFamily: "'Mulish', sans-serif" }}>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink4)', marginBottom: 10 }}>setup steps</div>
            {[
              ['1', 'Create a free project at supabase.com'],
              ['2', 'Run supabase/schema.sql in the SQL Editor'],
              ['3', 'Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON as GitHub repository secrets (Settings → Secrets → Actions)'],
              ['4', 'Re-run the GitHub Actions deploy workflow'],
            ].map(([n, t]) => (
              <div key={n} style={{ display: 'flex', gap: 12, marginBottom: 10, alignItems: 'flex-start' }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--violet-bg)', border: '1.5px solid rgba(94,45,153,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: 'var(--violet)', flexShrink: 0 }}>{n}</div>
                <p style={{ fontSize: 12, color: 'var(--ink3)', fontWeight: 700, lineHeight: 1.6, margin: 0 }}>{t}</p>
              </div>
            ))}
          </div>
        </div>
      </>
    )
  }

  if (authLoading) {
    return (
      <>
        <style>{css}</style>
        <div className="paper-bg" /><div className="vignette" />
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--parch)' }}>
          <div className="logo" style={{ fontSize: 32 }}>thresh<em>old</em></div>
        </div>
      </>
    )
  }

  if (!user) {
    return (
      <>
        <style>{css}</style>
        <div className="paper-bg" /><div className="vignette" />
        <Auth onAuth={{ signUp, signIn }} />
      </>
    )
  }

  const initials = (profile?.username ?? user.email ?? '?').slice(0, 1).toUpperCase()

  return (
    <>
      <style>{css}</style>
      <div className="paper-bg" />
      <div className="vignette" />

      {/* Toast */}
      {appData.toast && (
        <div className={`toast ${appData.toast.type}`}>{appData.toast.message}</div>
      )}

      {/* Sign-out confirm */}
      {showSignOut && (
        <div className="overlay" onClick={() => setShowSignOut(false)}>
          <div className="sheet" style={{ paddingBottom: 24 }}>
            <div className="sheet-handle" />
            <div className="sheet-title">sign <em>out?</em></div>
            <div className="sheet-sub">your data is saved in the cloud.</div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowSignOut(false)} style={{ flex: 1, padding: '13px', background: 'none', border: '1.5px solid var(--border2)', borderRadius: 14, color: 'var(--ink4)', fontFamily: "'Mulish',sans-serif", fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>cancel</button>
              <button onClick={signOut} style={{ flex: 1, padding: '13px', background: 'var(--violet-l)', border: 'none', borderRadius: 14, color: 'var(--parch)', fontFamily: "'Mulish',sans-serif", fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>sign out</button>
            </div>
          </div>
        </div>
      )}

      <div className="app">
        <div className="header">
          <div className="logo">thresh<em>old</em></div>
          <div className="header-right">
            <div className="notif-btn">
              <BellIllustration size={18} color="var(--ink3)" />
              <div className="notif-dot" />
            </div>
            <div className="avatar" onClick={() => setShowSignOut(true)} title="Sign out">{initials}</div>
          </div>
        </div>

        <div className="tabs">
          {[['feed', LeafIllustration], ['tracker', TrackerIllustration], ['schedule', ScheduleIllustration], ['savings', SavingsIllustration]].map(([key, Ill]) => (
            <button key={key} className={`tab ${tab === key ? 'active' : ''}`} onClick={() => setTab(key)}>
              <Ill size={22} color={navIconColor(key, tab)} />
              {key}
            </button>
          ))}
        </div>

        <div className="content">
          {tab === 'feed' && (
            <Feed
              feed={appData.feed}
              likedPosts={appData.likedPosts}
              onToggleLike={appData.toggleLike}
              onCreatePost={appData.createPost}
              profile={profile}
              loading={appData.loadingFeed}
            />
          )}

          {tab === 'tracker' && (
            <Tracker
              toleranceScore={appData.toleranceScore}
              sessions={appData.sessions}
              streak={appData.streak}
              activeTBreak={appData.activeTBreak}
              tBreakDays={appData.tBreakDays}
              tBreakHours={appData.tBreakHours}
              onStartTBreak={appData.startTBreak}
              onEndTBreak={appData.endTBreak}
              onDeleteSession={appData.deleteSession}
              onOpenLog={() => setShowLog(true)}
              method={method}
              setMethod={setMethod}
              timer={timer}
            />
          )}

          {tab === 'schedule' && (
            <Schedule
              sessions={appData.sessions}
              activeTBreak={appData.activeTBreak}
              profile={profile}
              onUpdateProfile={updateProfile}
              currentTolerance={appData.toleranceScore}
            />
          )}

          {tab === 'savings' && (
            <Savings
              sessions={appData.sessions}
              profile={profile}
              onUpdateProfile={updateProfile}
            />
          )}
        </div>

        <div className="bottom-nav">
          {[['feed', LeafIllustration], ['tracker', TrackerIllustration], ['schedule', ScheduleIllustration], ['savings', SavingsIllustration]].map(([key, NavIll]) => (
            <button key={key} className={`nbtn ${tab === key ? 'active' : ''}`} onClick={() => setTab(key)}>
              <NavIll size={24} color={navIconColor(key, tab)} />
              <span className="nbtn-lbl">{key}</span>
            </button>
          ))}
        </div>
      </div>

      {showLog && (
        <LogModal
          initialMethod={method}
          onClose={() => setShowLog(false)}
          onSave={handleLogSession}
        />
      )}
    </>
  )
}
