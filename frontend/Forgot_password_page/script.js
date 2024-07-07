document.addEventListener('DOMContentLoaded', function() {
    const recoveryForm = document.getElementById('recovery_form');
    if(recoveryForm) {
        recoveryForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            const email = document.getElementById('email').value;

            try{
                const response = await fetch('http://localhost:3001/sendRecoveryCode', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({email})
                });


                const result = await response.json();
                if(response.ok){ 
                    document.getElementById('send_mail').textContent = 'Recovery Code sent to your email';
                    window.location.href ='recovery.html';

                } else{ 
                    document.getElementById('send_mail').textContent = result.message;
                }
            } catch(error) {
                document.getElementById('send_mail').textContent = ' Error sending recovery code'
            }
        });
    }

    const verifaction_code = document.getElementById('verification_form');
    if(verifaction_code) {
        verifaction_code.addEventListener('submit', async function(event){
            const email = new URLSearchParams(window.location.search).get('email');
            const code = document.getElementById('passcode').value;
            
            try{
                const response = await fetch('http://localhost:3001/recoveryPage', {
                    method: 'POST',
                    headers: {
                        'Content-Type' : 'application/json'
                    }, 
                    body: JSON.stringify({email, code})
                });

                const result = await response.json();
                if(response.ok){
                    document.getElementById('sent_mail').textContent = 'Code verified success, you can reset the password';
                    window.location.href = 'reset.html';
                } else {
                    document.getElementById('sent_mail').textContent = result.message;
                }

            } catch ( error) {
                document.getElementById('sent_mail').textContent = 'Erro verifying the code ';
            }
        });
    }

    const resetForm = document.getElementById('reset_form');
    if(resetForm) {
        resetForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            const newPassword = document.getElementById('new_password').value;
            const email = new URLSearchParams(window.location.search).get('email');
            
            try {
                const response = await fetch('http://localhost:3001/resetPassword', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, newPassword })
                });

                const result = await response.json();
                if(response.ok) {
                    document.getElementById('reset_status').textContent = 'password reset success';
                } else{
                    document.getElementById('reset_status').textContent = result.message;
                }

            } catch(error){
                document.getElementById('reset_status').textContent = 'error reset the password';
            }
        })
    }












});

