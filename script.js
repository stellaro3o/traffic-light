const BASE_DURATIONS_MS = {
  NS_GREEN: 4200,
  NS_YELLOW: 1800,
  EW_GREEN: 4200,
  EW_YELLOW: 1800
};

const STATE_SEQUENCE = ["NS_GREEN", "NS_YELLOW", "EW_GREEN", "EW_YELLOW"];

const lights = {
  nsRed: document.getElementById("ns-red"),
  nsYellow: document.getElementById("ns-yellow"),
  nsGreen: document.getElementById("ns-green"),
  ewRed: document.getElementById("ew-red"),
  ewYellow: document.getElementById("ew-yellow"),
  ewGreen: document.getElementById("ew-green")
};

const cloneLights = {
  nsRed: document.querySelector(".ns-clone.red"),
  nsYellow: document.querySelector(".ns-clone.yellow"),
  nsGreen: document.querySelector(".ns-clone.green"),
  ewRed: document.querySelector(".ew-clone.red"),
  ewYellow: document.querySelector(".ew-clone.yellow"),
  ewGreen: document.querySelector(".ew-clone.green")
};

const el = {
  nsStatus: document.getElementById("ns-status"),
  ewStatus: document.getElementById("ew-status"),
  pedStatus: document.getElementById("ped-status"),
  pedTimer: document.getElementById("ped-timer"),
  systemBadge: document.getElementById("systemBadge"),
  stateName: document.getElementById("stateName"),
  stateSeconds: document.getElementById("stateSeconds"),
  cycleCount: document.getElementById("cycleCount"),
  modeLabel: document.getElementById("modeLabel"),
  logBox: document.getElementById("logBox"),
  logCount: document.getElementById("logCount"),
  modeSelect: document.getElementById("modeSelect"),
  speedRange: document.getElementById("speedRange"),
  speedLabel: document.getElementById("speedLabel"),
  startBtn: document.getElementById("startBtn"),
  stopBtn: document.getElementById("stopBtn"),
  switchBtn: document.getElementById("switchBtn"),
  pedBtn: document.getElementById("pedBtn"),
  clearLog: document.getElementById("clearLog")
};

const sim = {
  running: false,
  state: "NS_GREEN",
  timer: null,
  secondTicker: null,
  pedTimer: null,
  pedSecondsLeft: 0,
  stateStartedAt: Date.now(),
  cycleCount: 0,
  mode: "timed",
  speedMultiplier: 1,
  logEntries: 0
};

function logEvent(message) {
  const row = document.createElement("div");
  row.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
  el.logBox.prepend(row);

  sim.logEntries += 1;
  el.logCount.textContent = `${sim.logEntries} ${sim.logEntries === 1 ? "entry" : "entries"}`;
}

function speedText(multiplier) {
  if (multiplier <= 0.8) return "Slow";
  if (multiplier >= 1.4) return "Fast";
  return "Normal";
}

function getDuration(state) {
  return Math.round(BASE_DURATIONS_MS[state] / sim.speedMultiplier);
}

function resetLightGlow() {
  document.querySelectorAll(".light").forEach((light) => light.classList.remove("active"));
}

function setStatus(nsText, nsClass, ewText, ewClass) {
  el.nsStatus.textContent = `NORTH/SOUTH: ${nsText}`;
  el.ewStatus.textContent = `EAST/WEST: ${ewText}`;
  el.nsStatus.className = `status ${nsClass}`;
  el.ewStatus.className = `status ${ewClass}`;
}

function markPedestrian(isWalk) {
  el.pedStatus.textContent = isWalk ? "WALK" : "DON'T WALK";
  el.pedStatus.className = `ped-status ${isWalk ? "walk" : "stop"}`;
}

function updateBadge() {
  el.systemBadge.textContent = sim.running ? "ONLINE" : "OFFLINE";
  el.systemBadge.className = sim.running ? "badge badge-on" : "badge badge-off";
}

function updateStateStats() {
  const elapsed = Math.max(0, Math.floor((Date.now() - sim.stateStartedAt) / 1000));
  el.stateSeconds.textContent = `${elapsed}`;
}

function updateModeUI() {
  const modeText = sim.mode === "timed" ? "Timed Auto" : "Manual Priority";
  el.modeLabel.textContent = modeText;
  el.switchBtn.disabled = sim.mode === "timed" || !sim.running;
}

function setState(nextState) {
  sim.state = nextState;
  sim.stateStartedAt = Date.now();
  el.stateName.textContent = nextState.replace("_", " ");
  updateStateStats();
  resetLightGlow();

  if (nextState === "NS_GREEN") {
    lights.nsGreen.classList.add("active");
    lights.ewRed.classList.add("active");
    cloneLights.nsGreen?.classList.add("active");
    cloneLights.ewRed?.classList.add("active");
    setStatus("GO", "go", "STOP", "stop");
    sim.cycleCount += 1;
    el.cycleCount.textContent = `${sim.cycleCount}`;
  } else if (nextState === "NS_YELLOW") {
    lights.nsYellow.classList.add("active");
    lights.ewRed.classList.add("active");
    cloneLights.nsYellow?.classList.add("active");
    cloneLights.ewRed?.classList.add("active");
    setStatus("WAIT", "wait", "STOP", "stop");
  } else if (nextState === "EW_GREEN") {
    lights.ewGreen.classList.add("active");
    lights.nsRed.classList.add("active");
    cloneLights.ewGreen?.classList.add("active");
    cloneLights.nsRed?.classList.add("active");
    setStatus("STOP", "stop", "GO", "go");
  } else if (nextState === "EW_YELLOW") {
    lights.ewYellow.classList.add("active");
    lights.nsRed.classList.add("active");
    cloneLights.ewYellow?.classList.add("active");
    cloneLights.nsRed?.classList.add("active");
    setStatus("STOP", "stop", "WAIT", "wait");
  }
}

