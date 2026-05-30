// models/Trigger.js
const mongoose = require('mongoose');

const TriggerSchema = new mongoose.Schema({
    guildId: {
        type: String,
        required: true,
    },
    triggers: [
        {
            trigger: {
                type: String,
                required: true,
            },
            url: {
                type: String,
                required: true,
            },
            title: {
                type: String,
            },
            author: {
                type: String,
            },
            source: {
              type: String,  
            },
        },
    ],
});

module.exports = mongoose.model('Trigger', TriggerSchema);
