import { requestWakeLock, updateQuaternion } from "../common.mjs";
import * as socketioJs from "/socket.io/socket.io.js";

let scene = {
    'canvas': null,
    'ctx': null,
    'pointer': {
        'x': 0,
        'y': 0,
    },
};

if (document.readyState === 'interactive') {
    init();
} else {
    window.addEventListener('DOMContentLoaded', () => {
        init();
    });
}

function init() {
    requestWakeLock();

    let socket = io();
    let room = "pointer-test";
    socket.emit("join", room);

    socket.on("quaternion", function (quaternion) {
        updateQuaternion(quaternion, scene, updateCanvas);
    });

    canvasInit();
}

/**
 * Inizializza la canvas
 */
function canvasInit() {
    let canvas = document.getElementById('canvas');
    if (canvas.getContext) {
        canvas.height = document.documentElement.clientHeight;
        canvas.width = document.documentElement.clientWidth;
        let ctx = canvas.getContext('2d');

        scene.pointer = {
            'x': Math.floor(canvas.width / 2),
            'y': Math.floor(canvas.height / 2),
        };

        scene.canvas = canvas;
        scene.ctx = ctx;

        updateCanvas(scene);
    }
}

/**
 * Aggiorna la scena
 *
 * @param scene
 */
function updateCanvas(scene) {
    scene.ctx.fillStyle = "rgba(255,255,255,1)";
    scene.ctx.fillRect(0, 0, scene.canvas.width, scene.canvas.height);

    scene.ctx.beginPath();
    scene.ctx.arc(scene.pointer.x, scene.pointer.y, 10, 0, 2 * Math.PI);
    scene.ctx.fillStyle = 'rgba(255,0,0,1)';
    scene.ctx.fill();
}