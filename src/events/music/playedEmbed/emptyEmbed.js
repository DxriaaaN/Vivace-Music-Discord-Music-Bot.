const { EmbedBuilder } = require('discord.js');
const { useQueue, useHistory } = require('discord-player');
const musicSchema = require('../../../functions/database/models/musicSchema');

module.exports = (client) => {
    client.player.events.on('channelEmpty', async (queue) => {
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
                    .setDescription('El canal de voz está vacío, por lo que la música se detuvo.')
                    .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() });

                await message.edit({ embeds: [nowPlayingEmbed] });
            } catch (error) {
                console.error('Error al actualizar el embed tras canal vacío:', error);
            }
        }
    });
}