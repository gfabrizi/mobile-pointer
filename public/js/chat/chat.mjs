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

    let roomIdInput = document.querySelector('#room-id');
    let roomLoginButton = document.querySelector('#room-login');
    let isTypingIcon = document.querySelector('#is-typing');
    let newMessageInput = document.querySelector('#new-message-text');

    // Entra nella stanza scelta
    roomLoginButton.addEventListener('click', () => {
        if (roomIdInput.value.trim() === '') {
            roomIdInput.classList.add('error');
            return;
        }

        socket.emit("join", roomIdInput.value);

        let isTypingTimeout;
        socket.on("typing", function () {
            clearTimeout(isTypingTimeout);
            isTypingIcon.classList.remove('hidden');
            isTypingTimeout = setTimeout(() => {
                isTypingIcon.classList.add('hidden');
                console.log("timeout cleared!");
            }, 3000)
        });

        newMessageInput.addEventListener('keydown', (ev) => {
            socket.emit("typing");
        });

        socket.on("message", function (data) {
            isTypingIcon.classList.add('hidden');
            addMessage(data);
            clearTimeout(isTypingTimeout);
        });

        document.querySelector('#room-login-page').style.display = 'none';
        document.querySelector('#room-chat-page').style.display = 'block';
        newMessageInput.focus();
    })

    // Invia un nuovo messaggio
    document.querySelector('#new-message-send').addEventListener('click', () => {
        if (newMessageInput.value.trim() === '') {
            newMessageInput.value = '';
            newMessageInput.focus();
            return;
        }

        let currentDate = new Date();
        let message = {
            text: newMessageInput.value,
            date: currentDate.getDate() + '/' + (currentDate.getMonth() + 1) + '/' + currentDate.getFullYear() + ' ' + currentDate.getHours() + ':' + currentDate.getMinutes(),
        }
        socket.emit("message", message);
        addMessage(message, 'mine');
        newMessageInput.value = '';
    });

    roomIdInput.addEventListener('keyup', (ev) => {
        // Rimuove la classe di errore dall'input id stanza
        ev.currentTarget.classList.remove('error');

        // Gestione pressione tasto invio nell'input id stanza
        if (ev.keyCode === 13) {
            ev.preventDefault();
            roomLoginButton.click();
        }
    });
}

function addMessage(message, className = '') {
    let messagesWrapper = document.querySelector('#room-messages');
    messagesWrapper.innerHTML += "<div class='room-message " + className + "'>" + escapeHTML(message.text) +
        "<span>" + message.date + "</span></div>";

    messagesWrapper.scrollTo({
        top: document.body.scrollHeight,
        left: 0,
        behavior: 'smooth'
    });
}

// Genio...
// https://stackoverflow.com/questions/5499078/fastest-method-to-escape-html-tags-as-html-entities/9251169#9251169
function escapeHTML(html) {
    let escapeElement = document.createElement('textarea');
    escapeElement.textContent = html;
    let escapedText = escapeElement.innerHTML;

    // sostituisce i ritorni a capo con il tag <br>
    return escapedText.replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1<br>');
}