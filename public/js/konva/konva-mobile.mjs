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
    let room = "konva-test";
    socket.emit("join", room);

    const relativeOptions = { frequency: 60, referenceFrame: 'device' };
    const relativeSensor = new RelativeOrientationSensor(relativeOptions);
    Promise.all([navigator.permissions.query({ name: "accelerometer" }),
        navigator.permissions.query({ name: "gyroscope" })])
        .then(results => {
            if (results.every(result => result.state === "granted")) {
                relativeSensor.addEventListener('reading', () => {
                    socket.emit("quaternion", relativeSensor.quaternion);
                });
                relativeSensor.addEventListener('error', error => {
                    if (error.name === 'NotReadableError') {
                        debugLog.innerHTML += "<strong>Sensor is not available.</strong><br>";
                    }
                });
                relativeSensor.start();
            } else {
                debugLog.innerHTML += "<strong>No permissions to use RelativeOrientationSensor.</strong><br>";
            }
        });

    document.querySelector('#click-button').addEventListener('click', () => {
        socket.emit('click');
    })
}