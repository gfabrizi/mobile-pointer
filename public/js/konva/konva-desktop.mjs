import { requestWakeLock, updateQuaternion, mouseClick } from "../common.mjs";
import * as socketioJs from "/socket.io/socket.io.js";
import * as konvaJs from "https://unpkg.com/konva@8.3.5/konva.min.js"

let scene = {
    // width e height saranno sovrascritti dopo l'inizializzazione di Konva
    'canvas': {
        width: 1300,
        height: 1000
    },
    'pointer': {
        'x': 0,
        'y': 0,
    },
};

let cursor;

if (document.readyState === 'interactive') {
    init();
} else {
    window.addEventListener('DOMContentLoaded', () => {
        init();
    });
}

function init() {
    requestWakeLock();

    document.querySelectorAll('.button').forEach((button) => {
        buttonApplyColor(button);
        button.addEventListener('click', (ev) => {
            buttonApplyColor(ev.currentTarget);
        })
    });

    let width = window.innerWidth;
    let height = window.innerHeight;

    let stage = new Konva.Stage({
        container: 'konva-container',
        width: width,
        height: height,
    });

    let layer = new Konva.Layer();

    cursor = new Konva.Circle({
        x: stage.width() / 2,
        y: stage.height() / 2,
        radius: 10,
        fill: 'red',
        stroke: 'red',
        strokeWidth: 0,
    });

    // aggiunge il cursore al layer
    layer.add(cursor);

    // aggiunge il layer allo stage
    stage.add(layer);

    scene.canvas = {
        width: stage.width(),
        height: stage.height()
    };

    let socket = io();
    let room = "konva-test";
    socket.emit("join", room);

    socket.on("quaternion", function (quaternion) {
        updateQuaternion(quaternion, scene, updateCanvas);
    });

    socket.on("click", function () {
        mouseClick(cursor.x(), cursor.y())
    });
}

function buttonApplyColor(button) {
    const randomColor = Math.floor(Math.random() * 16777215).toString(16);
    button.style.backgroundColor = "#" + randomColor;
}

/**
 * Aggiorna la scena
 *
 * @param scene
 */
function updateCanvas(scene) {
    cursor.x(scene.pointer.x);
    cursor.y(scene.pointer.y);
}