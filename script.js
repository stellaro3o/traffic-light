let lights = ["red", "green", "yellow"];
let currentIndex = localStorage.getItem("lightIndex");

if (currentIndex === null) {
    currentIndex = 0;
} else {
    currentIndex = parseInt(currentIndex);
}

let autoInterval = null;

function updateLight() {
    // reset all
    lights.forEach(light => {
        document.getElementById(light).classList.remove("active");
    });

    // activate current
    let currentLight = lights[currentIndex];
    document.getElementById(currentLight).classList.add("active");

    // save state
    localStorage.setItem("lightIndex", currentIndex);

    document.getElementById("status").innerText =
        "Status: " + currentLight.toUpperCase() + " light is ON";
}

function changeLight() {
    currentIndex = (currentIndex + 1) % lights.length;
    updateLight();
}

function resetLight() {
    currentIndex = 0;
    updateLight();
    stopAuto();
}

function autoMode() {
    if (autoInterval) {
        stopAuto();
        return;
    }

    autoInterval = setInterval(() => {
        changeLight();
    }, 2000);

    document.getElementById("status").innerText = "Status: Auto Mode Running";
}

function stopAuto() {
    clearInterval(autoInterval);
    autoInterval = null;
    document.getElementById("status").innerText = "Status: Auto Mode Stopped";
}

// initialize
updateLight();
