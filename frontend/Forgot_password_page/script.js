document.addEventListener('DOMContentLoaded', function() {
    const recoveryForm = document.getElementById('recovery_form');
    if (recoveryForm) {
        recoveryForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            const email = document.getElementById('email').value;
            localStorage.setItem('email', email);
            try {
                const response = await fetch('http://localhost:3001/sendRecoveryCode', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email })
                });

                const result = await response.json();
                if (response.ok) {
                    document.getElementById('send_mail').textContent = 'Recovery Code sent to your email';
                    window.location.href = 'recovery.html'; 
                } else {
                    document.getElementById('send_mail').textContent = result.message;
                }
            } catch (error) {
                console.error('Error sending recovery code:', error);
                document.getElementById('send_mail').textContent = 'Error sending recovery code';
            }
        });
    }

    const verificationForm = document.getElementById('verification_form');
    if (verificationForm) {
        verificationForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            const email = localStorage.getItem('email');
            const code = document.getElementById('passcode').value;

            try {
                const response = await fetch('http://localhost:3001/recoveryPage', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, code })
                });

                const result = await response.json();
                if (response.ok) {
                    document.getElementById('sent_mail').textContent = 'Code verified successfully, you can reset the password';
                    window.location.href = './reset.html';
                } else {
                    document.getElementById('sent_mail').textContent = result.message;
                }
            } catch (error) {
                console.error('Error verifying the code:', error);
                document.getElementById('sent_mail').textContent = 'Error verifying the code';
            }
        });
    }

    const resetForm = document.getElementById('reset_form');
    if (resetForm) {
        resetForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            const newPassword = document.getElementById('new_password').value;
            const email = localStorage.getItem('email');

            try {
                const response = await fetch('http://localhost:3001/resetPassword', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, newPassword })
                });

                const result = await response.json();
                if (response.ok) {
                    document.getElementById('reset_status').textContent = 'Password reset successfully';
                } else {
                    document.getElementById('reset_status').textContent = result.message;
                }
            } catch (error) {
                console.error('Error resetting the password:', error);
                document.getElementById('reset_status').textContent = 'Error resetting the password';
            }
        });
    }
});
