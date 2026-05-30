const { EmbedBuilder } = require('discord.js');
const { useQueue, useHistory } = require('discord-player');
const musicSchema = require('../../../functions/database/models/musicSchema');
module.exports = (client) => {
    //Cuando se reinicia el bot
    client.on('ready', async () => {
        console.log('Bot ha reiniciado, actualizando los mensajes de "Now Playing"...');
        // Obtener todas las configuraciones de música de la base de datos
        const allSettings = await musicSchema.find();
        for (const settings of allSettings) {
            const { guildId, musicSearchChannelId, nowPlayingMessageId } = settings;

            const guild = client.guilds.cache.get(guildId);
            const guildName = guild.name;

            try {
                // Buscar el canal de música y el mensaje "Now Playing"
                const channel = await client.channels.fetch(musicSearchChannelId).catch(console.error);
                if (!channel) {
                    console.log(`Canal de música no encontrado en guild: ${guildId}`);
                    continue;
                }
                const message = await channel.messages.fetch(nowPlayingMessageId).catch(console.error);
                if (!message) {
                    console.log(`Mensaje "Now Playing" no encontrado en guild: ${guildId}`);
                    continue;
                }
                // Crear embed de "Nada se está reproduciendo en este momento"
                const nowPlayingEmbed = new EmbedBuilder()
                    .setColor(parseInt('313850', 16))
                    .setTitle('Nada se está reproduciendo en este momento.')
                    .setDescription('La música se detuvo o la cola está vacía.')
                    .setFooter({ text: client.user.username, iconURL: `${client.user.displayAvatarURL()}` });
                // Actualizar el mensaje "Now Playing"
                await message.edit({ embeds: [nowPlayingEmbed] });
               // console.log(Actualizado el mensaje "Now Playing" en guild: ${guildId});
            } catch (error) {
                console.error(`Error al actualizar el mensaje en Name: ${guildName} - ID: ${guildId}:`, error);
            }
        }
    });
}