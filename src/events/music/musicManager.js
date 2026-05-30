const musicPlayHandler = require('./playedEmbed/embedPlayHandler');
const musicDeleteHandler = require('./deleteMessages/musicDelete');
const musicDeleteMessageHandler = require('./deleteMessages/musicDeleteMessage');
const musicButtonsHandler = require('./buttons/musicButtons');
const guildDelete = require('./deleteMessages/guildDelete');

const interactionMessageHandler = require('./interactions/musicMention');
const interactionMusicSearchHandler = require('./interactions/musicSearch');
const interactionMusicTrigger = require('./interactions/musicTrigger');
const {iniciarTriggerCollector } = require('./interactions/musicCollector');



module.exports = (client) => {
    musicPlayHandler(client);
    musicDeleteHandler(client);
    musicDeleteMessageHandler(client);
    musicButtonsHandler(client);
    interactionMessageHandler(client);
    interactionMusicSearchHandler(client);
    interactionMusicTrigger(client);
    guildDelete(client);
    iniciarTriggerCollector(client);
};