require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { errorHandler } = require('./middleware/error.middleware');

const app = express();

const allGlobalRoute = require("./routes/allGlobalRoute");  // for routes

app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));


// Parse AccessURLs from the environment variable
const allowedOrigins = process.env.AccessURLs.split(',');

app.use(
  cors({
    origin: allowedOrigins,  // Change this to your frontend's URL (e.g., React app URL)
    credentials: true,  // This allows cookies to be sent with the request
  })
);


app.use(allGlobalRoute); // for routes
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'PulseDesk API', timestamp: new Date() }));




app.use(errorHandler);


const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
