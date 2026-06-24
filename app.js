// CANASTA - Application Logic, Audio System & Gameplay Engine

// -------------------------------------------------------------
// 1. Audio System (Generative Synth & SFX using Web Audio API)
// -------------------------------------------------------------
class CanastaAudio {
    constructor() {
        this.ctx = null;
        this.musicVolume = 0.7;
        this.sfxEnabled = true;

        this.isPlaying = false;
        this.musicInterval = null;
        this.musicGain = null;

        this.chords = [
            [130.81, 146.83, 196.00, 261.63], // Csus2 (Open and hollow)
            [138.59, 174.61, 196.00, 261.63], // Dbmaj7#11 (Mysterious and cinematic)
            [103.83, 155.56, 196.00, 261.63], // Abmaj7 (Warm and deep)
            [116.54, 130.81, 174.61, 233.08]  // Bbsus2 (Soft and airy)
        ];
        this.currentChordIndex = 0;
        this.step = 0;
    }

    init() {
        if (this.ctx) return;
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.musicGain = this.ctx.createGain();
        this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
        this.musicGain.connect(this.ctx.destination);
    }

    startMusic() {
        // Initialize audio context for SFX, but do not play background music
        this.init();
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    stopMusic() {
        this.isPlaying = false;
        if (this.musicInterval) {
            clearInterval(this.musicInterval);
            this.musicInterval = null;
        }
    }

    setMusicVolume(vol) {
        this.musicVolume = parseFloat(vol);
        if (this.musicGain) {
            this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
        }
    }

    setSfxEnabled(enabled) {
        this.sfxEnabled = enabled;
    }

    playChordStep() {
        if (!this.ctx || !this.isPlaying) return;
        const chord = this.chords[this.currentChordIndex];
        if (this.step % 4 === 0) {
            this.playSynthNote(chord[0] / 2, 0.3, 1.1, 'triangle', 0.1);
        }
        const noteIndex = Math.floor(Math.random() * chord.length);
        const noteFreq = chord[noteIndex];
        this.playSynthNote(noteFreq, 0.12, 0.9, 'sine', 0.05);
        if (Math.random() > 0.5) {
            const secondNoteFreq = chord[(noteIndex + 2) % chord.length];
            this.playSynthNote(secondNoteFreq, 0.06, 0.7, 'sine', 0.05);
        }
        this.step++;
        if (this.step % 4 === 0) {
            this.currentChordIndex = (this.currentChordIndex + 1) % this.chords.length;
        }
    }

    playSynthNote(frequency, volume, duration, type = 'sine', attack = 0.1) {
        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(600, this.ctx.currentTime);

        osc.type = type;
        osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);

        gainNode.gain.setValueAtTime(0, this.ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume * this.musicVolume, this.ctx.currentTime + attack);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

        osc.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duration + 0.1);
    }

    playSFX(type) {
        if (!this.sfxEnabled) return;
        this.init();
        const time = this.ctx.currentTime;

        if (type === 'click') {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.frequency.setValueAtTime(800, time);
            osc.frequency.exponentialRampToValueAtTime(400, time + 0.08);
            gain.gain.setValueAtTime(0.15, time);
            gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.08);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(time + 0.1);
        }
        else if (type === 'success') {
            const notes = [523.25, 659.25, 783.99, 1046.50];
            notes.forEach((freq, idx) => {
                const noteTime = time + idx * 0.08;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.frequency.setValueAtTime(freq, noteTime);
                gain.gain.setValueAtTime(0.12, noteTime);
                gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 0.25);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(noteTime);
                osc.stop(noteTime + 0.3);
            });
        }
        else if (type === 'card-flip') {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(300, time);
            osc.frequency.exponentialRampToValueAtTime(600, time + 0.15);
            gain.gain.setValueAtTime(0.08, time);
            gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.15);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(time + 0.2);
        }
        else if (type === 'thinking') {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(220, time);
            gain.gain.setValueAtTime(0.1, time);
            gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.4);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(time + 0.5);
        }
        else if (type === 'deal') {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, time);
            osc.frequency.exponentialRampToValueAtTime(900, time + 0.06);
            gain.gain.setValueAtTime(0.05, time);
            gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.06);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(time + 0.1);
        }
    }
}

const audio = new CanastaAudio();

// -------------------------------------------------------------
// 2. Floating Background Cards Animation
// -------------------------------------------------------------
function setupBackgroundCanvas() {
    const canvas = document.getElementById('bg-canvas');
    canvas.innerHTML = '';
    const suits = ['♠', '♥', '♦', '♣'];
    const cardValues = ['A', 'K', 'Q', 'J', '10'];
    for (let i = 0; i < 12; i++) {
        const card = document.createElement('div');
        card.className = 'floating-card';
        const suit = suits[Math.floor(Math.random() * suits.length)];
        const val = cardValues[Math.floor(Math.random() * cardValues.length)];
        card.innerHTML = `<span style="font-size: 0.9rem; position: absolute; top: 5px; left: 8px;">${val}</span>
                          <span>${suit}</span>
                          <span style="font-size: 0.9rem; position: absolute; bottom: 5px; right: 8px; transform: rotate(180deg);">${val}</span>`;
        if (suit === '♥' || suit === '♦') {
            card.style.color = '#e04a4a';
        } else {
            card.style.color = 'var(--gold)';
        }
        card.style.left = `${Math.random() * 90}%`;
        card.style.animationDelay = `${Math.random() * 20}s`;
        card.style.animationDuration = `${20 + Math.random() * 15}s`;
        canvas.appendChild(card);
    }
}

// -------------------------------------------------------------
// 3. UI Navigation & Screens Control
// -------------------------------------------------------------
const screens = {
    menu: document.getElementById('menu-screen'),
    lobby: document.getElementById('lobby-screen'),
    table: document.getElementById('table-screen'),
    settingsModal: document.getElementById('settings-modal'),
    scoreOverlay: document.getElementById('score-overlay'),
    meldInspectorModal: document.getElementById('meld-inspector-modal')
};

// Multiplayer Networking Globals
let socket = null;
let currentRoom = null;
let isHost = false;

// Open settings
document.getElementById('btn-settings').addEventListener('click', () => {
    audio.playSFX('click');
    screens.settingsModal.classList.add('active');
    audio.startMusic();
});

// Close settings
document.getElementById('btn-close-settings').addEventListener('click', () => {
    audio.playSFX('click');
    screens.settingsModal.classList.remove('active');
});

// Close inspector
document.getElementById('btn-close-inspector').addEventListener('click', () => {
    audio.playSFX('click');
    screens.meldInspectorModal.classList.remove('active');
});

// Close inspector when clicking outside the content overlay
screens.meldInspectorModal.addEventListener('click', (e) => {
    if (e.target === screens.meldInspectorModal) {
        audio.playSFX('click');
        screens.meldInspectorModal.classList.remove('active');
    }
});

// Volume Slider
const musicSlider = document.getElementById('music-slider');
const musicVolLbl = document.getElementById('music-vol-lbl');
musicSlider.addEventListener('input', (e) => {
    const val = e.target.value;
    musicVolLbl.textContent = `${val}%`;
    audio.setMusicVolume(val / 100);
});

// SFX Toggle
const sfxToggle = document.getElementById('sfx-toggle');
const sfxLbl = document.getElementById('sfx-lbl');
sfxToggle.addEventListener('change', (e) => {
    const isEnabled = e.target.checked;
    sfxLbl.textContent = isEnabled ? 'ON' : 'OFF';
    audio.setSfxEnabled(isEnabled);
    audio.playSFX('click');
});

// Start Solo Game Play
// --- Multiplayer Lobby Flow & State ---
let lobbyPlayers = [null, null, null, null]; // Slots: 0 (Host/T1), 1 (T2), 2 (T1), 3 (T2)

function renderLobbyUI() {
    let filledCount = 0;
    for (let i = 0; i < 4; i++) {
        const slotEl = document.getElementById(`slot-${i}`);
        const p = lobbyPlayers[i];
        if (p) {
            filledCount++;
            const icon = p.type === 'human' ? '👤' : '🤖';
            const hostBadge = p.isHost ? `<span style="font-size:0.7rem; background:var(--gold); color:black; padding:2px 6px; border-radius:4px; margin-left:8px;">HOST</span>` : '';
            const removeBtn = (isHost && p.type === 'bot') ? `<button class="btn btn-secondary btn-small" onclick="removeBot(${i})">Kick</button>` : '';
            slotEl.className = `lobby-slot filled ${p.isHost ? 'host-slot' : ''}`;
            slotEl.innerHTML = `<span class="player-name">${icon} ${p.name} ${hostBadge}</span>${removeBtn}`;
        } else {
            const addBotBtn = isHost ? `<button class="btn btn-small" onclick="addBot(${i})">+ Add Bot</button>` : '';
            slotEl.className = 'lobby-slot';
            slotEl.innerHTML = `<span class="player-name" style="color:var(--text-secondary); font-weight:400;">Empty Slot</span>${addBotBtn}`;
        }

        slotEl.onclick = (e) => {
            if (e.target.tagName === 'BUTTON') return;
            audio.playSFX('click');
            if (socket && currentRoom) {
                socket.emit('chooseSeat', { roomCode: currentRoom, index: i });
            }
        };
    }
    document.getElementById('btn-start-multiplayer').disabled = (filledCount < 4);
}

window.addBot = function (index) {
    if (!isHost || !currentRoom) return;
    audio.playSFX('click');
    const botNames = ['AlphaBot', 'BetaBot', 'CharlieBot', 'DeltaBot'];
    socket.emit('updateBot', { roomCode: currentRoom, action: 'add', index: index, botName: botNames[index] });
};

window.removeBot = function (index) {
    if (!isHost || !currentRoom) return;
    audio.playSFX('card-flip');
    socket.emit('updateBot', { roomCode: currentRoom, action: 'remove', index: index });
};

document.getElementById('btn-multiplayer').addEventListener('click', () => {
    audio.playSFX('click');
    screens.menu.classList.remove('active');
    screens.lobby.classList.add('active');
    document.getElementById('lobby-choices').style.display = 'flex';
    document.getElementById('lobby-waiting').style.display = 'none';
});

document.getElementById('btn-back-menu').addEventListener('click', () => {
    audio.playSFX('click');
    screens.lobby.classList.remove('active');
    screens.menu.classList.add('active');
    if (socket) {
        socket.disconnect();
        socket = null;
    }
});

document.getElementById('btn-lobby-swap').addEventListener('click', () => {
    if (!isHost || !currentRoom) return;
    audio.playSFX('card-flip');
    socket.emit('swapTeams', { roomCode: currentRoom });
});

// --- SERVER CONNECTION LOGIC ---
let mySlotIndex = 0;
let isMultiplayer = false;

function unrotateState(rotatedState, mySlotIndex) {
    const compass = ['player', 'east', 'north', 'west'];
    const unrotated = JSON.parse(JSON.stringify(rotatedState));
    const directionalKeys = ['hands', 'melds', 'pendingMelds', 'red3s'];

    directionalKeys.forEach(group => {
        if (!rotatedState[group]) return;
        unrotated[group] = {};
        for (let i = 0; i < 4; i++) {
            const targetSeat = compass[(i + mySlotIndex) % 4];
            const sourceSeat = compass[i];
            unrotated[group][targetSeat] = rotatedState[group][sourceSeat];
        }
    });

    if (rotatedState.activePlayer) {
        const localActiveIndex = compass.indexOf(rotatedState.activePlayer);
        unrotated.activePlayer = compass[(localActiveIndex + mySlotIndex) % 4];
    }
    if (rotatedState.startingPlayer) {
        const localStartIndex = compass.indexOf(rotatedState.startingPlayer);
        unrotated.startingPlayer = compass[(localStartIndex + mySlotIndex) % 4];
    }
    return unrotated;
}

function broadcastState() {
    if (!isMultiplayer || !socket) return;
    const stateToSend = unrotateState(roundState, mySlotIndex);
    socket.emit('syncGameState', { roomCode: currentRoom, state: stateToSend });
}


function setupMultiplayerTable(players, mySlotIndex) {
    document.getElementById('center-hud').style.display = 'none';
    document.getElementById('center-play-zone').style.display = 'flex';
    document.getElementById('melds-container').style.display = 'flex';
    document.getElementById('hand-area').style.display = 'flex';

    document.getElementById('count-west').style.display = 'block';
    document.getElementById('count-north').style.display = 'block';
    document.getElementById('count-east').style.display = 'block';

    const headerScores = document.getElementById('header-scores');
    if (headerScores) headerScores.style.display = 'flex';
    updateFeltScoresUI();

    const compassMap = ['player', 'east', 'north', 'west'];
    for (let i = 0; i < 4; i++) {
        const serverSlot = (mySlotIndex + i) % 4;
        const playerObj = players[serverSlot] || { name: 'Waiting...', type: 'bot' };
        const compassKey = compassMap[i];

        const avatar = playerObj.type === 'bot' ? '🤖' : '👤';
        const name = playerObj.name;
        const role = i === 0 ? 'You' : (i === 2 ? 'Partner' : 'Opponent');

        seatAssignments[compassKey === 'player' ? 'south' : compassKey] = { id: compassKey, name: name, avatar: avatar, role: role, type: playerObj.type };
        renderSeatHTML(compassKey, name, avatar, role);
    }

    resetTeamVisuals();
    document.getElementById('card-south').classList.add('team-red-border');
    document.getElementById('card-north').classList.add('team-red-border');
    document.getElementById('card-west').classList.add('team-blue-border');
    document.getElementById('card-east').classList.add('team-blue-border');
    document.getElementById('team-beam-vertical').classList.add('active');
}

function translateCompassKey(sourceKey, senderSlot, receiverSlot) {
    const compass = ['player', 'east', 'north', 'west'];
    const senderIdx = compass.indexOf(sourceKey);
    if (senderIdx === -1) return sourceKey;
    const serverSlot = (senderSlot + senderIdx) % 4;
    const receiverIdx = (serverSlot - receiverSlot + 4) % 4;
    return compass[receiverIdx];
}

