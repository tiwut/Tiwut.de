const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false // Setze auf 'true' um Kollisionsboxen zu sehen
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

// Globale Variablen für Firebase und Spieler-Objekte
let firebaseAuth;
let database;
let player; // Das Sprite des lokalen Spielers
let playerId;
let playerRef; // Referenz zum Spieler in der Datenbank
let otherPlayers; // Eine Gruppe für die Sprites der anderen Spieler
let cursors; // Für die Tastatureingabe
let spacebar;
let lastMoveTime = 0;
const moveUpdateThreshold = 50; // Millisekunden: Sende nur alle 50ms ein Positionsupdate

function preload() {
    // Lade die Grafiken
    this.load.image('player', 'assets/player.png');
    this.load.image('other_player', 'assets/other_player.png');
    this.load.image('bullet', 'assets/bullet.png');
}

function create() {
    // Initialisiere Firebase Services
    firebaseAuth = firebase.auth();
    database = firebase.database();

    // Erstelle eine Gruppe für die anderen Spieler
    otherPlayers = this.physics.add.group();

    // Initialisiere Tastatureingaben
    cursors = this.input.keyboard.createCursorKeys();
    spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // Anonym bei Firebase anmelden
    firebaseAuth.signInAnonymously().catch(error => {
        console.error("Anmeldung fehlgeschlagen:", error);
    });

    // Listener, der feuert, sobald der User angemeldet ist
    firebaseAuth.onAuthStateChanged(user => {
        if (user) {
            playerId = user.uid;
            playerRef = database.ref(`players/${playerId}`);
            
            // Startposition zufällig wählen
            const startX = Math.floor(Math.random() * 700) + 50;
            const startY = Math.floor(Math.random() * 500) + 50;
            
            // Erstelle das Sprite für den lokalen Spieler
            player = this.physics.add.sprite(startX, startY, 'player');
            player.setCollideWorldBounds(true); // Verhindert, dass der Spieler den Bildschirm verlässt

            // Speichere den Spieler in der Datenbank
            playerRef.set({
                x: player.x,
                y: player.y,
                playerId: playerId,
                angle: 0
            });
            
            // Wenn der Spieler die Seite schließt, entferne ihn aus der Datenbank
            playerRef.onDisconnect().remove();

            // Starte die Listener für andere Spieler und Schüsse
            listenForOtherPlayers.call(this);
            listenForShots.call(this);

        } else {
            // User ist nicht angemeldet
        }
    });
}

function listenForOtherPlayers() {
    const allPlayersRef = database.ref('players');
    
    // Wenn ein Spieler hinzukommt
    allPlayersRef.on('child_added', snapshot => {
        const playerData = snapshot.val();
        if (playerData.playerId !== playerId) { // Ignoriere den lokalen Spieler
            const otherPlayer = this.physics.add.sprite(playerData.x, playerData.y, 'other_player');
            otherPlayer.playerId = playerData.playerId; // Speichere die ID am Sprite
            otherPlayers.add(otherPlayer);
        }
    });
    
    // Wenn sich ein Spieler bewegt oder dreht
    allPlayersRef.on('child_changed', snapshot => {
        const playerData = snapshot.val();
        if (playerData.playerId !== playerId) {
            otherPlayers.getChildren().forEach(otherPlayer => {
                if (playerData.playerId === otherPlayer.playerId) {
                    // Sanfte Bewegung zur neuen Position
                    this.tweens.add({
                        targets: otherPlayer,
                        x: playerData.x,
                        y: playerData.y,
                        angle: playerData.angle,
                        duration: 50,
                        ease: 'Linear'
                    });
                }
            });
        }
    });

    // Wenn ein Spieler das Spiel verlässt
    allPlayersRef.on('child_removed', snapshot => {
        const playerData = snapshot.val();
        otherPlayers.getChildren().forEach(otherPlayer => {
            if (playerData.playerId === otherPlayer.playerId) {
                otherPlayer.destroy();
            }
        });
    });
}

function listenForShots() {
    const shotsRef = database.ref('shots');
    // 'child_added' ist perfekt hier, da jeder Schuss ein neues, einmaliges Event ist
    shotsRef.on('child_added', snapshot => {
        const shotData = snapshot.val();
        
        // Erstelle ein Bullet-Sprite im Spiel
        const bullet = this.physics.add.sprite(shotData.x, shotData.y, 'bullet');
        bullet.setRotation(shotData.angle);
        
        // Gib dem Projektil eine Geschwindigkeit in die Richtung, in die es zeigt
        this.physics.velocityFromRotation(shotData.angle, 500, bullet.body.velocity);
        
        // Entferne das Projektil nach 2 Sekunden, um die Datenbank und das Spiel sauber zu halten
        setTimeout(() => {
            bullet.destroy();
        }, 2000);
        
        // Entferne den Schuss aus der Datenbank, um sie nicht zu überfüllen
        snapshot.ref.remove();
    });
}


function update(time, delta) {
    if (player) {
        // --- Spielerbewegung ---
        player.setVelocity(0); // Setze Geschwindigkeit zurück
        let velocityX = 0;
        let velocityY = 0;

        if (cursors.left.isDown) {
            velocityX = -200;
        } else if (cursors.right.isDown) {
            velocityX = 200;
        }

        if (cursors.up.isDown) {
            velocityY = -200;
        } else if (cursors.down.isDown) {
            velocityY = 200;
        }
        
        player.setVelocityX(velocityX);
        player.setVelocityY(velocityY);

        // --- Spielerrotation (Blickrichtung zur Maus) ---
        const pointer = this.input.activePointer;
        player.rotation = Phaser.Math.Angle.Between(player.x, player.y, pointer.x, pointer.y);

        // --- Sende Positionsupdate an Firebase (optimiert) ---
        if (time > lastMoveTime + moveUpdateThreshold) {
            if (player.body.velocity.x !== 0 || player.body.velocity.y !== 0 || player.rotation !== player.lastRotation) {
                playerRef.update({
                    x: player.x,
                    y: player.y,
                    angle: player.rotation
                });
            }
            lastMoveTime = time;
            player.lastRotation = player.rotation;
        }
        
        // --- Schießen ---
        if (Phaser.Input.Keyboard.JustDown(spacebar)) {
            // Schreibe ein "Schuss-Event" in die Datenbank.
            // Alle Clients (inklusive diesem) hören auf dieses Event und erstellen dann das Projektil.
            database.ref('shots').push({
                shooterId: playerId,
                x: player.x,
                y: player.y,
                angle: player.rotation
            });
        }
    }
}