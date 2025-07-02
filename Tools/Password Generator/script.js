document.addEventListener('DOMContentLoaded', () => {
    const lengthEl = document.getElementById('length');
    const uppercaseEl = document.getElementById('uppercase');
    const lowercaseEl = document.getElementById('lowercase');
    const numbersEl = document.getElementById('numbers');
    const symbolsEl = document.getElementById('symbols');
    const generateButton = document.getElementById('generateButton');
    const passwordOutputEl = document.getElementById('passwordOutput');
    const copyButton = document.getElementById('copyButton');
    const messageEl = document.getElementById('message');

    const charSets = {
        uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        lowercase: 'abcdefghijklmnopqrstuvwxyz',
        numbers: '0123456789',
        symbols: '!@#$%^&*()_+-=[]{};\':"\\|,.<>/?`~'
    };

    function getRandomChar(str) {
        return str[Math.floor(Math.random() * str.length)];
    }

    function generatePassword() {
        const length = parseInt(lengthEl.value);
        let characterPool = '';
        let generatedPassword = '';
        let guaranteedChars = []; // To ensure at least one of each selected type

        if (length < 8 || length > 128) {
            showMessage("Password length must be between 8 and 128.", true);
            passwordOutputEl.value = '';
            return;
        }

        if (uppercaseEl.checked) {
            characterPool += charSets.uppercase;
            guaranteedChars.push(getRandomChar(charSets.uppercase));
        }
        if (lowercaseEl.checked) {
            characterPool += charSets.lowercase;
            guaranteedChars.push(getRandomChar(charSets.lowercase));
        }
        if (numbersEl.checked) {
            characterPool += charSets.numbers;
            guaranteedChars.push(getRandomChar(charSets.numbers));
        }
        if (symbolsEl.checked) {
            characterPool += charSets.symbols;
            guaranteedChars.push(getRandomChar(charSets.symbols));
        }

        if (characterPool === '') {
            showMessage("Please select at least one character type.", true);
            passwordOutputEl.value = '';
            return;
        }
        
        if (guaranteedChars.length > length) {
             showMessage("Password length is too short for all selected character types. Please increase length or deselect some types.", true);
             passwordOutputEl.value = '';
             return;
        }

        // Add guaranteed characters first
        for (let char of guaranteedChars) {
            generatedPassword += char;
        }
        
        // Fill the rest of the password length
        const remainingLength = length - guaranteedChars.length;
        for (let i = 0; i < remainingLength; i++) {
            generatedPassword += getRandomChar(characterPool);
        }

        // Shuffle the password to mix guaranteed characters
        generatedPassword = shuffleString(generatedPassword);
        
        passwordOutputEl.value = generatedPassword;
        showMessage("Password generated!", false);
    }

    // Fisher-Yates (Knuth) Shuffle for strings
    function shuffleString(str) {
        let arr = str.split('');
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]]; // Swap elements
        }
        return arr.join('');
    }

    function copyToClipboard() {
        const password = passwordOutputEl.value;
        if (!password) {
            showMessage("Nothing to copy.", true);
            return;
        }

        navigator.clipboard.writeText(password)
            .then(() => {
                showMessage("Password copied to clipboard!", false);
            })
            .catch(err => {
                showMessage("Failed to copy. Please copy manually.", true);
                console.error('Failed to copy: ', err);
            });
    }

    function showMessage(text, isError = false) {
        messageEl.textContent = text;
        messageEl.style.color = isError ? '#e74c3c' : '#27ae60'; // Red for error, green for success
        setTimeout(() => {
            messageEl.textContent = '';
        }, 3000); // Clear message after 3 seconds
    }

    generateButton.addEventListener('click', generatePassword);
    copyButton.addEventListener('click', copyToClipboard);

    // Generate a password on page load
    generatePassword();
});