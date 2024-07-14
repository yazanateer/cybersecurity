document.addEventListener('DOMContentLoaded', function() {
  let failedAttempts = 0;
  let isBlocked = false;
  let retryInterval;
  let blockStartTime = localStorage.getItem('blockStartTime');

  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const retryInfo = document.getElementById('retry_info');
  const retryMessage = document.getElementById('retry_message');
  const retryTimer = document.getElementById('retry_timer');

  if (blockStartTime) {
      const currentTime = new Date().getTime();
      const timePassed = currentTime - blockStartTime;
      if (timePassed < 30000) {
          blockUser();
      } else {
          localStorage.removeItem('blockStartTime');
      }
  }

  document.getElementById('login_form').addEventListener('submit', async function(event) {
      event.preventDefault();

      if (isBlocked) {
          alert('You are currently blocked. Please wait for the retry timer.');
          return;
      }

      const email = emailInput.value;
      const password = passwordInput.value;

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
          localStorage.setItem('user_id', result.userId);

          alert('Login successful!');
          window.location.href = '../dashboard/index.html';
      } else {
          failedAttempts++;

          if (failedAttempts >= 3) {
              blockUser();
          } else {
              const result = await response.json();
              alert('Login failed: ' + result.message);
          }
      }
  });

  function blockUser() {
      isBlocked = true;
      retryInfo.classList.remove('hidden');
      emailInput.disabled = true;
      passwordInput.disabled = true;

      let secondsLeft = 30;
      retryMessage.textContent = `Please wait ${secondsLeft} seconds before retrying...`;

      retryInterval = setInterval(() => {
          secondsLeft--;
          if (secondsLeft > 0) {
              retryMessage.textContent = `Please wait ${secondsLeft} seconds before retrying...`;
          } else {
              clearInterval(retryInterval);
              resetLogin();
          }
      }, 1000);
      localStorage.setItem('blockStartTime', new Date().getTime());
  }

  function resetLogin() {
      isBlocked = false;
      failedAttempts = 0;
      clearInterval(retryInterval);
      retryInfo.classList.add('hidden');
      emailInput.disabled = false;
      passwordInput.disabled = false;
      emailInput.value = '';
      passwordInput.value = '';
      localStorage.removeItem('blockStartTime');
  }
});
