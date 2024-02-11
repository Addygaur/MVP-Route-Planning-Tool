// Initialize the map variable outside the initMap function
let map;
let markers = []; // Array to store markers representing addresses
let routePath; // Variable to store the route polyline

// Initialize and add the map
function initMap() {
    const mapOptions = {
        zoom: 8,
        center: { lat: -34.397, lng: 150.644 } // Default center
    };
    map = new google.maps.Map(document.getElementById("map"), mapOptions);
}

// Function to add address to the map
function addAddress() {
    const address = document.getElementById("addressInput").value;

    // Use Geocoding service to convert address to LatLng
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ 'address': address }, function(results, status) {
        if (status === 'OK') {
            const location = results[0].geometry.location;
            
            // Add marker to the map
            const marker = new google.maps.Marker({
                position: location,
                map: map,
                title: address
            });

            // Store the marker in the array
            markers.push(marker);

            // Center map on the new marker
            map.setCenter(location);

            // Send address to the backend
            fetch('/api/job-locations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ address }),
            })
            .then(response => response.json())
            .then(data => console.log(data))
            .catch(error => console.error('Error:', error));
        } else {
            alert('Geocode was not successful for the following reason: ' + status);
        }
    });
}

// Function to plan the route
function planRoute() {
    // Get all markers on the map
    const markers = map.getMarkers();

    if (markers.length < 2) {
        alert("Please add at least two addresses to plan a route.");
        return;
    }

    // Start the route from the first marker
    const startMarker = markers[0];
    let currentMarker = startMarker;
    let remainingMarkers = markers.slice(1); // Exclude the start marker

    // Array to store the route coordinates
    const routeCoordinates = [currentMarker.getPosition()];

    // Find the nearest marker and add it to the route
    while (remainingMarkers.length > 0) {
        let nearestMarker = remainingMarkers[0];
        let nearestDistance = google.maps.geometry.spherical.computeDistanceBetween(
            currentMarker.getPosition(),
            nearestMarker.getPosition()
        );

        for (let i = 1; i < remainingMarkers.length; i++) {
            const distance = google.maps.geometry.spherical.computeDistanceBetween(
                currentMarker.getPosition(),
                remainingMarkers[i].getPosition()
            );

            if (distance < nearestDistance) {
                nearestMarker = remainingMarkers[i];
                nearestDistance = distance;
            }
        }

        routeCoordinates.push(nearestMarker.getPosition());
        currentMarker = nearestMarker;
        remainingMarkers = remainingMarkers.filter(marker => marker !== nearestMarker);
    }

    // Add the technician's location if provided
    const technicianLocation = document.getElementById("technicianLocationInput").value;
    if (technicianLocation) {
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ 'address': technicianLocation }, function(results, status) {
            if (status === 'OK') {
                const location = results[0].geometry.location;
                const technicianMarker = new google.maps.Marker({
                    position: location,
                    map: map,
                    title: "Technician's Location"
                });
                markers.push(technicianMarker);
            } else {
                alert('Geocode was not successful for the following reason: ' + status);
            }
        });
    }

    // Add the first marker again to complete the loop
    routeCoordinates.push(startMarker.getPosition());

    // Draw the route on the map
    routePath = new google.maps.Polyline({
        path: routeCoordinates,
        geodesic: true,
        strokeColor: "#FF0000",
        strokeOpacity: 1.0,
        strokeWeight: 2
    });

    routePath.setMap(map);
}

// Function to mark a job as completed
function markJobCompleted(marker) {
    // Change marker icon or style to indicate completion
    // For example:
    marker.setIcon('http://maps.google.com/mapfiles/ms/icons/green-dot.png');
}

// Function to simulate navigation to the next job
function navigateToNextJob() {
    // Find the nearest marker along the route
    const currentPosition = map.getCenter();
    let nearestMarker;
    let nearestDistance = Infinity;

    markers.forEach(marker => {
        const distance = google.maps.geometry.spherical.computeDistanceBetween(
            currentPosition,
            marker.getPosition()
        );

        if (distance < nearestDistance) {
            nearestMarker = marker;
            nearestDistance = distance;
        }
    });

    // Mark the nearest job as completed
    markJobCompleted(nearestMarker);

    // Remove the nearest marker from the array
    markers = markers.filter(marker => marker !== nearestMarker);

    // Remove the nearest marker from the route path
    routePath.getPath().forEach((path, index) => {
        if (path.equals(nearestMarker.getPosition())) {
            routePath.getPath().removeAt(index);
        }
    });

    // Update the route path on the map
    routePath.setPath(routePath.getPath());
}
