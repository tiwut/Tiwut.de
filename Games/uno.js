// --- I18N & LOCALIZATION ---
const translations = {
    en: {
        welcome: "Welcome to Firebase UNO!",
        find_game: "Find Game",
        searching: "Searching for a game...",
        waiting: "Waiting for an opponent...",
        your_turn: "Your Turn!",
        pick_color: "Pick a color:",
        you_won: "You Won! 🎉",
        you_lost: "You Lost.",
        play_again: "Play Again",
        draw_pile: "DRAW"
    },
    de: {
        welcome: "Willkommen bei Firebase UNO!",
        find_game: "Spiel suchen",
        searching: "Suche nach einem Spiel...",
        waiting: "Warte auf einen Gegner...",
        your_turn: "Dein Zug!",
        pick_color: "Wähle eine Farbe:",
        you_won: "Du hast gewonnen! 🎉",
        you_lost: "Du hast verloren.",
        play_again: "Erneut spielen",
        draw_pile: "ZIEHEN"
    },
    es: {
        welcome: "¡Bienvenido a Firebase UNO!",
        find_game: "Buscar Partida",
        searching: "Buscando una partida...",
        waiting: "Esperando a un oponente...",
        your_turn: "¡Tu Turno!",
        pick_color: "Elige un color:",
        you_won: "¡Has Ganado! 🎉",
        you_lost: "Has Perdido.",
        play_again: "Jugar de Nuevo",
        draw_pile: "ROBAR"
    }
};

let currentLang = 'en';

function getInitialLang() {
    const browserLang = navigator.language.split('-')[0];
    return ['en', 'de', 'es'].includes(browserLang) ? browserLang : 'en';
}

function t(key) {
    return translations[currentLang][key] || key;
}

function updateUIText() {
    document.querySelectorAll('[data-i18n-key]').forEach(el => {
        const key = el.getAttribute('data-i18n-key');
        el.textContent = t(key);
    });
}

function setLanguage(lang) {
    currentLang = lang;
    document.getElementById('lang-select').value = lang;
    updateUIText();
    // Re-render status text if game hasn't started
    if (gameBoard.classList.contains('hidden')) {
        statusText.textContent = t('welcome');
    }
}


// --- GLOBAL VARIABLES & DOM ELEMENTS ---
const auth = firebase.auth();
const database = firebase.database();
let playerId;
let gameId;
let gameListener;
let lastGameState = null; // Für Animationsvergleiche

const findGameBtn = document.getElementById('find-game-btn');
const statusText = document.getElementById('status-text');
const gameBoard = document.getElementById('game-board');
const playerHandDiv = document.getElementById('player-hand');
const opponentHandDiv = document.getElementById('opponent-hand');
const discardPileDiv = document.getElementById('discard-pile');
const drawPileDiv = document.getElementById('draw-pile');
const colorPickerDiv = document.getElementById('color-picker');
const langSelect = document.getElementById('lang-select');
const endScreen = document.getElementById('end-screen');
const endScreenTitle = document.getElementById('end-screen-title');
const playAgainBtn = document.getElementById('play-again-btn');
const turnIndicator = document.getElementById('turn-indicator');
const gameContainer = document.getElementById('game-container');


// --- CARD & DECK HELPERS ---
// (Funktionen 'createUnoDeck', 'shuffle', 'createCardElement', 'getCardDisplayValue' bleiben unverändert)
function createUnoDeck() {const colors=['red','green','blue','yellow'];const values=['0','1','2','3','4','5','6','7','8','9','skip','reverse','draw2'];const wildValues=['wild','wild_draw4'];let deck=[];colors.forEach(color=>{values.forEach(value=>{deck.push({color,value});if(value!=='0'){deck.push({color,value})}})});for(let i=0;i<4;i++){wildValues.forEach(value=>{deck.push({color:'black',value})})}return deck}
function shuffle(array){for(let i=array.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[array[i],array[j]]=[array[j],array[i]]}return array}
function createCardElement(card,isPlayerCard=false){const cardDiv=document.createElement('div');cardDiv.classList.add('card',card.color);if(card.value){cardDiv.dataset.value=card.value;cardDiv.dataset.color=card.color;}if(isPlayerCard){cardDiv.innerHTML=`<span class="value">${getCardDisplayValue(card)}</span>`;cardDiv.onclick=()=>handleCardClick(card);}else{if(card.color!=='back'){cardDiv.innerHTML=`<span class="value">${getCardDisplayValue(card)}</span>`;}else{cardDiv.classList.add('back')}}return cardDiv}
function getCardDisplayValue(card){if(card.value==='skip')return'🚫';if(card.value==='reverse')return'🔄';if(card.value==='draw2')return'+2';if(card.value==='wild')return'🎨';if(card.value==='wild_draw4')return'+4';return card.value}

