const addEmbed = require('./addEmbed');
const addPlaylist = require('./addEmbed');
const emptyEmbed = require ('./emptyEmbed');
const finishEmbed = require ('./finishEmbed');
const kickEmbed = require ('./kickEmbed');
const readyEmbed = require('./readyEmbed');
const startEmbed = require('./startEmbed');

module.exports = (client) => {
    addEmbed(client);
    addPlaylist(client);
    emptyEmbed(client);
    finishEmbed(client);
    kickEmbed(client);
    readyEmbed(client);
    startEmbed(client);
};