function connectToServer(action, code = null, playerName = 'Player') {
    if (!socket) {
        let serverUrl = 'http://localhost:3000';
        if (window.location.hostname && window.location.hostname !== 'localhost' && !window.location.hostname.startsWith('192.168.')) {
            // Production server on Render.com (Replace with your actual URL if different)
            serverUrl = 'https://canasta-backend-wm5f.onrender.com';
        } else if (window.location.hostname && window.location.hostname !== 'localhost') {
            // Local LAN IP fallback
            const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
            serverUrl = `${protocol}//${window.location.hostname}:3000`;
        }
        socket = io(serverUrl);

        socket.on('lobbyUpdated', (players) => {
            lobbyPlayers = players;
            renderLobbyUI();
            audio.playSFX('card-flip');
        });

        socket.on('disconnect', () => {
            alert("Lost connection to the game server!");
            screens.lobby.classList.remove('active');
            screens.menu.classList.add('active');
            isMultiplayer = false;
        });

        socket.on('gameStarted', (players) => {
            audio.playSFX('success');
            isMultiplayer = true;
            mySlotIndex = players.findIndex(p => p && p.id === socket.id);

            screens.lobby.classList.remove('active');
            screens.table.classList.add('active');
            setupMultiplayerTable(players, mySlotIndex);

            if (isHost) {
                if (typeof startNewRound === 'function') startNewRound();
            } else {
                // Guests clear out any left-over local data and wait for the Host's broadcast
                roundState.hands = { player: [], west: [], north: [], east: [] };
                roundState.melds = { player: {}, west: {}, north: {}, east: {} };
                roundState.red3s = { player: [], west: [], north: [], east: [] };
            }
        });

        socket.on('playerMoved', (data) => {
            const localPlayerKey = translateCompassKey(data.playerKey, data.senderSlot, mySlotIndex);
            if (data.type === 'deal') {
                if (localPlayerKey === 'player') {
                    if (data.card) {
                        roundState.hands.player.push(data.card);
                        renderPlayerHand();
                    }
                } else {
                    roundState.hands[localPlayerKey].push({ id: 'temp_' + Math.random() });
                    updateBotCardCount(localPlayerKey);
                }
                createCardFlyAnimation(localPlayerKey);
                audio.playSFX('deal');
            } else if (data.type === 'dealRed3') {
                roundState.red3s[localPlayerKey].push(data.card);
                renderDeployedRed3s(localPlayerKey);
                audio.playSFX('success');
            } else if (data.type === 'draw') {
                if (localPlayerKey !== 'player') {
                    roundState.hands[localPlayerKey].push({ id: 'temp_' + Math.random() });
                    updateBotCardCount(localPlayerKey);
                }
                if (roundState.deck.length > 0) {
                    roundState.deck.pop();
                }
                createCardFlyAnimation(localPlayerKey);
                updateDeckCount();
                audio.playSFX('deal');
            } else if (data.type === 'discard') {
                // Instantly update local state for responsive visual
                roundState.discardPile.push(data.card);
                if (roundState.hands[localPlayerKey]) {
                    const idx = roundState.hands[localPlayerKey].findIndex(c => c.id === data.card.id);
                    if (idx !== -1) {
                        roundState.hands[localPlayerKey].splice(idx, 1);
                    } else if (localPlayerKey !== 'player' && roundState.hands[localPlayerKey].length > 0) {
                        roundState.hands[localPlayerKey].pop();
                    }
                }
                animateCardThrow(localPlayerKey, data.card, null, () => {
                    renderDiscardPile();
                    updateBotCardCount(localPlayerKey);
                });
                audio.playSFX('card-flip');
            } else if (data.type === 'benchTake') {
                animateBenchTakeAction(localPlayerKey, data.rank, data.requiredCount);
            }
        });

        socket.on('gameStateUpdated', (absoluteState) => {
            const compass = ['player', 'east', 'north', 'west'];
            const rotatedState = JSON.parse(JSON.stringify(absoluteState));

            const directionalKeys = ['hands', 'melds', 'pendingMelds', 'red3s'];
            directionalKeys.forEach(group => {
                if (!absoluteState[group]) return;
                rotatedState[group] = {};
                for (let i = 0; i < 4; i++) {
                    const targetSeat = compass[i];
                    const sourceSeat = compass[(i + mySlotIndex) % 4];
                    rotatedState[group][targetSeat] = absoluteState[group][sourceSeat];
                }
            });

            if (absoluteState.activePlayer) {
                const absoluteActiveIndex = compass.indexOf(absoluteState.activePlayer);
                rotatedState.activePlayer = compass[(absoluteActiveIndex - mySlotIndex + 4) % 4];
            }
            if (absoluteState.startingPlayer) {
                const absoluteStartIndex = compass.indexOf(absoluteState.startingPlayer);
                rotatedState.startingPlayer = compass[(absoluteStartIndex - mySlotIndex + 4) % 4];
            }

            const activeChanged = (roundState.activePlayer !== rotatedState.activePlayer);
            const phaseChanged = (roundState.turnPhase !== rotatedState.turnPhase);

            roundState = rotatedState;

            // Trigger round end stats summary overlay on Guest client
            if (rotatedState.roundEndedBy && !screens.scoreOverlay.classList.contains('active')) {
                triggerRoundEnd(rotatedState.roundEndedBy);
                return; // Round is over, halt further turn flow processing
            }

            // Auto-close round summary overlay if Host advances to next round
            if (!rotatedState.roundEndedBy && screens.scoreOverlay.classList.contains('active')) {
                screens.scoreOverlay.classList.remove('active');
            }

            if (typeof renderPlayerHand === 'function') renderPlayerHand();
            if (typeof renderMelds === 'function') renderMelds();
            if (typeof renderDiscardPile === 'function') renderDiscardPile();

            ['player', 'west', 'north', 'east'].forEach(k => {
                if (typeof renderDeployedRed3s === 'function') renderDeployedRed3s(k);
                if (k !== 'player' && typeof updateBotCardCount === 'function') updateBotCardCount(k);
            });
            if (typeof updateTurnIndicatorUI === 'function') updateTurnIndicatorUI();
            if (typeof updateActivePlayerHighlight === 'function') updateActivePlayerHighlight();
            if (typeof updateDeckCount === 'function') updateDeckCount();
            if (typeof updateBenchLockVisual === 'function') updateBenchLockVisual();

            if (activeChanged || phaseChanged) {
                if (roundState.turnPhase !== 'DEALING') {
                    nextTurn();
                }
            }
        });
    }

    if (action === 'create') {
        socket.emit('createRoom', { playerName: playerName }, (res) => {
            if (res.success) { currentRoom = res.roomCode; document.getElementById('room-code-display').textContent = currentRoom; lobbyPlayers = res.players; renderLobbyUI(); }
        });
    } else if (action === 'join') {
        socket.emit('joinRoom', { roomCode: code, playerName: playerName }, (res) => {
            if (res.success) { currentRoom = res.roomCode; document.getElementById('room-code-display').textContent = currentRoom; lobbyPlayers = res.players; renderLobbyUI(); }
            else { alert(res.message); document.getElementById('lobby-choices').style.display = 'flex'; document.getElementById('lobby-waiting').style.display = 'none'; }
        });
    }
}

document.getElementById('btn-create-room').addEventListener('click', () => {
    const pName = document.getElementById('input-player-name').value.trim() || 'Host Player';
    audio.playSFX('success');
    isHost = true;
    document.getElementById('lobby-choices').style.display = 'none';
    document.getElementById('lobby-waiting').style.display = 'flex';
    document.getElementById('room-code-display').textContent = "LOAD...";
    connectToServer('create', null, pName);
});

document.getElementById('btn-join-room').addEventListener('click', () => {
    const pName = document.getElementById('input-player-name').value.trim() || 'Guest Player';
    const code = document.getElementById('input-join-code').value.trim().toUpperCase();
    if (code.length < 5) { alert("Please enter a valid 6-digit room code."); return; }
    audio.playSFX('success');
    isHost = false;
    document.getElementById('lobby-choices').style.display = 'none';
    document.getElementById('lobby-waiting').style.display = 'flex';
    document.getElementById('room-code-display').textContent = "JOIN...";
    connectToServer('join', code, pName);
});

document.getElementById('btn-start-multiplayer').addEventListener('click', () => {
    if (!isHost || !currentRoom) return;
    audio.playSFX('success');
    socket.emit('startGame', { roomCode: currentRoom });
});

// Copy Room Code directly by clicking the text
document.getElementById('room-code-display').addEventListener('click', function () {
    const code = this.textContent;
    if (code && code !== '---') {
        navigator.clipboard.writeText(code);
        audio.playSFX('click');
        const originalColor = this.style.color;
        this.style.color = '#a5d6a7';
        setTimeout(() => this.style.color = originalColor, 1000);
    }
});

// Copy Full Join Link by clicking the button
document.getElementById('btn-copy-link').addEventListener('click', function () {
    const code = document.getElementById('room-code-display').textContent;
    if (code && code !== '---') {
        const joinLink = `${window.location.origin}${window.location.pathname}?join=${code}`;
        navigator.clipboard.writeText(joinLink);
        audio.playSFX('success');
        const originalHtml = this.innerHTML;
        this.innerHTML = '✅ Copied!';
        this.style.color = '#a5d6a7';
        this.style.borderColor = '#a5d6a7';
        setTimeout(() => {
            this.innerHTML = originalHtml;
            this.style.color = '';
            this.style.borderColor = '';
        }, 2000);
    }
});
// ------------------------------
document.getElementById('btn-solo').addEventListener('click', () => {
    audio.playSFX('click');
    audio.startMusic();
    screens.menu.classList.remove('active');
    screens.table.classList.add('active');
    initTeamSetup();
});

// Quit Table / Return to Menu
document.getElementById('btn-quit').addEventListener('click', () => {
    audio.playSFX('click');
    screens.table.classList.remove('active');
    screens.menu.classList.add('active');
    resetTeamState();
});

// Next Round Trigger
document.getElementById('btn-next-round').addEventListener('click', () => {
    audio.playSFX('click');
    screens.scoreOverlay.classList.remove('active');
    if (globalScores.us >= 5000 || globalScores.them >= 5000) {
        alert(globalScores.us >= 5000 ? "Victory! Your Team Won the game!" : "Defeat! Opponents Won the game!");
        screens.table.classList.remove('active');
        screens.menu.classList.add('active');
        resetTeamState();
    } else {
        if (!isMultiplayer || isHost) {
            startNewRound();
        }
    }
});


// -------------------------------------------------------------
// 4. Seating & Team Selection Mechanics
// -------------------------------------------------------------
const defaultBots = {
    west: { id: 'west', name: 'Sophia', avatar: '👩', defaultRole: 'West (Bot)', type: 'bot' },
    north: { id: 'north', name: 'Marcus', avatar: '👨', defaultRole: 'North (Bot)', type: 'bot' },
    east: { id: 'east', name: 'Elena', avatar: '👩', defaultRole: 'East (Bot)', type: 'bot' }
};

let seatAssignments = {
    south: { id: 'player', name: 'You', avatar: '👤', role: 'South', type: 'human' },
    north: null,
    west: null,
    east: null
};

let botsData = {
    west: null,
    north: null,
    east: null
};

let selectedTeammateId = null;
let isPartnerChoosing = false;
let selectedCards = [];

const welcomeBubbles = [
    "Awesome! Let's build some Canastas together!",
    "You chose well! We will crush them!",
    "Partners! Let's meld our way to victory!"
];
const rejectBubbles = [
    "Opposition it is! Prepare to lose!",
    "Oh, rivals! Good luck, you'll need it!",
    "I'll block your discards all game!"
];

function initTeamSetup() {
    isPartnerChoosing = false;
    selectedTeammateId = null;

    // UI clean
    document.getElementById('hud-title').textContent = 'Partnership Setup';
    document.getElementById('hud-message').textContent = 'Select one of the players to choose them as your teammate.';
    document.getElementById('btn-next-phase').style.display = 'none';
    document.getElementById('center-play-zone').style.display = 'none';
    document.getElementById('melds-container').style.display = 'none';
    document.getElementById('hand-area').style.display = 'none';
    document.getElementById('turn-indicator').textContent = '';

    const headerScores = document.getElementById('header-scores');
    if (headerScores) headerScores.style.display = 'none';

    ['south', 'west', 'north', 'east'].forEach(pos => {
        const el = document.getElementById(`red3s-${pos}`);
        if (el) el.innerHTML = '';
    });

    renderSeatHTML('west', defaultBots.west.name, defaultBots.west.avatar, defaultBots.west.defaultRole);
    renderSeatHTML('north', defaultBots.north.name, defaultBots.north.avatar, defaultBots.north.defaultRole);
    renderSeatHTML('east', defaultBots.east.name, defaultBots.east.avatar, defaultBots.east.defaultRole);

    resetTeamVisuals();

    document.getElementById('seat-west').classList.add('selectable-partner');
    document.getElementById('seat-north').classList.add('selectable-partner');
    document.getElementById('seat-east').classList.add('selectable-partner');

    document.getElementById('seat-west').onclick = () => selectPartner('west');
    document.getElementById('seat-north').onclick = () => selectPartner('north');
    document.getElementById('seat-east').onclick = () => selectPartner('east');
}

function renderSeatHTML(position, name, avatar, role) {
    const seatId = position === 'player' ? 'south' : position;
    const card = document.getElementById(`card-${seatId}`);
    if (card) {
        card.querySelector('.player-avatar').textContent = avatar;
        card.querySelector('.player-name').textContent = name;
        card.querySelector('.player-role').textContent = role;
    }
    const countEl = document.getElementById(`count-${seatId}`);
    if (countEl) {
        countEl.style.display = seatId === 'south' ? 'none' : 'block';
    }
}

