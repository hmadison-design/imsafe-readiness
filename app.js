// Second Opinion - D-plus build
// Sequential flow: Home -> Intro -> PVT -> Stroop -> 2-Back -> FRAT -> Summary
// FRAT-only and About are accessible from Home.

document.addEventListener("DOMContentLoaded", () => {
  const screens = document.querySelectorAll(".screen");

  const state = {
    currentScreen: "home",
    pvt: {
      nTrials: 5,
      trial: 0,
      isWaiting: false,
      isReady: false,
      timerId: null,
      startTime: 0,
      rts: []
    },
    stroop: {
      nTrials: 20,
      trial: 0,
      correct: 0,
      total: 0,
      lastResponseCorrect: null,
      lastRt: null,
      lastStartTime: 0
    },
    nback: {
      nTrials: 20,
      trial: 0,
      sequence: [],
      hits: 0,
      errors: 0
    },
    frat: {
      totalScore: null,
      band: null
    }
  };

  function showScreen(id) {
    screens.forEach((s) => {
      if (s.id === `screen-${id}`) {
        s.classList.add("screen--active");
      } else {
        s.classList.remove("screen--active");
      }
    });
    state.currentScreen = id;
  }

  // ---------- NAV / ENTRY POINTS ----------

  const btnStartFullSequence = document.getElementById("btn-start-full-sequence");
  const btnFratOnly = document.getElementById("btn-frat-only");
  const btnOpenAbout = document.getElementById("btn-open-about");

  if (btnStartFullSequence) {
    btnStartFullSequence.addEventListener("click", () => {
      resetAllTests();
      showScreen("selftest-intro");
    });
  }

  if (btnFratOnly) {
    btnFratOnly.addEventListener("click", () => {
      resetFRAT();
      showScreen("frat");
    });
  }

  if (btnOpenAbout) {
    btnOpenAbout.addEventListener("click", () => {
      showScreen("about");
    });
  }

  document.querySelectorAll("[data-nav]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-nav");
      if (target) {
        showScreen(target);
      }
    });
  });

  // ---------- PVT / REACTION TEST ----------

  const btnBeginPvt = document.getElementById("btn-begin-pvt");
  const pvtTarget = document.getElementById("pvt-target");
  const pvtTargetLabel = document.getElementById("pvt-target-label");
  const pvtFeedback = document.getElementById("pvt-feedback");
  const pvtTrialCounter = document.getElementById("pvt-trial-counter");
  const pvtMeanSoFar = document.getElementById("pvt-mean-so-far");
  const pvtTotalTrialsLabel = document.getElementById("pvt-total-trials-label");
  const btnPvtRestart = document.getElementById("btn-pvt-restart");
  const btnPvtSkip = document.getElementById("btn-pvt-skip");

  function resetPVT() {
    const p = state.pvt;
    clearTimeout(p.timerId);
    p.trial = 0;
    p.isWaiting = false;
    p.isReady = false;
    p.startTime = 0;
    p.rts = [];
    if (pvtTotalTrialsLabel) pvtTotalTrialsLabel.textContent = p.nTrials.toString();
    updatePVTUI("Tap to begin trial", "waiting");
    if (pvtTrialCounter) {
      pvtTrialCounter.textContent = `0 / ${p.nTrials}`;
    }
    if (pvtMeanSoFar) {
      pvtMeanSoFar.textContent = "–";
    }
    if (pvtFeedback) {
      pvtFeedback.textContent = "";
    }
  }

  function updatePVTUI(labelText, mode) {
    if (!pvtTarget) return;
    pvtTarget.classList.remove(
      "pvt-target--waiting",
      "pvt-target--ready",
      "pvt-target--too-early"
    );
    if (mode === "waiting") {
      pvtTarget.classList.add("pvt-target--waiting");
    } else if (mode === "ready") {
      pvtTarget.classList.add("pvt-target--ready");
    } else if (mode === "too-early") {
      pvtTarget.classList.add("pvt-target--too-early");
    }
    if (pvtTargetLabel) {
      pvtTargetLabel.textContent = labelText;
    }
  }

  function schedulePVTStimulus() {
    const p = state.pvt;
    p.isWaiting = true;
    p.isReady = false;
    if (pvtFeedback) {
      pvtFeedback.textContent = "";
    }
    updatePVTUI("Wait for green…", "waiting");

    const delay = 1200 + Math.random() * 2000;
    p.timerId = setTimeout(() => {
      p.isWaiting = false;
      p.isReady = true;
      p.startTime = performance.now();
      updatePVTUI("Tap!", "ready");
    }, delay);
  }

  function handlePVTClick() {
    const p = state.pvt;
    if (p.trial >= p.nTrials) {
      return;
    }

    // First click of the block
    if (p.trial === 0 && !p.isWaiting && !p.isReady && p.startTime === 0) {
      schedulePVTStimulus();
      return;
    }

    if (p.isWaiting) {
      clearTimeout(p.timerId);
      p.isWaiting = false;
      p.isReady = false;
      updatePVTUI("Too early – tap to try again", "too-early");
      if (pvtFeedback) {
        pvtFeedback.textContent = "You tapped before green. Trial doesn’t count.";
      }
      return;
    }

    if (p.isReady) {
      const rt = performance.now() - p.startTime;
      p.isReady = false;
      p.trial += 1;
      p.rts.push(rt);

      if (pvtFeedback) {
        pvtFeedback.textContent = `Reaction time: ${Math.round(rt)} ms`;
      }
      if (pvtTrialCounter) {
        pvtTrialCounter.textContent = `${p.trial} / ${p.nTrials}`;
      }

      const mean = p.rts.reduce((a, b) => a + b, 0) / p.rts.length;
      if (pvtMeanSoFar) {
        pvtMeanSoFar.textContent = `${Math.round(mean)} ms`;
      }

      if (p.trial >= p.nTrials) {
        updatePVTUI("Done. Tap to move on.", "waiting");
        p.startTime = 0;
        return;
      }

      // Schedule next trial
      p.startTime = 0;
      schedulePVTStimulus();
      return;
    }

    // After finishing all trials: click moves to next task
    if (p.trial >= p.nTrials) {
      showScreen("stroop");
      startStroop();
      return;
    }

    // Fallback: start a trial
    schedulePVTStimulus();
  }

  if (btnBeginPvt) {
    btnBeginPvt.addEventListener("click", () => {
      resetPVT();
      showScreen("pvt");
    });
  }

  if (pvtTarget) {
    pvtTarget.addEventListener("click", handlePVTClick);
  }

  if (btnPvtRestart) {
    btnPvtRestart.addEventListener("click", () => {
      resetPVT();
    });
  }

  if (btnPvtSkip) {
    btnPvtSkip.addEventListener("click", () => {
      showScreen("stroop");
      startStroop();
    });
  }

  // ---------- STROOP ----------

  const stroopStimulus = document.getElementById("stroop-stimulus");
  const stroopFeedback = document.getElementById("stroop-feedback");
  const stroopTrialCounter = document.getElementById("stroop-trial-counter");
  const stroopAccuracy = document.getElementById("stroop-accuracy");
  const stroopButtons = document.querySelectorAll(".btn--stroop");
  const btnStroopRestart = document.getElementById("btn-stroop-restart");
  const btnStroopSkip = document.getElementById("btn-stroop-skip");

  const stroopColors = [
    { name: "RED", css: "#ff4f5e" },
    { name: "GREEN", css: "#37d783" },
    { name: "BLUE", css: "#58a6ff" },
    { name: "YELLOW", css: "#ffdd57" }
  ];

  function resetStroop() {
    const s = state.stroop;
    s.trial = 0;
    s.correct = 0;
    s.total = 0;
    s.lastResponseCorrect = null;
    s.lastRt = null;
    s.lastStartTime = 0;

    if (stroopFeedback) stroopFeedback.textContent = "";
    if (stroopAccuracy) stroopAccuracy.textContent = "–";
    if (stroopTrialCounter) {
      stroopTrialCounter.textContent = `0 / ${s.nTrials}`;
    }
  }

  function startStroopTrial() {
    const s = state.stroop;
    if (s.trial >= s.nTrials) {
      if (stroopFeedback) {
        stroopFeedback.textContent = "Stroop complete. Tap any color to move on.";
      }
      return;
    }

    const wordIndex = Math.floor(Math.random() * stroopColors.length);
    let colorIndex = Math.floor(Math.random() * stroopColors.length);
    // Allow congruent or incongruent; bias slightly toward incongruent
    if (Math.random() < 0.6) {
      while (colorIndex === wordIndex) {
        colorIndex = Math.floor(Math.random() * stroopColors.length);
      }
    }

    const word = stroopColors[wordIndex].name;
    const ink = stroopColors[colorIndex].css;

    if (stroopStimulus) {
      stroopStimulus.textContent = word;
      stroopStimulus.style.color = ink;
    }

    s.lastStartTime = performance.now();
  }

  function handleStroopResponse(colorName) {
    const s = state.stroop;
    if (s.trial >= s.nTrials) {
      // After finishing, first click moves on to 2-Back
      showScreen("nback");
      startNBack();
      return;
    }

    if (!stroopStimulus) return;

    const inkColorCss = stroopStimulus.style.color;
    const correctColor = stroopColors.find((c) => c.css === inkColorCss);
    const correctName = correctColor ? correctColor.name.toLowerCase() : null;

    const rt = performance.now() - s.lastStartTime;
    const isCorrect = correctName === colorName.toLowerCase();

    s.trial += 1;
    s.total += 1;
    if (isCorrect) s.correct += 1;
    s.lastResponseCorrect = isCorrect;
    s.lastRt = rt;

    if (stroopFeedback) {
      stroopFeedback.textContent = isCorrect
        ? `Correct (${Math.round(rt)} ms)`
        : `Incorrect (${Math.round(rt)} ms)`;
    }

    if (stroopTrialCounter) {
      stroopTrialCounter.textContent = `${s.trial} / ${s.nTrials}`;
    }

    const accuracy = s.total > 0 ? (s.correct / s.total) * 100 : 0;
    if (stroopAccuracy) {
      stroopAccuracy.textContent = `${accuracy.toFixed(0)}%`;
    }

    if (s.trial >= s.nTrials) {
      if (stroopFeedback) {
        stroopFeedback.textContent += " · Done. Tap any color to move on.";
      }
      return;
    }

    startStroopTrial();
  }

  function startStroop() {
    resetStroop();
    startStroopTrial();
  }

  stroopButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const color = btn.getAttribute("data-color");
      if (!color) return;
      handleStroopResponse(color);
    });
  });

  if (btnStroopRestart) {
    btnStroopRestart.addEventListener("click", () => {
      startStroop();
    });
  }

  if (btnStroopSkip) {
    btnStroopSkip.addEventListener("click", () => {
      showScreen("nback");
      startNBack();
    });
  }

  // ---------- 2-BACK ----------

  const nbackStimulus = document.getElementById("nback-stimulus");
  const nbackFeedback = document.getElementById("nback-feedback");
  const nbackTrialCounter = document.getElementById("nback-trial-counter");
  const nbackHits = document.getElementById("nback-hits");
  const nbackErrors = document.getElementById("nback-errors");
  const btnNbackMatch = document.getElementById("btn-nback-match");
  const btnNbackNoMatch = document.getElementById("btn-nback-nomatch");
  const btnNbackRestart = document.getElementById("btn-nback-restart");
  const btnNbackFinish = document.getElementById("btn-nback-finish");

  const letters = "BCDFGHJKLMNPQRSTVWXZ".split("");

  function resetNBack() {
    const n = state.nback;
    n.trial = 0;
    n.sequence = [];
    n.hits = 0;
    n.errors = 0;

    if (nbackFeedback) nbackFeedback.textContent = "";
    if (nbackTrialCounter) {
      nbackTrialCounter.textContent = `0 / ${n.nTrials}`;
    }
    if (nbackHits) nbackHits.textContent = "0";
    if (nbackErrors) nbackErrors.textContent = "0";
  }

  function nextNBackLetter() {
    const n = state.nback;
    if (n.trial >= n.nTrials) {
      if (nbackFeedback) {
        nbackFeedback.textContent = "2-Back complete. Review & proceed to FRAT.";
      }
      return;
    }

    let letter;
    const shouldMatch =
      n.trial >= 2 && Math.random() < 0.3; // ~30% of trials are matches

    if (shouldMatch) {
      letter = n.sequence[n.trial - 2];
    } else {
      // choose a letter that's not the one 2 back, for clarity
      const disallowed = n.trial >= 2 ? n.sequence[n.trial - 2] : null;
      let candidate = null;
      do {
        candidate = letters[Math.floor(Math.random() * letters.length)];
      } while (candidate === disallowed);
      letter = candidate;
    }

    n.sequence.push(letter);
    n.trial += 1;

    if (nbackStimulus) {
      nbackStimulus.textContent = letter;
    }
    if (nbackTrialCounter) {
      nbackTrialCounter.textContent = `${n.trial} / ${n.nTrials}`;
    }
  }

  function handleNBackResponse(isMatchResponse) {
    const n = state.nback;
    if (n.trial === 0 || n.sequence.length === 0) return;

    const idx = n.trial - 1;
    let isActualMatch = false;
    if (idx >= 2) {
      isActualMatch = n.sequence[idx] === n.sequence[idx - 2];
    }

    let correct = false;
    if (isMatchResponse && isActualMatch) {
      correct = true;
      n.hits += 1;
    } else if (!isMatchResponse && !isActualMatch) {
      correct = true;
    } else {
      n.errors += 1;
    }

    if (nbackFeedback) {
      if (idx === n.nTrials - 1) {
        nbackFeedback.textContent = correct
          ? "Correct. 2-Back complete."
          : "Incorrect. 2-Back complete.";
      } else {
        nbackFeedback.textContent = correct ? "Correct" : "Incorrect";
      }
    }

    if (nbackHits) nbackHits.textContent = n.hits.toString();
    if (nbackErrors) nbackErrors.textContent = n.errors.toString();

    if (n.trial >= n.nTrials) {
      return;
    }

    // brief delay before next letter
    setTimeout(() => {
      nextNBackLetter();
    }, 450);
  }

  function startNBack() {
    resetNBack();
    nextNBackLetter();
  }

  if (btnNbackMatch) {
    btnNbackMatch.addEventListener("click", () => {
      handleNBackResponse(true);
    });
  }

  if (btnNbackNoMatch) {
    btnNbackNoMatch.addEventListener("click", () => {
      handleNBackResponse(false);
    });
  }

  if (btnNbackRestart) {
    btnNbackRestart.addEventListener("click", () => {
      startNBack();
    });
  }

  if (btnNbackFinish) {
    btnNbackFinish.addEventListener("click", () => {
      showScreen("frat");
      resetFRAT(); // keep cognitive results, refresh FRAT
    });
  }

  // ---------- FRAT ----------

  const fratForm = document.getElementById("frat-form");
  const btnFratSkipSummary = document.getElementById("btn-frat-skip-summary");

  function resetFRAT() {
    state.frat.totalScore = null;
    state.frat.band = null;
    if (!fratForm) return;
    fratForm.reset();
  }

  function computeFRATScore(form) {
    const fields = [
      "frat-weather",
      "frat-currency",
      "frat-complexity",
      "frat-pressure"
    ];
    let total = 0;
    for (const name of fields) {
      const val = form.querySelector(`input[name="${name}"]:checked`);
      if (!val) continue;
      total += parseInt(val.value, 10);
    }

    let band = "Low";
    if (total >= 5 && total <= 8) band = "Moderate";
    if (total > 8) band = "High";

    state.frat.totalScore = total;
    state.frat.band = band;
  }

  if (fratForm) {
    fratForm.addEventListener("submit", (e) => {
      e.preventDefault();
      computeFRATScore(fratForm);
      updateSummary();
      showScreen("summary");
    });
  }

  if (btnFratSkipSummary) {
    btnFratSkipSummary.addEventListener("click", () => {
      updateSummary();
      showScreen("summary");
    });
  }

  // ---------- SUMMARY ----------

  const summaryPvtMean = document.getElementById("summary-pvt-mean");
  const summaryStroopAccuracy = document.getElementById("summary-stroop-accuracy");
  const summaryNBack = document.getElementById("summary-nback");
  const summaryFratScore = document.getElementById("summary-frat-score");
  const summaryFratBand = document.getElementById("summary-frat-band");
  const btnSummaryRestart = document.getElementById("btn-summary-restart");

  function updateSummary() {
    // PVT
    if (summaryPvtMean) {
      const rts = state.pvt.rts;
      if (rts.length > 0) {
        const mean = rts.reduce((a, b) => a + b, 0) / rts.length;
        summaryPvtMean.textContent = `${Math.round(mean)} ms`;
      } else {
        summaryPvtMean.textContent = "Not run";
      }
    }

    // Stroop
    if (summaryStroopAccuracy) {
      const s = state.stroop;
      if (s.total > 0) {
        const acc = (s.correct / s.total) * 100;
        summaryStroopAccuracy.textContent = `${acc.toFixed(0)}% (${s.correct}/${s.total})`;
      } else {
        summaryStroopAccuracy.textContent = "Not run";
      }
    }

    // 2-Back
    if (summaryNBack) {
      const n = state.nback;
      if (n.nTrials > 0 && (n.hits > 0 || n.errors > 0 || n.trial > 0)) {
        const totalDecisions = n.hits + n.errors;
        const acc =
          totalDecisions > 0 ? (n.hits / totalDecisions) * 100 : null;
        summaryNBack.textContent =
          acc === null
            ? `${n.hits} hits, ${n.errors} errors`
            : `${acc.toFixed(0)}% · ${n.hits} hits / ${n.errors} errors`;
      } else {
        summaryNBack.textContent = "Not run";
      }
    }

    // FRAT
    if (summaryFratScore || summaryFratBand) {
      const { totalScore, band } = state.frat;
      if (totalScore === null || band === null) {
        if (summaryFratScore) summaryFratScore.textContent = "Not completed";
        if (summaryFratBand) summaryFratBand.textContent = "—";
      } else {
        if (summaryFratScore) summaryFratScore.textContent = totalScore.toString();
        if (summaryFratBand) summaryFratBand.textContent = band;
      }
    }
  }

  if (btnSummaryRestart) {
    btnSummaryRestart.addEventListener("click", () => {
      resetAllTests();
      showScreen("selftest-intro");
    });
  }

  // ---------- GLOBAL RESET ----------

  function resetAllTests() {
    resetPVT();
    resetStroop();
    resetNBack();
    resetFRAT();
  }

  // Initial state
  resetAllTests();
  showScreen("home");
});
