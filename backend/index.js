// backend/index.js

// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const { addJobLocation, markJobCompleted, getAllJobLocations } = require('./database');
const app = express();

// Middleware setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Mock data for demonstration
const jobLocations = [
  { id: 1, address: "123 Main St, City1" },
  { id: 2, address: "456 Elm St, City2" },
  { id: 3, address: "789 Oak St, City3" }
];

// Route to handle job locations input
app.post('/api/job-locations', (req, res) => {
  const { address } = req.body;
  addJobLocation(address)
    .then(newLocation => res.json({ message: 'Location added successfully', location: newLocation }))
    .catch(error => res.status(500).json({ error: error.message }));
});


// Route to calculate optimized route
app.get('/api/optimize-route', (req, res) => {
  getAllJobLocations()
    .then(locations => {
      // Implement route optimization logic here
      const optimizedRoute = optimizeRoute(locations);
      res.json({ optimizedRoute });
    })
    .catch(error => res.status(500).json({ error: error.message }));
});

// Simple route optimization algorithm (Nearest Neighbor)
function optimizeRoute(locations) {
    // Initialize variables
    const visited = new Set();
    let currentLocation = locations[0]; // Start from the first location
    const optimizedRoute = [currentLocation];
  
    // Mark the first location as visited
    visited.add(currentLocation);
  
    // Helper function to calculate distance between two locations (Euclidean distance)
    function calculateDistance(location1, location2) {
      const lat1 = location1.lat;
      const lon1 = location1.lng;
      const lat2 = location2.lat;
      const lon2 = location2.lng;
      return Math.sqrt(Math.pow(lat2 - lat1, 2) + Math.pow(lon2 - lon1, 2));
    }
  
    // Nearest neighbor algorithm
    while (visited.size < locations.length) {
      let nearestLocation;
      let minDistance = Infinity;
  
      // Find the nearest unvisited location
      locations.forEach(location => {
        if (!visited.has(location)) {
          const distance = calculateDistance(currentLocation, location);
          if (distance < minDistance) {
            minDistance = distance;
            nearestLocation = location;
          }
        }
      });
  
      // Move to the nearest unvisited location
      currentLocation = nearestLocation;
      optimizedRoute.push(currentLocation);
      visited.add(currentLocation);
    }
  
    return optimizedRoute;
  }
  

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
