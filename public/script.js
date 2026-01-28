let markers = [];

async function loadMap() {
  const res = await fetch("/config");
  const data = await res.json();

  const script = document.createElement("script");
  script.src = `https://maps.googleapis.com/maps/api/js?key=${data.apiKey}`;
  script.onload = initMap;
  document.head.appendChild(script);
}

function initMap() {
  navigator.geolocation.getCurrentPosition(pos => {
    const { latitude, longitude } = pos.coords;

    window.map = new google.maps.Map(document.getElementById("map"), {
      center: { lat: latitude, lng: longitude },
      zoom: 14
    });

    window.userLocation = { latitude, longitude };
  });
}

async function getPlaces() {
  if (!window.userLocation) {
    alert("Location not loaded yet");
    return;
  }

  const mood = document.getElementById("mood").value;
  const { latitude, longitude } = window.userLocation;

  // clear old markers
  markers.forEach(m => m.setMap(null));
  markers = [];

  const res = await fetch(
    `/recommend?mood=${mood}&lat=${latitude}&lng=${longitude}`
  );

  const places = await res.json();
  //used this to sort out the places
  const sortType = document.getElementById("sort").value;

    if (sortType === "rating") {
      places.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    if (sortType === "reviews") {
      places.sort((a, b) => (b.user_ratings_total || 0) - (a.user_ratings_total || 0));
    }

  console.log("Places:", places); // debug (check in console)

  if (places.length === 0) {
    alert("No places found nearby");
    return;
  }

places.forEach(p => {
  const marker = new google.maps.Marker({
    position: {
      lat: p.geometry.location.lat,
      lng: p.geometry.location.lng
    },
    map: window.map
  });

  const info = new google.maps.InfoWindow({
    content: `
      <strong>${p.name}</strong><br>
      ⭐ Rating: ${p.rating || "N/A"}<br>
      📍 ${p.vicinity || ""}
    `
  });

  marker.addListener("click", () => {
    info.open(window.map, marker);
  });

  markers.push(marker);
});

}


loadMap();
