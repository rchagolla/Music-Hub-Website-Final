document.querySelector("#loginButton").addEventListener("click", checkUserdata);

async function checkUserdata() {
  let username = document.querySelector("#loginUsername").value;
  let password = document.querySelector("#loginPassword").value;
  let feedback = document.querySelector("#loginFeedback");

  try {
    const response = await fetch(`/login/checkuserdata/${username}/${password}`);// check to see if user data is valid and logs user in
    const data = await response.json();

    if (data.userId>=0) {
      feedback.innerHTML = "Hooray! Your login was validated!";
      feedback.style.backgroundColor = 'green';
      window.location.href = '/';
    } else {
      feedback.innerHTML = "Invalid login credentials. Check that your username and password are valid and try again.";
      feedback.style.backgroundColor = 'red';
    }
  } catch (error) {
    console.error(error);
    feedback.innerHTML = "Error with logging in. Please contact the admins.";
    feedback.style.backgroundColor = 'red';
  }
}