// --- ANIMATION & EFFECTS ENGINE ---
function animateCardMove(startElement, endElement, cardData) {
    const cardClone = createCardElement(cardData, true);
    cardClone.classList.add('card-in-transit');
    
    const startRect = startElement.getBoundingClientRect();
    const endRect = endElement.getBoundingClientRect();
    
    cardClone.style.left = `${startRect.left}px`;
    cardClone.style.top = `${startRect.top}px`;
    
    document.body.appendChild(cardClone);
    
    requestAnimationFrame(() => {
        cardClone.style.left = `${endRect.left + (endRect.width - startRect.width) / 2}px`;
        cardClone.style.top = `${endRect.top + (endRect.height - startRect.height) / 2}px`;
        cardClone.style.transform = 'scale(1)';
    });
    
    setTimeout(() => {
        cardClone.remove();
    }, 500); // Animation duration
}

function triggerEffect(effect) {
    if (effect === 'shake') {
        gameContainer.classList.add('screen-shake');
        setTimeout(() => gameContainer.classList.remove('screen-shake'), 500);
    }
}

function arrangeHand(handDiv, cardCount, isPlayer) {
    const cards = handDiv.children;
    const handWidth = handDiv.offsetWidth;
    const cardWidth = 80;
    const maxSpread = Math.min(handWidth - cardWidth, cardCount * 40);
    const step = cardCount > 1 ? maxSpread / (cardCount - 1) : 0;
    const totalWidth = (cardCount - 1) * step + cardWidth;
    const startOffset = (handWidth - totalWidth) / 2;

    for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        const xPos = startOffset + i * step;
        const rotation = (i - (cardCount - 1) / 2) * 4; // Fächer-Effekt
        card.style.transform = `translateX(${xPos}px) rotate(${rotation}deg)`;
        if(isPlayer) card.style.bottom = '0px';
        else card.style.top = '0px';
    }
}

// --- GAME LOGIC (PLAYER ACTIONS) ---
function handleCardClick(card) {
    database.ref(`games/${gameId}`).once('value', snapshot => {
        const gameData = snapshot.val();
        if (gameData.currentPlayerId !== playerId || !isCardPlayable(card, gameData.discardPile[0])) return;
        
        // Finde die DOM-Karte, die geklickt wurde, für die Animation
        const cardElement = [...playerHandDiv.children].find(el => 
            el.dataset.value === card.value && el.dataset.color === card.color
        );
        if (cardElement) {
            animateCardMove(cardElement, discardPileDiv, card);
        }

        if (card.value.startsWith('wild')) {
            showColorPicker(card);
        } else {
            playCard(card, card.color);
        }
    });
}

