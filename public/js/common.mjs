let currentState = {
    'init': 0,
    'roll': 0,
    'pitch': 0,
    'yaw': 0,
};

function requestWakeLock() {
    if ('wakeLock' in navigator) {
        let wakeLock = null;

        // Crea una funzione asincrona per richiedere il wake lock
        try {
            navigator.wakeLock.request('screen').then(() => {
                console.log("Screen Wake lock enabled!")
            });
        } catch (err) {
            // La richiesta del Wake Lock è fallita, solitamente a causa del sistema (batteria scarica)
        }
    }
}

/**
 * Aggiorna lo stato del puntatore e ridisegna la canvas
 *
 * @param quaternion
 * @param scene
 * @param callback
 */
function updateQuaternion(quaternion, scene, callback) {
    let sensorRead = ToEulerAngles(quaternion);

    if (currentState.init === 0) {
        currentState = sensorRead;
        currentState.init = 1;
        return;
    }

    let deltaRoll = computeDelta(currentState.roll, sensorRead.roll);
    let deltaPitch = computeDelta(currentState.pitch, sensorRead.pitch);
    let deltaYaw = computeDelta(currentState.yaw, sensorRead.yaw);

    // moltiplico per 1.5 per aumentare la sensibilità del movimento (riducendone la precisione)
    let deltaX = (scene.canvas.width * deltaYaw) * 1.5;
    let deltaY = (scene.canvas.height * deltaRoll) * 1.5;

    // faccio in modo che il puntatore non esca dalla canvas
    if ((scene.pointer.x + deltaX) > scene.canvas.width) {
        scene.pointer.x = scene.canvas.width;
    } else if ((scene.pointer.x + deltaX) < 0) {
        scene.pointer.x = 0;
    } else {
        scene.pointer.x += deltaX;
    }

    if ((scene.pointer.y + deltaY) > scene.canvas.height) {
        scene.pointer.y = scene.canvas.height;
    } else if ((scene.pointer.y + deltaY) < 0) {
        scene.pointer.y = 0;
    } else {
        scene.pointer.y += deltaY;
    }

    // aggiorno la canvas
    callback(scene);

    // aggiorno lo stato attuale con le ultime letture del sensore
    currentState = sensorRead;
}

/**
 * Converte un quaternion in tre angoli di Eulero
 * https://en.wikipedia.org/wiki/Conversion_between_quaternions_and_Euler_angles
 *
 * @param qAsArray
 * @returns {{roll: number, pitch: number, yaw: number}}
 * @constructor
 */
function ToEulerAngles(qAsArray) {
    let q = {
        'x': qAsArray[0],
        'y': qAsArray[1],
        'z': qAsArray[2],
        'w': qAsArray[3]
    };

    let angles = {
        'roll': 0,
        'pitch': 0,
        'yaw': 0
    };

    // roll (x-axis rotation)
    let sinr_cosp = 2 * (q.w * q.x + q.y * q.z);
    let cosr_cosp = 1 - 2 * (q.x * q.x + q.y * q.y);
    angles.roll = Math.atan2(sinr_cosp, cosr_cosp);

    // pitch (y-axis rotation)
    let sinp = 2 * (q.w * q.y - q.z * q.x);
    if (Math.abs(sinp) >= 1) {
        angles.pitch = (Math.sign(sinp) !== 0 ? Math.sign(sinp) : 1) * Math.PI / 2; // use 90 degrees if out of range
    } else {
        angles.pitch = Math.asin(sinp);
    }

    // yaw (z-axis rotation)
    let siny_cosp = 2 * (q.w * q.z + q.x * q.y);
    let cosy_cosp = 1 - 2 * (q.y * q.y + q.z * q.z);
    angles.yaw = Math.atan2(siny_cosp, cosy_cosp);

    return angles;
}

/**
 * Calcola il delta tra due angoli di Eulero, compensando l'overflow dovuto alla "sfericità"
 * delle coordinate
 *
 * @param alpha il primo angolo
 * @param beta il secondo angolo
 * @param limit indica il limite per rilevare l'overflow. Il valore massimo si ha a 6.28 (pigreco * 2).
 *              Un valore credibile che possa compensare l'errore di precisione del sensore è 5
 * @returns {number} il delta tra i due angoli
 */
function computeDelta(alpha, beta, limit = 5) {
    let delta = alpha - beta;
    if ((alpha > 0) && (beta < 0) && ((alpha - beta) > limit)) {
        delta = alpha - Math.abs(beta);
    } else if ((alpha < 0) && (beta > 0) && ((beta - alpha) > limit)) {
        delta = Math.abs(alpha) - beta;
    }

    return delta;
}

function mouseClick(x, y) {
    const ev = new MouseEvent('click', {
        'view': window,
        'bubbles': true,
        'cancelable': true,
        'screenX': x,
        'screenY': y
    });
    const el = document.elementFromPoint(x, y);
    el.dispatchEvent(ev);
}

export { requestWakeLock, updateQuaternion, mouseClick };