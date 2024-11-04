$(document).ready(function() {
    $('#show-signup').click(function() {
        $('#signin-form').removeClass('active');
        $('#signup-form').addClass('active');
        $('#signin-error-message').text(''); 
        $('#signin-success-message').text(' '); 
    });

    $('#show-signin').click(function() {
        $('#signup-form').removeClass('active');
        $('#signin-form').addClass('active');
        $('#signin-error-message').text(''); 
        $('#signin-success-message').text(''); 
    });
});

$(document).ready(function() {
    // Check if the user is signed in
    const signedInUsername = localStorage.getItem('username');
    
    if (signedInUsername) {
        // If a username exists in local storage, display it
        $('#signed-in-user').text(signedInUsername);
    } else {
        // If no user is signed in, you can set a default message or leave it empty
        $('#signed-in-user').text('Guest');
    }

    $('#profile-1').click(function() {
        window.location.href = '/pages/home.html'; // Redirect to home page
    });
});


function handleSignIn(event) {
    event.preventDefault();
    const username = $('#signin-username').val(); // Get the username from the input
    const password = $('#signin-password').val(); // Get the password from the input

    const users = JSON.parse(localStorage.getItem('users')) || [];

    const userFound = users.find(user => user.username === username && user.password === password);

    if (userFound) {
        localStorage.setItem('username', username); 
        $('#signed-in-user').text(username); // Store the username in local storage
        localStorage.setItem('redirectTo', 'whosWatching'); 
        window.location.href = '/pages/loading.html'; // Redirect to loading page
     
        $('#signin-error-message').text(''); // Clear error message
        $('#signin-success-message').text('Sign in successful!'); // Display success message
        console.log('Sign in successful!');
        console.log('Username: ' + username); // Log the username
        // Redirect to loading page
        window.location.href = '/pages/loading.html'; 
    } else {
        $('#signin-error-message').text('Invalid username or password. Please sign up if you don\'t have an account.');
        $('#signin-success-message').text(''); 
    }
}

function handleSignUp(event) {
    event.preventDefault();
    const fullname = $('#signup-fullname').val();
    const username = $('#signup-username').val();
    const email = $('#signup-email').val();
    const password = $('#signup-password').val();

    const users = JSON.parse(localStorage.getItem('users')) || [];

    const userFound = users.find(user => user.username === username);

    if (userFound) {
        alert('Username already exists. Please choose a different username.');
    } else {
        // Add the new user to local storage
        users.push({ fullname, username, email, password });
        localStorage.setItem('users', JSON.stringify(users));

        // Set the username and password in the sign-in form
        $('#signin-username').val(username);
        $('#signin-password').val(password); 

        // Switch to the sign-in form
        $('#signin-form').addClass('active');
        $('#signup-form').removeClass('active');

        console.log('Sign up successful!');
        console.log('Username: ' + username);
        console.log('Password: ' + password);
    }
}


localStorage.setItem('username', username);
console.log('Stored username:', username); // Log the stored username