function selectPartner(position) {
    if (isPartnerChoosing) return;
    isPartnerChoosing = true;
    audio.playSFX('thinking');

    ['west', 'north', 'east'].forEach(pos => {
        const seat = document.getElementById(`seat-${pos}`);
        seat.classList.remove('selectable-partner');
        seat.onclick = null;
    });

    const chosenBot = defaultBots[position];
    document.getElementById(`card-${position}`).classList.add('team-red-border');
    document.getElementById('card-south').classList.add('team-red-border');

    document.getElementById('hud-title').textContent = 'Proposing Partnership...';
    document.getElementById('hud-message').innerHTML = `Awaiting response from <strong>${chosenBot.name}</strong>...`;

    showChatBubble(position, "Let me think...");

    setTimeout(() => {
        audio.playSFX('success');

        setupFinalSeating(chosenBot);

        showChatBubble('north', welcomeBubbles[Math.floor(Math.random() * welcomeBubbles.length)]);
        setTimeout(() => {
            showChatBubble('west', rejectBubbles[Math.floor(Math.random() * rejectBubbles.length)]);
            showChatBubble('east', rejectBubbles[Math.floor(Math.random() * rejectBubbles.length)]);
        }, 500);

        document.getElementById('card-south').classList.add('team-red-border');
        document.getElementById('card-north').classList.add('team-red-border');
        document.getElementById('card-west').classList.add('team-blue-border');
        document.getElementById('card-east').classList.add('team-blue-border');

        document.getElementById('team-beam-vertical').classList.add('active');

        document.getElementById('hud-title').textContent = 'Partnership Confirmed';
        document.getElementById('hud-message').innerHTML = `
            <span class="team-red-label">Your Team:</span> You & ${seatAssignments.north.name}<br>
            <span class="team-blue-label">Opponents:</span> ${seatAssignments.west.name} & ${seatAssignments.east.name}
        `;

        const startBtn = document.getElementById('btn-next-phase');
        startBtn.style.display = 'inline-block';
        startBtn.textContent = 'Deal Cards';
        startBtn.onclick = () => {
            audio.playSFX('click');
            startMatchPhase();
        };

        isPartnerChoosing = false;
    }, 1500);
}

function setupFinalSeating(teammate) {
    selectedTeammateId = teammate.id;
    seatAssignments.north = { ...teammate, role: 'Partner' };

    const opponents = Object.values(defaultBots).filter(b => b.id !== teammate.id);
    seatAssignments.west = { ...opponents[0], role: 'Opponent (West)' };
    seatAssignments.east = { ...opponents[1], role: 'Opponent (East)' };

    renderSeatHTML('north', seatAssignments.north.name, seatAssignments.north.avatar, seatAssignments.north.role);
    renderSeatHTML('west', seatAssignments.west.name, seatAssignments.west.avatar, seatAssignments.west.role);
    renderSeatHTML('east', seatAssignments.east.name, seatAssignments.east.avatar, seatAssignments.east.role);

    botsData.north = seatAssignments.north;
    botsData.west = seatAssignments.west;
    botsData.east = seatAssignments.east;
}

function showChatBubble(position, text) {
    const bubble = document.getElementById(`bubble-${position}`);
    bubble.textContent = text;
    bubble.classList.add('active');
    setTimeout(() => {
        bubble.classList.remove('active');
    }, 4500);
}

function resetTeamState() {
    resetTeamVisuals();
    ['west', 'north', 'east'].forEach(pos => {
        document.getElementById(`bubble-${pos}`).classList.remove('active');
    });
}

function resetTeamVisuals() {
    document.getElementById('team-beam-vertical').classList.remove('active');
    document.getElementById('team-beam-horizontal').classList.remove('active');
    document.getElementById('card-south').classList.remove('team-red-border', 'team-blue-border');
    ['west', 'north', 'east'].forEach(pos => {
        document.getElementById(`card-${pos}`).classList.remove('team-red-border', 'team-blue-border');
    });
}


// -------------------------------------------------------------
// 5. Game Play Engine & Data Structures
// -------------------------------------------------------------
const SUITS = [
    { name: 'hearts', symbol: '♥' },
    { name: 'diamonds', symbol: '♦' },
    { name: 'clubs', symbol: '♣' },
    { name: 'spades', symbol: '♠' }
];
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

let globalScores = {
    us: 0,
    them: 0
};

let roundState = {
    deck: [],
    discardPile: [],
    hands: {
        player: [], // South
        west: [],   // West
        north: [],  // North
        east: []    // East
    },
    melds: {
        player: {},
        west: {},
        north: {},
        east: {}
    },

    // PENDING MELDS STATE for initial opening requirements
    pendingMelds: {
        player: {},
        west: {},
        north: {},
        east: {}
    },

    // OPENING STATE (Requires meeting minimum points 50 / 90 / 120)
    isOpen: {
        us: false,
        them: false
    },

    // Direct discard pile taking state flags
    pendingBenchTake: false,
    pulledBenchCard: null,

    // Bench lock status (true: needs 3 cards in hand, false: needs 2 cards in hand)
    benchLocked: true,

    red3s: {
        player: [],
        west: [],
        north: [],
        east: []
    },
    activePlayer: 'player',
    playOrder: ['player', 'east', 'north', 'west'], // Reversed (Counter-Clockwise)
    turnPhase: 'DRAW_PHASE',
    firstTurnCompleted: false,
    startingPlayer: 'player',
    roundEndedBy: null
};

// Returns required points based on team score
function getRequiredOpeningPoints(score) {
    if (score < 1500) return 50;
    if (score < 3000) return 90;
    return 120;
}

function getCardRankValue(rank) {
    if (rank === 'JK') return 50;
    if (rank === '2') return 20;
    if (rank === 'A') return 20;
    if (['8', '9', '10', 'J', 'Q', 'K'].includes(rank)) return 10;
    if (['4', '5', '6', '7'].includes(rank)) return 5;
    if (rank === '3') return 0; // Black 3 is 0
    return 5;
}

function isWildcard(rank) {
    return rank === 'JK' || rank === '2';
}

function isRed3(card) {
    return card.rank === '3' && (card.suit === '♥' || card.suit === '♦');
}

function isBlack3(card) {
    return card.rank === '3' && (card.suit === '♠' || card.suit === '♣');
}

function getSuitClass(suitSymbol) {
    if (suitSymbol === '♥') return 'suit-hearts';
    if (suitSymbol === '♦') return 'suit-diamonds';
    if (suitSymbol === '♣') return 'suit-clubs';
    if (suitSymbol === '♠') return 'suit-spades';
    return 'card-joker';
}

function createDeck() {
    let deck = [];
    let id = 0;
    for (let deckNum = 0; deckNum < 2; deckNum++) {
        SUITS.forEach(suit => {
            RANKS.forEach(rank => {
                deck.push({
                    id: id++,
                    rank: rank,
                    suit: suit.symbol,
                    isJoker: false,
                    display: rank + suit.symbol,
                    suitName: suit.name
                });
            });
        });
    }
    for (let jokerNum = 0; jokerNum < 2; jokerNum++) {
        deck.push({
            id: id++,
            rank: 'JK',
            suit: '★',
            isJoker: true,
            display: 'Joker',
            suitName: 'joker'
        });
    }
    return deck;
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// -------------------------------------------------------------
// 6. Match Start & Card Dealing Animation
// -------------------------------------------------------------
function startMatchPhase() {
    document.getElementById('center-hud').style.display = 'none';
    document.getElementById('center-play-zone').style.display = 'flex';
    document.getElementById('melds-container').style.display = 'flex';
    document.getElementById('hand-area').style.display = 'flex';

    document.getElementById('count-west').style.display = 'block';
    document.getElementById('count-north').style.display = 'block';
    document.getElementById('count-east').style.display = 'block';

    const headerScores = document.getElementById('header-scores');
    if (headerScores) headerScores.style.display = 'flex';
    updateFeltScoresUI();

    startNewRound();
}

function updateFeltScoresUI() {
    document.getElementById('score-badge-us').textContent = `Us: ${globalScores.us}`;
    document.getElementById('score-badge-them').textContent = `Them: ${globalScores.them}`;
    // Also update grand total labels in score overlay if already visible
    const grandUs = document.getElementById('score-us-grand');
    const grandThem = document.getElementById('score-them-grand');
    if (grandUs) grandUs.textContent = `Total: ${globalScores.us} / 5000`;
    if (grandThem) grandThem.textContent = `Total: ${globalScores.them} / 5000`;
}

function startNewRound() {
    roundState.hands = { player: [], west: [], north: [], east: [] };
    roundState.red3s = { player: [], west: [], north: [], east: [] };
    roundState.melds = { player: {}, west: {}, north: {}, east: {} };
    roundState.pendingMelds = { player: {}, west: {}, north: {}, east: {} };
    roundState.isOpen = { us: false, them: false };
    roundState.pendingBenchTake = false;
    roundState.pulledBenchCard = null;
    roundState.discardPile = [];
    roundState.roundEndedBy = null;
    selectedCards = [];
    roundState.benchLocked = true;
    updateBenchLockVisual();

    // Hide Confirm/Recall/TakeBench buttons
    document.getElementById('btn-confirm-meld').style.display = 'none';
    document.getElementById('btn-recall-melds').style.display = 'none';
    document.getElementById('btn-take-bench').style.display = 'none';
    document.getElementById('pending-meld-points').style.display = 'none';

    ['south', 'west', 'north', 'east'].forEach(pos => {
        const el = document.getElementById(`red3s-${pos}`);
        if (el) el.innerHTML = '';
    });

    renderMelds();
    renderDiscardPile();

    roundState.deck = shuffle(createDeck());

    const starter = roundState.playOrder[Math.floor(Math.random() * roundState.playOrder.length)];
    roundState.startingPlayer = starter;
    roundState.activePlayer = starter;
    roundState.firstTurnCompleted = false;
    roundState.turnPhase = 'DEALING';

    const totalToGive = {
        player: starter === 'player' ? 15 : 14,
        east: starter === 'east' ? 15 : 14,
        north: starter === 'north' ? 15 : 14,
        west: starter === 'west' ? 15 : 14
    };

    animateDealing(totalToGive, () => {
        updateDeckCount();
        roundState.turnPhase = 'DRAW_PHASE';
        nextTurn();
    });
}

function updateDeckCount() {
    document.getElementById('draw-count').textContent = roundState.deck.length;
}

function updateBenchLockVisual() {
    const badge = document.getElementById('bench-lock-badge');
    if (!badge) return;

    if (roundState.benchLocked) {
        badge.textContent = "🔒 Locked (3)";
        badge.style.background = "rgba(211, 47, 47, 0.25)";
        badge.style.border = "1.5px solid #d32f2f";
        badge.style.color = "#ff8a80";
        badge.style.boxShadow = "0 0 10px rgba(211, 47, 47, 0.3)";
    } else {
        badge.textContent = "🔓 Unlocked (2)";
        badge.style.background = "rgba(46, 125, 50, 0.25)";
        badge.style.border = "1.5px solid #2e7d32";
        badge.style.color = "#81c784";
        badge.style.boxShadow = "0 0 10px rgba(46, 125, 50, 0.3)";
    }
}

function animateDealing(totalToGive, callback) {
    let dealtCounts = { player: 0, east: 0, north: 0, west: 0 };
    let playerIdx = 0;

    audio.playSFX('deal');

    function dealNextCard() {
        let playerKey = roundState.playOrder[playerIdx];
        if (dealtCounts[playerKey] < totalToGive[playerKey]) {
            let card = roundState.deck.pop();

            while (card && isRed3(card)) {
                roundState.red3s[playerKey].push(card);
                renderDeployedRed3s(playerKey);
                audio.playSFX('success');

                if (isMultiplayer && isHost) {
                    socket.emit('sendMove', {
                        roomCode: currentRoom,
                        type: 'dealRed3',
                        playerKey: playerKey,
                        card: card,
                        senderSlot: mySlotIndex
                    });
                }

                card = roundState.deck.pop();
            }

            if (card) {
                roundState.hands[playerKey].push(card);
                dealtCounts[playerKey]++;
                updateBotCardCount(playerKey);
                if (playerKey === 'player') {
                    renderPlayerHand();
                }
                createCardFlyAnimation(playerKey);
                audio.playSFX('deal');

                if (isMultiplayer && isHost) {
                    socket.emit('sendMove', {
                        roomCode: currentRoom,
                        type: 'deal',
                        playerKey: playerKey,
                        card: card,
                        senderSlot: mySlotIndex
                    });
                }
            }
        }

        let allDone = roundState.playOrder.every(k => dealtCounts[k] === totalToGive[k]);
        if (allDone) {
            setTimeout(() => {
                if (isMultiplayer && isHost) broadcastState(); // Broadcast the deck ONLY after dealing finishes!
                callback();
            }, 500);
        } else {
            playerIdx = (playerIdx + 1) % roundState.playOrder.length;
            setTimeout(dealNextCard, 80);
        }
    }
    dealNextCard();
}

function renderDeployedRed3s(playerKey) {
    const pos = playerKey === 'player' ? 'south' : playerKey;
    const container = document.getElementById(`red3s-${pos}`);
    if (!container) return;

    const list = roundState.red3s[playerKey] || [];

    // Only rebuild the HTML if the number of cards changed (Stops the blinking!)
    if (container.children.length === list.length) return;

    container.innerHTML = '';
    list.forEach(card => {
        const badge = document.createElement('div');
        badge.className = 'mini-red3';
        badge.textContent = `3${card.suit}`;
        container.appendChild(badge);
    });
}

function updateBotCardCount(playerKey) {
    if (playerKey === 'player') return;
    const countElement = document.getElementById(`count-${playerKey}`);
    if (countElement) {
        countElement.textContent = `${roundState.hands[playerKey].length} cards`;
    }
}

function createCardFlyAnimation(destinationPlayer) {
    const tableArea = document.querySelector('.table-area');
    const drawPile = document.getElementById('draw-pile');
    const destSeat = document.getElementById(`seat-${destinationPlayer === 'player' ? 'south' : destinationPlayer}`);

    if (!drawPile || !destSeat) return;

    const rectStart = drawPile.getBoundingClientRect();
    const rectEnd = destSeat.getBoundingClientRect();
    const rectTable = tableArea.getBoundingClientRect();

    const temp = document.createElement('div');
    temp.className = 'dealing-card-temp';
    temp.style.top = `${rectStart.top - rectTable.top}px`;
    temp.style.left = `${rectStart.left - rectTable.left}px`;

    tableArea.appendChild(temp);
    temp.getBoundingClientRect();

    temp.style.top = `${rectEnd.top - rectTable.top + 30}px`;
    temp.style.left = `${rectEnd.left - rectTable.left + 40}px`;
    temp.style.transform = 'scale(0.2) rotate(180deg)';
    temp.style.opacity = '0';

    setTimeout(() => {
        temp.remove();
    }, 600);
}


function animateCardThrow(sourceKey, card, domSourceNode, callback) {
    const tableArea = document.querySelector('.table-area');
    const discardPileEl = document.getElementById('discard-pile');

    if (!tableArea || !discardPileEl) {
        if (callback) callback();
        return;
    }

    const rectTable = tableArea.getBoundingClientRect();
    const rectDiscard = discardPileEl.getBoundingClientRect();

    let startX, startY;

    if (domSourceNode) {
        const rectSource = domSourceNode.getBoundingClientRect();
        startX = rectSource.left - rectTable.left;
        startY = rectSource.top - rectTable.top;
    } else {
        const seatId = sourceKey === 'player' ? 'seat-south' : `seat-${sourceKey}`;
        const seatEl = document.getElementById(seatId);
        if (seatEl) {
            const rectSeat = seatEl.getBoundingClientRect();
            startX = rectSeat.left + (rectSeat.width / 2) - rectTable.left - 20;
            startY = rectSeat.top + (rectSeat.height / 2) - rectTable.top - 30;
        } else {
            startX = 0; startY = 0;
        }
    }

    const flyCard = document.createElement('div');
    const suitCls = getSuitClass(card.suit);
    flyCard.className = `card ${suitCls} ${isWildcard(card.rank) ? 'card-joker' : ''}`;
    flyCard.style.position = 'absolute';
    flyCard.style.width = '40px';
    flyCard.style.height = '60px';
    flyCard.style.left = `${startX}px`;
    flyCard.style.top = `${startY}px`;
    flyCard.style.zIndex = '999';
    flyCard.style.transition = 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)';
    flyCard.style.pointerEvents = 'none';

    if (card.rank === 'JK') {
        flyCard.innerHTML = `<div class="card-top">JK</div><div class="card-center">🃏</div><div class="card-bottom">JK</div>`;
    } else {
        flyCard.innerHTML = `<div class="card-top">${card.rank}</div><div class="card-center">${card.suit}</div><div class="card-bottom">${card.rank}</div>`;
    }

    tableArea.appendChild(flyCard);
    flyCard.getBoundingClientRect(); // Force reflow

    const targetX = rectDiscard.left - rectTable.left;
    const targetY = rectDiscard.top - rectTable.top;
    const randomRotation = Math.floor(Math.random() * 30) - 15;

    flyCard.style.left = `${targetX}px`;
    flyCard.style.top = `${targetY}px`;
    flyCard.style.transform = `rotate(${randomRotation}deg)`;

    setTimeout(() => {
        flyCard.remove();
        if (callback) callback();
    }, 400);
}

