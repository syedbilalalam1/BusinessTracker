const express = require('express');
const path = require('path');
const cors = require('cors');

// Import the backend app
const backendApp = require('./Backend/server');

const app = express();
const PORT = process.env.PORT || 4000;

// Serve static files from the React frontend app
app.use(express.static(path.join(__dirname, 'Frontend/build')));

// Use the backend app as middleware
app.use('/api', backendApp);

// Anything that doesn't match the above, send back index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'Frontend/build/index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 