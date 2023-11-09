document.querySelector("#closeButton").addEventListener("click", closePopup);
if(localStorage.getItem('popupDismissed')){
  closePopup();
} else {
  document.querySelector("#introPopup").style.display="block";
}

function closePopup(){
  document.querySelector("#introPopup").style.display="none";
  localStorage.setItem('popupDismissed',true);
}