function animateBenchTakeAction(playerKey, rank, requiredCount) {
    const tableArea = document.querySelector('.table-area');
    const discardPileEl = document.getElementById('discard-pile');
    const seatId = playerKey === 'player' ? 'seat-south' : `seat-${playerKey}`;
    const seatEl = document.getElementById(seatId);

    if (!tableArea || !discardPileEl || !seatEl) return;

    const rectTable = tableArea.getBoundingClientRect();
    const rectDiscard = discardPileEl.getBoundingClientRect();
    const rectSeat = seatEl.getBoundingClientRect();

    const seatX = rectSeat.left + (rectSeat.width / 2) - rectTable.left - 20;
    const seatY = rectSeat.top + (rectSeat.height / 2) - rectTable.top - 30;

    const discardX = rectDiscard.left - rectTable.left;
    const discardY = rectDiscard.top - rectTable.top;

    const suits = ['♥', '♦', '♣', '♠'];
    const revealedCards = [];

    audio.playSFX('click');

    // 1. Create and fly required matching cards from player hand/seat to the discard pile
    for (let i = 0; i < requiredCount; i++) {
        const cardDiv = document.createElement('div');
        const suit = suits[i % 4];
        const suitCls = getSuitClass(suit);
        cardDiv.className = `card ${suitCls}`;
        cardDiv.style.position = 'absolute';
        cardDiv.style.width = '40px';
        cardDiv.style.height = '60px';
        cardDiv.style.left = `${seatX}px`;
        cardDiv.style.top = `${seatY}px`;
        cardDiv.style.zIndex = '999';
        cardDiv.style.transition = 'all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1)';
        cardDiv.style.pointerEvents = 'none';

        cardDiv.innerHTML = `
            <div class="card-top">${rank}</div>
            <div class="card-center">${suit}</div>
            <div class="card-bottom">${rank}</div>
        `;

        tableArea.appendChild(cardDiv);
        revealedCards.push(cardDiv);

        // Force reflow
        cardDiv.getBoundingClientRect();

        // Animate to discard pile with a slight fan out offset
        const offsetX = (i - (requiredCount - 1) / 2) * 15;
        const randomRotation = Math.floor(Math.random() * 20) - 10;
        cardDiv.style.left = `${discardX + offsetX}px`;
        cardDiv.style.top = `${discardY}px`;
        cardDiv.style.transform = `rotate(${randomRotation}deg)`;

        setTimeout(() => {
            audio.playSFX('card-flip');
        }, 300 + i * 50);
    }

    // 2. Wait 1.2 seconds, then fly all cards back to the player's seat
    setTimeout(() => {
        audio.playSFX('success');

        // Animate the revealed cards flying back
        revealedCards.forEach((cardDiv) => {
            cardDiv.style.left = `${seatX}px`;
            cardDiv.style.top = `${seatY}px`;
            cardDiv.style.transform = 'scale(0.2) rotate(180deg)';
            cardDiv.style.opacity = '0';

            setTimeout(() => {
                cardDiv.remove();
            }, 500);
        });

        // Also fly a few card backs to represent the rest of the pile being taken
        for (let i = 0; i < 4; i++) {
            setTimeout(() => {
                const flyCard = document.createElement('div');
                flyCard.className = 'dealing-card-temp';
                flyCard.style.left = `${discardX}px`;
                flyCard.style.top = `${discardY}px`;
                tableArea.appendChild(flyCard);

                // Force reflow
                flyCard.getBoundingClientRect();

                flyCard.style.left = `${seatX}px`;
                flyCard.style.top = `${seatY}px`;
                flyCard.style.transform = 'scale(0.2) rotate(180deg)';
                flyCard.style.opacity = '0';

                audio.playSFX('deal');

                setTimeout(() => {
                    flyCard.remove();
                }, 600);
            }, i * 80);
        }
    }, 1200);
}

// -------------------------------------------------------------
// 7. Player Hand & Selection
// -------------------------------------------------------------
function renderPlayerHand() {
    const handContainer = document.getElementById('player-hand');
    handContainer.innerHTML = '';

    roundState.hands.player.forEach(card => {
        const cardDiv = document.createElement('div');
        const suitCls = getSuitClass(card.suit);
        cardDiv.className = `card ${suitCls} ${card.rank === 'JK' ? 'card-joker' : ''}`;
        if (selectedCards.includes(card.id)) {
            cardDiv.classList.add('selected');
        }

        if (card.rank === 'JK') {
            cardDiv.innerHTML = `
                <div class="card-top">JK</div>
                <div class="card-center">🃏</div>
                <div class="card-bottom">JK</div>
            `;
        } else {
            cardDiv.innerHTML = `
                <div class="card-top">${card.rank}</div>
                <div class="card-center">${card.suit}</div>
                <div class="card-bottom">${card.rank}</div>
            `;
        }

        cardDiv.onclick = () => {
            if (roundState.activePlayer !== 'player') return;
            audio.playSFX('click');
            if (selectedCards.includes(card.id)) {
                selectedCards = selectedCards.filter(id => id !== card.id);
            } else {
                selectedCards.push(card.id);
            }
            renderPlayerHand();
        };

        handContainer.appendChild(cardDiv);
    });
}

function renderDiscardPile() {
    const pile = document.getElementById('discard-pile');
    pile.innerHTML = '';

    if (roundState.discardPile.length === 0) {
        pile.className = 'discard-pile';
        pile.innerHTML = '<span class="pile-empty-text">Discard Pile</span>';
        return;
    }

    const topCard = roundState.discardPile[roundState.discardPile.length - 1];
    pile.className = 'discard-pile has-card';

    const suitCls = getSuitClass(topCard.suit);
    const cardDiv = document.createElement('div');
    cardDiv.className = `card ${suitCls} ${topCard.rank === 'JK' ? 'card-joker' : ''}`;
    cardDiv.style.margin = '0';
    cardDiv.style.width = '100%';
    cardDiv.style.height = '100%';
    cardDiv.style.cursor = 'default';

    if (topCard.rank === 'JK') {
        cardDiv.innerHTML = `
            <div class="card-top">JK</div>
            <div class="card-center">🃏</div>
            <div class="card-bottom">JK</div>
        `;
    } else {
        cardDiv.innerHTML = `
            <div class="card-top">${topCard.rank}</div>
            <div class="card-center">${topCard.suit}</div>
            <div class="card-bottom">${topCard.rank}</div>
        `;
    }
    pile.appendChild(cardDiv);
}

// Discard action by clicking Discard Pile directly
document.getElementById('discard-pile').onclick = () => {
    if (roundState.activePlayer !== 'player') return;

    if (roundState.turnPhase !== 'MELD_PHASE') {
        alert("You must draw a card first!");
        return;
    }

    // Player CANNOT discard if they have pending melds that haven't been confirmed/opened yet
    const hasPending = Object.keys(roundState.pendingMelds.player).some(rank => roundState.pendingMelds.player[rank].length > 0);
    if (hasPending && !roundState.isOpen.us) {
        alert("You have pending melds! You must either meet the required points and click 'Confirm Meld' to open, or click 'Recall Melds' to return them to hand before you discard.");
        return;
    }

    if (selectedCards.length === 0) {
        alert("Select exactly ONE card in your hand and click the Discard Pile (bench) to discard and end your turn.");
        return;
    }

    if (selectedCards.length !== 1) {
        alert("Please select exactly ONE card to discard.");
        return;
    }

    const cardId = selectedCards[0];
    const cardIdx = roundState.hands.player.findIndex(c => c.id === cardId);
    const card = roundState.hands.player[cardIdx];

    // Going out validation check: hand reduces to 0 cards
    if (roundState.hands.player.length === 1) {
        if (!teamHasCompletedCanasta('us')) {
            alert("You cannot go out (reduce hand to 0) because your team does not have a completed Canasta!");
            return;
        }
    }

    // Grab the exact DOM element of the card the player clicked before removing it
    const handDOM = document.getElementById('player-hand');
    const selectedCardDOM = Array.from(handDOM.querySelectorAll('.card.selected')).find(el => el.textContent.includes(card.rank) && el.textContent.includes(card.suit));

    // Perform discard logic in data
    roundState.hands.player.splice(cardIdx, 1);
    roundState.discardPile.push(card);
    selectedCards = [];

    audio.playSFX('card-flip');

    if (isMultiplayer) {
        socket.emit('sendMove', {
            roomCode: currentRoom,
            type: 'discard',
            playerKey: 'player',
            card: card,
            senderSlot: mySlotIndex
        });
    }

    // 1. Start the animation FIRST so it can measure the card's exact position
    animateCardThrow('player', card, selectedCardDOM, () => {
        renderDiscardPile();

        if (checkRoundEnding('player')) return;

        // Only ask to lock if the bench is currently unlocked
        if (isWildcard(card.rank) && !roundState.benchLocked) {
            promptLockBench();
        } else {
            endPlayerTurn();
        }
    });

    // 2. NOW re-render the hand to make the original card disappear instantly
    renderPlayerHand();
};

function promptLockBench() {
    const hud = document.getElementById('center-hud');
    hud.style.display = 'flex';
    document.getElementById('hud-title').textContent = 'Lock Discard Pile?';
    document.getElementById('hud-message').textContent = 'You discarded a wild card. Do you want to lock the discard pile?';

    const nextBtn = document.getElementById('btn-next-phase');
    if (nextBtn) nextBtn.style.display = 'none';

    let choiceContainer = document.getElementById('lock-choice-container');
    if (!choiceContainer) {
        choiceContainer = document.createElement('div');
        choiceContainer.id = 'lock-choice-container';
        choiceContainer.style.display = 'flex';
        choiceContainer.style.gap = '1rem';
        choiceContainer.style.justifyContent = 'center';
        hud.appendChild(choiceContainer);
    }
    choiceContainer.style.display = 'flex';
    choiceContainer.innerHTML = `
        <button class="btn" id="btn-lock-bench" style="padding: 0.6rem 1.2rem; font-size: 0.95rem; background: #d32f2f; border-color: #d32f2f;">Yes, Lock It</button>
        <button class="btn btn-secondary" id="btn-unlock-bench" style="padding: 0.6rem 1.2rem; font-size: 0.95rem;">No</button>
    `;

    document.getElementById('btn-lock-bench').onclick = () => {
        audio.playSFX('success');
        roundState.benchLocked = true;
        updateBenchLockVisual();
        hud.style.display = 'none';
        choiceContainer.style.display = 'none';
        endPlayerTurn();
    };

    document.getElementById('btn-unlock-bench').onclick = () => {
        audio.playSFX('click');
        hud.style.display = 'none';
        choiceContainer.style.display = 'none';
        endPlayerTurn();
    };
}

// Sort Hand
document.getElementById('btn-sort').onclick = () => {
    // Allow sorting at any time by removing the turn restriction
    audio.playSFX('click');

    const rankOrder = ['3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A', '2', 'JK'];
    roundState.hands.player.sort((a, b) => {
        return rankOrder.indexOf(a.rank) - rankOrder.indexOf(b.rank);
    });
    renderPlayerHand();
    if (isMultiplayer) broadcastState();
};


// -------------------------------------------------------------
// 8. Melding & Direct Card Pulling (Pending Open checks added)
// -------------------------------------------------------------

function teamHasCompletedCanasta(side) {
    if (side === 'us') {
        const playerCanasta = Object.values(roundState.melds.player).some(cards => cards.length >= 7);
        const northCanasta = Object.values(roundState.melds.north).some(cards => cards.length >= 7);
        return playerCanasta || northCanasta;
    } else {
        const westCanasta = Object.values(roundState.melds.west).some(cards => cards.length >= 7);
        const eastCanasta = Object.values(roundState.melds.east).some(cards => cards.length >= 7);
        return westCanasta || eastCanasta;
    }
}

// Points sum value helper (with 4,5,6,7 pairing rule)
function getMeldsPointsValue(meldsObject) {
    let score = 0;
    let count5s = 0;
    Object.keys(meldsObject).forEach(rank => {
        const cards = meldsObject[rank];
        cards.forEach(c => {
            if (['4', '5', '6', '7'].includes(c.rank)) {
                count5s++;
            } else {
                score += getCardRankValue(c.rank);
            }
        });
    });
    score += Math.floor(count5s / 2) * 10;
    return score;
}

