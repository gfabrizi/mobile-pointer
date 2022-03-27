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

    const supported = 'mediaDevices' in navigator;
    if (!supported) {
        alert("Fotocamera non supportata");
    } else {
        const player = document.getElementById('player');
        const frame = document.getElementById('frame-image');
        const canvas = document.getElementById('canvas');
        const context = canvas.getContext('2d');
        const captureButton = document.getElementById('capture');

        const constraints = {
            video: true,
        };

        // Collega lo stream video all'elemento video in autoplay
        navigator.mediaDevices.getUserMedia(constraints)
            .then((stream) => {
                setTimeout(() => {
                    document.querySelectorAll('body')[0].style.opacity = '1';
                }, 500);
                player.srcObject = stream;
            });

        captureButton.addEventListener('click', () => {
            // Disegna il frame del video nella canvas
            context.drawImage(player, 0, 0, canvas.width, canvas.height);
            context.drawImage(frame, 0, 0, canvas.width, canvas.height);

            // Simula graficamente lo scatto della foto...
            player.style.opacity = '0';
            setTimeout(() => {
                player.style.opacity = '1';
            }, 500);

            socket.emit("image", canvas.toDataURL());
        });
    }
}