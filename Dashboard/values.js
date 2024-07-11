const mqtt = require("mqtt");
const fs = require('fs');
const client = mqtt.connect("mqtt://test.mosquitto.org");
const mongoose = require('mongoose');
const Sensors_values = require('./models/values_model');

let values = {
    temp_2: 0,
    temp_3: 0,
    hum_2: 0,
    hum_3: 0
};

// connect to MongoDB
const dbURI = 'your_MongoDB_URL';
mongoose.connect(dbURI)
    .then((result) => console.log('connected to db'))
    .catch((err) => console.log(err));

client.on("connect", () => {
    client.subscribe("ntua_temp", (err) => {});
  });

client.on("message", (topic, message) => {
    const jsonString = message.toString();
    try {
        const jsonData = JSON.parse(jsonString);
        console.log(jsonData);
        let temp_Stream = fs.createWriteStream(__dirname + '/history/temperature.txt');
        let hum_Stream = fs.createWriteStream(__dirname + '/history/humidity.txt');
        temp_Stream.write('node_2,node_3' + '\n');
        hum_Stream.write('node_2,node_3' + '\n');
        switch (jsonData["node address"]) {
            case 2:
                const sensors_values_2 = new Sensors_values(jsonData);
                sensors_values_2.save()
                    .then((result) => console.log('values saved'))
                    .catch((err) => console.log(err));
                values.temp_2 = jsonData.temperature;
                values.hum_2 = jsonData.humidity;
                temp_Stream.write(',' + values.temp_2.toString() + ',' + values.temp_3.toString());
                hum_Stream.write(',' + values.hum_2.toString() + ',' + values.hum_3.toString());
                temp_Stream.end();
                hum_Stream.end();
                break;
            case 3:
                const sensors_values_3 = new Sensors_values(jsonData);
                sensors_values_3.save()
                    .then((result) => console.log('values saved'))
                    .catch((err) => console.log(err));
                values.temp_3 = jsonData.temperature;
                values.hum_3 = jsonData.humidity;
                temp_Stream.write(',' + values.temp_2.toString() +',' + values.temp_3.toString());
                hum_Stream.write(',' + values.hum_2.toString() + ',' + values.hum_3.toString());
                temp_Stream.end();
                hum_Stream.end();
                break;
            default:
                console.log("Unknown node address");
        }
    } catch (error) {
        console.log("Error parsing JSON:", error);
    }
});