// Wildcard ratio constraints checker
function validateWildcardRatio(existingMeld, cardsToAdd) {
    const existingN = existingMeld.filter(c => !isWildcard(c.rank)).length;
    const existingW = existingMeld.filter(c => isWildcard(c.rank)).length;

    const addN = cardsToAdd.filter(c => !isWildcard(c.rank)).length;
    const addW = cardsToAdd.filter(c => isWildcard(c.rank)).length;

    const totalN = existingN + addN;
    const totalW = existingW + addW;

    if (totalW > 2) {
        return { valid: false, reason: "A meld/Canasta can carry a maximum of 2 wildcards (Jokers / 2s)!" };
    }
    if (totalN < 2) {
        return { valid: false, reason: "A meld requires at least 2 natural cards!" };
    }
    if (totalN === 2 && totalW > 1) {
        return { valid: false, reason: "Two natural cards can carry at most 1 wildcard! (Add a third natural card to add a second wildcard)." };
    }

    return { valid: true };
}

function tryMeldSelectedCards(targetMeldRank = null) {
    if (roundState.activePlayer !== 'player') return;
    if (selectedCards.length === 0) return; // FIX: Silently ignore accidental clicks!

    if (roundState.turnPhase !== 'MELD_PHASE') {
        alert("You must draw a card first!");
        return;
    }

    const cardsToMeld = roundState.hands.player.filter(c => selectedCards.includes(c.id));

    if (cardsToMeld.some(c => isBlack3(c))) {
        alert("Black 3s are trash cards and cannot be melded!");
        return;
    }

    let selectedRank = null;
    const nonWilds = cardsToMeld.filter(c => !isWildcard(c.rank));

    if (nonWilds.length === 0) {
        if (targetMeldRank) {
            selectedRank = targetMeldRank;
        } else {
            alert("You cannot start a meld consisting only of wildcards! Select which column to add them to.");
            return;
        }
    } else {
        selectedRank = nonWilds[0].rank;
        if (selectedRank === '2') {
            alert("Rank 2 is a wildcard and cannot form its own meld!");
            return;
        }
        const sameRank = nonWilds.every(c => c.rank === selectedRank);
        if (!sameRank) {
            alert("All melded cards must be of the same rank (except wildcards).");
            return;
        }
    }

    const isPlayerOpen = roundState.isOpen.us;
    const partnerMeld = isPlayerOpen ? roundState.melds.north[selectedRank] : roundState.pendingMelds.north[selectedRank];
    const targetKey = (partnerMeld && partnerMeld.length > 0) ? 'north' : 'player';

    const targetCollection = isPlayerOpen ? roundState.melds[targetKey] : roundState.pendingMelds[targetKey];
    const existingMeld = targetCollection[selectedRank] || [];

    const ratioCheck = validateWildcardRatio(existingMeld, cardsToMeld);
    if (!ratioCheck.valid) { alert(ratioCheck.reason); return; }

    if (existingMeld.length === 0 && cardsToMeld.length < 3) {
        alert("A new meld requires at least 3 cards (e.g. Q-Q-Q or Q-Q-2).");
        return;
    }

    const remainingHandSize = roundState.hands.player.length - cardsToMeld.length;
    if (remainingHandSize < 2) {
        let temporaryMeldLength = existingMeld.length + cardsToMeld.length;
        let hasCanasta = teamHasCompletedCanasta('us') || (temporaryMeldLength >= 7);
        if (!hasCanasta) {
            alert("You cannot reduce your hand to less than 2 cards because your team does not have a completed Canasta!");
            return;
        }
    }

    if (!targetCollection[selectedRank]) targetCollection[selectedRank] = [];

    cardsToMeld.forEach(c => {
        targetCollection[selectedRank].push(c);
        const idx = roundState.hands.player.findIndex(hc => hc.id === c.id);
        roundState.hands.player.splice(idx, 1);
    });

    selectedCards = [];
    audio.playSFX('success');

    renderPlayerHand();
    renderMelds();

    if (!isPlayerOpen) updatePendingScoreUI();
    checkRoundEnding('player');

    if (isMultiplayer) broadcastState(); // SYNC GUEST MELD TO HOST
}

// Player clicks on Our Melds container to start a new meld
document.getElementById('meld-area-player').onclick = (e) => {
    tryMeldSelectedCards();
};

function updatePendingScoreUI() {
    const required = getRequiredOpeningPoints(globalScores.us);
    const current = getMeldsPointsValue(roundState.pendingMelds.player);

    const label = document.getElementById('pending-meld-points');
    label.style.display = 'inline-block';
    label.textContent = `Pending Meld Score: ${current} / ${required} needed`;

    document.getElementById('btn-confirm-meld').style.display = 'inline-block';
    document.getElementById('btn-recall-melds').style.display = 'inline-block';
}

// Confirm Meld opening
document.getElementById('btn-confirm-meld').onclick = () => {
    if (roundState.activePlayer !== 'player') return;

    const required = getRequiredOpeningPoints(globalScores.us);
    const current = getMeldsPointsValue(roundState.pendingMelds.player);

    if (current < required) {
        alert(`Your pending melds only total ${current} points. You need at least ${required} points to open!`);
        return;
    }

    // Success: transfer pending melds to permanent melds
    Object.keys(roundState.pendingMelds.player).forEach(rank => {
        const cards = roundState.pendingMelds.player[rank];
        if (!roundState.melds.player[rank]) {
            roundState.melds.player[rank] = [];
        }
        cards.forEach(c => roundState.melds.player[rank].push(c));
    });

    roundState.pendingMelds.player = {};
    roundState.isOpen.us = true;

    // If opened via bench taking, grant the rest of the discard pile and unlock!
    if (roundState.pendingBenchTake) {
        const pulledRank = roundState.pulledBenchCard.rank;
        const requiredCount = roundState.benchLocked ? 3 : 2;

        // Trigger reveal animation locally
        animateBenchTakeAction('player', pulledRank, requiredCount);

        if (isMultiplayer) {
            socket.emit('sendMove', {
                roomCode: currentRoom,
                type: 'benchTake',
                playerKey: 'player',
                rank: pulledRank,
                requiredCount: requiredCount,
                senderSlot: mySlotIndex
            });
        }

        takeRestOfDiscardPile('player');
        roundState.benchLocked = false;
        updateBenchLockVisual();
    }

    // Hide buttons
    document.getElementById('btn-confirm-meld').style.display = 'none';
    document.getElementById('btn-recall-melds').style.display = 'none';
    document.getElementById('pending-meld-points').style.display = 'none';

    audio.playSFX('success');
    renderPlayerHand();
    renderMelds();
    renderDiscardPile(); // Fix: Force the discard pile to visually clear!
};

// Recall Melds: return pending cards to hand
document.getElementById('btn-recall-melds').onclick = () => {
    if (roundState.activePlayer !== 'player') return;
    recallPendingMelds();
};

function recallPendingMelds() {
    // Return cards of pending melds to hand or discard pile
    Object.keys(roundState.pendingMelds.player).forEach(rank => {
        const cards = roundState.pendingMelds.player[rank];
        cards.forEach(c => {
            if (roundState.pendingBenchTake && roundState.pulledBenchCard && c.id === roundState.pulledBenchCard.id) {
                roundState.discardPile.push(c); // Top discard goes back to pile
            } else {
                roundState.hands.player.push(c);
            }
        });
    });

    roundState.pendingMelds.player = {};

    if (roundState.pendingBenchTake) {
        // If the player never even melded the pulled card, it's still in their hand.
        const handIdx = roundState.hands.player.findIndex(c => c.id === roundState.pulledBenchCard.id);
        if (handIdx !== -1) {
            const unmeldedCard = roundState.hands.player.splice(handIdx, 1)[0];
            roundState.discardPile.push(unmeldedCard);
        }

        roundState.pendingBenchTake = false;
        roundState.pulledBenchCard = null;
        roundState.turnPhase = 'DRAW_PHASE';
        highlightDrawDeck(true);
        setupPlayerDrawPrompt();
    }

    // Hide buttons
    document.getElementById('btn-confirm-meld').style.display = 'none';
    document.getElementById('btn-recall-melds').style.display = 'none';
    document.getElementById('pending-meld-points').style.display = 'none';

    audio.playSFX('card-flip');
    renderPlayerHand();
    renderMelds();
    renderDiscardPile();
}

// Add the remainder of discard pile to hand
function takeRestOfDiscardPile(playerKey) {
    const cardsLeft = [...roundState.discardPile];

    cardsLeft.forEach(c => {
        if (isRed3(c)) {
            roundState.red3s[playerKey].push(c);
            renderDeployedRed3s(playerKey);
        } else {
            roundState.hands[playerKey].push(c);
        }
    });

    roundState.discardPile = [];
    roundState.pendingBenchTake = false;
    roundState.pulledBenchCard = null;
}

function renderMelds() {
    renderPlayerMeldsHTML('player', roundState.melds.player, roundState.pendingMelds.player, 'meld-area-player');
    renderPlayerMeldsHTML('north', roundState.melds.north, roundState.pendingMelds.north, 'meld-area-north');
    renderPlayerMeldsHTML('west', roundState.melds.west, roundState.pendingMelds.west, 'meld-area-west');
    renderPlayerMeldsHTML('east', roundState.melds.east, roundState.pendingMelds.east, 'meld-area-east');
}

function renderPlayerMeldsHTML(playerKey, meldObject, pendingObject, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    const combinedRanks = new Set([...Object.keys(meldObject), ...Object.keys(pendingObject || {})]);

    combinedRanks.forEach(rank => {
        const permanentCards = meldObject[rank] || [];
        const pendingCards = pendingObject ? (pendingObject[rank] || []) : [];
        let cardsList = [...permanentCards, ...pendingCards];

        if (cardsList.length === 0) return;

        // Sort so wildcards (Jokers and 2s) are placed at the end of the array,
        // which makes them render last and visually appear on top of the stack.
        cardsList.sort((a, b) => {
            const aWild = isWildcard(a.rank);
            const bWild = isWildcard(b.rank);
            if (aWild === bWild) return 0;
            return aWild ? 1 : -1;
        });

        const col = document.createElement('div');
        col.className = 'meld-column meld-column-' + playerKey;

        const isComplete = cardsList.length >= 7;

        // 1. Render the cards FIRST so they sit at the bottom of the visual stack
        cardsList.forEach((card, index) => {
            const cardDiv = document.createElement('div');
            const suitCls = getSuitClass(card.suit);
            cardDiv.className = `card ${suitCls} ${isWildcard(card.rank) ? 'card-joker' : ''}`;
            cardDiv.style.cursor = 'pointer';

            // Dynamically adjust size/overlap when the meld gets tall
            let overlap = 20;
            if (cardsList.length >= 5) overlap = 26;
            if (cardsList.length >= 7) overlap = 32;

            if (index > 0) {
                if (playerKey === 'player' || playerKey === 'north') {
                    cardDiv.style.marginTop = `-${overlap}px`;
                } else if (playerKey === 'west') {
                    cardDiv.style.marginLeft = `-${overlap}px`;
                } else if (playerKey === 'east') {
                    cardDiv.style.marginRight = `-${overlap}px`;
                }
            }

            // Pending styling
            const isPending = pendingCards.some(pc => pc.id === card.id);
            if (isPending) {
                cardDiv.style.opacity = '0.75';
                cardDiv.style.border = '1.8px dashed var(--gold)';
            }

            if (card.rank === 'JK') {
                cardDiv.innerHTML = `
                    <div class="card-top">JK</div>
                    <div class="card-center">🃏</div>
                    <div class="card-bottom">JK</div>
                `;
            } else {
                cardDiv.innerHTML = `
                    <div class="card-top">${card.rank}</div>
                    <div class="card-center">${card.suit}</div>
                    <div class="card-bottom">${card.rank}</div>
                `;
            }
            col.appendChild(cardDiv);
        });

        // 2. Render the Badge LAST so it floats strictly on top of all cards
        let badgeEl = document.createElement('div');
        badgeEl.style.position = 'absolute';
        if (!isComplete) {
            badgeEl.className = 'meld-progress-badge';
            badgeEl.textContent = `${cardsList.length}/7`;
            // Make the badge slightly bigger and more legible
            badgeEl.style.fontSize = '0.78rem';
            badgeEl.style.padding = '3px 6px';
            if (cardsList.length >= 5) badgeEl.classList.add('near-complete');
        } else {
            col.classList.add('canasta-completed');
            const hasJokers = cardsList.some(c => isWildcard(c.rank));
            badgeEl.className = `canasta-badge ${hasJokers ? 'canasta-black' : 'canasta-red'}`;
            // Render as an indicator circle
            badgeEl.textContent = '';
            badgeEl.style.width = '18px';
            badgeEl.style.height = '18px';
            badgeEl.style.borderRadius = '50%';
            badgeEl.style.padding = '0';
            badgeEl.style.minWidth = '18px';
        }

        // 3. Anchor the badge next to the board edges and force text upright (0deg) for easy reading
        badgeEl.style.zIndex = '100';
        if (playerKey === 'player') {
            badgeEl.style.top = 'auto';
            badgeEl.style.bottom = '-18px';
            badgeEl.style.left = '50%';
            badgeEl.style.transform = 'translateX(-50%)'; // Keep Upright
        } else if (playerKey === 'north') {
            badgeEl.style.top = '-18px';
            badgeEl.style.bottom = 'auto';
            badgeEl.style.left = '50%';
            badgeEl.style.transform = 'translateX(-50%)'; // Keep Upright (Removed 180deg)
        } else if (playerKey === 'west') {
            badgeEl.style.left = '-24px';
            badgeEl.style.top = '50%';
            badgeEl.style.transform = 'translateY(-50%)'; // Keep Upright (Removed -90deg)
        } else if (playerKey === 'east') {
            badgeEl.style.right = '-24px';
            badgeEl.style.left = 'auto';
            badgeEl.style.top = '50%';
            badgeEl.style.transform = 'translateY(-50%)'; // Keep Upright (Removed 90deg)
        }

        col.appendChild(badgeEl);

        col.onclick = (e) => {
            e.stopPropagation();

            const isMyTurn = (roundState.activePlayer === 'player' && roundState.turnPhase === 'MELD_PHASE');
            const isMyTeam = (playerKey === 'player' || playerKey === 'north');

            if (isMyTurn && isMyTeam && selectedCards.length > 0) {
                tryMeldSelectedCards(rank);
            } else {
                openMeldInspector(playerKey, rank, cardsList);
            }
        };

        container.appendChild(col);
    });
}

