const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 3
    },
    content: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Members',
        required: true
    }
}, {
    timestamps: true
});

module.exports = { commentSchema }; 