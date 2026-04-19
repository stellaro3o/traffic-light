let current = localStorage.getItem("light") || "red";

let autoMode = false;
let interval;

// API STATUS (safe placeholder for your requirement 4)
fetch("data.json")
    .then(res => res.json())
    .then(data => {
        document.getElementById("status").innerText =
            "API: " + data.status;
    })
    .catch(() => {
        document.getElementById("status").innerText =
            "API: offline mode";
    });

function updateLight() {
    document.getElementById("red").style.background = "gray";
    document.getElementById("yellow").style.background = "gray";
    document.getElementById("green").style.background = "gray";

    document.getElementById(current).style.background = current;

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

    if (autoMode) {
        interval = setInterval(changeLight, 1500);
    } else {
        clearInterval(interval);
    }
}

updateLight();