function openMeldInspector(playerKey, rank, cardsList) {
    const modal = document.getElementById('meld-inspector-modal');
    if (!modal) return;

    let playerName = "";
    if (playerKey === 'player') {
        playerName = "Your Melds";
    } else {
        const p = seatAssignments[playerKey];
        playerName = p ? `${p.name}'s Melds` : `${playerKey}'s Melds`;
    }

    const title = document.getElementById('inspector-title');
    if (title) {
        title.textContent = `Meld of ${rank}s (${playerName})`;
    }

    const grid = document.getElementById('inspector-cards-grid');
    if (grid) {
        grid.innerHTML = '';
        cardsList.forEach(card => {
            const cardDiv = document.createElement('div');
            const suitCls = getSuitClass(card.suit);
            cardDiv.className = `card ${suitCls} ${card.rank === 'JK' ? 'card-joker' : ''}`;
            cardDiv.style.cursor = 'default';

            if (card.rank === 'JK') {
                cardDiv.innerHTML = `
                    <div class="card-top">JK</div>
                    <div class="card-center">🃏</div>
                    <div class="card-bottom">JK</div>
                `;
            } else {
                cardDiv.innerHTML = `
                    <div class="card-top">${card.rank}</div>
                    <div class="card-center">${card.suit}</div>
                    <div class="card-bottom">${card.rank}</div>
                `;
            }
            grid.appendChild(cardDiv);
        });
    }

    modal.classList.add('active');
}

function pullSelectedCardsToSpecificMeld(ownerKey, meldRank) {
    const cardsToMeld = roundState.hands.player.filter(c => selectedCards.includes(c.id));

    if (cardsToMeld.some(c => isBlack3(c))) {
        alert("Black 3s are trash cards and cannot be melded!");
        return;
    }

    const isValid = cardsToMeld.every(c => c.rank === meldRank || isWildcard(c.rank));
    if (!isValid) {
        alert(`You can only pull cards matching rank '${meldRank}' or wildcards (2 / Joker) into this Canasta!`);
        return;
    }

    const isPlayerOpen = roundState.isOpen.us;
    const targetCollection = isPlayerOpen ? roundState.melds[ownerKey] : roundState.pendingMelds[ownerKey];
    const existingMeld = targetCollection[meldRank] || [];

    const ratioCheck = validateWildcardRatio(existingMeld, cardsToMeld);
    if (!ratioCheck.valid) {
        alert(ratioCheck.reason);
        return;
    }

    const remainingHandSize = roundState.hands.player.length - cardsToMeld.length;
    if (remainingHandSize < 2) {
        let temporaryMeldLength = existingMeld.length + cardsToMeld.length;
        let hasCanasta = teamHasCompletedCanasta('us') || (temporaryMeldLength >= 7);
        if (!hasCanasta) {
            alert("You cannot reduce your hand to less than 2 cards because your team does not have a completed Canasta! (You must be able to discard and keep at least 1 card in hand).");
            return;
        }
    }

    if (!targetCollection[meldRank]) {
        targetCollection[meldRank] = [];
    }

    cardsToMeld.forEach(c => {
        targetCollection[meldRank].push(c);
        const idx = roundState.hands.player.findIndex(hc => hc.id === c.id);
        roundState.hands.player.splice(idx, 1);
    });

    selectedCards = [];
    audio.playSFX('success');

    renderPlayerHand();
    renderMelds();

    if (!isPlayerOpen) {
        updatePendingScoreUI();
    }

    checkRoundEnding('player');
}


// -------------------------------------------------------------
// 9. Game State Machine & Turn Controllers (Turn Dial Pointer)
// -------------------------------------------------------------
function nextTurn() {
    const active = roundState.activePlayer;
    updateTurnIndicatorUI();
    updateActivePlayerHighlight();

    Object.keys(roundState.hands).forEach(key => {
        updateBotCardCount(key);
    });

    document.getElementById('btn-take-bench').style.display = 'none';

    if (active === 'player') {
        setupPlayerDrawPrompt();
    } else {
        const seatKey = active === 'player' ? 'south' : active;
        const isActiveBot = seatAssignments[seatKey]?.type === 'bot';
        if (isActiveBot) {
            // ONLY Host runs Bots to avoid duplicate turns in Multiplayer!
            if (!isMultiplayer || isHost) {
                executeBotTurn(active);
            }
        }
    }
}

function updateActivePlayerHighlight() {
    const active = roundState.activePlayer;
    ['player', 'west', 'north', 'east'].forEach(key => {
        const cardId = `card-${key === 'player' ? 'south' : key}`;
        const cardEl = document.getElementById(cardId);
        if (cardEl) cardEl.classList.remove('active-turn');
    });
    const activeCardId = `card-${active === 'player' ? 'south' : active}`;
    const activeCardEl = document.getElementById(activeCardId);
    if (activeCardEl) activeCardEl.classList.add('active-turn');
}

function updateTurnIndicatorUI() {
    const active = roundState.activePlayer;
    let name = active === 'player' ? "Your Turn" : `${seatAssignments[active] ? seatAssignments[active].name : active}'s Turn`;
    const indicator = document.getElementById('turn-indicator');
    if (indicator) indicator.textContent = name;
}

function setupPlayerDrawPrompt() {
    const isStarterNoDraw = (roundState.activePlayer === roundState.startingPlayer && !roundState.firstTurnCompleted);
    checkPlayerBenchTakeEligibility();

    if (isStarterNoDraw) {
        roundState.turnPhase = 'MELD_PHASE';
        renderPlayerHand();
        highlightDrawDeck(false);
    } else {
        roundState.turnPhase = 'DRAW_PHASE';
        highlightDrawDeck(true);

        const drawPile = document.getElementById('draw-pile');
        drawPile.onclick = () => {
            audio.playSFX('card-flip');
            let drawn = roundState.deck.pop();

            while (drawn && isRed3(drawn)) {
                roundState.red3s.player.push(drawn);
                renderDeployedRed3s('player');
                audio.playSFX('success');
                showChatBubble('south', "Drew a Red 3! Auto-deploying and drawing replacement...");
                drawn = roundState.deck.pop();
            }

            if (drawn) {
                roundState.hands.player.push(drawn);
                updateDeckCount();
                highlightDrawDeck(false);
                drawPile.onclick = null;
                document.getElementById('btn-take-bench').style.display = 'none';

                roundState.turnPhase = 'MELD_PHASE';
                renderPlayerHand();
                createCardFlyAnimation('player');
                if (isMultiplayer) {
                    socket.emit('sendMove', {
                        roomCode: currentRoom,
                        type: 'draw',
                        playerKey: 'player',
                        senderSlot: mySlotIndex
                    });
                    broadcastState(); // SYNC GUEST DRAW
                }
            }
        };
    }
}

function checkPlayerBenchTakeEligibility() {
    const btn = document.getElementById('btn-take-bench');
    if (!btn) return;

    if (roundState.discardPile.length === 0) {
        btn.style.display = 'none';
        return;
    }

    const topCard = roundState.discardPile[roundState.discardPile.length - 1];
    if (isWildcard(topCard.rank) || isBlack3(topCard)) {
        btn.style.display = 'none';
        return;
    }

    const hand = roundState.hands.player;
    const matchCount = hand.filter(c => c.rank === topCard.rank).length;
    const requiredCopies = roundState.benchLocked ? 3 : 2;

    if (matchCount >= requiredCopies) {
        btn.style.display = 'inline-block';
    } else {
        btn.style.display = 'none';
    }
}

document.getElementById('btn-take-bench').onclick = () => {
    if (roundState.activePlayer !== 'player' || roundState.turnPhase !== 'DRAW_PHASE') return;
    audio.playSFX('click');

    const topCard = roundState.discardPile[roundState.discardPile.length - 1];
    const teamSide = 'us';
    const isOpen = roundState.isOpen[teamSide];

    if (isOpen) {
        const requiredCount = roundState.benchLocked ? 3 : 2;

        // Trigger reveal animation locally
        animateBenchTakeAction('player', topCard.rank, requiredCount);

        if (isMultiplayer) {
            socket.emit('sendMove', {
                roomCode: currentRoom,
                type: 'benchTake',
                playerKey: 'player',
                rank: topCard.rank,
                requiredCount: requiredCount,
                senderSlot: mySlotIndex
            });
        }

        takeRestOfDiscardPile('player');
        roundState.benchLocked = false;
        updateBenchLockVisual();

        roundState.turnPhase = 'MELD_PHASE';
        highlightDrawDeck(false);
        document.getElementById('btn-take-bench').style.display = 'none';
        document.getElementById('draw-pile').onclick = null;

        renderPlayerHand();
        renderDiscardPile();
        if (isMultiplayer) {
            broadcastState();
        }
    } else {
        const popped = roundState.discardPile.pop();
        roundState.hands.player.push(popped);
        roundState.pendingBenchTake = true;
        roundState.pulledBenchCard = popped;

        roundState.turnPhase = 'MELD_PHASE';
        highlightDrawDeck(false);
        document.getElementById('btn-take-bench').style.display = 'none';
        document.getElementById('draw-pile').onclick = null;

        renderPlayerHand();
        renderDiscardPile();
        updatePendingScoreUI();
        if (isMultiplayer) {
            socket.emit('sendMove', {
                roomCode: currentRoom,
                type: 'draw',
                playerKey: 'player',
                senderSlot: mySlotIndex
            });
            broadcastState();
        }
    }
};

function highlightDrawDeck(active) {
    const pile = document.getElementById('draw-pile');
    if (active) pile.classList.add('active-draw');
    else pile.classList.remove('active-draw');
}

function endPlayerTurn() {
    roundState.firstTurnCompleted = true;
    const currentIdx = roundState.playOrder.indexOf(roundState.activePlayer);
    roundState.activePlayer = roundState.playOrder[(currentIdx + 1) % roundState.playOrder.length];

    if (isMultiplayer) broadcastState(); // SYNC GUEST TURN PASS
    setTimeout(nextTurn, 800);
}


// -------------------------------------------------------------
// 10. Bot Automation AI (Opening & Bench Taking rules added)
// -------------------------------------------------------------
function canBotOpenFromHand(botKey) {
    const hand = roundState.hands[botKey];
    const teamSide = (botKey === 'north') ? 'us' : 'them';
    const currentScore = globalScores[teamSide];
    const requiredPoints = getRequiredOpeningPoints(currentScore);

    const groups = {};
    hand.forEach(c => {
        if (!isRed3(c)) {
            if (!groups[c.rank]) groups[c.rank] = [];
            groups[c.rank].push(c);
        }
    });

    const wildcards = [...(groups['2'] || []), ...(groups['JK'] || [])];
    delete groups['2'];
    delete groups['JK'];

    const potentialMelds = {};
    let totalPoints = 0;

    Object.keys(groups).forEach(rank => {
        if (groups[rank].length >= 3 && rank !== '3') {
            potentialMelds[rank] = [...groups[rank]];
            groups[rank].forEach(c => {
                totalPoints += getCardRankValue(c.rank);
            });
        }
    });

    if (totalPoints < requiredPoints) {
        Object.keys(groups).forEach(rank => {
            if (groups[rank].length === 2 && wildcards.length > 0 && rank !== '3') {
                const wild = wildcards.pop();
                potentialMelds[rank] = [...groups[rank], wild];
                totalPoints += getCardRankValue(rank) * 2 + getCardRankValue(wild.rank);
            }
        });
    }

    if (totalPoints < requiredPoints && wildcards.length > 0) {
        Object.keys(potentialMelds).forEach(rank => {
            if (wildcards.length === 0) return;
            const meld = potentialMelds[rank];
            const ratioCheck = validateWildcardRatio(meld, [wildcards[0]]);
            if (ratioCheck.valid && wildcards.length > 0) {
                const wild = wildcards.pop();
                potentialMelds[rank].push(wild);
                totalPoints += getCardRankValue(wild.rank);
            }
        });
    }

    if (totalPoints >= requiredPoints) {
        return potentialMelds;
    }
    return null;
}

function executeBotMelding(botKey) {
    const hand = roundState.hands[botKey];
    const teamSide = (botKey === 'north') ? 'us' : 'them';
    const isOpen = roundState.isOpen[teamSide];

    if (!isOpen) return;

    const partnerKey = botKey === 'north' ? 'player' : (botKey === 'east' ? 'west' : (botKey === 'west' ? 'east' : 'north'));

    const groups = {};
    hand.forEach(c => {
        if (!isRed3(c)) {
            if (!groups[c.rank]) groups[c.rank] = [];
            groups[c.rank].push(c);
        }
    });

    const wildcards = [...(groups['2'] || []), ...(groups['JK'] || [])];
    delete groups['2'];
    delete groups['JK'];

    Object.keys(groups).forEach(rank => {
        const matchingCards = groups[rank];
        if (matchingCards.length === 0) return;

        let targetOwner = null;
        if (roundState.melds[botKey][rank]) targetOwner = botKey;
        else if (roundState.melds[partnerKey][rank]) targetOwner = partnerKey;

        if (targetOwner) {
            matchingCards.forEach(c => {
                const remainingHandSize = roundState.hands[botKey].length - 1;
                if (remainingHandSize < 2) {
                    const tempLength = roundState.melds[targetOwner][rank].length + 1;
                    const hasCanasta = teamHasCompletedCanasta(teamSide) || (tempLength >= 7);
                    if (!hasCanasta) return;
                }

                roundState.melds[targetOwner][rank].push(c);
                const idx = roundState.hands[botKey].findIndex(hc => hc.id === c.id);
                if (idx !== -1) roundState.hands[botKey].splice(idx, 1);
            });
            delete groups[rank];
        }
    });

    Object.keys(groups).forEach(rank => {
        if (groups[rank].length >= 3 && rank !== '3') {
            const cardsToMeld = [...groups[rank]];

            const remainingHandSize = roundState.hands[botKey].length - cardsToMeld.length;
            if (remainingHandSize < 2) {
                const tempLength = cardsToMeld.length;
                const hasCanasta = teamHasCompletedCanasta(teamSide) || (tempLength >= 7);
                if (!hasCanasta) return;
            }

            roundState.melds[botKey][rank] = cardsToMeld;
            cardsToMeld.forEach(c => {
                const idx = roundState.hands[botKey].findIndex(hc => hc.id === c.id);
                if (idx !== -1) roundState.hands[botKey].splice(idx, 1);
            });
            delete groups[rank];
        }
    });

    if (wildcards.length > 0) {
        const teamMelds = { ...roundState.melds[botKey], ...roundState.melds[partnerKey] };
        Object.keys(teamMelds).forEach(rank => {
            if (wildcards.length === 0) return;

            let targetOwner = roundState.melds[botKey][rank] ? botKey : partnerKey;
            const existingMeld = roundState.melds[targetOwner][rank];

            const ratioCheck = validateWildcardRatio(existingMeld, [wildcards[0]]);
            if (ratioCheck.valid) {
                const remainingHandSize = roundState.hands[botKey].length - 1;
                if (remainingHandSize < 2) {
                    const tempLength = existingMeld.length + 1;
                    const hasCanasta = teamHasCompletedCanasta(teamSide) || (tempLength >= 7);
                    if (!hasCanasta) return;
                }

                const wild = wildcards.pop();
                roundState.melds[targetOwner][rank].push(wild);
                const idx = roundState.hands[botKey].findIndex(hc => hc.id === wild.id);
                if (idx !== -1) roundState.hands[botKey].splice(idx, 1);
            }
        });
    }
}

