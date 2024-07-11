const express = require('express');
const mongoose = require('mongoose');
const app = express();
const Sensors_values = require('./models/values_model');
const cors = require('cors')

// connect to MongoDB
const dbURI = 'your_MongoDB_URL';
mongoose.connect(dbURI)
    .then((result) => console.log('connected to db'))
    .catch((err) => console.log(err));

app.listen(3000, () => {
    console.log('Server running on port 3000');
});

app.use(cors());

// Retrieve data from MongoDB
app.get('/temp_node_2', (req, res) => {
    Sensors_values.find({'node address':2})
    .then((result) => {
      const data = [];
      result.forEach((doc) =>{
        const unixTime = new Date(doc.createdAt).getTime();
        data.push([unixTime, doc.temperature])
      })
      res.send(data);
    }).catch((err) => console.log(err));
});

app.get('/temp_node_3', (req, res) => {
  Sensors_values.find({'node address':3})
  .then((result) => {
    const data = [];
    result.forEach((doc) =>{
      const unixTime = new Date(doc.createdAt).getTime();
      data.push([unixTime, doc.temperature])
    })
    res.send(data);
  }).catch((err) => console.log(err));
});

app.get('/hum_node_2', (req, res) => {
  Sensors_values.find({'node address':2})
  .then((result) => {
    const data = [];
    result.forEach((doc) =>{
      const unixTime = new Date(doc.createdAt).getTime();
      data.push([unixTime, doc.humidity])
    })
    res.send(data);
  }).catch((err) => console.log(err));
});

app.get('/hum_node_3', (req, res) => {
  Sensors_values.find({'node address':3})
  .then((result) => {
    const data = [];
    result.forEach((doc) =>{
      const unixTime = new Date(doc.createdAt).getTime();
      data.push([unixTime, doc.humidity])
    })
    res.send(data);
  }).catch((err) => console.log(err));
});
