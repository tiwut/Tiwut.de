document.addEventListener('DOMContentLoaded', () => {
    const die = document.getElementById('die');
    const rollButton = document.getElementById('roll-button');
    const resultDisplay = document.getElementById('result-display');
    const diceContainer = document.querySelector('.dice-container');

    let isRolling = false;

    const rotationsForTopView = {
        1: { x: -90, y: 0,   z: 0 },
        2: { x: 180, y: 0,   z: 0 },
        3: { x: 0,   y: 0,   z: 90 },
        4: { x: 0,   y: 0,   z: -90 },
        5: { x: 0,   y: 0,   z: 0 },
        6: { x: 90,  y: 0,   z: 0 }
    };

    rollButton.addEventListener('click', () => {
        if (isRolling) return;
        isRolling = true;
        rollButton.disabled = true;
        resultDisplay.textContent = '-';

        const result = Math.floor(Math.random() * 6) + 1;
        const targetRotation = rotationsForTopView[result];

        const randomLandedZRotation = Math.floor(Math.random() * 30) - 15;

        document.documentElement.style.setProperty('--final-rotX', `${targetRotation.x}deg`);
        document.documentElement.style.setProperty('--final-rotY', `${targetRotation.y}deg`);
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