function executeBotTurn(botKey) {
    const isStarterNoDraw = (roundState.activePlayer === roundState.startingPlayer && !roundState.firstTurnCompleted);

    setTimeout(() => {
        let tookBench = false;

        // 1. Draw / Take Bench Phase
        if (!isStarterNoDraw) {
            tookBench = checkBotBenchTakeAndOpen(botKey);

            if (!tookBench) {
                audio.playSFX('card-flip');
                let drawn = roundState.deck.pop();

                while (drawn && isRed3(drawn)) {
                    roundState.red3s[botKey].push(drawn);
                    renderDeployedRed3s(botKey);
                    audio.playSFX('success');
                    drawn = roundState.deck.pop();
                }

                if (drawn) {
                    roundState.hands[botKey].push(drawn);
                    updateDeckCount();
                    updateBotCardCount(botKey);
                    if (isMultiplayer) {
                        socket.emit('sendMove', {
                            roomCode: currentRoom,
                            type: 'draw',
                            playerKey: botKey,
                            senderSlot: mySlotIndex
                        });
                    }
                }
            }
            if (isMultiplayer && isHost) broadcastState(); // Broadcast the bot draw immediately
        }

        // 2. Meld Phase
        setTimeout(() => {
            if (tookBench && !roundState.isOpen[botKey === 'north' ? 'us' : 'them']) {
                const teamSide = botKey === 'north' ? 'us' : 'them';
                const pendingCollection = roundState.pendingMelds[botKey];
                Object.keys(pendingCollection).forEach(rank => {
                    if (!roundState.melds[botKey][rank]) roundState.melds[botKey][rank] = [];
                    pendingCollection[rank].forEach(c => roundState.melds[botKey][rank].push(c));
                });
                roundState.pendingMelds[botKey] = {};
                roundState.isOpen[teamSide] = true;

                takeRestOfDiscardPile(botKey);
                audio.playSFX('success');
                executeBotMelding(botKey);
            } else {
                const teamSide = botKey === 'north' ? 'us' : 'them';
                if (!roundState.isOpen[teamSide]) {
                    const openingMelds = canBotOpenFromHand(botKey);
                    if (openingMelds) {
                        Object.keys(openingMelds).forEach(rank => {
                            roundState.melds[botKey][rank] = [];
                            openingMelds[rank].forEach(c => {
                                roundState.melds[botKey][rank].push(c);
                                const idx = roundState.hands[botKey].findIndex(hc => hc.id === c.id);
                                if (idx !== -1) roundState.hands[botKey].splice(idx, 1);
                            });
                        });
                        roundState.isOpen[teamSide] = true;
                        showChatBubble(botKey, `🔓 I'm opening from hand!`);
                        audio.playSFX('success');
                    }
                }
                executeBotMelding(botKey);
            }

            renderMelds();
            renderDiscardPile();
            if (isMultiplayer && isHost) broadcastState(); // Broadcast the bot meld immediately

            // 3. Discard Phase
            setTimeout(() => {
                if (roundState.hands[botKey].length > 0) {
                    executeBotDiscard(botKey);
                }

                if (checkRoundEnding(botKey)) return;

                roundState.firstTurnCompleted = true;
                const currentIdx = roundState.playOrder.indexOf(roundState.activePlayer);
                roundState.activePlayer = roundState.playOrder[(currentIdx + 1) % roundState.playOrder.length];

                if (isMultiplayer && isHost) broadcastState(); // Broadcast turn change
                setTimeout(nextTurn, 800);

            }, 1500);
        }, 1500);
    }, 1000);
}

function checkBotBenchTakeAndOpen(botKey) {
    if (roundState.discardPile.length === 0) return false;
    const topCard = roundState.discardPile[roundState.discardPile.length - 1];
    if (isWildcard(topCard.rank) || isBlack3(topCard)) return false;

    let hand = roundState.hands[botKey];
    const matchCount = hand.filter(c => c.rank === topCard.rank).length;
    const requiredCopies = roundState.benchLocked ? 3 : 2;
    if (matchCount < requiredCopies) return false;

    const teamSide = (botKey === 'north') ? 'us' : 'them';
    const isOpen = roundState.isOpen[teamSide];

    if (isOpen) {
        // Trigger reveal animation locally
        animateBenchTakeAction(botKey, topCard.rank, requiredCopies);

        if (isMultiplayer) {
            socket.emit('sendMove', {
                roomCode: currentRoom,
                type: 'benchTake',
                playerKey: botKey,
                rank: topCard.rank,
                requiredCount: requiredCopies,
                senderSlot: mySlotIndex
            });
        }

        roundState.discardPile.forEach(c => {
            if (isRed3(c)) roundState.red3s[botKey].push(c);
            else roundState.hands[botKey].push(c);
        });
        roundState.discardPile = [];
        roundState.benchLocked = false;
        updateBenchLockVisual();
        showChatBubble(botKey, `📥 Taking the bench!`);
        audio.playSFX('success');
        executeBotMelding(botKey);
        return true;
    } else {
        const openingMelds = canBotOpenFromHand(botKey);
        if (openingMelds) {
            // Trigger reveal animation locally
            animateBenchTakeAction(botKey, topCard.rank, requiredCopies);

            if (isMultiplayer) {
                socket.emit('sendMove', {
                    roomCode: currentRoom,
                    type: 'benchTake',
                    playerKey: botKey,
                    rank: topCard.rank,
                    requiredCount: requiredCopies,
                    senderSlot: mySlotIndex
                });
            }

            roundState.discardPile.forEach(c => {
                if (isRed3(c)) roundState.red3s[botKey].push(c);
                else roundState.hands[botKey].push(c);
            });
            roundState.discardPile = [];
            roundState.benchLocked = false;
            updateBenchLockVisual();

            Object.keys(openingMelds).forEach(rank => {
                roundState.melds[botKey][rank] = [];
                openingMelds[rank].forEach(c => {
                    roundState.melds[botKey][rank].push(c);
                    const idx = roundState.hands[botKey].findIndex(hc => hc.id === c.id);
                    if (idx !== -1) roundState.hands[botKey].splice(idx, 1);
                });
            });
            roundState.isOpen[teamSide] = true;
            showChatBubble(botKey, `📥 Taking the bench and opening!`);
            audio.playSFX('success');
            executeBotMelding(botKey);
            return true;
        }
    }
    return false;
}

function executeBotDiscard(botKey) {
    let hand = roundState.hands[botKey];
    let isGoingOut = (hand.length === 1);
    const teamSide = (botKey === 'north') ? 'us' : 'them';

    if (isGoingOut && !teamHasCompletedCanasta(teamSide)) return;

    let black3s = hand.filter(c => isBlack3(c));
    let cardToDiscard = null;

    if (black3s.length > 0) {
        cardToDiscard = black3s[0];
    } else {
        let nonWilds = hand.filter(c => !isWildcard(c.rank));
        if (nonWilds.length > 0) {
            let rankCounts = {};
            nonWilds.forEach(c => { rankCounts[c.rank] = (rankCounts[c.rank] || 0) + 1; });
            nonWilds.sort((a, b) => rankCounts[a.rank] - rankCounts[b.rank]);
            cardToDiscard = nonWilds[0];
        } else {
            cardToDiscard = hand[0];
        }
    }

    if (cardToDiscard) {
        const idx = hand.findIndex(c => c.id === cardToDiscard.id);
        hand.splice(idx, 1);
        roundState.discardPile.push(cardToDiscard);

        audio.playSFX('card-flip');
        updateBotCardCount(botKey);
        renderDiscardPile();

        if (isMultiplayer) {
            socket.emit('sendMove', {
                roomCode: currentRoom,
                type: 'discard',
                playerKey: botKey,
                card: cardToDiscard,
                senderSlot: mySlotIndex
            });
        }

        if (isWildcard(cardToDiscard.rank) && !roundState.benchLocked) {
            roundState.benchLocked = true;
            updateBenchLockVisual();
        }
    }
}


// -------------------------------------------------------------
// 11. Point Calculations (300/200 Canasta and 100 Out rules)
// -------------------------------------------------------------
function checkRoundEnding(playerKey) {
    const hand = roundState.hands[playerKey];
    if (hand.length === 0) {
        roundState.roundEndedBy = playerKey;
        setTimeout(() => {
            triggerRoundEnd(playerKey);
        }, 1000);
        return true;
    }
    if (roundState.deck.length === 0) {
        roundState.roundEndedBy = 'deck-empty';
        setTimeout(() => {
            triggerRoundEnd('deck-empty');
        }, 1000);
        return true;
    }
    return false;
}

// Helper: build a mini card chip HTML like "5♥" or "JK"
function miniCardChip(card) {
    const isRed = card.suit === '♥' || card.suit === '♦';
    const color = isRed ? '#ff6b6b' : '#e0e0e0';
    const label = card.rank === 'JK' ? '🃏' : `${card.rank}${card.suit}`;
    return `<span style="display:inline-block;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);border-radius:5px;padding:1px 5px;font-size:0.72rem;font-weight:700;color:${color};margin:1px;">${label}</span>`;
}

// Helper: visually pair 5-value cards (4, 5, 6, 7) into paired chips
function buildGroupedCardChips(cardsList, maxDisplay = 7) {
    const displayCards = cardsList.slice(0, maxDisplay);
    const fiveValCards = [];
    const otherCards = [];

    displayCards.forEach(c => {
        if (['4', '5', '6', '7'].includes(c.rank)) {
            fiveValCards.push(c);
        } else {
            otherCards.push(c);
        }
    });

    let chipsHtml = '';

    // Render standard high-value cards first
    otherCards.forEach(c => {
        chipsHtml += miniCardChip(c);
    });

    // Group and render the 5-value cards into pairs
    for (let i = 0; i < fiveValCards.length; i += 2) {
        if (i + 1 < fiveValCards.length) {
            const c1 = fiveValCards[i];
            const c2 = fiveValCards[i + 1];
            const c1Color = (c1.suit === '♥' || c1.suit === '♦') ? '#ff6b6b' : '#e0e0e0';
            const c2Color = (c2.suit === '♥' || c2.suit === '♦') ? '#ff6b6b' : '#e0e0e0';

            // Paired Chip UI (Gold border grouping the two cards)
            chipsHtml += `<span style="display:inline-flex; align-items:center; background:rgba(212, 175, 55, 0.15); border:1px solid rgba(212, 175, 55, 0.4); border-radius:5px; padding:1px 5px; font-size:0.72rem; font-weight:700; margin:1px; gap: 3px;">
                <span style="color:${c1Color};">${c1.rank}${c1.suit}</span>
                <span style="color:var(--text-secondary); font-size:0.65rem;">+</span>
                <span style="color:${c2Color};">${c2.rank}${c2.suit}</span>
            </span>`;
        } else {
            // Odd one out - render as a standard single chip
            chipsHtml += miniCardChip(fiveValCards[i]);
        }
    }

    return chipsHtml;
}

