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

function copyToClipboard() {
    var passwordOutput = document.getElementById('passwordOutput');
    var range = document.createRange();
    range.selectNode(passwordOutput);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    document.execCommand('copy');
    window.getSelection().removeAllRanges();

     // Display a custom alert message
     var alertMessage = document.createElement('div');
     alertMessage.textContent = 'Done!!! Password copied to clipboard!';
     alertMessage.className = 'alert';
 
     // Append the alert message to the body
     document.body.appendChild(alertMessage);
 
     // Hide the alert after a timeout of 2000 milliseconds (2 seconds)
     setTimeout(function () {
         alertMessage.style.display = 'none';
     }, 2000);
}