function showColorPicker(card) { /* ...unverändert... */ colorPickerDiv.classList.remove('hidden');document.querySelectorAll('.color-choice').forEach(choice=>{choice.onclick=()=>{const chosenColor=choice.dataset.color;colorPickerDiv.classList.add('hidden');playCard(card,chosenColor)}})}
function playCard(card, chosenColor) {
    const gameRef = database.ref(`games/${gameId}`);
    gameRef.transaction(gameData => {
        if (!gameData) return;
        const playerIndex = gameData.players.findIndex(p => p.id === playerId);
        const cardIndex = gameData.players[playerIndex].hand.findIndex(c => c.value === card.value && c.color === card.color);
        if (cardIndex === -1) return;
        gameData.players[playerIndex].hand.splice(cardIndex, 1);
        gameData.discardPile.unshift({ ...card, color: chosenColor });
        if (gameData.players[playerIndex].hand.length === 0) {
            gameData.status = 'finished';
            gameData.winnerId = playerId;
        } else {
            applyCardEffect(gameData, card);
        }
        return gameData;
    });
}
function applyCardEffect(gameData, card) { /* ...unverändert... */ const currentPlayerIndex=gameData.players.findIndex(p=>p.id===gameData.currentPlayerId);let nextPlayerIndex=(currentPlayerIndex+gameData.direction)%gameData.players.length;if(nextPlayerIndex<0)nextPlayerIndex+=gameData.players.length;switch(card.value){case'reverse':gameData.direction*=-1;nextPlayerIndex=currentPlayerIndex;break;case'skip':nextPlayerIndex=(nextPlayerIndex+gameData.direction)%gameData.players.length;if(nextPlayerIndex<0)nextPlayerIndex+=gameData.players.length;break;case'draw2':drawCards(gameData.players[nextPlayerIndex],gameData.deck,2);break;case'wild_draw4':drawCards(gameData.players[nextPlayerIndex],gameData.deck,4);break}gameData.currentPlayerId=gameData.players[nextPlayerIndex].id}
function drawCards(player, deck, count) { /* ...unverändert... */ for(let i=0;i<count;i++){if(deck.length===0){console.log("Deck ist leer!");break}player.hand.push(deck.pop())}}
drawPileDiv.onclick = () => { /* ... (Logik wie vorher, aber mit Animation) ... */ 
    database.ref(`games/${gameId}`).once('value', snapshot => {
        const gameData = snapshot.val();
        if (!gameData || gameData.currentPlayerId !== playerId) return;
        
        animateCardMove(drawPileDiv, playerHandDiv, {color:'back'});
        
        const gameRef = database.ref(`games/${gameId}`);
        gameRef.transaction(gameData => {
            if (!gameData) return;
            const playerIndex = gameData.players.findIndex(p => p.id === playerId);
            drawCards(gameData.players[playerIndex], gameData.deck, 1);
            let nextPlayerIndex = (playerIndex + gameData.direction) % gameData.players.length;
            if (nextPlayerIndex < 0) nextPlayerIndex += gameData.players.length;
            gameData.currentPlayerId = gameData.players[nextPlayerIndex].id;
            return gameData;
        });
    });
};
function isCardPlayable(card, topCard) { /* ...unverändert... */ return card.color==='black'||card.color===topCard.color||card.value===topCard.value}

// --- MATCHMAKING & GAME SETUP ---
function findOrCreateGame() {findGameBtn.disabled=true;statusText.textContent=t('searching');const gamesRef=database.ref('games');gamesRef.orderByChild('status').equalTo('waiting').limitToFirst(1).once('value',snapshot=>{if(snapshot.exists()){const[foundGameId,foundGame]=Object.entries(snapshot.val())[0];joinGame(foundGameId,foundGame)}else{createGame()}})}
function createGame() {gameId=database.ref('games').push().key;const gameData={status:'waiting',players:[{id:playerId,hand:[]}],deck:[],discardPile:[],currentPlayerId:null,direction:1};database.ref(`games/${gameId}`).set(gameData).then(()=>{statusText.textContent=t('waiting');listenForGameUpdates()})}
function joinGame(foundGameId, gameData) {gameId=foundGameId;gameData.status='playing';gameData.players.push({id:playerId,hand:[]});const deck=shuffle(createUnoDeck());gameData.players.forEach(p=>{p.hand=deck.splice(0,7)});let firstCard;do{firstCard=deck.pop()}while(firstCard.color==='black');gameData.discardPile=[firstCard];gameData.deck=deck;gameData.currentPlayerId=gameData.players[0].id;database.ref(`games/${gameId}`).set(gameData).then(()=>{listenForGameUpdates()})}