// Build score line items HTML for a team
function buildScoreLines(meldCollections, handCards, red3Cards, goingOutBonus, noCanastaPenalty) {
    const lines = [];
    let meldTotal = 0;
    let handTotal = 0;
    let canastaTotal = 0;
    let red3Total = 0;
    let five5count = 0;

    // --- Canastas and Melds ---
    meldCollections.forEach(meldCollection => {
        Object.keys(meldCollection).forEach(rank => {
            const cards = meldCollection[rank];
            if (cards.length === 0) return;
            const hasJoker = cards.some(c => isWildcard(c.rank));
            const isCanasta = cards.length >= 7;

            // Generate visually grouped chips for the line item
            const cardChips = buildGroupedCardChips(cards, 7);
            const extraChips = cards.length > 7 ? `<span style="font-size:0.72rem;color:var(--text-secondary)">+${cards.length - 7} more</span>` : '';

            if (isCanasta) {
                const bonusPts = hasJoker ? 200 : 300;
                canastaTotal += bonusPts;
                const type = hasJoker ? 'Mixed Canasta' : 'Pure Canasta';
                const typeColor = hasJoker ? '#ffd54f' : '#ef9a9a';

                // Also compute the card face values inside this canasta
                let cardPts = 0;
                let local5 = 0;
                cards.forEach(c => {
                    if (['4', '5', '6', '7'].includes(c.rank)) local5++;
                    else cardPts += getCardRankValue(c.rank);
                });
                cardPts += Math.floor(local5 / 2) * 10;
                meldTotal += cardPts;
                const totalPts = bonusPts + cardPts;

                lines.push(`<div class="rs-line">
                    <span class="rs-line-label" style="color:${typeColor};">${type} (${rank}s)</span>
                    <span class="rs-line-cards">${cardChips}${extraChips}</span>
                    <span class="rs-line-val rs-plus" style="display:flex;flex-direction:column;align-items:flex-end;gap:1px;">
                        <span>+${totalPts}</span>
                        <span style="font-size:0.65rem;font-weight:400;color:var(--text-secondary);">${bonusPts} bonus + ${cardPts} cards</span>
                    </span>
                </div>`);
            } else {
                // Regular meld — count value
                let meldPts = 0;
                let local5 = 0;
                cards.forEach(c => {
                    if (['4', '5', '6', '7'].includes(c.rank)) local5++;
                    else meldPts += getCardRankValue(c.rank);
                });
                five5count += local5;
                meldTotal += meldPts;
                const pts = meldPts + Math.floor(local5 / 2) * 10;

                lines.push(`<div class="rs-line">
                    <span class="rs-line-label">Meld (${rank}s)</span>
                    <span class="rs-line-cards">${cardChips}${extraChips}</span>
                    <span class="rs-line-val rs-plus">+${pts}</span>
                </div>`);
            }
        });
    });

    // Add the 5-value meld bonus if any (Handled automatically in lines above, but tracking for totals if needed)
    const extra5BonusMeld = Math.floor(five5count / 2) * 10;

    // --- Red 3s ---
    if (red3Cards.length > 0) {
        const hasCanasta = canastaTotal > 0;
        const bonus = red3Cards.length === 4 ? 800 : red3Cards.length * 100;
        const pts = hasCanasta ? bonus : -bonus;
        red3Total = pts;
        const r3Chips = red3Cards.map(c => miniCardChip(c)).join('');
        lines.push(`<div class="rs-line">
            <span class="rs-line-label" style="color:#ef9a9a;">Red 3s</span>
            <span class="rs-line-cards">${r3Chips}</span>
            <span class="rs-line-val ${pts >= 0 ? 'rs-plus' : 'rs-minus'}">${pts >= 0 ? '+' : ''}${pts}</span>
        </div>`);
    }

    // --- No-canasta base penalty ---
    if (noCanastaPenalty) {
        lines.push(`<div class="rs-line">
            <span class="rs-line-label" style="color:#ff6b6b;">No Canasta Penalty</span>
            <span class="rs-line-cards"></span>
            <span class="rs-line-val rs-minus">-300</span>
        </div>`);
    }

    // --- Going Out Bonus ---
    if (goingOutBonus > 0) {
        lines.push(`<div class="rs-line">
            <span class="rs-line-label" style="color:#a5d6a7;">Going Out Bonus</span>
            <span class="rs-line-cards"></span>
            <span class="rs-line-val rs-plus">+${goingOutBonus}</span>
        </div>`);
    }

    // --- Hand penalty ---
    if (handCards.length > 0) {
        let handPts = 0;
        let hand5 = 0;
        handCards.forEach(c => {
            if (['4', '5', '6', '7'].includes(c.rank)) hand5++;
            else handPts += getCardRankValue(c.rank);
        });
        const extra5 = Math.floor(hand5 / 2) * 10;
        handTotal = handPts + extra5;

        // Use grouped chips for the hand penalty visualization too
        const chipList = buildGroupedCardChips(handCards, handCards.length);

        lines.push(`<div class="rs-line">
            <span class="rs-line-label" style="color:#ff8a65;">Hand Cards</span>
            <span class="rs-line-cards">${chipList}</span>
            <span class="rs-line-val rs-minus">-${handTotal}</span>
        </div>`);
    }

    return lines.join('');
}

function triggerRoundEnd(winnerKey) {
    audio.playSFX('success');

    let winnerName = "";
    if (winnerKey === 'player') winnerName = "You went out";
    else if (winnerKey === 'deck-empty') winnerName = "Deck Empty";
    else winnerName = `${seatAssignments[winnerKey].name} went out`;

    const scores = calculatePoints();
    globalScores.us += scores.usRound;
    globalScores.them += scores.themRound;

    const isRoundSkipped = (winnerKey === 'deck-empty' && scores.usRound === 0 && scores.themRound === 0);

    // Build line items for US team
    const usHand = [...roundState.hands.player, ...roundState.hands.north];
    const usRed3s = [...roundState.red3s.player, ...roundState.red3s.north];
    const usMeldCollections = [roundState.melds.player, roundState.melds.north];
    const usHasCanasta = scores.usCanastaPoints > 0;
    const usNoCanasta = scores.usNoCanastaPenalty < 0;

    // Build line items for THEM team
    const themHand = [...roundState.hands.west, ...roundState.hands.east];
    const themRed3s = [...roundState.red3s.west, ...roundState.red3s.east];
    const themMeldCollections = [roundState.melds.west, roundState.melds.east];
    const themNoCanasta = scores.themNoCanastaPenalty < 0;

    if (isRoundSkipped) {
        document.getElementById('score-lines-us').innerHTML = `<div class="rs-line"><span class="rs-line-label" style="color:var(--text-secondary);">No canastas — round skipped</span><span class="rs-line-cards"></span><span class="rs-line-val">0</span></div>`;
        document.getElementById('score-lines-them').innerHTML = `<div class="rs-line"><span class="rs-line-label" style="color:var(--text-secondary);">No canastas — round skipped</span><span class="rs-line-cards"></span><span class="rs-line-val">0</span></div>`;
    } else {
        document.getElementById('score-lines-us').innerHTML = buildScoreLines(
            usNoCanasta ? [] : usMeldCollections, // Skip useless meld stats
            usNoCanasta ? [] : usHand,            // Skip useless hand stats
            usRed3s,                              // Always show Red 3s
            usNoCanasta ? 0 : scores.usGoingOutBonus,
            usNoCanasta
        );
        document.getElementById('score-lines-them').innerHTML = buildScoreLines(
            themNoCanasta ? [] : themMeldCollections, // Skip useless meld stats
            themNoCanasta ? [] : themHand,            // Skip useless hand stats
            themRed3s,                                // Always show Red 3s
            themNoCanasta ? 0 : scores.themGoingOutBonus,
            themNoCanasta
        );
    }

    const sign = (n) => n >= 0 ? `+${n}` : `${n}`;
    document.getElementById('score-us-total').textContent = `Round: ${sign(scores.usRound)}`;
    document.getElementById('score-them-total').textContent = `Round: ${sign(scores.themRound)}`;

    updateFeltScoresUI();
    document.getElementById('score-us-grand').textContent = `Total: ${globalScores.us} / 5000`;
    document.getElementById('score-them-grand').textContent = `Total: ${globalScores.them} / 5000`;

    const titleEl = document.getElementById('round-summary-title');
    if (titleEl) titleEl.textContent = isRoundSkipped ? 'Deck Empty — Round Skipped' : `${winnerName}! Round Over.`;

    screens.scoreOverlay.classList.add('active');
}

function calculatePoints() {
    let result = {
        usMeldPoints: 0,
        usCanastaPoints: 0,
        usHandPenalty: 0,
        usRed3Points: 0,
        usNoCanastaPenalty: 0,
        usGoingOutBonus: 0,
        usRound: 0,

        themMeldPoints: 0,
        themCanastaPoints: 0,
        themHandPenalty: 0,
        themRed3Points: 0,
        themNoCanastaPenalty: 0,
        themGoingOutBonus: 0,
        themRound: 0
    };

    // Calculate Canasta Counts
    let usCanastaCount = 0;
    let us5valueMeldCount = 0;
    const usMelds = [roundState.melds.player, roundState.melds.north];
    usMelds.forEach(meldCollection => {
        Object.keys(meldCollection).forEach(rank => {
            const cards = meldCollection[rank];
            if (cards.length >= 7) {
                usCanastaCount++;
                const hasJoker = cards.some(c => isWildcard(c.rank));
                result.usCanastaPoints += hasJoker ? 200 : 300; // Mixed: 200, Pure: 300
            }
        });
    });

    let themCanastaCount = 0;
    let them5valueMeldCount = 0;
    const themMelds = [roundState.melds.west, roundState.melds.east];
    themMelds.forEach(meldCollection => {
        Object.keys(meldCollection).forEach(rank => {
            const cards = meldCollection[rank];
            if (cards.length >= 7) {
                themCanastaCount++;
                const hasJoker = cards.some(c => isWildcard(c.rank));
                result.themCanastaPoints += hasJoker ? 200 : 300; // Mixed: 200, Pure: 300
            }
        });
    });

    // Check Condition 1: Deck card finish and no team made any completed Canasta
    // Round is skipped entirely with 0 points calculated
    if (roundState.deck.length === 0 && usCanastaCount === 0 && themCanastaCount === 0) {
        result.usRound = 0;
        result.themRound = 0;
        return result;
    }

    // --- US TEAM SCORING ---
    const usRed3Count = roundState.red3s.player.length + roundState.red3s.north.length;

    // Condition 2: Check if US team has no Canasta and opponent DOES have a Canasta
    // They lose only the 300 base and 100 for each red 3 they have, regardless of hands
    if (usCanastaCount === 0 && themCanastaCount >= 1) {
        result.usNoCanastaPenalty = -300;
        result.usRed3Points = usRed3Count === 4 ? -800 : -(usRed3Count * 100);
        result.usRound = -300 + result.usRed3Points;
        result.usMeldPoints = 0;
        result.usHandPenalty = 0;
        result.usCanastaPoints = 0;
        result.usGoingOutBonus = 0;
    } else {
        // Normal scoring
        usMelds.forEach(meldCollection => {
            Object.keys(meldCollection).forEach(rank => {
                const cards = meldCollection[rank];
                cards.forEach(c => {
                    if (['4', '5', '6', '7'].includes(c.rank)) {
                        us5valueMeldCount++;
                    } else {
                        result.usMeldPoints += getCardRankValue(c.rank);
                    }
                });
            });
        });
        result.usMeldPoints += Math.floor(us5valueMeldCount / 2) * 10;

        // Hand Penalties
        let us5valueHandCount = 0;
        const usHandCards = [...roundState.hands.player, ...roundState.hands.north];
        usHandCards.forEach(c => {
            if (['4', '5', '6', '7'].includes(c.rank)) {
                us5valueHandCount++;
            } else {
                result.usHandPenalty += getCardRankValue(c.rank);
            }
        });
        result.usHandPenalty += Math.floor(us5valueHandCount / 2) * 10;

        // Red 3s scoring (positive bonus if they have Canasta)
        if (usCanastaCount >= 1) {
            result.usRed3Points = usRed3Count === 4 ? 800 : usRed3Count * 100;
        } else {
            result.usNoCanastaPenalty = -300;
            result.usRed3Points = usRed3Count === 4 ? -800 : -(usRed3Count * 100);
        }

        // Going Out Bonus
        if (roundState.roundEndedBy === 'player' || roundState.roundEndedBy === 'north') {
            result.usGoingOutBonus = 100;
        }

        result.usRound = result.usMeldPoints + result.usCanastaPoints + result.usRed3Points + result.usNoCanastaPenalty + result.usGoingOutBonus - result.usHandPenalty;
    }

    // --- THEM TEAM SCORING ---
    const themRed3Count = roundState.red3s.west.length + roundState.red3s.east.length;

    // Condition 2: Check if THEM team has no Canasta and opponent DOES have a Canasta
    // They lose only the 300 base and 100 for each red 3 they have, regardless of hands
    if (themCanastaCount === 0 && usCanastaCount >= 1) {
        result.themNoCanastaPenalty = -300;
        result.themRed3Points = themRed3Count === 4 ? -800 : -(themRed3Count * 100);
        result.themRound = -300 + result.themRed3Points;
        result.themMeldPoints = 0;
        result.themHandPenalty = 0;
        result.themCanastaPoints = 0;
        result.themGoingOutBonus = 0;
    } else {
        // Normal scoring
        themMelds.forEach(meldCollection => {
            Object.keys(meldCollection).forEach(rank => {
                const cards = meldCollection[rank];
                cards.forEach(c => {
                    if (['4', '5', '6', '7'].includes(c.rank)) {
                        them5valueMeldCount++;
                    } else {
                        result.themMeldPoints += getCardRankValue(c.rank);
                    }
                });
            });
        });
        result.themMeldPoints += Math.floor(them5valueMeldCount / 2) * 10;

        // Hand Penalties
        let them5valueHandCount = 0;
        const themHandCards = [...roundState.hands.west, ...roundState.hands.east];
        themHandCards.forEach(c => {
            if (['4', '5', '6', '7'].includes(c.rank)) {
                them5valueHandCount++;
            } else {
                result.themHandPenalty += getCardRankValue(c.rank);
            }
        });
        result.themHandPenalty += Math.floor(them5valueHandCount / 2) * 10;

        // Red 3s scoring
        if (themCanastaCount >= 1) {
            result.themRed3Points = themRed3Count === 4 ? 800 : themRed3Count * 100;
        } else {
            result.themNoCanastaPenalty = -300;
            result.themRed3Points = themRed3Count === 4 ? -800 : -(themRed3Count * 100);
        }

        // Going Out Bonus
        if (roundState.roundEndedBy === 'west' || roundState.roundEndedBy === 'east') {
            result.themGoingOutBonus = 100;
        }

        result.themRound = result.themMeldPoints + result.themCanastaPoints + result.themRed3Points + result.themNoCanastaPenalty + result.themGoingOutBonus - result.themHandPenalty;
    }

    return result;
}


// Initialize elements on load
window.addEventListener('DOMContentLoaded', () => {
    setupBackgroundCanvas();

    // Enable horizontal scrolling with vertical mouse wheel in the player hand
    const playerHandContainer = document.getElementById('player-hand');
    if (playerHandContainer) {
        playerHandContainer.addEventListener('wheel', (e) => {
            // Only translate the scroll if the user is scrolling vertically
            if (e.deltaY !== 0) {
                e.preventDefault(); // Stop the page itself from scrolling
                playerHandContainer.scrollLeft += e.deltaY;
            }
        });
    }

    // Parse join code query param if present
    const urlParams = new URLSearchParams(window.location.search);
    const joinCode = urlParams.get('join');
    if (joinCode) {
        // Switch to lobby screen
        screens.menu.classList.remove('active');
        screens.lobby.classList.add('active');
        document.getElementById('lobby-choices').style.display = 'flex';
        document.getElementById('lobby-waiting').style.display = 'none';
        document.getElementById('input-join-code').value = joinCode.toUpperCase();

        // Focus the name input so the user can just type their name and join
        document.getElementById('input-player-name').focus();
    }
});
