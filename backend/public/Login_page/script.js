
let wrong_password = 0; //for the wrong password attempt
document.getElementById('login_form').addEventListener('submit', async function(event) {
    event.preventDefault();

    if(wrong_password == 3){ //you can enter wrong pasowrd only 3 times sequentaily and then you cant login 
      alert('login attempt reached the maximum 3 times , try again later');
      return;
    }

  
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
  
    const response = await fetch('http://localhost:3001/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({username, password })
    });

    if (response.ok) {
      const result = await response.json();
      localStorage.setItem('accessToken', result.accessToken); 
      localStorage.setItem('user_id',result.userId)
      
      alert('Login successful!');
        wrong_password = 0; //restore the wrong attempt

      
      window.location.href = '../dashboard/index.html'; 
    } else {
      const result = await response.json();
      alert('Login failed: ' + result.message);
      wrong_password+=1;
    
      const queryResults = result.results;
    if (queryResults && queryResults.length > 0) {
      const resultDisplay = document.getElementById('resultDisplay');
      resultDisplay.innerHTML = `
        <p>Query results:</p>
        <pre>${JSON.stringify(queryResults, null, 2)}</pre>
      `;
    }
  
    }
  });
  