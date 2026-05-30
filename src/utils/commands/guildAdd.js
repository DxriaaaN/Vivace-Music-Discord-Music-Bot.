const { registerCommandsGuild } = require('../../functions/client/registerCommandsGuild');
const fs = require('fs');
const path = require('path');

module.exports = (client, commands) => {
    client.on('guildCreate', async (guild) => {
        // Datos del servidor
        const guildName = guild.name;

        try {
            console.log(`✅ El bot ha sido añadido a: ${guildName} (${guild.id})`);
            await registerCommandsGuild(client, guild.id, commands);

            // Verificar si el servidor tiene espacio para emojis
            if (!guild.features.includes('ANIMATED_ICON') && guild.emojis.cache.size >= 50) {
                console.log(`🚫 No hay espacio para emojis en ${guild.name}`);
                return;
            }

            // Ruta de los archivos de emojis
            const emojiFiles = [
                { name: 'spotify', file: 'spotify.png' },
                { name: 'youtube', file: 'yt.png' },
                { name: 'soundcloud', file: 'soundcloud.png' },
                { name: 'music', file: 'music.png' }
            ];

            for (const emoji of emojiFiles) {
                const emojiPath = path.join(__dirname, '../../../config/assets/', emoji.file);

                // Verificar si el archivo existe
                if (!fs.existsSync(emojiPath)) {
                    console.log(`❌ No se encontró el archivo: ${emoji.file}`);
                    continue;
                }

                // Subir el emoji al servidor
                const emojiUpload = await guild.emojis.create({
                    attachment: emojiPath,
                    name: emoji.name
                });

                console.log(`✅ Emoji subido: ${emoji.name} (${emojiUpload.id}) en ${guild.name}`);
            }

        } catch (error) {
            console.error(`⚠️ Error en guildCreate para ${guildName}:`, error);
        }
    });
};
