import * as socketioJs from "/socket.io/socket.io.js";

if (document.readyState === 'interactive') {
    init();
} else {
    window.addEventListener('DOMContentLoaded', () => {
        init();
    });
}

function init() {
    let socket = io();
    let room = "camera-test";
    socket.emit("join", room);

    socket.on("image", function (image) {
        document.getElementById('output').src = image;
    });
}
