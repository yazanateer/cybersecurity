document.addEventListener('DOMContentLoaded', function() {
    // For getting the username from the database
    const usernameForm = document.getElementById('username_form');
    if (usernameForm) {
        usernameForm.addEventListener('submit', async function(event) {
            event.preventDefault();

            const username = document.getElementById('username').value;

            try {
                const response = await fetch(`http://localhost:3001/checkUsername?username=${username}`);
                if (response.ok) {
                    window.location.href = `/frontend/change_password/index.html?username=${username}`;
                } else {
                    alert('Username not found');
                }
            } catch (error) {
                console.error('Error checking the username:', error);
                alert('Error checking username');
            }
        });
    }

    // // For updating the password
    // const changePasswordForm = document.getElementById('change_password_form');
    // if (changePasswordForm) {
    //     changePasswordForm.addEventListener('submit', async function(event) {
    //         event.preventDefault();

    //         const currentPass = document.getElementById('current_password').value;
    //         const newPass = document.getElementById('new_password').value;
    //         const confirmPass = document.getElementById('confirm_new_password').value;


    //         console.log(currentPass);
    //         console.log(newPass);
    //         console.log(confirmPass);
    //         const params = new URLSearchParams(window.location.search);
    //         const username = params.get('username');

    //         if (newPass !== confirmPass) {
    //             alert('The passwords do not match');
    //             return;
    //         }

    //         try {
    //             const response = await fetch('http://localhost:3001/changePassword', {
    //                 method: 'POST',
    //                 headers: {
    //                     'Content-Type': 'application/json'
    //                 },
    //                 body: JSON.stringify({ username, current_password, new_password })
                    

    //             });

    //             const result = await response.json();
    //             if (response.ok) {
    //                 alert('Password changed successfully');
    //             } else {
    //                 alert(result.message);
    //             }

    //         } catch (error) {
    //             console.error('Error changing password', error);
    //             alert('Error changing password');
    //         }
    //     });
    // }


    // For updating the password
    const changePasswordForm = document.getElementById('change_password_form');
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', async function(event) {
            event.preventDefault();

            const currentPassword = document.getElementById('current_password').value;
            const newPassword = document.getElementById('new_password').value;
            const confirmPass = document.getElementById('confirm_new_password').value;


            console.log(currentPassword);
            console.log(newPassword);
            console.log(confirmPass);
            const params = new URLSearchParams(window.location.search);
            const username = params.get('username');

            if (newPassword !== confirmPass) {
                alert('The passwords do not match');
                return;
            }

            try {
                const response = await fetch('http://localhost:3001/changePassword', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, currentPassword, newPassword })
                    

                });

                const result = await response.json();
                if (response.ok) {
                    alert('Password changed successfully');
                } else {
                    alert(result.message);
                }

            } catch (error) {
                console.error('Error changing password', error);
                alert('Error changing password');
            }
        });
    }





});
