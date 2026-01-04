import axios from 'axios';

// Set config defaults when creating the instance
axios.defaults.baseURL = '/api';

// Optional: Add interceptors for token handling if strictly needed,
// though AuthContext usually handles headers.
// Just ensuring base URL is enough for now.
