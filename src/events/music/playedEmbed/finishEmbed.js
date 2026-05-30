const { EmbedBuilder } = require('discord.js');
const { useQueue, useHistory } = require('discord-player');
const musicSchema = require('../../../functions/database/models/musicSchema');

module.exports = (client) => {
    //Evento Tracks End
    client.player.events.on('playerFinish', async (queue) => {
        const guildId = queue.guild.id;
        const settings = await musicSchema.findOne({ guildId });

        if (settings && settings.musicSearchChannelId && settings.nowPlayingMessageId) {
            const channel = await client.channels.fetch(settings.musicSearchChannelId);
            if (!channel) return;

            try {
                const message = await channel.messages.fetch(settings.nowPlayingMessageId);

                const nowPlayingEmbed = new EmbedBuilder()
                    .setColor(parseInt('313850', 16))
                    .setTitle('Nada se está reproduciendo en este momento.')
                    .setDescription('La música se detuvo o la cola está vacía.')
                    //.setThumbnail('https://example.com/default_thumbnail.png')
                    .setFooter({ text: client.user.username, iconURL: `${client.user.displayAvatarURL()}` })

                await message.edit({ embeds: [nowPlayingEmbed] });
            } catch (error) {
                console.error('Error al editar el mensaje de finalización:', error);
            }
        }
    });
}