// --- UI RENDERING & STATE MANAGEMENT ---
function listenForGameUpdates() {
    if(gameListener) database.ref(`games/${gameId}`).off('value', gameListener);
    gameListener = database.ref(`games/${gameId}`).on('value', snapshot => {
        const gameData = snapshot.val();
        if (!gameData) { showEndScreen(false, true); return; } // Gegner hat aufgegeben
        renderGame(gameData);
        lastGameState = JSON.parse(JSON.stringify(gameData)); // Tiefe Kopie für nächsten Vergleich
    });
}

function renderGame(gameData) {
    document.getElementById('status-bar').classList.add('hidden');
    gameBoard.classList.remove('hidden');

    const me = gameData.players.find(p => p.id === playerId);
    const opponent = gameData.players.find(p => p.id !== playerId);

    // Eigene Hand rendern
    playerHandDiv.innerHTML = '';
    me.hand.forEach(card => {
        const cardEl = createCardElement(card, true);
        if(gameData.currentPlayerId === playerId && isCardPlayable(card, gameData.discardPile[0])) {
            cardEl.classList.add('playable');
        }
        playerHandDiv.appendChild(cardEl);
    });
    arrangeHand(playerHandDiv, me.hand.length, true);

    // Gegner-Hand rendern
    opponentHandDiv.innerHTML = '';
    if(opponent) {
        for (let i = 0; i < opponent.hand.length; i++) {
            opponentHandDiv.appendChild(createCardElement({color:'back'}));
        }
        arrangeHand(opponentHandDiv, opponent.hand.length, false);
    }
    
    // Ablagestapel
    discardPileDiv.innerHTML = '';
    const topCard = gameData.discardPile[0];
    if (topCard) {
        const topCardEl = createCardElement(topCard, false);
        topCardEl.style.cursor = 'default';
        discardPileDiv.appendChild(topCardEl);
    }

    // Effekte basierend auf State-Änderung
    if(lastGameState) {
        const lastTopCard = lastGameState.discardPile[0];
        if (topCard.value !== lastTopCard.value || topCard.color !== lastTopCard.color) {
            if(['draw2', 'wild_draw4', 'skip', 'reverse'].includes(topCard.value)) {
                triggerEffect('shake');
            }
        }
    }

    // Zug-Indikator
    turnIndicator.classList.toggle('hidden', gameData.currentPlayerId !== playerId);

    // Spielende
    if (gameData.status === 'finished') {
        showEndScreen(gameData.winnerId === playerId);
    }
}

function showEndScreen(didWin, opponentLeft = false) {
    if (gameListener) database.ref(`games/${gameId}`).off('value', gameListener);
    
    gameContainer.classList.add('blurred');
    endScreen.classList.remove('hidden');
    
    if (opponentLeft) {
        endScreenTitle.textContent = "Gegner hat aufgegeben. Du gewinnst!"; // Besser wäre auch i18n
    } else {
        endScreenTitle.textContent = didWin ? t('you_won') : t('you_lost');
    }

    // Spiel aus DB entfernen nach kurzer Zeit
    setTimeout(() => { if (gameId) database.ref(`games/${gameId}`).remove(); }, 5000);
}

function resetUI() {
    gameContainer.classList.remove('blurred');
    endScreen.classList.add('hidden');
    gameBoard.classList.add('hidden');
    document.getElementById('status-bar').classList.remove('hidden');
    statusText.textContent = t('welcome');
    findGameBtn.disabled = false;
    lastGameState = null;
    gameId = null;
}

// --- INITIALIZATION ---
window.onload = () => {
    auth.signInAnonymously().catch(error => console.error(error));
    auth.onAuthStateChanged(user => {
        if (user) {
            playerId = user.uid;
            findGameBtn.disabled = false;
        }
    });

    setLanguage(getInitialLang());
    langSelect.addEventListener('change', (e) => setLanguage(e.target.value));
    findGameBtn.addEventListener('click', findOrCreateGame);
    playAgainBtn.addEventListener('click', () => {
        resetUI();
        findOrCreateGame();
    });
};