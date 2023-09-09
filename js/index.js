
// Initialize the map
  var map = L.map('map').setView([20.5937, 78.9629], 5); // India center

  // Add a tile layer (you can choose a different one)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
  }).addTo(map);

  // Create an array to hold the draggable points
  var draggablePoints = [];

  // Initialize the drag and drop markers
  var startLatLng = [32.1024, 77.5619]; // Default start location coordinates
  var destinationLatLng = [30.7333, 76.7794]; // Default destination location coordinates
  var startMarker = L.marker(startLatLng, { draggable: true }).addTo(map);
  var destinationMarker = L.marker(destinationLatLng, { draggable: true }).addTo(map);

  // Call the function to calculate and display default distance and time
  calculateAndDisplayDistanceTime()

  // Function to perform reverse geocoding and set the location name in the input field
  function setDefaultLocationName(marker, inputField) {
      var latLng = marker.getLatLng();
      reverseGeocode(latLng, function(locationName) {
          // Update the input field with the location name
          inputField.value = locationName;
      });
  }

  // Set default location names for start and destination
  setDefaultLocationName(startMarker, document.querySelector('input[name="start"]'));
  setDefaultLocationName(destinationMarker, document.querySelector('input[name="destination"]'));

  // Initialize the line graph
  var line = L.polyline([startLatLng, destinationLatLng], { color: 'red', weight: 3 }).addTo(map);

  // Update the event listener to calculate distance and time
  startMarker.on('dragend', function(event) {
      var latLng = startMarker.getLatLng();
      reverseGeocode(latLng, function(locationName) {
          console.log(`Start Marker Dragged to Location: ${locationName}`);
          updateLineGraph();

          // Update the input field with the new location name
          document.querySelector('input[name="start"]').value = locationName;
          // Update the list of destinations
          updateDestinationList();
          // Calculate distance and time and update the info div
          calculateAndDisplayDistanceTime();
      });
  });

  destinationMarker.on('dragend', function(event) {
      var latLng = destinationMarker.getLatLng();
      reverseGeocode(latLng, function(locationName) {
          console.log(`Destination Marker Dragged to Location: ${locationName}`);
          updateLineGraph();

          // Update the input field with the new location name
          document.querySelector('input[name="destination"]').value = locationName;
          // Update the list of destinations
          updateDestinationList();
          // Calculate distance and time and update the info div
          calculateAndDisplayDistanceTime();
      });
  });

  // reverseGeocode function to perform reverse geocoding using name and address of location
  function reverseGeocode(latLng, callback) {
      var nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latLng.lat}&lon=${latLng.lng}`;
      $.getJSON(nominatimUrl, function(data) {
          var locationName = data.display_name;
          console.log(locationName, 'locationName');
          callback(locationName);
      });
  }

  // Calculate distance and time and update the info div
  function calculateAndDisplayDistanceTime() {
      var distance = calculateDistance(startMarker, destinationMarker);
      var time = calculateTime(startMarker, destinationMarker);

      // Update the distance and time in the sidebar
      document.querySelector('#distance').textContent = `${distance.toFixed(2)} km`;
      document.querySelector('#time').textContent = `${time.toFixed(2)} hours`;

      // Create new popups and bind them to the markers
      startMarker.unbindPopup().bindPopup(`Start Location<br>Distance: ${distance.toFixed(2)} km<br>Time: ${time.toFixed(2)} hours`).openPopup();
      destinationMarker.unbindPopup().bindPopup(`Distance: ${distance.toFixed(2)} km<br>Time: ${time.toFixed(2)} hours`).openPopup();
  }

  function updateDestinationList() {
      var ul = document.querySelector('#destination-list');
      ul.innerHTML = ''; // Clear the existing list

      addLocationToList(startMarker.getLatLng());
      addLocationToList(destinationMarker.getLatLng());
  }

  function addLocationToList(latLng) {
      var ul = document.querySelector('#destination-list');
      var li = document.createElement('li');
      li.textContent = `Location : ${latLng.lat}, Lng: ${latLng.lng}`;
      ul.appendChild(li);
  }

  function updateLineGraph() {
      line.setLatLngs([startMarker.getLatLng(), destinationMarker.getLatLng()]);
  }

  // Calculate the distance between two markers formula
  function calculateDistance(startMarker, destinationMarker) {
      var startLat = startMarker.getLatLng().lat;
      var startLng = startMarker.getLatLng().lng;
      var destinationLat = destinationMarker.getLatLng().lat;
      var destinationLng = destinationMarker.getLatLng().lng;

      // Radius of the Earth in kilometers
      var earthRadius = 6371;

      var latDiff = (destinationLat - startLat) * (Math.PI / 180);
      var lngDiff = (destinationLng - startLng) * (Math.PI / 180);

      var a =
          Math.sin(latDiff / 2) * Math.sin(latDiff / 2) +
          Math.cos(startLat * (Math.PI / 180)) * Math.cos(destinationLat * (Math.PI / 180)) *
          Math.sin(lngDiff / 2) * Math.sin(lngDiff / 2);
      // console.log(a, 'a');
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      var distance = earthRadius * c;

      return distance;
  }

  // Calculate the time between two markers
  function calculateTime(startMarker, destinationMarker) {
      var distance = calculateDistance(startMarker, destinationMarker);
      var speed = 50; // Assume the speed is 50 km/h

      var time = distance / speed;

      return time;
  }
  