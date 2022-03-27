import { requestWakeLock } from "../common.mjs";
import * as socketioJs from "/socket.io/socket.io.js";

if (document.readyState === 'interactive') {
    init();
} else {
    window.addEventListener('DOMContentLoaded', () => {
        init();
    });
}

function init() {
    requestWakeLock()

    let debugLog = document.querySelector('#debug');

    let socket = io();
    let room = "pointer-test";
    socket.emit("join", room);

    const sensorOptions = {frequency: 60, referenceFrame: 'device'};
    const deviceSensor = new RelativeOrientationSensor(sensorOptions);
    Promise.all([navigator.permissions.query({name: "accelerometer"}),
        navigator.permissions.query({name: "gyroscope"})])
        .then(results => {
            if (results.every(result => result.state === "granted")) {
                deviceSensor.addEventListener('reading', () => {
                    socket.emit("quaternion", deviceSensor.quaternion);
                });
                deviceSensor.addEventListener('error', error => {
                    if (error.name === 'NotReadableError') {
                        debugLog.innerHTML += "<strong>Sensor is not available.</strong><br>";
                    }
                });
                deviceSensor.start();
            } else {
                debugLog.innerHTML += "<strong>No permissions to use RelativeOrientationSensor.</strong><br>";
            }
        });
}