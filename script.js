let current = localStorage.getItem("light") || "red";
let autoMode = false;
let interval;

fetch("data.json")
    .then(res => res.json())
    .then(data => {
        document.getElementById("status").innerText = data.status;
    })
    .catch(() => {
        document.getElementById("status").innerText = "System offline";
    });

function updateLight() {
    document.querySelectorAll(".light").forEach(l => l.classList.remove("active"));
    document.getElementById(current).classList.add("active");
    localStorage.setItem("light", current);
}

function changeLight() {
    if (current === "red") current = "green";
    else if (current === "green") current = "yellow";
    else current = "red";

    updateLight();
}

function resetLight() {
    current = "red";
    updateLight();
}

function toggleAuto() {
    autoMode = !autoMode;
    const btn = document.getElementById("autoBtn");

    if (autoMode) {
        btn.innerText = "AUTO MODE ACTIVE";
        interval = setInterval(changeLight, 900);
    } else {
        btn.innerText = "AUTO MODE";
        clearInterval(interval);
    }
}

updateLight();
