document.getElementById('login_form').addEventListener('submit', async function(event) {
    event.preventDefault();
  
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
  
    const response = await fetch('http://localhost:3001/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
  
    if (response.ok) {
      const result = await response.json();
      localStorage.setItem('accessToken', result.accessToken); 
      localStorage.setItem('user_id',result.userId)
      
      alert('Login successful!');
  
      
       window.location.href = '../dashboard/index.html'; 
    } else {
      const result = await response.json();
      alert('Login failed: ' + result.message);
    }
  });
  