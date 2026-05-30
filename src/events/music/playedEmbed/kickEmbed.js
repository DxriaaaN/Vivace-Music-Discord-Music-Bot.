const { EmbedBuilder } = require('discord.js');
const { useQueue, useHistory } = require('discord-player');
const musicSchema = require('../../../functions/database/models/musicSchema');

module.exports = (client) => {
    //Evento Kick o Disconect
    client.player.events.on('disconnect', async (queue) => {
        const guildId = queue.guild.id;
        const settings = await musicSchema.findOne({ guildId });
        if (settings && settings.musicSearchChannelId && settings.nowPlayingMessageId) {
            const channel = await client.channels.fetch(settings.musicSearchChannelId);
            if (!channel) return;

            try {
                const message = await channel.messages.fetch(settings.nowPlayingMessageId);

                const disconnectEmbed = new EmbedBuilder()
                    .setColor(parseInt('313850', 16))
                    .setTitle('Nada se está reproduciendo en este momento.')
                    .setDescription('El bot fue desconectado del canal de voz.')
                    //.setThumbnail('https://example.com/default_thumbnail.png')
                    .setFooter({ text: client.user.username, iconURL: `${client.user.displayAvatarURL()}` })

                await message.edit({ embeds: [disconnectEmbed] });
            } catch (error) {
                console.error('Error al editar el mensaje tras desconexión:', error);
            }
        }
    });
}