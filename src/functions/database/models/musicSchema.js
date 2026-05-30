const mongoose = require('mongoose');

const musicSchema = new mongoose.Schema({
    guildId: {
        type: String,
        required: true,
    },
    musicSearchChannelId: {
        type: String,
        required: true,
    },
    musicSearchMessageId: {
        type: String,
        default: null, 
    },
    nowPlayingMessageId: {
        type: String,
        default: null, 
    },
    thumbnailUrl: {
        type: String,
        default: '../../../../config/images/defaultMusicSearch.png', 
    },
    
}, { timestamps: true });

module.exports = mongoose.model('MusicSettings', musicSchema);
