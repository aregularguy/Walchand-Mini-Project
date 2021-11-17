const mongoose = require('mongoose')

// const Schema =mongoose.Schema;
const Student = new mongoose.Schema({
    FullName: {
        type: String,
        require: true,
        unique: true
    },
    Prn: {
        type: String,
        required: true,
        unique: true

    },
    Branch: {
        type: String,
        required: true,

    },
    Year: {
        type: String,
        required: true,

    },
    Vaccine: {
        type: String,
        required: true,

    },

    FirstDose: {
        type: Boolean,
        required: true,

    },
    SecondDose: {
        type: Boolean,
        required: true,

    },

});

module.exports = mongoose.model('student', Student);