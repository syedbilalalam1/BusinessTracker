const config = {
  apiUrl: process.env.NODE_ENV === 'production' 
    ? 'https://hemayal.onrender.com/api'  // Production backend URL
    : 'http://localhost:4000/api'         // Development backend URL
};

export default config; 