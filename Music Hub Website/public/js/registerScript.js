document.querySelector("#registerUsername").addEventListener("change", checkUsername);

// document.querySelector("#accountRegisterButton").addEventListener("click", checkPassword);
document.querySelector("#registerPassword").addEventListener("change", checkPassword);
document.querySelector("#registerPasswordConfirm").addEventListener("change", checkPassword);

function checkUsername() {
  let username = document.querySelector("#registerUsername").value;
  let usernameTaken = false;

  fetch(`/register/checkusername/${username}`)// check to see if username is taken
    .then(response => response.json())
    .then(data => {
      console.log("Checking username...")
      if (data.exists) {
        usernameTaken = true;
        console.log("username Taken");
      } else {
        usernameTaken = false;
        console.log("username Available");
      }
      if (usernameTaken) {
        document.querySelector("#usernameFeedback").innerHTML = "Username is already taken.";
        document.querySelector("#usernameFeedback").style.display = "block";
        document.getElementById("accountRegisterButton").disabled = true;
      } else {
        document.getElementById("accountRegisterButton").disabled = false;
        document.querySelector("#usernameFeedback").innerHTML = "";
        document.querySelector("#usernameFeedback").style.display = "none"
      }
    })
}

function checkPassword() {
  document.querySelector("#registerFeedback").innerHTML = "";
  document.querySelector("#registerFeedback").style.display = "none";

  let password = document.querySelector("#registerPassword").value;
  let passwordConfirm = document.querySelector("#registerPasswordConfirm").value;
  document.getElementById("accountRegisterButton").disabled = false;

  if (password != passwordConfirm) {
    document.querySelector("#registerFeedback").innerHTML = "Passwords do not match.";
    document.querySelector("#registerFeedback").style.display = "block";
    document.getElementById("accountRegisterButton").disabled = true;
  }
}