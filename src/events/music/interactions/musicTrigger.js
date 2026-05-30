// events/messageCreate.js
const Trigger = require('../../../functions/database/models/triggerSchema');

module.exports = (client) => {
    client.on('messageCreate', async (message) => {
        if (message.author.bot) return; // Ignorar mensajes de bots

        const content = message.content.toLowerCase();
        const guildId = message.guild.id;
        const guild = message.guild

        // Verificar si el bot está mencionado
        const botMention = message.mentions.users.has(client.user.id);

        // Verificar si el usuario está en un canal de voz y si el mensaje contiene la mención al bot
        if (!message.member.voice.channel || !botMention) {
            //const channelId = message.channel.id
            //const channel = guild.channels.cache.get(channelId);
            //channel.send("Necesitas estar en un canal de voz y mencionar al bot para usar este comando.");
            return;
        }

        // Obtener los triggers del servidor
        let triggerDoc = await Trigger.findOne({ guildId });

        if (!triggerDoc || triggerDoc.triggers.length === 0) return;

        // Buscar si el mensaje contiene algún trigger
        for (const { trigger, url } of triggerDoc.triggers) {
            if (content.includes(trigger)) {
                // Obtener el comando 'play'
                const playCommand = client.musicacommands.get('play');
                if (playCommand) {
                    // Crear una interacción falsa
                    const fakeInteraction = {
                        options: {
                            getString: () => url
                        },
                        id: message.id,
                        guildId: message.guild.id,
                        member: message.member,
                        guild: message.guild,
                        channel: message.channel,
                        user: message.author,
                        reply: ({ content }) => message.channel.send(content),
                        followUp: ({ content }) => message.channel.send(content),
                        deferReply: () => Promise.resolve(),
                        editReply: ({ embeds }) => message.channel.send({ embeds })
                    };

                    try {
                        await playCommand.run({ client, interaction: fakeInteraction });
                        return;
                    } catch (error) {
                        console.error(error);
                        return;
                    }
                }
                return;
            }
        }
    });
};