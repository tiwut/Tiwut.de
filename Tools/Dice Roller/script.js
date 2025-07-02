document.addEventListener('DOMContentLoaded', () => {
    const die = document.getElementById('die');
    const rollButton = document.getElementById('roll-button');
    const resultDisplay = document.getElementById('result-display');
    const diceContainer = document.querySelector('.dice-container');

    let isRolling = false;

    // KORRIGIERTE Rotationen, um die Zielfläche definitiv nach oben zu bringen.
    // "Oben" bedeutet, die Fläche ist nach oben ausgerichtet, parallel zur Plattform.
    // Annahmen zur initialen Würfelausrichtung im CSS:
    // - Face 1: .front (zeigt in +Z Richtung des Würfels)
    // - Face 2: .bottom (zeigt in -Y Richtung des Würfels)
    // - Face 3: .right (zeigt in +X Richtung des Würfels)
    // - Face 4: .left (zeigt in -X Richtung des Würfels)
    // - Face 5: .top (zeigt in +Y Richtung des Würfels)
    // - Face 6: .back (zeigt in -Z Richtung des Würfels)
    //
    // Ziel: Die lokale Achse des Würfels, auf der die Zahl liegt, soll zur globalen +Y Achse (oben) zeigen.
    const rotationsForTopView = {
        1: { x: -90, y: 0,   z: 0 },    // Würfel +Z (Front) zu Welt +Y (Oben)
        2: { x: 180, y: 0,   z: 0 },    // Würfel -Y (Unten) zu Welt +Y (Oben)
        3: { x: 0,   y: 0,   z: 90 },   // Würfel +X (Rechts) zu Welt +Y (Oben)
        4: { x: 0,   y: 0,   z: -90 },  // Würfel -X (Links) zu Welt +Y (Oben)
        5: { x: 0,   y: 0,   z: 0 },    // Würfel +Y (Oben) zu Welt +Y (Oben) - keine Änderung
        6: { x: 90,  y: 0,   z: 0 }     // Würfel -Z (Hinten) zu Welt +Y (Oben)
    };

    rollButton.addEventListener('click', () => {
        if (isRolling) return;
        isRolling = true;
        rollButton.disabled = true;
        resultDisplay.textContent = '-';

        const result = Math.floor(Math.random() * 6) + 1;
        const targetRotation = rotationsForTopView[result];

        // Leichte zufällige Z-Rotation für natürlicheres Aussehen beim Landen
        const randomLandedZRotation = Math.floor(Math.random() * 30) - 15; // -15 bis +15 Grad

        document.documentElement.style.setProperty('--final-rotX', `${targetRotation.x}deg`);
        document.documentElement.style.setProperty('--final-rotY', `${targetRotation.y}deg`);
        // Wichtig: Die 'randomLandedZRotation' ist die Endrotation um die Z-Achse,
        // *nachdem* X und Y die korrekte Seite nach oben gebracht haben.
        // Wenn targetRotation.z bereits einen Wert hat (z.B. für 3 oder 4), wird dieser verwendet.
        // Ansonsten wird die zufällige Z-Rotation angewendet.
        document.documentElement.style.setProperty('--final-rotZ', `${targetRotation.z + randomLandedZRotation}deg`);


        diceContainer.style.transform = 'translateX(-50%) translateY(-150%) rotateX(0deg) rotateY(0deg)';
        
        die.classList.remove('rolling');
        void die.offsetWidth; 
        die.classList.add('rolling');

        die.onanimationend = () => {
            die.classList.remove('rolling');
            
            resultDisplay.textContent = result;
            isRolling = false;
            rollButton.disabled = false;
            die.onanimationend = null; 
        };
    });

    diceContainer.style.transform = 'translateX(-50%) translateY(-150%) rotateX(0deg) rotateY(0deg)';
});