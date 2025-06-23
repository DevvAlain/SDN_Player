const mongoose = require('mongoose');
const { commentSchema } = require('./comment');

const playerSchema = new mongoose.Schema({
    playerName: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    cost: {
        type: Number,
        required: true
    },
    isCaptain: {
        type: Boolean,
        default: false
    },
    infomation: {
        type: String,
        required: true
    },
    team: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teams',
        required: true
    },
    comments: [commentSchema]
}, {
    timestamps: true
});

module.exports = mongoose.model('Players', playerSchema); 