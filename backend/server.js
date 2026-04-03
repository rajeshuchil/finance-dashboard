const app = require('./app');
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Act as a global safety net for any asynchronous functions that throw completely unhandled errors,
// preventing Node.js from running in an undefined state.
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

// Handle graceful shutdown signals from platforms like Docker, Kubernetes, or Heroku
process.on('SIGTERM', () => {
  server.close(() => process.exit(0));
});
