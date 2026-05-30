const { EmbedBuilder } = require('discord.js');
const { useQueue, useHistory } = require('discord-player');
const musicSchema = require('../../../functions/database/models/musicSchema');

module.exports = (client) => {
    //Evento Track Start
    client.player.events.on('playerStart', async (queue) => {

        //GuldId Y Cancion Actual
        const guildId = queue.guild.id;
        const track = queue.currentTrack;

        //Cargar Configuracion Schema Music
        const settings = await musicSchema.findOne({ guildId });

        //Verifica ajustes y id de canales.
        if (settings && settings.musicSearchChannelId && settings.nowPlayingMessageId) {

            //Busca el canal en base al id existente.
            const channel = await client.channels.fetch(settings.musicSearchChannelId);

            if (!channel) return;

            try {
                //Busca el mensaje por ID
                const message = await channel.messages.fetch(settings.nowPlayingMessageId);

                //Asigna el proximo tema
                const nextTrack = useHistory(guildId)?.nextTrack?.title || 'Ninguno'; // Verificar si `nextTrack` existe
                const songsData = queue.tracks.data;

                const nowPlayingEmbed = new EmbedBuilder()
                    .setColor(parseInt('313850', 16))
                    .setTitle(`Reproduciendo ahora: ${track.title}`)
                    .addFields(
                        { name: `🎤 Artista:`, value: `${track.author}`, inline: true },
                        { name: `⌛ Duración:`, value: `${track.duration}`, inline: true },
                        { name: `🔤 En cola:`, value: `${songsData.length}`, inline: true },
                        { name: `Pedido por:`, value: `${track.requestedBy}`, inline: true },
                        { name: `Siguiente:`, value: `${nextTrack}`, inline: true }
                    )
                    .setThumbnail(track.thumbnail)
                    .setFooter({ text: client.user.username, iconURL: `${client.user.displayAvatarURL()}` })
                    .setTimestamp();

                await message.edit({ embeds: [nowPlayingEmbed] });

            } catch (error) {
                console.log('Error al editar el mensaje de inicio', error);
            }
        };
    });
}