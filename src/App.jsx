import { useState, useEffect, useRef, useCallback } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// THEME
// ─────────────────────────────────────────────────────────────────────────────
const T = {
  charcoal: "#1C1C1E",
  charcoalLight: "#2A2A2C",
  charcoalMid: "#3A3A3C",
  gold: "#C9A84C",
  goldLight: "#E2C47A",
  goldDim: "#8B6F2E",
  offWhite: "#F5F0E8",
  offWhiteDim: "#D6CEBF",
};

// ─────────────────────────────────────────────────────────────────────────────
// GLOBAL STYLES
// ─────────────────────────────────────────────────────────────────────────────
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=Montserrat:wght@300;400;500;600;700&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --charcoal:       ${T.charcoal};
      --charcoal-light: ${T.charcoalLight};
      --charcoal-mid:   ${T.charcoalMid};
      --gold:           ${T.gold};
      --gold-light:     ${T.goldLight};
      --gold-dim:       ${T.goldDim};
      --off-white:      ${T.offWhite};
      --off-white-dim:  ${T.offWhiteDim};
    }
    html { scroll-behavior: smooth; }
    body {
      background: var(--charcoal);
      color: var(--off-white);
      font-family: 'Montserrat', sans-serif;
      font-weight: 300;
      -webkit-font-smoothing: antialiased;
      overflow-x: hidden;
    }

    /* ── PAGE LOADER ─────────────────────────────────────────────────────── */
    .page-loader {
      position: fixed; inset: 0; z-index: 9999;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      pointer-events: none;
      overflow: hidden;
    }
    /* Two curtain panels slide in from top/bottom */
    .loader-curtain-top,
    .loader-curtain-bottom {
      position: absolute; left: 0; right: 0;
      height: 50%; background: var(--charcoal-light);
      transition: transform 0.72s cubic-bezier(0.77,0,0.175,1);
    }
    .loader-curtain-top    { top: 0;   transform: translateY(-100%); }
    .loader-curtain-bottom { bottom: 0; transform: translateY(100%); }
    .page-loader.entering .loader-curtain-top    { transform: translateY(0); }
    .page-loader.entering .loader-curtain-bottom { transform: translateY(0); }
    .page-loader.holding  .loader-curtain-top    { transform: translateY(0); }
    .page-loader.holding  .loader-curtain-bottom { transform: translateY(0); }
    .page-loader.exiting  .loader-curtain-top    { transform: translateY(-100%); }
    .page-loader.exiting  .loader-curtain-bottom { transform: translateY(100%); }

    /* Gold progress bar */
    .loader-bar-track {
      position: absolute; z-index: 2;
      width: 240px; height: 1px;
      background: rgba(201,168,76,0.2);
      opacity: 0; transition: opacity 0.3s;
    }
    .page-loader.holding .loader-bar-track { opacity: 1; }
    .loader-bar-fill {
      height: 100%; width: 0%; background: var(--gold);
      transition: width 0.55s ease;
    }
    .page-loader.holding .loader-bar-fill { width: 100%; }

    /* Brand mark shown during load */
    .loader-brand {
      position: absolute; z-index: 2;
      display: flex; flex-direction: column; align-items: center; gap: 6px;
      opacity: 0; transform: translateY(10px);
      transition: opacity 0.35s 0.2s, transform 0.35s 0.2s;
    }
    .page-loader.holding .loader-brand { opacity: 1; transform: translateY(0); }
    .loader-brand-name {
      font-family: 'Cormorant Garamond', serif; font-weight: 300;
      font-size: 1.6rem; letter-spacing: 0.18em; text-transform: uppercase;
      color: var(--off-white);
    }
    .loader-brand-sub {
      font-size: 0.58rem; letter-spacing: 0.45em;
      text-transform: uppercase; color: var(--gold); font-weight: 500;
    }
    .loader-brand-bar {
      width: 32px; height: 1px; background: var(--gold); margin-top: 8px;
    }
    .loader-page-name {
      font-size: 0.6rem; letter-spacing: 0.38em;
      text-transform: uppercase; color: var(--off-white-dim);
      margin-top: 40px;
    }

    /* ── NAVBAR ──────────────────────────────────────────────────────────── */
    .navbar {
      position: fixed; top: 0; left: 0; right: 0; z-index: 100;
      transition: background 0.4s ease, box-shadow 0.4s ease;
    }
    .navbar.scrolled {
      background: rgba(28,28,30,0.96);
      box-shadow: 0 1px 0 rgba(201,168,76,0.25);
      backdrop-filter: blur(14px);
    }
    .navbar-inner {
      max-width: 1280px; margin: 0 auto; padding: 26px 40px;
      display: flex; align-items: center; justify-content: space-between;
      transition: padding 0.4s ease;
    }
    .navbar.scrolled .navbar-inner { padding: 16px 40px; }
    .brand { display: flex; flex-direction: row; align-items: center; gap: 0; text-decoration: none; cursor: pointer; background: none; border: none; text-align: left; padding: 0; }
    .brand-logo { height: 52px; width: auto; object-fit: contain; transition: height 0.4s ease; }
    .navbar.scrolled .brand-logo { height: 40px; }
    .brand-text { display: flex; flex-direction: column; gap: 2px; }
    .brand-name { font-family: 'Cormorant Garamond', serif; font-weight: 300; font-size: 1.45rem; letter-spacing: 0.12em; color: var(--off-white); line-height: 1; text-transform: uppercase; }
    .brand-sub  { font-size: 0.6rem; letter-spacing: 0.35em; color: var(--gold); text-transform: uppercase; font-weight: 500; }
    .loader-logo { width: 220px; height: auto; object-fit: contain; margin-bottom: 20px; }
    .footer-brand-logo { width: 200px; height: auto; object-fit: contain; margin-bottom: 20px; }
    .nav-links  { display: flex; align-items: center; gap: 40px; list-style: none; }
    .nav-link {
      position: relative; font-size: 0.7rem; letter-spacing: 0.22em;
      text-transform: uppercase; color: var(--off-white-dim);
      font-weight: 400; transition: color 0.3s;
      cursor: pointer; background: none; border: none; padding: 0;
    }
    .nav-link::after { content: ''; position: absolute; bottom: -4px; left: 0; width: 0; height: 1px; background: var(--gold); transition: width 0.35s ease; }
    .nav-link:hover { color: var(--gold-light); }
    .nav-link:hover::after { width: 100%; }
    .nav-link.active { color: var(--gold); }
    .nav-link.active::after { width: 100%; }
    .nav-cta { font-size: 0.65rem; letter-spacing: 0.22em; text-transform: uppercase; font-weight: 500; color: var(--charcoal); background: var(--gold); border: none; padding: 10px 22px; cursor: pointer; transition: background 0.3s, transform 0.2s; }
    .nav-cta:hover { background: var(--gold-light); transform: translateY(-1px); }
    .hamburger { display: none; flex-direction: column; gap: 5px; cursor: pointer; background: none; border: none; padding: 4px; }
    .hamburger span { display: block; width: 24px; height: 1px; background: var(--off-white); transition: all 0.3s ease; }
    .hamburger.open span:nth-child(1) { transform: translateY(6px) rotate(45deg); }
    .hamburger.open span:nth-child(2) { opacity: 0; }
    .hamburger.open span:nth-child(3) { transform: translateY(-6px) rotate(-45deg); }
    .mobile-menu { position: fixed; top: 0; right: 0; width: min(320px,85vw); height: 100vh; background: var(--charcoal-light); border-left: 1px solid rgba(201,168,76,0.2); transform: translateX(100%); transition: transform 0.45s cubic-bezier(0.77,0,0.175,1); z-index: 99; display: flex; flex-direction: column; padding: 100px 40px 40px; gap: 32px; }
    .mobile-menu.open { transform: translateX(0); }
    .mobile-menu .nav-link { font-size: 0.85rem; color: var(--off-white-dim); }
    .overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 98; opacity: 0; pointer-events: none; transition: opacity 0.4s; }
    .overlay.open { opacity: 1; pointer-events: all; }

    /* ── PAGE WRAPPER (fade on entry) ───────────────────────────────────── */
    .page-content {
      opacity: 0; transform: translateY(12px);
      transition: opacity 0.5s ease, transform 0.5s ease;
    }
    .page-content.visible { opacity: 1; transform: translateY(0); }

    /* ── PAGE HERO BANNER (shared) ──────────────────────────────────────── */
    .page-hero {
      position: relative; min-height: 52vh;
      display: flex; align-items: flex-end;
      overflow: hidden;
      padding-top: 80px;
    }
    .page-hero-bg { position: absolute; inset: 0; }
    .page-hero-bg img { width: 100%; height: 100%; object-fit: cover; transform: scale(1.04); animation: heroZoom 16s ease-out forwards; }
    .page-hero-overlay { position: absolute; inset: 0; background: linear-gradient(135deg, rgba(28,28,30,0.88) 0%, rgba(28,28,30,0.55) 60%, rgba(28,28,30,0.80) 100%); }
    .page-hero-content { position: relative; z-index: 1; max-width: 1280px; margin: 0 auto; width: 100%; padding: 60px 40px; }
    .page-hero-eyebrow { font-size: 0.6rem; letter-spacing: 0.42em; text-transform: uppercase; color: var(--gold); display: flex; align-items: center; gap: 14px; margin-bottom: 18px; }
    .page-hero-eyebrow::before { content: ''; display: block; width: 28px; height: 1px; background: var(--gold); }
    .page-hero-title { font-family: 'Cormorant Garamond', serif; font-weight: 300; font-size: clamp(2.8rem, 5vw, 5rem); line-height: 1.08; color: var(--off-white); }
    .page-hero-title em { font-style: italic; color: var(--gold-light); }

    /* ── SHARED SECTION UTILS ───────────────────────────────────────────── */
    .s-eyebrow { font-size: 0.6rem; letter-spacing: 0.4em; text-transform: uppercase; color: var(--gold); display: block; font-weight: 500; }
    .s-title { font-family: 'Cormorant Garamond', serif; font-weight: 300; font-size: clamp(2rem, 3.2vw, 3.4rem); line-height: 1.12; color: var(--off-white); }
    .s-title em { font-style: italic; color: var(--gold-light); }
    .s-body { font-size: 0.88rem; line-height: 2; color: var(--off-white-dim); }
    .s-rule { width: 48px; height: 1px; background: var(--gold); }
    .section-wrap { max-width: 1280px; margin: 0 auto; padding: 0 40px; }

    /* ── BUTTONS ────────────────────────────────────────────────────────── */
    .btn-gold { font-size: 0.68rem; letter-spacing: 0.22em; text-transform: uppercase; font-weight: 600; color: var(--charcoal); background: var(--gold); border: none; padding: 15px 36px; cursor: pointer; transition: background 0.3s, transform 0.25s, box-shadow 0.3s; position: relative; overflow: hidden; }
    .btn-gold:hover { background: var(--gold-light); transform: translateY(-3px); box-shadow: 0 12px 32px rgba(201,168,76,0.35); }
    .btn-outline { font-size: 0.68rem; letter-spacing: 0.22em; text-transform: uppercase; font-weight: 400; color: var(--off-white); background: rgba(255,255,255,0.04); border: 1px solid rgba(245,240,232,0.3); padding: 15px 36px; cursor: pointer; transition: border-color 0.3s, color 0.3s, background 0.3s, transform 0.25s; }
    .btn-outline:hover { border-color: var(--gold); color: var(--gold-light); background: rgba(201,168,76,0.07); transform: translateY(-3px); }

    /* ── SCROLL REVEAL ──────────────────────────────────────────────────── */
    .reveal { opacity: 0; transform: translateY(28px); transition: opacity 0.7s ease, transform 0.7s ease; }
    .reveal.visible { opacity: 1; transform: translateY(0); }

    /* ═══════════════════════════════════════════════════════════════════
       HOME PAGE
    ═══════════════════════════════════════════════════════════════════ */
    .hero { position: relative; min-height: 100vh; display: flex; flex-direction: column; justify-content: center; overflow: hidden; }
    .hero-bg { position: absolute; inset: 0; z-index: 0; }
    .hero-bg img { width: 100%; height: 100%; object-fit: cover; transform: scale(1.06); animation: heroZoom 18s ease-out forwards; }
    .hero-bg-overlay { position: absolute; inset: 0; background: linear-gradient(135deg, rgba(28,28,30,0.92) 0%, rgba(28,28,30,0.55) 50%, rgba(28,28,30,0.75) 100%), linear-gradient(to top, rgba(28,28,30,0.9) 0%, transparent 40%); }
    .hero-bg-gold { position: absolute; inset: 0; background: radial-gradient(ellipse at 70% 30%, rgba(201,168,76,0.07) 0%, transparent 60%); }
    .hero-deco { position: absolute; inset: 0; z-index: 1; overflow: hidden; pointer-events: none; }
    .hero-deco::before { content: ''; position: absolute; top: 0; right: 18%; width: 1px; height: 100%; background: linear-gradient(to bottom, transparent, rgba(201,168,76,0.18) 30%, rgba(201,168,76,0.18) 70%, transparent); }
    .hero-deco::after  { content: ''; position: absolute; top: 0; right: calc(18% + 8px); width: 1px; height: 100%; background: linear-gradient(to bottom, transparent, rgba(201,168,76,0.07) 30%, rgba(201,168,76,0.07) 70%, transparent); }
    .hero-content { position: relative; z-index: 2; max-width: 1280px; margin: 0 auto; width: 100%; padding: 0 40px; padding-top: 120px; display: grid; grid-template-columns: 1fr 420px; gap: 60px; align-items: center; min-height: 100vh; }
    .hero-left { display: flex; flex-direction: column; }
    .hero-location { display: inline-flex; align-items: center; gap: 10px; margin-bottom: 32px; opacity: 0; animation: fadeUp 0.8s 0.2s forwards; }
    .hero-location-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--gold); box-shadow: 0 0 8px rgba(201,168,76,0.6); animation: pulse 2s infinite; }
    .hero-location-text { font-size: 0.62rem; letter-spacing: 0.4em; text-transform: uppercase; color: var(--gold); font-weight: 500; }
    .hero-title { font-family: 'Cormorant Garamond', serif; font-weight: 300; font-size: clamp(2.8rem, 4.5vw, 5.2rem); line-height: 1.08; color: var(--off-white); margin-bottom: 28px; opacity: 0; animation: fadeUp 0.9s 0.45s forwards; }
    .hero-title .highlight { font-style: italic; color: var(--gold-light); display: block; }
    .hero-title .underline-gold { position: relative; display: inline-block; }
    .hero-title .underline-gold::after { content: ''; position: absolute; bottom: 4px; left: 0; width: 100%; height: 2px; background: linear-gradient(to right, var(--gold), var(--gold-light), transparent); }
    .hero-tagline { font-family: 'Cormorant Garamond', serif; font-style: italic; font-weight: 300; font-size: clamp(1.1rem,1.8vw,1.45rem); color: var(--gold-light); letter-spacing: 0.05em; margin-bottom: 20px; opacity: 0; animation: fadeUp 0.9s 0.65s forwards; }
    .hero-divider { display: flex; align-items: center; gap: 16px; margin-bottom: 28px; opacity: 0; animation: fadeUp 0.8s 0.8s forwards; }
    .hero-divider-line { width: 48px; height: 1px; background: var(--gold); }
    .hero-divider-text { font-size: 0.6rem; letter-spacing: 0.35em; text-transform: uppercase; color: var(--off-white-dim); }
    .hero-body { font-size: 0.87rem; line-height: 1.95; color: var(--off-white-dim); max-width: 520px; margin-bottom: 48px; opacity: 0; animation: fadeUp 0.9s 0.95s forwards; }
    .hero-cta-row { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; opacity: 0; animation: fadeUp 0.9s 1.1s forwards; }
    .hero-right { display: flex; flex-direction: column; gap: 20px; align-items: flex-end; opacity: 0; animation: fadeIn 1s 1.3s forwards; }
    .hero-award-card { background: rgba(28,28,30,0.85); border: 1px solid rgba(201,168,76,0.3); backdrop-filter: blur(16px); padding: 28px 32px; width: 100%; }
    .hero-award-icon { font-size: 1.8rem; margin-bottom: 8px; display: block; }
    .hero-award-title { font-family: 'Cormorant Garamond', serif; font-size: 1.15rem; color: var(--off-white); font-weight: 400; margin-bottom: 4px; }
    .hero-award-sub { font-size: 0.62rem; letter-spacing: 0.25em; text-transform: uppercase; color: var(--gold); }
    .hero-image-thumb { width: 100%; aspect-ratio: 4/3; overflow: hidden; position: relative; }
    .hero-image-thumb img { width: 100%; height: 100%; object-fit: cover; filter: brightness(0.7) sepia(0.15); transition: transform 0.6s ease; }
    .hero-image-thumb:hover img { transform: scale(1.04); }
    .hero-image-thumb-caption { position: absolute; bottom: 0; left: 0; right: 0; padding: 20px 20px 16px; background: linear-gradient(to top, rgba(28,28,30,0.9), transparent); font-size: 0.62rem; letter-spacing: 0.25em; text-transform: uppercase; color: var(--gold); }
    .hero-scroll { position: absolute; bottom: 40px; left: 50%; transform: translateX(-50%); z-index: 3; display: flex; flex-direction: column; align-items: center; gap: 10px; opacity: 0; animation: fadeIn 1s 1.8s forwards; cursor: pointer; }
    .hero-scroll-label { font-size: 0.55rem; letter-spacing: 0.4em; text-transform: uppercase; color: var(--off-white-dim); }
    .hero-scroll-track { width: 1px; height: 56px; background: rgba(245,240,232,0.2); position: relative; overflow: hidden; }
    .hero-scroll-track::after { content: ''; position: absolute; top: -100%; left: 0; width: 100%; height: 50%; background: var(--gold); animation: scrollDrop 2s 2s ease-in-out infinite; }

    /* ── STATS BAR ──────────────────────────────────────────────────────── */
    .stats-bar { position: relative; background: var(--charcoal-light); border-top: 1px solid rgba(201,168,76,0.2); border-bottom: 1px solid rgba(201,168,76,0.2); overflow: hidden; }
    .stats-bar::before { content: ''; position: absolute; top: 0; left: -100%; width: 50%; height: 100%; background: linear-gradient(90deg, transparent, rgba(201,168,76,0.04), transparent); animation: shimmer 4s 2s ease-in-out infinite; }
    .stats-bar-inner { max-width: 1280px; margin: 0 auto; padding: 0 40px; display: grid; grid-template-columns: repeat(4,1fr); position: relative; z-index: 1; }
    .stat-item { padding: 52px 40px; display: flex; flex-direction: column; align-items: center; text-align: center; position: relative; cursor: default; }
    .stat-item + .stat-item::before { content: ''; position: absolute; left: 0; top: 50%; transform: translateY(-50%); width: 1px; height: 60%; background: linear-gradient(to bottom, transparent, rgba(201,168,76,0.3), transparent); }
    .stat-number { font-family: 'Cormorant Garamond', serif; font-weight: 300; font-size: clamp(3rem,4vw,4.2rem); line-height: 1; color: var(--off-white); margin-bottom: 4px; transition: color 0.3s; }
    .stat-number .stat-suffix { color: var(--gold); font-style: italic; }
    .stat-item:hover .stat-number { color: var(--gold-light); }
    .stat-label { font-size: 0.65rem; letter-spacing: 0.28em; text-transform: uppercase; color: var(--off-white-dim); font-weight: 400; margin-top: 10px; line-height: 1.6; }
    .stat-icon { width: 28px; height: 1px; background: var(--gold); margin: 0 auto 18px; opacity: 0.5; transition: width 0.4s ease, opacity 0.3s; }
    .stat-item:hover .stat-icon { width: 48px; opacity: 1; }

    /* ── SERVICES SECTION ───────────────────────────────────────────────── */
    .services-section { position: relative; background: var(--charcoal); overflow: hidden; }
    .services-section::before { content: ''; position: absolute; inset: 0; background: repeating-linear-gradient(-55deg, transparent, transparent 80px, rgba(201,168,76,0.018) 80px, rgba(201,168,76,0.018) 81px); pointer-events: none; }
    .services-inner { max-width: 1280px; margin: 0 auto; padding: 120px 40px; position: relative; z-index: 1; }
    .services-header { text-align: center; margin-bottom: 80px; }
    .services-eyebrow { display: inline-flex; align-items: center; gap: 14px; font-size: 0.62rem; letter-spacing: 0.4em; text-transform: uppercase; color: var(--gold); font-weight: 500; margin-bottom: 20px; }
    .services-eyebrow::before, .services-eyebrow::after { content: ''; display: block; width: 32px; height: 1px; background: var(--gold); opacity: 0.6; }
    .services-title { font-family: 'Cormorant Garamond', serif; font-weight: 300; font-size: clamp(2.2rem,3.5vw,3.6rem); line-height: 1.1; color: var(--off-white); margin-bottom: 20px; }
    .services-title em { font-style: italic; color: var(--gold-light); }
    .services-subtitle { font-size: 0.85rem; line-height: 1.9; color: var(--off-white-dim); max-width: 560px; margin: 0 auto; }
    .services-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 2px; }
    .service-card { position: relative; background: var(--charcoal-light); overflow: hidden; cursor: default; opacity: 0; transform: translateY(32px); transition: opacity 0.6s ease, transform 0.6s ease, background 0.4s ease; }
    .service-card.visible { opacity: 1; transform: translateY(0); }
    .service-card:hover { background: var(--charcoal-mid); }
    .service-card-image { position: absolute; inset: 0; z-index: 0; overflow: hidden; }
    .service-card-image img { width: 100%; height: 100%; object-fit: cover; filter: brightness(0.15) saturate(0.3); transition: filter 0.65s ease, transform 0.75s ease; }
    .service-card:hover .service-card-image img { filter: brightness(0.28) saturate(0.6); transform: scale(1.07); }
    .service-card-body { position: relative; z-index: 1; padding: 48px 40px 44px; display: flex; flex-direction: column; min-height: 340px; }
    .service-card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; }
    .service-card-num { font-family: 'Cormorant Garamond', serif; font-size: 4.5rem; font-weight: 300; line-height: 1; color: rgba(201,168,76,0.13); transition: color 0.4s; user-select: none; }
    .service-card:hover .service-card-num { color: rgba(201,168,76,0.25); }
    .service-card-icon-wrap { width: 52px; height: 52px; border: 1px solid rgba(201,168,76,0.3); display: flex; align-items: center; justify-content: center; transition: border-color 0.4s, background 0.4s; flex-shrink: 0; }
    .service-card:hover .service-card-icon-wrap { border-color: var(--gold); background: rgba(201,168,76,0.1); }
    .service-card-icon { font-size: 1.4rem; line-height: 1; }
    .service-card-tag { font-size: 0.55rem; letter-spacing: 0.3em; text-transform: uppercase; color: var(--gold-dim); margin-bottom: 10px; font-weight: 500; transition: color 0.3s; }
    .service-card:hover .service-card-tag { color: var(--gold); }
    .service-card-title { font-family: 'Cormorant Garamond', serif; font-size: 1.42rem; font-weight: 400; color: var(--off-white); line-height: 1.25; margin-bottom: 14px; transition: color 0.3s; }
    .service-card:hover .service-card-title { color: var(--gold-light); }
    .service-card-rule { width: 32px; height: 1px; background: var(--gold); margin-bottom: 16px; opacity: 0.5; transition: width 0.5s ease, opacity 0.4s; }
    .service-card:hover .service-card-rule { width: 60px; opacity: 1; }
    .service-card-desc { font-size: 0.82rem; line-height: 1.85; color: var(--off-white-dim); flex: 1; }
    .service-card-link { display: inline-flex; align-items: center; gap: 10px; margin-top: 28px; font-size: 0.6rem; letter-spacing: 0.3em; text-transform: uppercase; color: var(--gold-dim); font-weight: 500; transition: color 0.3s, gap 0.35s; background: none; border: none; cursor: pointer; padding: 0; }
    .service-card:hover .service-card-link { color: var(--gold); gap: 16px; }
    .service-card-link-arrow { font-size: 0.9rem; transition: transform 0.35s ease; }
    .service-card:hover .service-card-link-arrow { transform: translateX(4px); }
    .service-card::after { content: ''; position: absolute; bottom: 0; left: 0; width: 0; height: 2px; background: linear-gradient(to right, var(--gold), var(--gold-light)); transition: width 0.55s cubic-bezier(0.4,0,0.2,1); }
    .service-card:hover::after { width: 100%; }
    .services-cta-banner { margin-top: 64px; border: 1px solid rgba(201,168,76,0.2); padding: 48px 60px; display: flex; align-items: center; justify-content: space-between; gap: 40px; background: var(--charcoal-light); position: relative; overflow: hidden; }
    .services-cta-banner::before { content: ''; position: absolute; top: 0; left: 0; width: 4px; height: 100%; background: linear-gradient(to bottom, var(--gold), var(--gold-light)); }
    .services-cta-text-group { display: flex; flex-direction: column; gap: 6px; }
    .services-cta-label { font-size: 0.6rem; letter-spacing: 0.35em; text-transform: uppercase; color: var(--gold); }
    .services-cta-heading { font-family: 'Cormorant Garamond', serif; font-weight: 300; font-size: clamp(1.4rem,2.2vw,2rem); color: var(--off-white); }
    .services-cta-heading em { font-style: italic; color: var(--gold-light); }

    /* ── PROCESS SECTION ────────────────────────────────────────────── */
    .process-section { padding: 120px 0; background: var(--charcoal-light); position: relative; overflow: hidden; }
    .process-section::before { content: ''; position: absolute; inset: 0; background: repeating-linear-gradient(-55deg, transparent, transparent 80px, rgba(201,168,76,0.016) 80px, rgba(201,168,76,0.016) 81px); pointer-events: none; }
    .process-header { text-align: center; margin-bottom: 80px; position: relative; z-index: 1; }
    .process-header .s-eyebrow { margin-bottom: 14px; }
    .process-timeline { position: relative; z-index: 1; max-width: 1280px; margin: 0 auto; padding: 0 40px; display: flex; flex-direction: column; gap: 0; }
    .process-line { position: absolute; left: 50%; top: 0; bottom: 0; width: 1px; background: linear-gradient(to bottom, transparent, rgba(201,168,76,0.3) 10%, rgba(201,168,76,0.3) 90%, transparent); transform: translateX(-50%); z-index: 0; }
    .process-step { display: grid; grid-template-columns: 1fr 80px 1fr; align-items: center; position: relative; min-height: 180px; }
    .process-step-content { padding: 40px; }
    .process-step:nth-child(odd) .process-step-content { grid-column: 1; text-align: right; }
    .process-step:nth-child(odd) .process-step-placeholder { grid-column: 3; }
    .process-step:nth-child(even) .process-step-content { grid-column: 3; text-align: left; }
    .process-step:nth-child(even) .process-step-placeholder { grid-column: 1; }
    .process-step-node { grid-column: 2; display: flex; align-items: center; justify-content: center; z-index: 2; }
    .process-step-num { width: 56px; height: 56px; border: 1px solid rgba(201,168,76,0.4); background: var(--charcoal-light); display: flex; align-items: center; justify-content: center; font-family: 'Cormorant Garamond', serif; font-size: 1.3rem; color: var(--gold); font-weight: 400; transition: background 0.4s, border-color 0.4s, transform 0.3s, box-shadow 0.4s; }
    .process-step:hover .process-step-num { background: var(--gold); color: var(--charcoal); border-color: var(--gold); transform: scale(1.1); box-shadow: 0 0 28px rgba(201,168,76,0.4); }
    .process-step-icon { font-size: 1.6rem; margin-bottom: 12px; display: block; }
    .process-step-title { font-family: 'Cormorant Garamond', serif; font-size: 1.4rem; font-weight: 400; color: var(--off-white); margin-bottom: 10px; line-height: 1.25; transition: color 0.3s; }
    .process-step:hover .process-step-title { color: var(--gold-light); }
    .process-step-desc { font-size: 0.82rem; line-height: 1.85; color: var(--off-white-dim); max-width: 360px; }
    .process-step:nth-child(odd) .process-step-desc { margin-left: auto; }
    .process-step-placeholder { }

    /* ── TESTIMONIALS SECTION ──────────────────────────────────────────── */
    .testimonials-section { padding: 120px 0; background: var(--charcoal); position: relative; overflow: hidden; }
    .testimonials-section::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse at 50% 0%, rgba(201,168,76,0.05) 0%, transparent 60%); pointer-events: none; }
    .testimonials-header { text-align: center; margin-bottom: 70px; position: relative; z-index: 1; }
    .testimonials-header .s-eyebrow { margin-bottom: 14px; }
    .testimonials-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2px; max-width: 1280px; margin: 0 auto; padding: 0 40px; position: relative; z-index: 1; }
    .testimonial-card { background: var(--charcoal-light); padding: 60px 52px; position: relative; overflow: hidden; transition: background 0.4s; }
    .testimonial-card:hover { background: var(--charcoal-mid); }
    .testimonial-card::before { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 3px; background: linear-gradient(to right, var(--gold), var(--gold-light), transparent); }
    .testimonial-quote-mark { font-family: 'Cormorant Garamond', serif; font-size: 6rem; line-height: 1; color: rgba(201,168,76,0.15); position: absolute; top: 20px; left: 40px; user-select: none; }
    .testimonial-stars { display: flex; gap: 4px; margin-bottom: 24px; }
    .testimonial-star { color: var(--gold); font-size: 0.85rem; }
    .testimonial-text { font-family: 'Cormorant Garamond', serif; font-style: italic; font-size: 1.2rem; line-height: 1.85; color: var(--off-white); margin-bottom: 36px; font-weight: 300; }
    .testimonial-divider { width: 40px; height: 1px; background: var(--gold); margin-bottom: 24px; opacity: 0.5; transition: width 0.4s, opacity 0.3s; }
    .testimonial-card:hover .testimonial-divider { width: 64px; opacity: 1; }
    .testimonial-author { display: flex; flex-direction: column; gap: 4px; }
    .testimonial-name { font-size: 0.88rem; font-weight: 500; color: var(--off-white); letter-spacing: 0.05em; }
    .testimonial-role { font-size: 0.6rem; letter-spacing: 0.32em; text-transform: uppercase; color: var(--gold); font-weight: 500; }

    @media (max-width:900px){
      .process-step { grid-template-columns: 60px 1fr; min-height: auto; }
      .process-line { left: 70px; }
      .process-step-content { grid-column: 2 !important; text-align: left !important; }
      .process-step-node { grid-column: 1; }
      .process-step-placeholder { display: none; }
      .process-step:nth-child(odd) .process-step-desc { margin-left: 0; }
      .testimonials-grid { grid-template-columns: 1fr; }
    }
    @media (max-width:768px){
      .process-section { padding: 80px 0; }
      .process-timeline { padding: 0 24px; }
      .process-step-content { padding: 28px 24px; }
      .process-step-num { width: 44px; height: 44px; font-size: 1.1rem; }
      .testimonials-section { padding: 80px 0; }
      .testimonials-grid { padding: 0 24px; }
      .testimonial-card { padding: 48px 32px; }
    }

    /* ═══════════════════════════════════════════════════════════════════
       ABOUT PAGE
    ═══════════════════════════════════════════════════════════════════ */

    /* Our Story */
    .about-story { padding: 100px 0; background: var(--charcoal); }
    .about-story-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }
    .about-story-img-wrap { position: relative; height: 600px; }
    .about-story-img { width: 100%; height: 100%; object-fit: cover; filter: brightness(0.8) sepia(0.1); }
    .about-story-img-frame { position: absolute; bottom: -24px; right: -24px; width: 220px; height: 220px; border: 1px solid rgba(201,168,76,0.3); pointer-events: none; }
    .about-story-year { position: absolute; top: 32px; left: -20px; background: var(--charcoal-light); border: 1px solid rgba(201,168,76,0.3); padding: 18px 24px; }
    .about-story-year-num { font-family: 'Cormorant Garamond', serif; font-size: 2.4rem; color: var(--gold); line-height: 1; font-weight: 300; }
    .about-story-year-label { font-size: 0.58rem; letter-spacing: 0.3em; text-transform: uppercase; color: var(--off-white-dim); margin-top: 4px; }
    .about-story-text { display: flex; flex-direction: column; gap: 20px; }
    .about-story-text .s-eyebrow { margin-bottom: 4px; }
    .about-story-text .s-title { margin-bottom: 8px; }
    .about-story-text .s-body + .s-body { margin-top: -8px; }
    .about-story-signature { margin-top: 24px; }
    .about-story-sig-name { font-family: 'Cormorant Garamond', serif; font-style: italic; font-size: 1.6rem; color: var(--off-white); font-weight: 300; }
    .about-story-sig-role { font-size: 0.6rem; letter-spacing: 0.32em; text-transform: uppercase; color: var(--gold); margin-top: 4px; }

    /* Mission & Vision */
    .mv-section { padding: 100px 0; background: var(--charcoal-light); }
    .mv-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2px; }
    .mv-card { padding: 70px 60px; position: relative; overflow: hidden; }
    .mv-card-mission { background: var(--charcoal-mid); }
    .mv-card-vision  { background: var(--charcoal-light); }
    .mv-card::before { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 3px; background: linear-gradient(to right, var(--gold), var(--gold-light), transparent); }
    .mv-card-icon { font-size: 2.8rem; margin-bottom: 28px; display: block; }
    .mv-card-label { font-size: 0.6rem; letter-spacing: 0.4em; text-transform: uppercase; color: var(--gold); font-weight: 500; margin-bottom: 14px; display: block; }
    .mv-card-title { font-family: 'Cormorant Garamond', serif; font-size: clamp(1.8rem,2.5vw,2.4rem); font-weight: 300; color: var(--off-white); margin-bottom: 24px; line-height: 1.15; }
    .mv-card-title em { font-style: italic; color: var(--gold-light); }
    .mv-card-body { font-size: 0.86rem; line-height: 1.95; color: var(--off-white-dim); }
    .mv-card-points { list-style: none; margin-top: 24px; display: flex; flex-direction: column; gap: 12px; }
    .mv-card-points li { display: flex; align-items: flex-start; gap: 14px; font-size: 0.83rem; line-height: 1.7; color: var(--off-white-dim); }
    .mv-card-points li::before { content: ''; display: block; width: 20px; height: 1px; background: var(--gold); margin-top: 11px; flex-shrink: 0; }

    /* Core Values */
    .values-section { padding: 100px 0; background: var(--charcoal); position: relative; overflow: hidden; }
    .values-section::before { content: ''; position: absolute; inset: 0; background: repeating-linear-gradient(-55deg, transparent, transparent 80px, rgba(201,168,76,0.016) 80px, rgba(201,168,76,0.016) 81px); pointer-events: none; }
    .values-header { text-align: center; margin-bottom: 70px; }
    .values-header .s-eyebrow { margin-bottom: 14px; }
    .values-header .s-title { margin-bottom: 0; }
    .values-grid { display: grid; grid-template-columns: repeat(5,1fr); gap: 2px; }
    .value-card { background: var(--charcoal-light); padding: 48px 32px; position: relative; overflow: hidden; transition: background 0.4s; cursor: default; display: flex; flex-direction: column; align-items: center; text-align: center; }
    .value-card:hover { background: var(--charcoal-mid); }
    .value-card::after { content: ''; position: absolute; bottom: 0; left: 0; width: 0; height: 2px; background: linear-gradient(to right, var(--gold), var(--gold-light)); transition: width 0.5s ease; }
    .value-card:hover::after { width: 100%; }
    .value-card-icon { font-size: 2.2rem; margin-bottom: 20px; }
    .value-card-num { font-family: 'Cormorant Garamond', serif; font-size: 3.6rem; font-weight: 300; color: rgba(201,168,76,0.1); line-height: 1; position: absolute; top: 16px; right: 20px; user-select: none; transition: color 0.4s; }
    .value-card:hover .value-card-num { color: rgba(201,168,76,0.2); }
    .value-card-title { font-family: 'Cormorant Garamond', serif; font-size: 1.2rem; font-weight: 400; color: var(--off-white); margin-bottom: 12px; line-height: 1.3; transition: color 0.3s; }
    .value-card:hover .value-card-title { color: var(--gold-light); }
    .value-card-line { width: 24px; height: 1px; background: var(--gold); margin: 0 auto 14px; opacity: 0.5; transition: width 0.4s, opacity 0.3s; }
    .value-card:hover .value-card-line { width: 44px; opacity: 1; }
    .value-card-desc { font-size: 0.78rem; line-height: 1.75; color: var(--off-white-dim); }

    /* Team/founder strip */
    .about-team-strip { padding: 100px 0; background: var(--charcoal-light); }
    .about-team-inner { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }
    .about-team-image { position: relative; height: 480px; }
    .about-team-image img { width: 100%; height: 100%; object-fit: cover; filter: brightness(0.75) sepia(0.1); }
    .about-team-badge { position: absolute; bottom: 32px; right: -24px; background: var(--charcoal); border: 1px solid rgba(201,168,76,0.3); padding: 20px 28px; }
    .about-team-badge-num { font-family: 'Cormorant Garamond', serif; font-size: 2rem; color: var(--gold); line-height: 1; font-weight: 300; }
    .about-team-badge-label { font-size: 0.58rem; letter-spacing: 0.3em; text-transform: uppercase; color: var(--off-white-dim); margin-top: 4px; }
    .about-team-content { display: flex; flex-direction: column; gap: 20px; }
    .about-team-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 2px; margin-top: 8px; }
    .about-team-stat { background: var(--charcoal); padding: 28px 24px; }
    .about-team-stat-num { font-family: 'Cormorant Garamond', serif; font-size: 2.4rem; color: var(--gold); font-weight: 300; line-height: 1; }
    .about-team-stat-label { font-size: 0.6rem; letter-spacing: 0.25em; text-transform: uppercase; color: var(--off-white-dim); margin-top: 6px; }

    /* ═══════════════════════════════════════════════════════════════════
       CONTACT PAGE
    ═══════════════════════════════════════════════════════════════════ */
    .contact-page { background: var(--charcoal); padding: 100px 0; }
    .contact-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2px; }
    .contact-form-panel { background: var(--charcoal-light); padding: 70px 60px; }
    .contact-info-panel { background: var(--charcoal-mid); padding: 70px 60px; display: flex; flex-direction: column; gap: 40px; }
    .contact-form-title { font-family: 'Cormorant Garamond', serif; font-weight: 300; font-size: 2rem; color: var(--off-white); margin-bottom: 8px; }
    .contact-form-subtitle { font-size: 0.82rem; line-height: 1.8; color: var(--off-white-dim); margin-bottom: 40px; }
    .contact-field { margin-bottom: 32px; }
    .contact-label { font-size: 0.62rem; letter-spacing: 0.28em; text-transform: uppercase; color: var(--gold); margin-bottom: 10px; display: block; }
    .contact-input { width: 100%; background: transparent; border: none; border-bottom: 1px solid rgba(201,168,76,0.3); padding: 12px 0; color: var(--off-white); font-family: 'Montserrat', sans-serif; font-size: 0.85rem; font-weight: 300; outline: none; transition: border-color 0.3s; }
    .contact-input:focus { border-bottom-color: var(--gold); }
    .contact-input::placeholder { color: rgba(214,206,191,0.35); }
    textarea.contact-input { resize: none; height: 110px; }
    .contact-info-item { border-bottom: 1px solid rgba(201,168,76,0.12); padding-bottom: 28px; }
    .contact-info-item:last-child { border-bottom: none; }
    .contact-info-label { font-size: 0.6rem; letter-spacing: 0.32em; text-transform: uppercase; color: var(--gold); margin-bottom: 8px; display: block; }
    .contact-info-value { font-size: 0.9rem; color: var(--off-white); line-height: 1.7; }
    .contact-map { width: 100%; height: 280px; background: var(--charcoal-mid); border: 1px solid rgba(201,168,76,0.15); display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 12px; }
    .contact-map-icon { font-size: 2rem; }
    .contact-map-text { font-size: 0.65rem; letter-spacing: 0.3em; text-transform: uppercase; color: var(--gold); }

    /* ── FAQ SECTION ─────────────────────────────────────────────────── */
    .faq-section { padding: 100px 0; background: var(--charcoal-light); position: relative; overflow: hidden; }
    .faq-section::before { content: ''; position: absolute; inset: 0; background: repeating-linear-gradient(-55deg, transparent, transparent 80px, rgba(201,168,76,0.016) 80px, rgba(201,168,76,0.016) 81px); pointer-events: none; }
    .faq-header { text-align: center; margin-bottom: 60px; position: relative; z-index: 1; }
    .faq-header .s-eyebrow { margin-bottom: 14px; }
    .faq-list { max-width: 860px; margin: 0 auto; display: flex; flex-direction: column; gap: 2px; position: relative; z-index: 1; }
    .faq-item { background: var(--charcoal); border: 1px solid rgba(201,168,76,0.1); transition: border-color 0.3s; }
    .faq-item.open { border-color: rgba(201,168,76,0.3); }
    .faq-question { width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 28px 36px; background: none; border: none; cursor: pointer; text-align: left; transition: background 0.3s; }
    .faq-question:hover { background: rgba(201,168,76,0.04); }
    .faq-question-text { font-family: 'Cormorant Garamond', serif; font-size: 1.2rem; font-weight: 400; color: var(--off-white); line-height: 1.4; transition: color 0.3s; }
    .faq-item.open .faq-question-text { color: var(--gold-light); }
    .faq-icon { width: 32px; height: 32px; border: 1px solid rgba(201,168,76,0.3); display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: background 0.3s, border-color 0.3s, transform 0.4s; }
    .faq-item.open .faq-icon { background: var(--gold); border-color: var(--gold); transform: rotate(45deg); }
    .faq-icon-plus { font-size: 1.1rem; color: var(--gold); line-height: 1; font-weight: 300; transition: color 0.3s; }
    .faq-item.open .faq-icon-plus { color: var(--charcoal); }
    .faq-answer { max-height: 0; overflow: hidden; transition: max-height 0.45s cubic-bezier(0.4,0,0.2,1), padding 0.35s ease; }
    .faq-item.open .faq-answer { max-height: 400px; }
    .faq-answer-inner { padding: 0 36px 32px; }
    .faq-answer-text { font-size: 0.85rem; line-height: 1.95; color: var(--off-white-dim); }
    .faq-answer-text a { color: var(--gold); text-decoration: none; transition: color 0.3s; }
    .faq-answer-text a:hover { color: var(--gold-light); }

    /* ── CONTACT FORM STATUS ───────────────────────────────────────────── */
    .contact-status { margin-top: 16px; padding: 14px 20px; font-size: 0.78rem; letter-spacing: 0.05em; text-align: center; }
    .contact-status.success { background: rgba(201,168,76,0.12); border: 1px solid rgba(201,168,76,0.3); color: var(--gold-light); }
    .contact-status.error { background: rgba(220,60,60,0.1); border: 1px solid rgba(220,60,60,0.3); color: #e88; }
    .contact-input.invalid { border-bottom-color: #e07; }

    @media (max-width:768px){
      .faq-section { padding: 70px 0; }
      .faq-question { padding: 22px 24px; }
      .faq-answer-inner { padding: 0 24px 24px; }
      .faq-question-text { font-size: 1.05rem; }
    }

    /* ═══════════════════════════════════════════════════════════════════
       FOOTER
    ═══════════════════════════════════════════════════════════════════ */
    .footer { background: var(--charcoal-light); border-top: 1px solid rgba(201,168,76,0.15); }
    .footer-inner { max-width: 1280px; margin: 0 auto; padding: 60px 40px 36px; }
    .footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 60px; margin-bottom: 48px; }
    .footer-brand-name { font-family: 'Cormorant Garamond', serif; font-weight: 300; font-size: 1.5rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--off-white); margin-bottom: 4px; }
    .footer-brand-sub { font-size: 0.58rem; letter-spacing: 0.4em; text-transform: uppercase; color: var(--gold); margin-bottom: 20px; }
    .footer-brand-desc { font-size: 0.8rem; line-height: 1.85; color: var(--off-white-dim); max-width: 280px; }
    .footer-col-title { font-size: 0.6rem; letter-spacing: 0.35em; text-transform: uppercase; color: var(--gold); margin-bottom: 20px; display: block; }
    .footer-link { display: block; font-size: 0.8rem; color: var(--off-white-dim); margin-bottom: 12px; cursor: pointer; transition: color 0.3s; background: none; border: none; padding: 0; text-align: left; }
    .footer-link:hover { color: var(--gold-light); }
    .footer-bottom { border-top: 1px solid rgba(201,168,76,0.12); padding-top: 28px; display: flex; justify-content: space-between; align-items: center; }
    .footer-copy { font-size: 0.68rem; letter-spacing: 0.08em; color: var(--off-white-dim); }
    .footer-gold { color: var(--gold); }
    .footer-cities { font-size: 0.6rem; letter-spacing: 0.3em; text-transform: uppercase; color: var(--gold); }

    /* ── ANIMATIONS ─────────────────────────────────────────────────────────── */
    @keyframes fadeUp  { from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:translateY(0); } }
    @keyframes fadeIn  { from { opacity:0; } to { opacity:1; } }
    @keyframes heroZoom{ from { transform:scale(1.06); } to { transform:scale(1); } }
    @keyframes pulse   { 0%,100%{box-shadow:0 0 8px rgba(201,168,76,.6);}50%{box-shadow:0 0 18px rgba(201,168,76,1);} }
    @keyframes scrollDrop { 0%{top:-100%;opacity:1;}80%{top:150%;opacity:1;}100%{top:150%;opacity:0;} }
    @keyframes shimmer { 0%{left:-100%;}100%{left:200%;} }
    @keyframes loaderBar { from{width:0%;}to{width:100%;} }

    /* ── RESPONSIVE ─────────────────────────────────────────────────────────── */
    @media (max-width:1100px){
      .hero-content{grid-template-columns:1fr;padding-top:100px;min-height:auto;padding-bottom:100px;}
      .hero-right{display:none;}
      .services-grid{grid-template-columns:repeat(2,1fr);}
      .values-grid{grid-template-columns:repeat(3,1fr);}
      .footer-grid{grid-template-columns:1fr 1fr;}
    }
    @media (max-width:900px){
      .stats-bar-inner{grid-template-columns:repeat(2,1fr);}
      .mv-grid{grid-template-columns:1fr;}
      .about-story-grid{grid-template-columns:1fr;}
      .about-story-img-wrap{height:360px;}
      .about-team-inner{grid-template-columns:1fr;}
      .about-team-image{height:360px;}
      .contact-grid{grid-template-columns:1fr;}
      .services-cta-banner{flex-direction:column;align-items:flex-start;}
    }
    @media (max-width:768px){
      .navbar-inner{padding:20px 24px;}
      .navbar.scrolled .navbar-inner{padding:14px 24px;}
      .nav-links,.nav-cta{display:none;}
      .hamburger{display:flex;}
      .section-wrap{padding:0 24px;}
      .hero-content{padding:0 24px;padding-top:100px;padding-bottom:80px;}
      .hero-cta-row{flex-direction:column;align-items:flex-start;}
      .btn-gold,.btn-outline{width:100%;text-align:center;}
      .stats-bar-inner{padding:0 24px;}
      .stat-item{padding:36px 16px;}
      .services-inner{padding:80px 24px;}
      .services-grid{grid-template-columns:1fr;}
      .about-story{padding:70px 0;}
      .mv-section{padding:70px 0;}
      .mv-card{padding:48px 32px;}
      .values-section{padding:70px 0;}
      .values-grid{grid-template-columns:1fr 1fr;}
      .about-team-strip{padding:70px 0;}
      .contact-page{padding:70px 0;}
      .contact-form-panel,.contact-info-panel{padding:48px 32px;}
      .footer-grid{grid-template-columns:1fr;}
      .footer-bottom{flex-direction:column;gap:12px;text-align:center;}
      .services-cta-banner{padding:36px 28px;}
      .page-hero-content{padding:48px 24px;}
    }
    @media (max-width:520px){
      .values-grid{grid-template-columns:1fr;}
    }
  `}</style>
);

// ─────────────────────────────────────────────────────────────────────────────
// PAGE TRANSITION LOADER
// ─────────────────────────────────────────────────────────────────────────────
const PageLoader = ({ state, pageName }) => (
  <div className={`page-loader ${state}`} aria-hidden="true">
    <div className="loader-curtain-top" />
    <div className="loader-curtain-bottom" />
    <div className="loader-brand">
      <img src="/logo.png" alt="Kassaart Interior Designers" className="loader-logo" />
      <div className="loader-brand-bar" />
      <div className="loader-page-name">{pageName}</div>
    </div>
    <div className="loader-bar-track">
      <div className="loader-bar-fill" />
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// SCROLL REVEAL HOOK
// ─────────────────────────────────────────────────────────────────────────────
const useReveal = () => {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("visible"); obs.unobserve(e.target); } });
    }, { threshold: 0.12 });
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// NAVBAR
// ─────────────────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { label: "Home",     page: "home"    },
  { label: "About Us", page: "about"   },
  { label: "Services", page: "services"},
  { label: "Contact",  page: "contact" },
];

const Navbar = ({ activePage, onNav }) => {
  const [scrolled, setScrolled]   = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);
  const go = (page) => { onNav(page); setMenuOpen(false); };
  return (
    <>
      <nav className={`navbar${scrolled ? " scrolled" : ""}`}>
        <div className="navbar-inner">
          <button className="brand" onClick={() => go("home")}>
            <img src="/logo.png" alt="Kassaart Interior Designers" className="brand-logo" />
          </button>
          <ul className="nav-links">
            {NAV_ITEMS.map(({ label, page }) => (
              <li key={page}>
                <button className={`nav-link${activePage === page ? " active" : ""}`} onClick={() => go(page)}>{label}</button>
              </li>
            ))}
          </ul>
          <button className="nav-cta" onClick={() => go("contact")}>Book a Consultation</button>
          <button className={`hamburger${menuOpen ? " open" : ""}`} onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
            <span /><span /><span />
          </button>
        </div>
      </nav>
      <div className={`overlay${menuOpen ? " open" : ""}`} onClick={() => setMenuOpen(false)} />
      <div className={`mobile-menu${menuOpen ? " open" : ""}`}>
        {NAV_ITEMS.map(({ label, page }) => (
          <button key={page} className={`nav-link${activePage === page ? " active" : ""}`} onClick={() => go(page)}>{label}</button>
        ))}
        <button className="nav-cta" style={{ marginTop: 16 }} onClick={() => go("contact")}>Book a Consultation</button>
      </div>
    </>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// ANIMATED COUNTER
// ─────────────────────────────────────────────────────────────────────────────
const useCountUp = (target, dur = 1800, go = false) => {
  const [c, setC] = useState(0);
  useEffect(() => {
    if (!go) return;
    let t0 = null;
    const step = (ts) => {
      if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / dur, 1);
      setC(Math.floor((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [go, target, dur]);
  return c;
};

// ─────────────────────────────────────────────────────────────────────────────
// STATS BAR
// ─────────────────────────────────────────────────────────────────────────────
const STATS = [
  { value:20,  suffix:"+", label:"Years\nExperience"   },
  { value:600, suffix:"+", label:"Projects\nCompleted" },
  { value:500, suffix:"+", label:"Happy\nClients"      },
  { value:40,  suffix:"+", label:"Expert Team\nMembers"},
];
const StatItem = ({ value, suffix, label, triggered }) => {
  const n = useCountUp(value, 1800, triggered);
  return (
    <div className="stat-item">
      <div className="stat-icon" />
      <div className="stat-number">{n}<span className="stat-suffix">{suffix}</span></div>
      <div className="stat-label" style={{ whiteSpace:"pre-line" }}>{label}</div>
    </div>
  );
};
const StatsBar = () => {
  const [go, setGo] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if(e.isIntersecting){setGo(true);obs.disconnect();} }, { threshold:0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div className="stats-bar" ref={ref}>
      <div className="stats-bar-inner">
        {STATS.map((s) => <StatItem key={s.label} {...s} triggered={go} />)}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SERVICE CARDS DATA
// ─────────────────────────────────────────────────────────────────────────────
const SVC = [
  { num:"01", icon:"🏠", tag:"Homes & Villas",         title:"Residential Interior Design", desc:"Elegant, modern home interiors crafted around your lifestyle — from intimate apartments to sprawling villas.",  img:"https://images.unsplash.com/photo-1600210492493-0946911123ea?w=700&q=70" },
  { num:"02", icon:"🏢", tag:"Offices & Retail",        title:"Commercial Interior Design",  desc:"Innovative office and workspace designs that reflect your brand and inspire high performance.",                  img:"https://images.unsplash.com/photo-1497366216548-37526070297c?w=700&q=70" },
  { num:"03", icon:"📐", tag:"Planning & Visualisation", title:"2D & 3D Layouts",             desc:"Detailed floor plans and photorealistic renderings that let you walk through your space before a single wall is built.", img:"https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=700&q=70" },
  { num:"04", icon:"🪑", tag:"Bespoke Pieces",           title:"Furniture Customization",     desc:"Tailor-made furniture conceived exclusively for your space — perfect proportions, bespoke materials, timeless form.", img:"https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=700&q=70" },
  { num:"05", icon:"✨", tag:"Restoration & Refresh",   title:"Renovation",                  desc:"Transforming outdated spaces into vibrant, contemporary environments while preserving what matters most.",      img:"https://images.unsplash.com/photo-1581404645139-93e0d68d3d29?w=700&q=70" },
  { num:"06", icon:"🔑", tag:"Full Project Management",  title:"Turnkey Solutions",           desc:"End-to-end project management from concept to handover — you arrive to a flawless, fully finished space.",    img:"https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=700&q=70" },
];

// ─────────────────────────────────────────────────────────────────────────────
// PAGE: HOME
// ─────────────────────────────────────────────────────────────────────────────
const HomePage = ({ onNav }) => {
  const cardRefs = useRef([]);
  useEffect(() => {
    const observers = cardRefs.current.map((el, i) => {
      if (!el) return null;
      const obs = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) { setTimeout(() => el.classList.add("visible"), i * 100); obs.disconnect(); }
      }, { threshold: 0.1 });
      obs.observe(el);
      return obs;
    });
    return () => observers.forEach((o) => o?.disconnect());
  }, []);

  return (
    <>
      {/* Hero */}
      <div className="hero" id="home">
        <div className="hero-bg">
          <img src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1600&q=85" alt="Luxury interior" />
          <div className="hero-bg-overlay" /><div className="hero-bg-gold" />
        </div>
        <div className="hero-deco" />
        <div className="hero-content">
          <div className="hero-left">
            <div className="hero-location"><span className="hero-location-dot" /><span className="hero-location-text">Hyderabad, India · Est. 2014</span></div>
            <h1 className="hero-title">
              Luxury Interior Designers<br />
              in Hyderabad <span className="highlight">Crafting</span>
              <span className="underline-gold"> Timeless Spaces</span>
            </h1>
            <p className="hero-tagline">"Where Vision Meets Luxury Living"</p>
            <div className="hero-divider"><div className="hero-divider-line" /><span className="hero-divider-text">Award-winning studio · 10+ years of excellence</span></div>
            <p className="hero-body">We transform aspirations into extraordinary living environments. From opulent residences to landmark commercial spaces across Hyderabad — every project is a testament to our uncompromising pursuit of beauty, function, and lasting refinement.</p>
            <div className="hero-cta-row">
              <button className="btn-gold" onClick={() => onNav("contact")}>Get Free Consultation</button>
              <button className="btn-outline" onClick={() => onNav("services")}>View Our Portfolio</button>
            </div>
          </div>
          <div className="hero-right">
            <div className="hero-award-card">
              <span className="hero-award-icon">🏆</span>
              <div className="hero-award-title">Best Luxury Interior Studio</div>
              <div className="hero-award-sub">Hyderabad Design Awards · 2023</div>
            </div>
            <div className="hero-image-thumb">
              <img src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80" alt="Featured project" />
              <div className="hero-image-thumb-caption">Featured Project · Jubilee Hills</div>
            </div>
          </div>
        </div>
        <div className="hero-scroll" onClick={() => window.scrollBy({ top: window.innerHeight, behavior:"smooth" })}>
          <span className="hero-scroll-label">Scroll</span>
          <div className="hero-scroll-track" />
        </div>
      </div>

      {/* Stats */}
      <StatsBar />

      {/* Services */}
      <div className="services-section">
        <div className="services-inner">
          <div className="services-header">
            <div className="services-eyebrow">Our Expertise</div>
            <h2 className="services-title">Our Interior Design Services<br /><em>in Hyderabad</em></h2>
            <p className="services-subtitle">From concept to completion — each service delivered with obsessive attention to detail.</p>
          </div>
          <div className="services-grid">
            {SVC.map((c, i) => (
              <div key={c.num} className="service-card" ref={(el) => (cardRefs.current[i] = el)}>
                <div className="service-card-image"><img src={c.img} alt={c.title} loading="lazy" /></div>
                <div className="service-card-body">
                  <div className="service-card-top">
                    <span className="service-card-num">{c.num}</span>
                    <div className="service-card-icon-wrap"><span className="service-card-icon">{c.icon}</span></div>
                  </div>
                  <span className="service-card-tag">{c.tag}</span>
                  <h3 className="service-card-title">{c.title}</h3>
                  <div className="service-card-rule" />
                  <p className="service-card-desc">{c.desc}</p>
                  <button className="service-card-link" onClick={() => onNav("contact")}>Enquire Now <span className="service-card-link-arrow">→</span></button>
                </div>
              </div>
            ))}
          </div>
          <div className="services-cta-banner">
            <div className="services-cta-text-group">
              <span className="services-cta-label">Ready to Begin?</span>
              <h3 className="services-cta-heading">Let's design your <em>dream space</em> together</h3>
            </div>
            <div style={{ display:"flex", gap:"16px", flexShrink:0, flexWrap:"wrap" }}>
              <button className="btn-gold" onClick={() => onNav("contact")}>Get Free Consultation</button>
              <button className="btn-outline" onClick={() => onNav("contact")}>View Portfolio</button>
            </div>
          </div>
        </div>
      </div>

      {/* Process */}
      <ProcessSection />

      {/* Testimonials */}
      <TestimonialsSection />
    </>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// PROCESS SECTION
// ─────────────────────────────────────────────────────────────────────────────
const PROCESS_STEPS = [
  { num: "01", icon: "🏠", title: "Consultation & Site Visit", desc: "We begin with an in-depth discussion to understand your vision, lifestyle, and aspirations — followed by a thorough site visit to assess dimensions, light, and spatial potential." },
  { num: "02", icon: "📋", title: "Planning & Concept", desc: "Our designers craft a bespoke concept tailored to your brief — including mood boards, material palettes, space planning, and a detailed project roadmap." },
  { num: "03", icon: "🖥️", title: "3D Visualization", desc: "Experience your space before it's built. We create photorealistic 3D renderings and virtual walkthroughs so every detail is perfected before execution begins." },
  { num: "04", icon: "🔨", title: "Execution & Installation", desc: "Our skilled craftsmen and project managers bring the design to life with precision — managing every element from civil works to furniture installation." },
  { num: "05", icon: "🔑", title: "Final Handover", desc: "We conduct a meticulous quality inspection and hand over a flawless, move-in-ready space — complete with a maintenance guide and our continued support." },
];

const ProcessSection = () => {
  useReveal();
  return (
    <div className="process-section">
      <div className="section-wrap">
        <div className="process-header reveal">
          <span className="s-eyebrow">How We Work</span>
          <h2 className="s-title">Our Interior Design <em>Process</em></h2>
        </div>
      </div>
      <div className="process-timeline">
        <div className="process-line" />
        {PROCESS_STEPS.map((step, i) => (
          <div key={step.num} className="process-step reveal" style={{ transitionDelay: `${i * 120}ms` }}>
            <div className="process-step-content">
              <span className="process-step-icon">{step.icon}</span>
              <h3 className="process-step-title">{step.title}</h3>
              <p className="process-step-desc">{step.desc}</p>
            </div>
            <div className="process-step-node">
              <div className="process-step-num">{step.num}</div>
            </div>
            <div className="process-step-placeholder" />
          </div>
        ))}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// TESTIMONIALS SECTION
// ─────────────────────────────────────────────────────────────────────────────
const TESTIMONIALS = [
  {
    quote: "Kassaart transformed our home into a masterpiece of luxury and functionality. Every room tells a story — from the hand-selected marble in our foyer to the bespoke walnut cabinetry in our living area. They didn't just design a house; they created a sanctuary that perfectly reflects our family's personality.",
    name: "Priya & Rajesh Sharma",
    role: "Residential Client · Jubilee Hills Villa",
  },
  {
    quote: "The level of professionalism Kassaart brought to our corporate headquarters was extraordinary. They understood our brand DNA from day one and translated it into a workspace that energises our team and impresses every client who walks through the door. On time, on budget, beyond expectations.",
    name: "Anil Mehta",
    role: "Commercial Client · CEO, Meridian Technologies",
  },
];

const TestimonialsSection = () => {
  useReveal();
  return (
    <div className="testimonials-section">
      <div className="section-wrap">
        <div className="testimonials-header reveal">
          <span className="s-eyebrow">Client Stories</span>
          <h2 className="s-title">What Our Clients <em>Say</em></h2>
        </div>
      </div>
      <div className="testimonials-grid">
        {TESTIMONIALS.map((t, i) => (
          <div key={i} className="testimonial-card reveal" style={{ transitionDelay: `${i * 150}ms` }}>
            <span className="testimonial-quote-mark">{"\u201C"}</span>
            <div className="testimonial-stars">
              {[...Array(5)].map((_, j) => <span key={j} className="testimonial-star">★</span>)}
            </div>
            <p className="testimonial-text">"{t.quote}"</p>
            <div className="testimonial-divider" />
            <div className="testimonial-author">
              <span className="testimonial-name">{t.name}</span>
              <span className="testimonial-role">{t.role}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// PAGE: ABOUT US
// ─────────────────────────────────────────────────────────────────────────────
const CORE_VALUES = [
  { num:"01", icon:"⭐", title:"Design Excellence", desc:"Every space we create is an expression of extraordinary craft — where beauty and function are inseparable." },
  { num:"02", icon:"🤝", title:"Integrity",         desc:"We operate with radical transparency, honest pricing, and unwavering ethical standards on every project." },
  { num:"03", icon:"💛", title:"Client Satisfaction",desc:"Your delight is our measure of success. We listen deeply and exceed expectations, always." },
  { num:"04", icon:"🔍", title:"Attention to Detail",desc:"From a single door handle to an entire facade — we obsess over every element, however small." },
  { num:"05", icon:"🌿", title:"Sustainable Practices",desc:"We champion responsible design — sourcing materials thoughtfully and building spaces that endure." },
];

const AboutPage = ({ onNav }) => {
  useReveal();
  return (
    <>
      {/* Hero Banner */}
      <div className="page-hero">
        <div className="page-hero-bg">
          <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=80" alt="About Kassaart" />
          <div className="page-hero-overlay" />
        </div>
        <div className="page-hero-content">
          <div className="page-hero-eyebrow" style={{ opacity:0, animation:"fadeUp 0.8s 0.3s forwards" }}>Who We Are</div>
          <h1 className="page-hero-title" style={{ opacity:0, animation:"fadeUp 0.9s 0.55s forwards" }}>
            Crafting Spaces With<br /><em>Soul & Intention</em>
          </h1>
        </div>
      </div>

      {/* ── OUR STORY ── */}
      <div className="about-story">
        <div className="section-wrap">
          <div className="about-story-grid">
            <div className="about-story-img-wrap reveal">
              <img className="about-story-img" src="https://images.unsplash.com/photo-1616137422495-1e9e46e2aa77?w=900&q=80" alt="Kassaart studio Hyderabad" />
              <div className="about-story-img-frame" />
              <div className="about-story-year">
                <div className="about-story-year-num">2014</div>
                <div className="about-story-year-label">Year Founded</div>
              </div>
            </div>
            <div className="about-story-text reveal" style={{ transitionDelay:"0.15s" }}>
              <span className="s-eyebrow" style={{ marginBottom:14 }}>Our Story</span>
              <h2 className="s-title" style={{ marginBottom:24 }}>
                Born in Hyderabad,<br /><em>Built for India</em>
              </h2>
              <div className="s-rule" style={{ marginBottom:28 }} />
              <p className="s-body">
                Kassaart Interior Designers was founded in 2014 in Hyderabad with a singular conviction: that every person deserves to live and work in a space that is both beautiful and deeply personal.
              </p>
              <p className="s-body" style={{ marginTop:16 }}>
                What began as a small studio with a handful of passionate designers has grown into one of Hyderabad's most trusted names in luxury interiors — with a portfolio spanning intimate residences, landmark commercial projects, and award-winning hospitality spaces.
              </p>
              <p className="s-body" style={{ marginTop:16 }}>
                We create spaces that are elegant, functional, and luxurious — environments that don't just impress at first glance, but reveal new layers of beauty the longer you inhabit them. Every project is a collaboration rooted in trust, creativity, and an obsessive commitment to craft.
              </p>
              <div className="about-story-signature" style={{ marginTop:36 }}>
                <div className="about-story-sig-name">Arjun Kassaart</div>
                <div className="about-story-sig-role">Founder & Principal Designer</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── MISSION & VISION ── */}
      <div className="mv-section">
        <div className="section-wrap" style={{ marginBottom:2 }}>
          <div style={{ textAlign:"center", marginBottom:60 }} className="reveal">
            <span className="s-eyebrow" style={{ marginBottom:14 }}>What Drives Us</span>
            <h2 className="s-title">Our Mission &amp; <em>Vision</em></h2>
          </div>
        </div>
        <div className="mv-grid">
          {/* Mission */}
          <div className="mv-card mv-card-mission reveal">
            <span className="mv-card-icon">🎯</span>
            <span className="mv-card-label">Our Mission</span>
            <h3 className="mv-card-title">Innovative, <em>Sustainable</em><br />Design for Every Client</h3>
            <p className="mv-card-body">
              Our mission is to deliver innovative interior design solutions that are both aesthetically exceptional and responsibly conceived. We integrate sustainable practices into every phase — from material sourcing to long-term spatial planning — ensuring our work is as kind to the planet as it is beautiful to inhabit.
            </p>
            <ul className="mv-card-points">
              <li>Innovative use of materials and spatial concepts</li>
              <li>Sustainable sourcing and eco-conscious construction</li>
              <li>Personalised solutions tailored to each client</li>
              <li>Transparent process from concept to completion</li>
            </ul>
          </div>
          {/* Vision */}
          <div className="mv-card mv-card-vision reveal" style={{ transitionDelay:"0.15s" }}>
            <span className="mv-card-icon">🔭</span>
            <span className="mv-card-label">Our Vision</span>
            <h3 className="mv-card-title">India's <em>Leading</em><br />Luxury Design Studio</h3>
            <p className="mv-card-body">
              We envision Kassaart as the definitive luxury interior design studio in India — recognised not only for the beauty of our work, but for the values that underpin it. We aspire to set the standard for what exceptional design can be: inclusive, responsible, deeply human, and endlessly refined.
            </p>
            <ul className="mv-card-points">
              <li>Recognised as India's premier luxury design studio</li>
              <li>A benchmark for ethical, client-centred practice</li>
              <li>Pioneering sustainable luxury across the country</li>
              <li>Expanding into Mumbai, Bangalore, and beyond</li>
            </ul>
          </div>
        </div>
      </div>

      {/* ── CORE VALUES ── */}
      <div className="values-section">
        <div className="section-wrap">
          <div className="values-header reveal">
            <span className="s-eyebrow" style={{ marginBottom:14 }}>What We Stand For</span>
            <h2 className="s-title">Our Core <em>Values</em></h2>
          </div>
          <div className="values-grid">
            {CORE_VALUES.map((v, i) => (
              <div key={v.num} className="value-card reveal" style={{ transitionDelay:`${i*90}ms` }}>
                <span className="value-card-num">{v.num}</span>
                <div className="value-card-icon">{v.icon}</div>
                <h3 className="value-card-title">{v.title}</h3>
                <div className="value-card-line" />
                <p className="value-card-desc">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── TEAM / STATS STRIP ── */}
      <div className="about-team-strip">
        <div className="section-wrap">
          <div className="about-team-inner">
            <div className="about-team-image reveal">
              <img src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=900&q=80" alt="Kassaart team" />
              <div className="about-team-badge">
                <div className="about-team-badge-num">40+</div>
                <div className="about-team-badge-label">Team Members</div>
              </div>
            </div>
            <div className="about-team-content reveal" style={{ transitionDelay:"0.15s" }}>
              <span className="s-eyebrow" style={{ marginBottom:12 }}>The People Behind the Work</span>
              <h2 className="s-title" style={{ marginBottom:20 }}>A Studio Built on<br /><em>Shared Passion</em></h2>
              <div className="s-rule" style={{ marginBottom:24 }} />
              <p className="s-body">Our team of 40+ architects, interior designers, 3D visualisers, and project managers share one thing: an insatiable love for beautiful spaces. Together, we bring a diversity of perspectives, cultures, and skills — united by the Kassaart standard of excellence.</p>
              <div className="about-team-stats">
                {[["600+","Projects Delivered"],["15","Design Awards"],["500+","Happy Clients"],["10+","Years in Hyderabad"]].map(([n,l]) => (
                  <div className="about-team-stat" key={l}>
                    <div className="about-team-stat-num">{n}</div>
                    <div className="about-team-stat-label">{l}</div>
                  </div>
                ))}
              </div>
              <div style={{ display:"flex", gap:16, marginTop:36, flexWrap:"wrap" }}>
                <button className="btn-gold" onClick={() => onNav("contact")}>Work With Us</button>
                <button className="btn-outline" onClick={() => onNav("services")}>Our Services</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// PAGE: SERVICES
// ─────────────────────────────────────────────────────────────────────────────
const ServicesPage = ({ onNav }) => {
  const cardRefs = useRef([]);
  useEffect(() => {
    const observers = cardRefs.current.map((el, i) => {
      if (!el) return null;
      const obs = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) { setTimeout(() => el.classList.add("visible"), i * 100); obs.disconnect(); }
      }, { threshold: 0.1 });
      obs.observe(el);
      return obs;
    });
    return () => observers.forEach((o) => o?.disconnect());
  }, []);
  useReveal();

  return (
    <>
      <div className="page-hero">
        <div className="page-hero-bg">
          <img src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1600&q=80" alt="Services" />
          <div className="page-hero-overlay" />
        </div>
        <div className="page-hero-content">
          <div className="page-hero-eyebrow" style={{ opacity:0, animation:"fadeUp 0.8s 0.3s forwards" }}>What We Do</div>
          <h1 className="page-hero-title" style={{ opacity:0, animation:"fadeUp 0.9s 0.55s forwards" }}>
            Design Services<br /><em>in Hyderabad</em>
          </h1>
        </div>
      </div>

      <div className="services-section">
        <div className="services-inner">
          <div className="services-header reveal">
            <div className="services-eyebrow">Our Expertise</div>
            <h2 className="services-title">Our Interior Design Services<br /><em>in Hyderabad</em></h2>
            <p className="services-subtitle">A comprehensive suite of design services — each delivered with the same obsessive attention to detail.</p>
          </div>
          <div className="services-grid">
            {SVC.map((c, i) => (
              <div key={c.num} className="service-card" ref={(el) => (cardRefs.current[i] = el)}>
                <div className="service-card-image"><img src={c.img} alt={c.title} loading="lazy" /></div>
                <div className="service-card-body">
                  <div className="service-card-top">
                    <span className="service-card-num">{c.num}</span>
                    <div className="service-card-icon-wrap"><span className="service-card-icon">{c.icon}</span></div>
                  </div>
                  <span className="service-card-tag">{c.tag}</span>
                  <h3 className="service-card-title">{c.title}</h3>
                  <div className="service-card-rule" />
                  <p className="service-card-desc">{c.desc}</p>
                  <button className="service-card-link" onClick={() => onNav("contact")}>Enquire Now <span className="service-card-link-arrow">→</span></button>
                </div>
              </div>
            ))}
          </div>
          <div className="services-cta-banner reveal">
            <div className="services-cta-text-group">
              <span className="services-cta-label">Ready to Begin?</span>
              <h3 className="services-cta-heading">Let's design your <em>dream space</em> together</h3>
            </div>
            <div style={{ display:"flex", gap:"16px", flexShrink:0, flexWrap:"wrap" }}>
              <button className="btn-gold" onClick={() => onNav("contact")}>Get Free Consultation</button>
              <button className="btn-outline" onClick={() => onNav("about")}>Our Story</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// FAQ DATA
// ─────────────────────────────────────────────────────────────────────────────
const FAQ_DATA = [
  {
    q: "How much do interior designers charge in Hyderabad?",
    a: "Interior design charges in Hyderabad vary based on the scope, size, and complexity of the project. At Kassaart, our residential projects typically start from ₹8–15 lakh for a standard 2–3 BHK, while premium and luxury projects are priced based on bespoke requirements. We offer a free initial consultation to understand your needs and provide a transparent, detailed quotation with no hidden costs.",
  },
  {
    q: "How long does a typical interior design project take?",
    a: "Most projects are completed within 6–12 weeks, depending on the scale and complexity. A standard 2–3 BHK apartment typically takes 6–8 weeks, while larger villas, commercial spaces, or highly customised projects may require 10–12 weeks. We provide a clear project timeline during the planning phase and keep you updated at every milestone.",
  },
  {
    q: "Do you provide 3D design visualizations before starting work?",
    a: "Absolutely! 3D visualization is a core part of our design process. Before any construction or installation begins, we create photorealistic 3D renderings and virtual walkthroughs of every room. This allows you to experience your space, request changes, and approve the final design with complete confidence — ensuring zero surprises on handover day.",
  },
  {
    q: "What areas in Hyderabad do you serve?",
    a: "We serve all major areas across Hyderabad including Banjara Hills, Jubilee Hills, Gachibowli, Kondapur, Hitech City, Kukatpally, Manikonda, Narsingi, Kokapet, and Miyapur. We also take on projects in Secunderabad and across Telangana. Contact us to check availability for your specific location.",
  },
  {
    q: "Can I see your previous work or visit a completed project?",
    a: "Yes! We maintain a comprehensive portfolio of completed residential and commercial projects. During your consultation, we'll share detailed case studies, before-and-after galleries, and — where possible — arrange a visit to one of our recently completed spaces so you can experience our craftsmanship firsthand.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// FAQ ACCORDION COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const FaqAccordion = () => {
  const [openIndex, setOpenIndex] = useState(null);
  useReveal();
  return (
    <div className="faq-section">
      <div className="section-wrap">
        <div className="faq-header reveal">
          <span className="s-eyebrow">Common Questions</span>
          <h2 className="s-title">Frequently Asked <em>Questions</em></h2>
        </div>
      </div>
      <div className="section-wrap">
        <div className="faq-list">
          {FAQ_DATA.map((item, i) => (
            <div key={i} className={`faq-item reveal${openIndex === i ? " open" : ""}`} style={{ transitionDelay: `${i * 80}ms` }}>
              <button className="faq-question" onClick={() => setOpenIndex(openIndex === i ? null : i)}>
                <span className="faq-question-text">{item.q}</span>
                <span className="faq-icon"><span className="faq-icon-plus">+</span></span>
              </button>
              <div className="faq-answer">
                <div className="faq-answer-inner">
                  <p className="faq-answer-text">{item.a}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// PAGE: CONTACT
// ─────────────────────────────────────────────────────────────────────────────
const ContactPage = () => {
  const [form, setForm] = useState({ name: "", email: "", phone: "", projectType: "", message: "" });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null); // null | 'success' | 'error'
  const [submitting, setSubmitting] = useState(false);
  useReveal();

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = true;
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) errs.email = true;
    if (!form.phone.trim() || form.phone.replace(/\D/g, "").length < 10) errs.phone = true;
    if (!form.projectType.trim()) errs.projectType = true;
    if (!form.message.trim()) errs.message = true;
    return errs;
  };

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
    if (status) setStatus(null);
  };

  const handleSubmit = () => {
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setSubmitting(true);
    // Simulate submission
    setTimeout(() => {
      setSubmitting(false);
      setStatus("success");
      setForm({ name: "", email: "", phone: "", projectType: "", message: "" });
    }, 1200);
  };

  return (
    <>
      <div className="page-hero">
        <div className="page-hero-bg">
          <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1600&q=80" alt="Contact" />
          <div className="page-hero-overlay" />
        </div>
        <div className="page-hero-content">
          <div className="page-hero-eyebrow" style={{ opacity:0, animation:"fadeUp 0.8s 0.3s forwards" }}>Get In Touch</div>
          <h1 className="page-hero-title" style={{ opacity:0, animation:"fadeUp 0.9s 0.55s forwards" }}>
            Begin Your<br /><em>Design Journey</em>
          </h1>
        </div>
      </div>

      <div className="contact-page">
        <div className="section-wrap">
          <div className="contact-grid reveal">
            <div className="contact-form-panel">
              <h2 className="contact-form-title">Send Us a Message</h2>
              <p className="contact-form-subtitle">Tell us about your project — we'll respond within 24 hours with a complimentary consultation offer.</p>
              <div className="contact-field">
                <label className="contact-label">Full Name</label>
                <input className={`contact-input${errors.name ? " invalid" : ""}`} placeholder="Your Name" value={form.name} onChange={handleChange("name")} />
              </div>
              <div className="contact-field">
                <label className="contact-label">Email Address</label>
                <input className={`contact-input${errors.email ? " invalid" : ""}`} type="email" placeholder="marketing.kassaartinteriors@gmail.com" value={form.email} onChange={handleChange("email")} />
              </div>
              <div className="contact-field">
                <label className="contact-label">Phone Number</label>
                <input className={`contact-input${errors.phone ? " invalid" : ""}`} placeholder="+91 73309 00829" value={form.phone} onChange={handleChange("phone")} />
              </div>
              <div className="contact-field">
                <label className="contact-label">Project Type</label>
                <input className={`contact-input${errors.projectType ? " invalid" : ""}`} placeholder="Residential / Commercial / Renovation…" value={form.projectType} onChange={handleChange("projectType")} />
              </div>
              <div className="contact-field">
                <label className="contact-label">Message</label>
                <textarea className={`contact-input${errors.message ? " invalid" : ""}`} placeholder="Tell us about your space, timeline, and vision…" value={form.message} onChange={handleChange("message")} />
              </div>
              <button className="btn-gold" style={{ width:"100%", marginTop:8, opacity: submitting ? 0.6 : 1 }} onClick={handleSubmit} disabled={submitting}>
                {submitting ? "Sending…" : "Send Message"}
              </button>
              {status === "success" && <div className="contact-status success">Thank you! Your message has been sent successfully. We'll get back to you within 24 hours.</div>}
              {status === "error" && <div className="contact-status error">Something went wrong. Please try again or contact us directly.</div>}
            </div>
            <div className="contact-info-panel">
              <div style={{ display:"flex", flexDirection:"column", gap:28 }}>
                {[
                  ["Studio Address", "Kassaart Interior Designers\nBanjara Hills, Road No. 12\nHyderabad, Telangana 500034"],
                  ["Email", "marketing.kassaartinteriors@gmail.com"],
                  ["Phone", "+91 73309 00829"],
                  ["Working Hours", "Mon – Sat · 9:00 AM – 6:00 PM"],
                ].map(([l, v]) => (
                  <div className="contact-info-item" key={l}>
                    <span className="contact-info-label">{l}</span>
                    <div className="contact-info-value" style={{ whiteSpace:"pre-line" }}>{v}</div>
                  </div>
                ))}
              </div>
              <div className="contact-map">
                <div className="contact-map-icon">{"\ud83d\udccd"}</div>
                <div className="contact-map-text">Banjara Hills, Hyderabad</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <FaqAccordion />
    </>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// FOOTER
// ─────────────────────────────────────────────────────────────────────────────
const Footer = ({ onNav }) => (
  <footer className="footer">
    <div className="footer-inner">
      <div className="footer-grid">
        <div>
          <img src="/logo.png" alt="Kassaart Interior Designers" className="footer-brand-logo" />
          <p className="footer-brand-desc">Creating elegant, functional, and luxurious spaces across Hyderabad since 2014. Where vision meets luxury living.</p>
        </div>
        <div>
          <span className="footer-col-title">Navigation</span>
          {[["Home","home"],["About Us","about"],["Services","services"],["Contact","contact"]].map(([l,p]) => (
            <button key={p} className="footer-link" onClick={() => onNav(p)}>{l}</button>
          ))}
        </div>
        <div>
          <span className="footer-col-title">Services</span>
          {["Residential Design","Commercial Design","2D & 3D Layouts","Furniture Customization","Renovation","Turnkey Solutions"].map((s) => (
            <button key={s} className="footer-link" onClick={() => onNav("services")}>{s}</button>
          ))}
        </div>
        <div>
          <span className="footer-col-title">Contact</span>
          <p className="footer-link" style={{ cursor:"default" }}>Road No. 12, Banjara Hills{"\n"}Hyderabad 500034</p>
          <p className="footer-link" style={{ cursor:"default" }}>marketing.kassaartinteriors@gmail.com</p>
          <p className="footer-link" style={{ cursor:"default" }}>+91 73309 00829</p>
        </div>
      </div>
      <div className="footer-bottom">
        <span className="footer-copy">© 2024 <span className="footer-gold">Kassaart</span> Interior Designers. All rights reserved.</span>
        <span className="footer-cities">Hyderabad · Mumbai · Dubai</span>
      </div>
    </div>
  </footer>
);

// ─────────────────────────────────────────────────────────────────────────────
// PAGE NAMES (for loader display)
// ─────────────────────────────────────────────────────────────────────────────
const PAGE_NAMES = {
  home:     "Home",
  about:    "About Us",
  services: "Services",
  contact:  "Contact",
};

// ─────────────────────────────────────────────────────────────────────────────
// APP
// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  const [activePage, setActivePage]   = useState("home");
  const [visiblePage, setVisiblePage] = useState("home");   // page currently rendered
  const [loaderState, setLoaderState] = useState("idle");   // idle | entering | holding | exiting
  const [contentVisible, setContentVisible] = useState(true);
  const transitioning = useRef(false);

  const navigate = useCallback((target) => {
    if (target === visiblePage || transitioning.current) return;
    transitioning.current = true;
    setActivePage(target);

    // 1. Curtains close  (entering)
    setLoaderState("entering");
    setContentVisible(false);

    setTimeout(() => {
      // 2. Curtains fully closed — swap page + show brand + bar
      setLoaderState("holding");
      setVisiblePage(target);
      window.scrollTo({ top: 0 });

      setTimeout(() => {
        // 3. Curtains open (exiting)
        setLoaderState("exiting");

        setTimeout(() => {
          // 4. Done
          setLoaderState("idle");
          setContentVisible(true);
          transitioning.current = false;
        }, 750);
      }, 700); // hold duration
    }, 700);   // enter duration
  }, [visiblePage]);

  const renderPage = () => {
    switch (visiblePage) {
      case "home":     return <HomePage     onNav={navigate} />;
      case "about":    return <AboutPage    onNav={navigate} />;
      case "services": return <ServicesPage onNav={navigate} />;
      case "contact":  return <ContactPage />;
      default:         return <HomePage     onNav={navigate} />;
    }
  };

  return (
    <>
      <GlobalStyles />

      {/* Transition loader */}
      {loaderState !== "idle" && (
        <PageLoader state={loaderState} pageName={PAGE_NAMES[activePage]} />
      )}

      <Navbar activePage={activePage} onNav={navigate} />

      <div className={`page-content${contentVisible ? " visible" : ""}`}>
        {renderPage()}
        <Footer onNav={navigate} />
      </div>
    </>
  );
}
