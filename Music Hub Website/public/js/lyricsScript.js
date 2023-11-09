function displayLyrics() {
document.getElementById("lyricDisplay").innerHTML = "<div id='rg_embed_link_245054' class='rg_embed_link' data-song-id='245054'>Read <a href='https://genius.com/Vance-joy-riptide-lyrics'>“Riptide” by Vance Joy</a> on Genius</div>";
  let scriptElement = document.createElement('script');
  scriptElement.setAttribute('crossorigin', '');
  scriptElement.setAttribute('src', '//genius.com/songs/245054/embed.js');
  scriptElement.async = true;
  scriptElement.onload = () => {
    console.log("script has loaded....supposedly");
  }
  document.body.appendChild(scriptElement);
}