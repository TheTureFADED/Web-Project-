

const p = 11;
const q = 13;
const n = p * q; // 143
const totient = (p - 1) * (q - 1); // 120
const e = 7;
const d = 103;


function powerMod(base, exponent, modulus) {
    if (modulus === 1) return 0;

    let result = 1;
    base = base % modulus;

    while (exponent > 0) {
        if (exponent % 2 === 1) {
            result = (result * base) % modulus;
        }
        exponent = Math.floor(exponent / 2);
        base = (base * base) % modulus;
    }

    return result;
}


function encrypt(message) {
    return powerMod(message, e, n);
}


function decrypt(ciphertext) {
    return powerMod(ciphertext, d, n);
}


const sentenceInput = document.getElementById('sentence-input');
const encryptBtn = document.getElementById('encrypt-btn');
const encryptResult = document.getElementById('encrypt-result');
const encryptSteps = document.getElementById('encrypt-steps');
const encryptedValue = document.getElementById('encrypted-value');
const decryptBtn = document.getElementById('decrypt-btn');
const decryptResult = document.getElementById('decrypt-result');
const decryptSteps = document.getElementById('decrypt-steps');
const decryptedValue = document.getElementById('decrypted-value');


encryptBtn.addEventListener('click', function () {
    const sentence = document.getElementById('sentence-input').value;

    if (!sentence) {
        alert('Please enter a sentence');
        return;
    }

    const encryptedValues = [];
    let stepsHtml = '';

    
    for (let i = 0; i < sentence.length; i++) {
        const char = sentence[i];
        const ascii = char.charCodeAt(0);

        if (ascii >= n) {
            alert(`Character "${char}" has ASCII value ${ascii}, which is too large for this demo (must be < ${n})`);
            return;
        }

        const encrypted = encrypt(ascii);
        encryptedValues.push(encrypted);

        stepsHtml += `
                        <div class="mb-2 pb-2 border-bottom">
                            <p>Character ${i + 1}: "${char}" (ASCII: ${ascii})</p>
                            <p>Encrypt: ${ascii}<sup>${e}</sup> mod ${n} = ${encrypted}</p>
                        </div>
                    `;
    }

    
    encryptSteps.innerHTML = `
                    <p>Original sentence: "${sentence}"</p>
                    <p>Encrypting each character using C = M<sup>e</sup> mod n:</p>
                    ${stepsHtml}
                `;

    const encryptedResult = encryptedValues.join(', ');
    encryptedValue.textContent = `Encrypted Result: ${encryptedResult}`;
    encryptResult.style.display = 'block';

    
    document.getElementById('encrypted-input').value = encryptedResult;
});


decryptBtn.addEventListener('click', function () {
    const encryptedInput = document.getElementById('encrypted-input').value;

    if (!encryptedInput) {
        alert('Please enter encrypted values');
        return;
    }

   
    const encryptedValues = encryptedInput.split(',').map(val => parseInt(val.trim()));

    if (encryptedValues.some(isNaN)) {
        alert('Invalid input. Please enter comma-separated numbers.');
        return;
    }

    const decryptedChars = [];
    let stepsHtml = '';

   
    for (let i = 0; i < encryptedValues.length; i++) {
        const encryptedVal = encryptedValues[i];
        const decrypted = decrypt(encryptedVal);
        const char = String.fromCharCode(decrypted);

        decryptedChars.push(char);

        stepsHtml += `
                        <div class="mb-2 pb-2 border-bottom">
                            <p>Encrypted value ${i + 1}: ${encryptedVal}</p>
                            <p>Decrypt: ${encryptedVal}<sup>${d}</sup> mod ${n} = ${decrypted}</p>
                            <p>Character: "${char}"</p>
                        </div>
                    `;
    }

  
    decryptSteps.innerHTML = `
                    <p>Decrypting each value using M = C<sup>d</sup> mod n:</p>
                    ${stepsHtml}
                `;

    const decryptedSentence = decryptedChars.join('');
    decryptedValue.textContent = `Decrypted Result: "${decryptedSentence}"`;
    decryptResult.style.display = 'block';
});
