const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    numReqLeft: {
        type: Number,
        required: true
    },
    lastLimitUpdateTime: {
        type: Number, 
        required: false
    },
    mnemonic: {
        type: String,
        required: true
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model('User', userSchema);
