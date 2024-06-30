async function registerUser(event) {
event.preventDefault();

const username = document.getElementById('username').value;
const email = document.getElementById('email').value;
const password = document.getElementById('password').value;
const re_pass = document.getElementById('re-password').value;

const user = {
  username,
  email,
  password,
  re_pass
};



try {
  const response = await fetch('http://localhost:3001/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(user)
  });

  if (response.ok) {
    alert('User registered successfully');
  } else if (response.status === 400) {
    const error_alert = await response.json();
    alert(error_alert.message);
  } else {
    alert('Error registering user');
  }
} catch (error) {
  console.error('Error registering user: ', error);
  alert('Error registering user');
}
}
