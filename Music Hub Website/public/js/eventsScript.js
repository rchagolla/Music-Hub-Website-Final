document.addEventListener('DOMContentLoaded', function () {
  const form = document.querySelector('#artistSearchForm');
  const eventList = document.querySelector('#eventList');
  const artistImg = document.querySelector('#artistImg');
  const artistLink = document.querySelector('#artistLink');

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    const artistName = document.querySelector('#artistInput').value;
    const request = new XMLHttpRequest();

    request.open('GET', `https://rest.bandsintown.com/artists/${artistName}?app_id=d1a456429d32067ce6d660b6880c4451`);
    request.onload = function () {
      if (request.status === 200) {
        const artist = JSON.parse(request.responseText);
        artistImg.src = artist.image_url;
        artistLink.href = artist.url;
        artistLink.textContent = `View ${artistName}'s BandsInTown Profile`;

        const eventsRequest = new XMLHttpRequest();
        eventsRequest.open('GET', `https://rest.bandsintown.com/artists/${artistName}/events?app_id=d1a456429d32067ce6d660b6880c4451`);
        eventsRequest.onload = function () {
          if (eventsRequest.status === 200) {
            const events = JSON.parse(eventsRequest.responseText);

            if (events.length === 0) {
              eventList.innerHTML = '<p>No upcoming events</p>';
            } else {
              let html = '<ul>';
              let eventNumber = 1;
              for (const event of events) {
                html += `${eventNumber}. <b> ${event.venue.name} </b>, ${event.datetime}, ${event.venue.city} <br>`;
                eventNumber = eventNumber + 1;
              }
              html += '</ul>';
              eventList.innerHTML = html;
            }
          } else {
            console.error('Events request failed');
          }
        };
        eventsRequest.send();
      } else {
        console.error('Artist request failed');
      }
    };
    request.send();
  });
});
