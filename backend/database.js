// backend/database.js

const sqlite3 = require('sqlite3').verbose();

// Connect to SQLite database
const db = new sqlite3.Database(':memory:');

// Create job_locations table
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS job_locations (
    id INTEGER PRIMARY KEY,
    address TEXT
  )`);

  // Create job_completion table
  db.run(`CREATE TABLE IF NOT EXISTS job_completion (
    id INTEGER PRIMARY KEY,
    job_id INTEGER,
    completed BOOLEAN,
    FOREIGN KEY (job_id) REFERENCES job_locations(id)
  )`);
});

// Function to add a job location to the database
function addJobLocation(address) {
  return new Promise((resolve, reject) => {
    db.run('INSERT INTO job_locations (address) VALUES (?)', [address], function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ id: this.lastID, address });
      }
    });
  });
}

// Function to mark a job as completed in the database
function markJobCompleted(jobId) {
  return new Promise((resolve, reject) => {
    db.run('INSERT INTO job_completion (job_id, completed) VALUES (?, ?)', [jobId, true], function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ id: this.lastID, jobId, completed: true });
      }
    });
  });
}

// Function to fetch all job locations from the database
function getAllJobLocations() {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM job_locations', (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

// Export database functions
module.exports = {
  addJobLocation,
  markJobCompleted,
  getAllJobLocations
};
