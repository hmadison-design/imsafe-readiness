(function () {
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));
  const now = () => performance.now();

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const mean = (arr) => (arr.length ? arr.reduce((x, y) => x + y, 0) / arr.length : 0);
  const sd = (arr) => {
    if (arr.length < 2) return 0;
    const m = mean(arr);
    const v = mean(arr.map((x) => (x - m) * (x - m)));
    return Math.sqrt(v);
  };
  const fmt = (n) =>
    typeof n === "number" && isFinite(n) ? Math.round(n * 10) / 10 : "—";

  function show(el) {
    if (el) el.classList.remove("hide");
  }
  function hide(el) {
    if (el) el.classList.add("hide");
  }

  // ---------------------------------------------------------------------------
  //  HAPTIC SUPPORT
  // ---------------------------------------------------------------------------
  function triggerHapticPulse() {
    try {
      if (navigator && typeof navigator.vibrate === "function") {
        navigator.vibrate(18);
      }
    } catch (_) {
      /* ignore */
    }
  }

  // ---------------------------------------------------------------------------
  //  SPLASH / LAUNCH ANIMATION
  // ---------------------------------------------------------------------------
  const splash = $("#splash");
  const splashIcon = $("#splash-icon");
  const splashOst = $("#splash-ost");

  if (splash) {
    window.addEventListener("load", () => {
      if (splashIcon) splashIcon.classList.add("visible");

      // Keep icon alone for a bit, then bring OST in
      setTimeout(() => {
        if (splashOst) splashOst.classList.add("visible");
      }, 1400); // icon visible ~1.4s before OST appears

      // Fade out entire splash around 2.2s
      setTimeout(() => {
        splash.classList.add("splash-hidden");
      }, 2200);

      splash.addEventListener(
        "transitionend",
        () => {
          splash.remove();
        },
        { once: true }
      );
    });
  }

  // ---------------------------------------------------------------------------
  //  ROOT VIEW NAVIGATION + SLIDE TRANSITIONS
  // ---------------------------------------------------------------------------
  const viewScreens = $$(".view-screen");
  let currentViewId =
    (viewScreens.find((v) => !v.classList.contains("hide")) ||
      $("#modeCard") ||
      viewScreens[0] ||
      {}
    ).id || null;

  function setActiveView(id) {
    viewScreens.forEach((screen) => {
      if (!screen) return;
      if (screen.id === id) {
        screen.classList.remove(
          "hide",
          "view-slide-in-right",
          "view-slide-out-left"
        );
      } else {
        screen.classList.add("hide");
        screen.classList.remove("view-slide-in-right", "view-slide-out-left");
      }
    });
    currentViewId = id;
  }

  function goView(id, animate = true) {
    if (!id) return;
    if (!currentViewId) {
      setActiveView(id);
      return;
    }
    if (id === currentViewId) {
      setActiveView(id);
      return;
    }

    const from = document.getElementById(currentViewId);
    const to = document.getElementById(id);
    if (!to) return;

    if (!animate || !from) {
      setActiveView(id);
      return;
    }

    from.classList.remove("view-slide-in-right", "view-slide-out-left");
    to.classList.remove("view-slide-in-right", "view-slide-out-left", "hide");

    const onEnd = () => {
      from.classList.add("hide");
      from.classList.remove("view-slide-out-left");
      to.classList.remove("view-slide-in-right");
      from.removeEventListener("animationend", onEnd);
      currentViewId = id;
    };

    requestAnimationFrame(() => {
      from.classList.add("view-slide-out-left");
      to.classList.add("view-slide-in-right");
      from.addEventListener("animationend", onEnd);
    });
  }

  function goMain() {
    goView("modeCard");
  }

  // ---------------------------------------------------------------------------
  //  GLOBAL HAMBURGER
  // ---------------------------------------------------------------------------
  const globalHamburger = $("#globalHamburger");
  const globalHamburgerOverlay = $("#globalHamburgerOverlay");
  const globalHamburgerClose = $("#globalHamburgerClose");

  if (globalHamburger && globalHamburgerOverlay) {
    const closeHamburger = () => {
      globalHamburgerOverlay.classList.remove("open");
      globalHamburger.classList.remove("open");
    };

    globalHamburger.addEventListener("click", () => {
      const isOpen = globalHamburgerOverlay.classList.contains("open");
      if (isOpen) closeHamburger();
      else {
        globalHamburgerOverlay.classList.add("open");
        globalHamburger.classList.add("open");
      }
    });

    if (globalHamburgerClose) {
      globalHamburgerClose.addEventListener("click", closeHamburger);
    }

    globalHamburgerOverlay.addEventListener("click", (e) => {
      if (e.target === globalHamburgerOverlay) closeHamburger();
    });

    $$(".menu-item[data-view-target]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = btn.getAttribute("data-view-target");
        if (target) {
          if (target === "modeCard") {
            goMain();
          } else {
            goView(target);
          }
        }
        closeHamburger();
      });
    });
  }

  // ---------------------------------------------------------------------------
  //  MAIN MODE CARD BUTTONS
  // ---------------------------------------------------------------------------
  const goTmdBtn = $("#goTmdBtn");
  const goFratBtn = $("#goFratBtn");

  const tmdRoot = $("#tmdRoot");
  const fratRoot = $("#fratRoot");

  const tmdHome = $("#tmdHome");
  const tmdInfoCard = $("#tmdInfoCard");
  const tmdInfoBtn = $("#tmdInfoBtn");
  const tmdInfoBackBtn = $("#tmdInfoBackBtn");

  const appInfoLink = $("#appInfoLink");
  const appInfoCard = $("#appInfoCard");
  const appInfoBackBtn = $("#appInfoBackBtn");

  const aboutAppLink = $("#aboutAppLink");
  const aboutAppCard = $("#aboutAppCard");
  const aboutAppBackBtn = $("#aboutAppBackBtn");

  const aboutOstCard = $("#aboutOstCard");
  const aboutOstBackBtn = $("#aboutOstBackBtn");

  if (goTmdBtn) {
    goTmdBtn.addEventListener("click", () => {
      if (tmdRoot) {
        // reset stack
        show(tmdRoot);
        show(tmdHome);
        hide(tmdInfoCard);
        hide($("#testCard"));
        hide($("#resultCard"));
        hide($("#baselineCard"));
        hide($("#tmdMenu"));
        goView("tmdRoot");
      }
    });
  }

  if (goFratBtn) {
    goFratBtn.addEventListener("click", () => {
      if (fratRoot) {
        show(fratRoot);
        goView("fratRoot");
      }
    });
  }

  if (appInfoLink && appInfoCard) {
    appInfoLink.addEventListener("click", () => {
      goView("appInfoCard");
    });
  }
  if (appInfoBackBtn) appInfoBackBtn.addEventListener("click", goMain);

  if (aboutAppLink && aboutAppCard) {
    aboutAppLink.addEventListener("click", () => {
      goView("aboutAppCard");
    });
  }
  if (aboutAppBackBtn) aboutAppBackBtn.addEventListener("click", goMain);

  if (aboutOstBackBtn) {
    aboutOstBackBtn.addEventListener("click", () => {
      goMain();
    });
  }

  if (tmdInfoBtn) {
    tmdInfoBtn.addEventListener("click", () => {
      hide(tmdHome);
      hide($("#tmdMenu"));
      show(tmdInfoCard);
    });
  }
  if (tmdInfoBackBtn) {
    tmdInfoBackBtn.addEventListener("click", () => {
      hide(tmdInfoCard);
      show(tmdHome);
    });
  }

  // ---------------------------------------------------------------------------
  //  COGNITION & ACUITY (SRT, STROOP, 2-BACK)
  // ---------------------------------------------------------------------------
  const CONFIG = {
    SRT_TRIALS: 10,
    STROOP_TRIALS: 16,
    NBACK_TRIALS: 20,
  };

  const startBtn = $("#startBtn");
  const testCard = $("#testCard");
  const stepName = $("#stepName");
  const timePill = $("#timePill");
  const countdown = $("#countdown");
  const progressBar = $("#progressBar");

  const srtPane = $("#srtPane");
  const srtTarget = $("#srtTarget");

  const stroopPane = $("#stroopPane");
  const stroopWord = $("#stroopWord");
  const btnMatch = $("#btnMatch");
  const btnMismatch = $("#btnMismatch");

  const betweenPane = $("#betweenPane");
  const betweenCountdown = $("#betweenCountdown");

  const preNbackPane = $("#preNbackPane");
  const preNbackHint = $("#preNbackHint");
  const startNbackBtn = $("#startNbackBtn");

  const nbackPane = $("#nbackPane");
  const groupLabel = $("#groupLabel");
  const nbackDigit = $("#nbackDigit");
  const btnTarget = $("#btnTarget");
  const btnNotTarget = $("#btnNotTarget");

  const resultCard = $("#resultCard");
  const lightDot = $("#lightDot");
  const lightLabel = $("#lightLabel");
  const metricSrtMedian = $("#metricSrtMedian");
  const metricSrtLapses = $("#metricSrtLapses");
  const metricStroopAcc = $("#metricStroopAcc");
  const metricStroopMedian = $("#metricStroopMedian");
  const metricNbackAcc = $("#metricNbackAcc");
  const metricNbackBias = $("#metricNbackBias");
  const metricSummary = $("#metricSummary");
  const metricToday = $("#metricToday");
  const metricBase = $("#metricBase");

  const againBtn = $("#againBtn");
  const backToMainBtn = $("#backToMainBtn");
  const addBaselineBtn2 = $("#addBaselineBtn2");

  const tmdMenuBtn = $("#tmdMenuBtn");
  const tmdMenu = $("#tmdMenu");
  const menuAddBaseline = $("#menuAddBaseline");
  const menuManageBaseline = $("#menuManageBaseline");
  const menuExport = $("#menuExport");
  const menuMain = $("#menuMain");
  const menuAboutOst = $("#menuAboutOst");

  const baselineCard = $("#baselineCard");
  const baselineList = $("#baselineList");
  const deleteBaselineBtn = $("#deleteBaselineBtn");
  const closeBaselineBtn = $("#closeBaselineBtn");

  const BASELINE_KEY = "secondOpinionBaseline_v1";

  function loadBaseline() {
    try {
      return JSON.parse(localStorage.getItem(BASELINE_KEY) || "[]");
    } catch {
      return [];
    }
  }
  function saveBaseline(list) {
    localStorage.setItem(BASELINE_KEY, JSON.stringify(list || []));
  }

  let baselineSessions = loadBaseline();
  let sessionResult = null;

  function renderBaselineList() {
    if (!baselineList) return;
    if (!baselineSessions.length) {
      baselineList.textContent = "No baseline sessions stored yet.";
      return;
    }
    baselineList.innerHTML = "";
    baselineSessions.forEach((s, idx) => {
      const div = document.createElement("div");
      div.className = "baselineListItem";
      const date = s.date ? new Date(s.date).toLocaleString() : `Session ${idx + 1}`;
      div.textContent =
        `${date} – SRT ${fmt(s.srtMedian)} ms, Stroop ${fmt(
          s.stroopAcc * 100
        )}% acc, 2-back ${fmt(s.nbackAcc * 100)}% acc`;
      baselineList.appendChild(div);
    });
  }

  function setProgress(p) {
    if (progressBar) {
      progressBar.style.width = clamp(p, 0, 1) * 100 + "%";
    }
  }

  function sleep(ms) {
    return new Promise((res) => setTimeout(res, ms));
  }

  async function runSrtSegment() {
    const rts = [];
    let lapses = 0;

    if (stepName) stepName.textContent = "Simple reaction time";
    if (timePill) timePill.textContent = `${CONFIG.SRT_TRIALS} taps`;
    if (betweenPane) hide(betweenPane);
    show(srtPane);
    hide(stroopPane);
    hide(preNbackPane);
    hide(nbackPane);

    for (let i = 0; i < CONFIG.SRT_TRIALS; i++) {
      if (countdown) countdown.textContent = `Tap ${i + 1} of ${CONFIG.SRT_TRIALS}`;
      setProgress(i / (CONFIG.SRT_TRIALS + CONFIG.STROOP_TRIALS + CONFIG.NBACK_TRIALS));

      if (srtTarget) {
        srtTarget.className = "tapTarget ready";
        srtTarget.textContent = "WAIT";
      }

      // random wait
      await sleep(700 + Math.random() * 1100);

      if (!srtTarget) break;
      srtTarget.className = "tapTarget go";
      srtTarget.textContent = "TAP";
      triggerHapticPulse();
      const startTime = now();

      const rt = await new Promise((resolve) => {
        const handler = () => {
          srtTarget.removeEventListener("click", handler);
          resolve(now() - startTime);
        };
        srtTarget.addEventListener("click", handler, { once: true });
      });

      rts.push(rt);
      if (rt > 500) lapses++;
    }

    const sorted = rts.slice().sort((a, b) => a - b);
    const median = sorted.length
      ? sorted[Math.floor(sorted.length / 2)]
      : NaN;

    return { medianRT: median, lapses };
  }

  async function runStroopSegment() {
    const colors = [
      { name: "RED", css: "#f97373" },
      { name: "BLUE", css: "#60a5fa" },
      { name: "GREEN", css: "#4ade80" },
      { name: "YELLOW", css: "#facc15" },
    ];

    if (stepName) stepName.textContent = "Stroop – executive control";
    show(stroopPane);
    hide(srtPane);
    hide(betweenPane);
    hide(preNbackPane);
    hide(nbackPane);

    const rts = [];
    let correct = 0;

    const runTrial = () =>
      new Promise((resolve) => {
        const wordIdx = Math.floor(Math.random() * colors.length);
        let colorIdx;
        if (Math.random() < 0.5) {
          colorIdx = wordIdx; // congruent
        } else {
          const other = colors.filter((_, i) => i !== wordIdx);
          colorIdx = wordIdx === colors.length - 1 ? 0 : wordIdx + 1;
          if (Math.random() < 0.5) {
            colorIdx = colors.indexOf(other[Math.floor(Math.random() * other.length)]);
          }
        }

        const word = colors[wordIdx];
        const ink = colors[colorIdx];
        const isCongruent = wordIdx === colorIdx;

        if (stroopWord) {
          stroopWord.textContent = word.name;
          stroopWord.style.color = ink.css;
        }
        if (countdown)
          countdown.textContent = `Item ${
            stroopStats.trial + 1
          } of ${CONFIG.STROOP_TRIALS}`;
        const startTime = now();

        const onMatch = () => {
          cleanup(true);
        };
        const onMismatch = () => {
          cleanup(false);
        };

        function cleanup(choseMatch) {
          btnMatch && btnMatch.removeEventListener("click", onMatch);
          btnMismatch && btnMismatch.removeEventListener("click", onMismatch);
          const rt = now() - startTime;
          const isCorrect = isCongruent ? choseMatch : !choseMatch;
          resolve({ rt, isCorrect });
        }

        if (btnMatch) btnMatch.addEventListener("click", onMatch, { once: true });
        if (btnMismatch)
          btnMismatch.addEventListener("click", onMismatch, { once: true });
      });

    const stroopStats = { trial: 0 };
    for (let i = 0; i < CONFIG.STROOP_TRIALS; i++) {
      stroopStats.trial = i;
      setProgress(
        (CONFIG.SRT_TRIALS + i) /
          (CONFIG.SRT_TRIALS + CONFIG.STROOP_TRIALS + CONFIG.NBACK_TRIALS)
      );
      const { rt, isCorrect } = await runTrial();
      rts.push(rt);
      if (isCorrect) correct++;
    }

    const sorted = rts.slice().sort((a, b) => a - b);
    const median = sorted.length
      ? sorted[Math.floor(sorted.length / 2)]
      : NaN;
    const acc = rts.length ? correct / rts.length : 0;

    return { medianRT: median, accuracy: acc };
  }

  async function runNbackSegment() {
    if (stepName) stepName.textContent = "2-back working memory";
    hide(srtPane);
    hide(stroopPane);
    hide(betweenPane);
    show(preNbackPane);
    hide(nbackPane);

    if (preNbackHint) {
      preNbackHint.textContent =
        "Tap “Match” when the CURRENT digit is the same as the one from two steps ago. Otherwise tap “No match.”";
    }

    await new Promise((resolve) => {
      if (!startNbackBtn) return resolve();
      const handler = () => {
        startNbackBtn.removeEventListener("click", handler);
        resolve();
      };
      startNbackBtn.addEventListener("click", handler);
    });

    hide(preNbackPane);
    show(nbackPane);

    const digits = [];
    let hits = 0;
    let misses = 0;
    let falseAlarms = 0;
    let correctRejects = 0;

    const trialPromise = (index) =>
      new Promise((resolve) => {
        const options = [1, 2, 3, 4, 5, 6, 7, 8];
        let digit;
        let isTarget = false;

        if (index >= 2 && Math.random() < 0.25) {
          digit = digits[index - 2];
          isTarget = true;
        } else {
          const prev2 = index >= 2 ? digits[index - 2] : null;
          const pool = prev2
            ? options.filter((x) => x !== prev2)
            : options;
          digit = pool[Math.floor(Math.random() * pool.length)];
          isTarget = false;
        }

        digits.push(digit);

        if (nbackDigit) nbackDigit.textContent = String(digit);
        if (groupLabel) groupLabel.textContent = `Item ${
          index + 1
        } of ${CONFIG.NBACK_TRIALS}`;
        if (countdown) countdown.textContent = "";

        setProgress(
          (CONFIG.SRT_TRIALS + CONFIG.STROOP_TRIALS + index) /
            (CONFIG.SRT_TRIALS + CONFIG.STROOP_TRIALS + CONFIG.NBACK_TRIALS)
        );

        const startTime = now();

        const onTarget = () => finish(true);
        const onNotTarget = () => finish(false);

        function finish(choseMatch) {
          btnTarget && btnTarget.removeEventListener("click", onTarget);
          btnNotTarget && btnNotTarget.removeEventListener("click", onNotTarget);
          const rt = now() - startTime;
          const correct = isTarget === choseMatch;

          if (isTarget && choseMatch) hits++;
          else if (isTarget && !choseMatch) misses++;
          else if (!isTarget && choseMatch) falseAlarms++;
          else if (!isTarget && !choseMatch) correctRejects++;

          resolve({ rt, correct });
        }

        if (btnTarget) btnTarget.addEventListener("click", onTarget, { once: true });
        if (btnNotTarget)
          btnNotTarget.addEventListener("click", onNotTarget, { once: true });
      });

    const rts = [];
    for (let i = 0; i < CONFIG.NBACK_TRIALS; i++) {
      const { rt } = await trialPromise(i);
      rts.push(rt);
    }

    hide(nbackPane);

    const sorted = rts.slice().sort((a, b) => a - b);
    const median = sorted.length
      ? sorted[Math.floor(sorted.length / 2)]
      : NaN;
    const total = hits + misses + falseAlarms + correctRejects || 1;
    const acc = (hits + correctRejects) / total;
    const bias =
      hits + falseAlarms > 0 ? hits / (hits + falseAlarms) : 0.5;

    return {
      medianRT: median,
      accuracy: acc,
      bias,
      hits,
      misses,
      falseAlarms,
      correctRejects,
    };
  }

  function summarizeAgainstBaseline(today, baseline) {
    if (!baseline.length) {
      return {
        label: "No baseline",
        dotClass: "",
        summary:
          "You don’t have any baseline sessions stored yet. Consider adding several “good-day” sessions before relying on comparisons.",
      };
    }

    const keys = [
      { key: "srtMedian", higherIsBetter: false },
      { key: "srtLapses", higherIsBetter: false },
      { key: "stroopAcc", higherIsBetter: true },
      { key: "stroopMedian", higherIsBetter: false },
      { key: "nbackAcc", higherIsBetter: true },
    ];

    let zSum = 0;
    let zCount = 0;

    keys.forEach(({ key, higherIsBetter }) => {
      const vals = baseline.map((s) => s[key]).filter((v) => typeof v === "number");
      if (!vals.length) return;
      const m = mean(vals);
      const sdev = sd(vals);
      if (!sdev) return;
      const raw = today[key];
      if (typeof raw !== "number") return;
      let z = (raw - m) / sdev;
      if (!higherIsBetter) z = -z;
      zSum += z;
      zCount++;
    });

    if (!zCount) {
      return {
        label: "Baseline stored",
        dotClass: "",
        summary:
          "You have baseline data, but not enough overlapping metrics to compute a trend.",
      };
    }

    const zAvg = zSum / zCount;
    if (zAvg >= 0.5) {
      return {
        label: "At or above baseline",
        dotClass: "good",
        summary:
          "Today’s performance is broadly in line with or better than your baseline. Still run your full IM SAFE and ADM flow.",
      };
    } else if (zAvg <= -1.0) {
      return {
        label: "Significantly below baseline",
        dotClass: "bad",
        summary:
          "You’re notably below your usual performance. Consider delaying, changing the plan, or bringing another qualified pilot.",
      };
    } else if (zAvg <= -0.5) {
      return {
        label: "Somewhat below baseline",
        dotClass: "warn",
        summary:
          "Today’s performance is softer than usual. That’s a nudge to slow down, review your plan, and be conservative with risk.",
      };
    } else {
      return {
        label: "Similar to baseline",
        dotClass: "",
        summary:
          "You’re roughly in line with your usual performance, but that doesn’t negate any other sources of risk.",
      };
    }
  }

  async function runAssessment() {
    if (!testCard) return;
    hide(resultCard);
    hide(baselineCard);
    hide(tmdInfoCard);
    hide(tmdHome && tmdRoot ? tmdHome : null);

    show(testCard);
    setProgress(0);

    const srt = await runSrtSegment();
    show(betweenPane);
    if (betweenCountdown) betweenCountdown.textContent = "3";
    await sleep(1000);
    if (betweenCountdown) betweenCountdown.textContent = "2";
    await sleep(1000);
    if (betweenCountdown) betweenCountdown.textContent = "1";
    await sleep(1000);
    hide(betweenPane);

    const stroop = await runStroopSegment();
    show(betweenPane);
    if (betweenCountdown) betweenCountdown.textContent = "3";
    await sleep(1000);
    if (betweenCountdown) betweenCountdown.textContent = "2";
    await sleep(1000);
    if (betweenCountdown) betweenCountdown.textContent = "1";
    await sleep(1000);
    hide(betweenPane);

    const nback = await runNbackSegment();

    // Build session result
    sessionResult = {
      date: Date.now(),
      srtMedian: srt.medianRT,
      srtLapses: srt.lapses,
      stroopAcc: stroop.accuracy,
      stroopMedian: stroop.medianRT,
      nbackAcc: nback.accuracy,
      nbackBias: nback.bias,
    };

    // Fill metrics
    if (metricSrtMedian) metricSrtMedian.textContent = `${fmt(srt.medianRT)} ms`;
    if (metricSrtLapses) metricSrtLapses.textContent = String(srt.lapses);
    if (metricStroopAcc)
      metricStroopAcc.textContent = `${fmt(stroop.accuracy * 100)}%`;
    if (metricStroopMedian)
      metricStroopMedian.textContent = `${fmt(stroop.medianRT)} ms`;
    if (metricNbackAcc)
      metricNbackAcc.textContent = `${fmt(nback.accuracy * 100)}%`;
    if (metricNbackBias)
      metricNbackBias.textContent = `${fmt(nback.bias * 100)}% hits/(hits+FA)`;

    const summary = summarizeAgainstBaseline(sessionResult, baselineSessions);
    if (metricSummary) metricSummary.textContent = summary.summary;
    if (lightDot) {
      lightDot.className = "lightDot";
      if (summary.dotClass) lightDot.classList.add(summary.dotClass);
    }
    if (lightLabel) lightLabel.textContent = summary.label;

    if (metricToday) {
      metricToday.textContent = `Today – SRT ${fmt(
        srt.medianRT
      )} ms, Stroop ${fmt(stroop.accuracy * 100)}% acc, 2-back ${fmt(
        nback.accuracy * 100
      )}% acc.`;
    }
    if (metricBase) {
      if (!baselineSessions.length) {
        metricBase.textContent = "Baseline: none stored yet.";
      } else {
        const srtArr = baselineSessions.map((s) => s.srtMedian);
        const stroopArr = baselineSessions.map((s) => s.stroopAcc);
        const nbackArr = baselineSessions.map((s) => s.nbackAcc);
        metricBase.textContent = `Baseline (mean) – SRT ${fmt(
          mean(srtArr)
        )} ms, Stroop ${fmt(mean(stroopArr) * 100)}% acc, 2-back ${fmt(
          mean(nbackArr) * 100
        )}% acc.`;
      }
    }

    hide(testCard);
    show(resultCard);
  }

  if (startBtn) {
    startBtn.addEventListener("click", () => {
      if (tmdRoot) goView("tmdRoot");
      runAssessment();
    });
  }

  if (againBtn) {
    againBtn.addEventListener("click", () => {
      if (tmdRoot) goView("tmdRoot");
      runAssessment();
    });
  }

  if (backToMainBtn) {
    backToMainBtn.addEventListener("click", () => {
      hide(resultCard);
      show(tmdHome);
      goMain();
    });
  }

  if (tmdMenuBtn && tmdMenu) {
    tmdMenuBtn.addEventListener("click", () => {
      tmdMenu.classList.toggle("hide");
    });
  }

  function addCurrentToBaseline() {
    if (!sessionResult) return;
    baselineSessions.push(sessionResult);
    saveBaseline(baselineSessions);
    renderBaselineList();
  }

  if (menuAddBaseline) {
    menuAddBaseline.addEventListener("click", () => {
      addCurrentToBaseline();
      hide(tmdMenu);
    });
  }
  if (addBaselineBtn2) {
    addBaselineBtn2.addEventListener("click", () => {
      addCurrentToBaseline();
    });
  }

  if (menuManageBaseline) {
    menuManageBaseline.addEventListener("click", () => {
      hide(tmdMenu);
      renderBaselineList();
      show(baselineCard);
    });
  }

  if (menuExport) {
    menuExport.addEventListener("click", () => {
      hide(tmdMenu);
      if (!sessionResult) {
        alert("Run an assessment first; no recent result to export.");
        return;
      }
      const w = window.open("", "_blank");
      if (!w) return;
      w.document.write(
        `<pre>${JSON.stringify(sessionResult, null, 2)}</pre>`
      );
    });
  }

  if (menuMain) {
    menuMain.addEventListener("click", () => {
      hide(tmdMenu);
      goView("tmdRoot");
      hide(testCard);
      hide(resultCard);
      show(tmdHome);
    });
  }

  if (menuAboutOst) {
    menuAboutOst.addEventListener("click", () => {
      hide(tmdMenu);
      goView("aboutOstCard");
    });
  }

  if (deleteBaselineBtn) {
    deleteBaselineBtn.addEventListener("click", () => {
      if (!baselineSessions.length) return;
      if (!confirm("Delete all baseline sessions on this device?")) return;
      baselineSessions = [];
      saveBaseline(baselineSessions);
      renderBaselineList();
    });
  }

  if (closeBaselineBtn) {
    closeBaselineBtn.addEventListener("click", () => {
      hide(baselineCard);
    });
  }

  // ---------------------------------------------------------------------------
  //  FRAT
  // ---------------------------------------------------------------------------
  const fratIntroCard = $("#fratIntroCard");
  const fratQuestionsCard = $("#fratQuestionsCard");
  const fratResultCard = $("#fratResultCard");
  const fratQuestions = $("#fratQuestions");
  const fratStartBtn = $("#fratStartBtn");
  const fratBackToMainBtn = $("#fratBackToMainBtn");
  const fratCalcBtn = $("#fratCalcBtn");
  const fratResetBtn = $("#fratResetBtn");
  const fratDot = $("#fratDot");
  const fratScoreText = $("#fratScoreText");
  const fratStatusLabel = $("#fratStatusLabel");
  const fratNarrative = $("#fratNarrative");
  const fratGuidance = $("#fratGuidance");
  const fratBreakdown = $("#fratBreakdown");
  const fratBandRef = $("#fratBandRef");
  const fratExportBtn = $("#fratExportBtn");

  const FRAT_ITEMS = [
    // Pilot
    {
      id: "pilot-low-time",
      label: "PIC total time < 100 hours or < 25 hours in type",
      points: 3,
      category: "Pilot",
    },
    {
      id: "pilot-recent-layoff",
      label: "No flight in last 30 days, or just back from multi-month layoff",
      points: 2,
      category: "Pilot",
    },
    {
      id: "pilot-fatigue",
      label: "Less than 6 hours of sleep in last 24 hours, or significant fatigue",
      points: 3,
      category: "Pilot",
    },
    // Aircraft / environment
    {
      id: "aircraft-marginal-weather",
      label: "Marginal VFR or low IFR near your personal minimums on any leg",
      points: 3,
      category: "Environment",
    },
    {
      id: "aircraft-night",
      label: "Night operations away from home base or at an unfamiliar airport",
      points: 2,
      category: "Environment",
    },
    {
      id: "aircraft-short-runway",
      label: "Short, soft, or sloped runway requiring performance calculation",
      points: 2,
      category: "Aircraft",
    },
    // Operational / social pressure
    {
      id: "pressure-pax",
      label: "Non-pilot passengers with strong schedule expectations",
      points: 2,
      category: "Pressure",
    },
    {
      id: "pressure-event",
      label: "Important event at destination (wedding, business meeting, etc.)",
      points: 2,
      category: "Pressure",
    },
  ];

  function buildFratQuestions() {
    if (!fratQuestions || fratQuestions.children.length) return;
    fratQuestions.innerHTML = "";
    FRAT_ITEMS.forEach((item) => {
      const label = document.createElement("label");
      const input = document.createElement("input");
      input.type = "checkbox";
      input.dataset.points = String(item.points);
      input.dataset.category = item.category;
      input.id = item.id;

      const span = document.createElement("span");
      span.textContent = `${item.label} (+${item.points})`;

      label.appendChild(input);
      label.appendChild(span);
      fratQuestions.appendChild(label);
    });
  }

  function computeFrat() {
    const inputs = fratQuestions
      ? Array.from(fratQuestions.querySelectorAll("input[type=checkbox]"))
      : [];
    let total = 0;
    const byCat = new Map();
    inputs.forEach((inp) => {
      if (!inp.checked) return;
      const pts = Number(inp.dataset.points || "0") || 0;
      const cat = inp.dataset.category || "Other";
      total += pts;
      byCat.set(cat, (byCat.get(cat) || 0) + pts);
    });

    let band = "";
    let bandText = "";
    let dotClass = "good";

    if (total <= 4) {
      band = "Low";
      bandText = "Overall risk band: LOW";
      dotClass = "good";
    } else if (total <= 8) {
      band = "Moderate";
      bandText = "Overall risk band: MODERATE";
      dotClass = "warn";
    } else {
      band = "High";
      bandText = "Overall risk band: HIGH";
      dotClass = "bad";
    }

    return { total, band, bandText, byCat, dotClass };
  }

  if (fratStartBtn) {
    fratStartBtn.addEventListener("click", () => {
      buildFratQuestions();
      hide(fratIntroCard);
      hide(fratResultCard);
      show(fratQuestionsCard);
      if (fratRoot) goView("fratRoot");
    });
  }

  if (fratBackToMainBtn) {
    fratBackToMainBtn.addEventListener("click", () => {
      goMain();
    });
  }

  if (fratCalcBtn) {
    fratCalcBtn.addEventListener("click", () => {
      const { total, band, bandText, byCat, dotClass } = computeFrat();

      if (fratStatusLabel) fratStatusLabel.textContent = bandText;
      if (fratScoreText) fratScoreText.textContent = `Score: ${total}`;
      if (fratDot) {
        fratDot.className = "lightDot";
        fratDot.classList.add(dotClass);
      }

      if (fratNarrative) {
        fratNarrative.textContent = `Your selections yielded a total FRAT score of ${total}, placing this flight in the ${band.toUpperCase()} band.`;
      }
      if (fratGuidance) {
        if (band === "Low") {
          fratGuidance.textContent =
            "Nothing in this score forces a change of plan, but you still own the outcome. Keep scanning for weak links and avoid complacency.";
        } else if (band === "Moderate") {
          fratGuidance.textContent =
            "This is a “yellow-flag” flight. Consider adding margins: more fuel, alternate routes, earlier departure, or consulting another experienced pilot.";
        } else {
          fratGuidance.textContent =
            "This is a “red-flag” flight. You are strongly encouraged to delay, change the plan, add another qualified pilot, or stand down.";
        }
      }

      if (fratBreakdown) {
        let html = "";
        byCat.forEach((pts, cat) => {
          html += `<div>${cat}: ${pts} points</div>`;
        });
        fratBreakdown.innerHTML = html || "No items selected.";
      }

      if (fratBandRef) {
        fratBandRef.innerHTML =
          "<div>0–4: Low</div><div>5–8: Moderate</div><div>9+: High</div>";
      }

      hide(fratQuestionsCard);
      show(fratResultCard);
    });
  }

  if (fratResetBtn) {
    fratResetBtn.addEventListener("click", () => {
      if (!fratQuestions) return;
      fratQuestions
        .querySelectorAll("input[type=checkbox]")
        .forEach((inp) => (inp.checked = false));
      hide(fratResultCard);
    });
  }

  if (fratExportBtn) {
    fratExportBtn.addEventListener("click", () => {
      const { total, band, byCat } = computeFrat();
      const w = window.open("", "_blank");
      if (!w) return;
      let breakdown = "";
      byCat.forEach((pts, cat) => {
        breakdown += `${cat}: ${pts} pts\n`;
      });
      w.document.write(
        `<pre>FRAT score: ${total}\nBand: ${band}\n\nBreakdown:\n${breakdown}</pre>`
      );
    });
  }

  // Initial baseline render
  renderBaselineList();
})();
