const path = require('path');
const express = require('express');
const colors = require('colors');
const dotenv = require('dotenv').config();
const port = process.env.PORT || 5000;
const productRoutes = require('./routes/product/routes.js');
const userRoutes = require('./routes/user/routes.js');
const orderRoutes = require('./routes/order/routes.js');
const dynamicRoutes = require('./routes/_dynamic/routes.js');
const { handleErrors } = require('./routes/error/middleware.js');
const connectDB = require('./config/db.js')();
const cors = require('cors');

const corsOptions = {
  origin: process.env.ORIGIN,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

const app = express();

app.use(cors(corsOptions));

app.options('*', cors(corsOptions));

app.use(express.json());

app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api', dynamicRoutes);

app.get('/api/config/paypal', (req, res) =>
  res.send(process.env.PAYPAL_CLIENT_ID)
);

const __dirName = path.resolve();

// if (process.env.NODE_ENV === 'production') {
//   app.use(express.static(path.join(__dirName, '/frontend/build')));

//   app.get('*', (req, res) =>
//     res.sendFile(path.resolve(__dirName, 'frontend', 'build', 'index.html'))
//   );
// } else {
//   app.get('/', (req, res) => {
//     res.send('API is running....');
//   });
// }

app.get('/', (req, res) => {
  res.send('API is running....');
});

app.use(handleErrors);

app.listen(port, function () {
  console.log(
    `server started on port ${port}`.yellow.bold
  );
});