function getNextState(currState) {
  const i = STATE_SEQUENCE.indexOf(currState);
  return STATE_SEQUENCE[(i + 1) % STATE_SEQUENCE.length];
}

function stopTimers() {
  clearTimeout(sim.timer);
  clearInterval(sim.pedTimer);
  sim.timer = null;
  sim.pedTimer = null;
}

function scheduleNext() {
  if (!sim.running || sim.mode !== "timed") return;

  const wait = getDuration(sim.state);
  sim.timer = setTimeout(() => {
    const nextState = getNextState(sim.state);
    setState(nextState);
    logEvent(`State changed to ${nextState.replace("_", " ")}`);
    scheduleNext();
  }, wait);
}

function startStateTicker() {
  clearInterval(sim.secondTicker);
  sim.secondTicker = setInterval(updateStateStats, 1000);
}

function forceAllRed() {
  resetLightGlow();
  lights.nsRed.classList.add("active");
  lights.ewRed.classList.add("active");
  cloneLights.nsRed?.classList.add("active");
  cloneLights.ewRed?.classList.add("active");
  setStatus("STOP", "stop", "STOP", "stop");
}

function startSystem() {
  if (sim.running) return;

  sim.running = true;
  updateBadge();
  updateModeUI();
  setState("NS_GREEN");
  markPedestrian(false);
  el.pedTimer.textContent = "0s";
  startStateTicker();
  scheduleNext();
  logEvent("System started");
}

function stopSystem() {
  if (!sim.running) return;

  sim.running = false;
  stopTimers();
  clearInterval(sim.secondTicker);
  forceAllRed();
  markPedestrian(false);
  el.pedTimer.textContent = "0s";
  updateBadge();
  updateModeUI();
  logEvent("System stopped (all red)");
}

function manualSwitch() {
  if (!sim.running || sim.mode !== "manual") return;
  const nextState = getNextState(sim.state);
  setState(nextState);
  logEvent(`Manual switch to ${nextState.replace("_", " ")}`);
}

function pedestrianRequest() {
  if (!sim.running) {
    logEvent("Pedestrian request ignored (system offline)");
    return;
  }

  stopTimers();
  forceAllRed();
  markPedestrian(true);
  sim.pedSecondsLeft = 6;
  el.pedTimer.textContent = `${sim.pedSecondsLeft}s`;
  logEvent("Pedestrian crossing started");

  sim.pedTimer = setInterval(() => {
    sim.pedSecondsLeft -= 1;
    el.pedTimer.textContent = `${Math.max(0, sim.pedSecondsLeft)}s`;

    if (sim.pedSecondsLeft <= 0) {
      clearInterval(sim.pedTimer);
      sim.pedTimer = null;
      markPedestrian(false);
      el.pedTimer.textContent = "0s";
      setState("NS_GREEN");
      logEvent("Pedestrian crossing completed");

      if (sim.mode === "timed") {
        scheduleNext();
      }
    }
  }, 1000);
}

function clearLog() {
  el.logBox.innerHTML = "";
  sim.logEntries = 0;
  el.logCount.textContent = "0 entries";
}

function handleModeChange() {
  sim.mode = el.modeSelect.value;
  updateModeUI();
  stopTimers();
  logEvent(`Mode set to ${sim.mode === "timed" ? "Timed Auto" : "Manual Priority"}`);

  if (sim.running && sim.mode === "timed") {
    scheduleNext();
  }
}

function handleSpeedChange() {
  sim.speedMultiplier = Number(el.speedRange.value);
  el.speedLabel.textContent = speedText(sim.speedMultiplier);
  logEvent(`Speed set to ${speedText(sim.speedMultiplier)} (${sim.speedMultiplier.toFixed(1)}x)`);

  if (sim.running && sim.mode === "timed") {
    clearTimeout(sim.timer);
    scheduleNext();
  }
}

function bindEvents() {
  el.startBtn.addEventListener("click", startSystem);
  el.stopBtn.addEventListener("click", stopSystem);
  el.switchBtn.addEventListener("click", manualSwitch);
  el.pedBtn.addEventListener("click", pedestrianRequest);
  el.clearLog.addEventListener("click", clearLog);
  el.modeSelect.addEventListener("change", handleModeChange);
  el.speedRange.addEventListener("input", handleSpeedChange);
}

function boot() {
  bindEvents();
  updateBadge();
  updateModeUI();
  markPedestrian(false);
  el.speedLabel.textContent = speedText(sim.speedMultiplier);
  el.cycleCount.textContent = "0";
  el.stateName.textContent = "NS GREEN";
  el.stateSeconds.textContent = "0";
  el.logCount.textContent = "0 entries";
  logEvent("System initialized");
}

boot();

