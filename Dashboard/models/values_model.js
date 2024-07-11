const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const valueSchema = new Schema({
    ['node address']: {
        type: Number,
        required: true
    },
    temperature: {
        type: Number,
        required: true
    },
    humidity: {
        type: Number,
        required: true
    }
}, { timestamps: true})

const Sensors_values = mongoose.model('sensors_values', valueSchema);
module.exports = Sensors_values;