function changeBackgroundColor() {
    // Generate random RGB values
    var randomColor = 'rgb(' + Math.floor(Math.random() * 256) + ',' + Math.floor(Math.random() * 256) + ',' + Math.floor(Math.random() * 256) + ')';
    
    // Set the background color
    document.body.style.backgroundColor = randomColor;
}

function updateOutput() {
    // Get the paragraph element by its ID
    var outputParagraph = document.getElementById('output');
    var paswd = 

    // Update the content of the paragraph
    outputParagraph.innerHTML = 'Button clicked! This is the output.';
}

function generatePassword() {
    // Define the character sets
    var uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    var numericChars = '0123456789';
    var specialChars = '!@#$%^&*()_+[]{}|;:,.<>?';

    // Combine character sets based on user choices
    var allChars = '';
    if (document.getElementById('uppercaseCheckbox').checked) {
        allChars += uppercaseChars;
    }
    if (document.getElementById('lowercaseCheckbox').checked) {
        allChars += lowercaseChars;
    }
    if (document.getElementById('numericCheckbox').checked) {
        allChars += numericChars;
    }
    if (document.getElementById('specialCheckbox').checked) {
        allChars += specialChars;
    }

    // Get the desired password length
    var passwordLength = document.getElementById('passwordLength').value;

    // Generate the password
    var generatedPassword = '';
    for (var i = 0; i < passwordLength; i++) {
        var randomIndex = Math.floor(Math.random() * allChars.length);
        generatedPassword += allChars.charAt(randomIndex);
    }

    // Display the generated password
    document.getElementById('passwordOutput').textContent = generatedPassword;
}

function toggleCheckbox(element) {
    var checkbox = element.querySelector('input[type="checkbox"]');
    checkbox.checked = !checkbox.checked;

    if (checkbox.checked) {
        element.classList.add('active');
    } else {
        element.classList.remove('active');
    }
}