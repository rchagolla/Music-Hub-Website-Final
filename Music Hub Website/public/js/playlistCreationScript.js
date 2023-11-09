document.querySelector("#searchForm").addEventListener("submit", validateForm);

function validateForm(ev) {
  let keyword = document.querySelector("#keyword").value;
  let playlistName = document.querySelector("#newPlaylist").value;
  let playlistMenu = document.querySelector("#playlists").value;
  console.log(playlistMenu);
  console.log(playlistName);
  if (keyword.length == 0) {
    document.querySelector("#errorMessage").innerHTML = "Please enter a valid Search Term.";
    document.querySelector("#errorMessage").style.backgroundColor = "red";
    ev.preventDefault();
  }
  if (playlistName == "" && playlistMenu == "") {
    document.querySelector("#errorMessage").innerHTML = "Please enter a valid Playlist or Playlist Name.";
    document.querySelector("#errorMessage").style.backgroundColor = "red";
    ev.preventDefault();
  }
}