const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Tu ID de usuario para restringir el uso del comando
const DEVELOPER_ID = '432215088686956565';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addemojis')
        .setDescription('Sube los emojis personalizados al servidor actual (solo para el developer).')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator), // Solo admins pueden usarlo, pero validamos manualmente el developer
    async run( {interaction} ) {
        // Verifica si el usuario que ejecuta el comando es el desarrollador
        if (interaction.member.id !== DEVELOPER_ID) {
            return interaction.editReply({ content: '🚫 No tienes permiso para usar este comando.', ephemeral: true });
        }

        const guild = interaction.guild;
        if (!guild) return interaction.editReply({ content: '❌ Este comando solo puede usarse en un servidor.', ephemeral: true });

        try {
            // Verificar si hay espacio para emojis
            if (!guild.features.includes('ANIMATED_ICON') && guild.emojis.cache.size >= 50) {
                return interaction.editReply({ content: '🚫 No hay espacio para más emojis en este servidor.', ephemeral: true });
            }

            // Lista de emojis a subir
            const emojiFiles = [
                { name: 'spotify', file: 'spotify.png' },
                { name: 'youtube', file: 'yt.png' },
                { name: 'soundcloud', file: 'soundcloud.png' },
                { name: 'music', file: 'music.png' }
            ];

            let uploadedEmojis = [];

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

                uploadedEmojis.push(`${emojiUpload} (${emojiUpload.name})`);
            }

            if (uploadedEmojis.length === 0) {
                return interaction.editReply({ content: '⚠️ No se subieron emojis. Revisa si ya existen o si hay espacio disponible.', ephemeral: true });
            }

            return interaction.editReply({
                content: `✅ Emojis subidos con éxito:\n${uploadedEmojis.join('\n')}`,
                ephemeral: false
            });

        } catch (error) {
            console.error('⚠️ Error al subir emojis:', error);
            return interaction.editReply({ content: '❌ Hubo un error al subir los emojis.', ephemeral: true });
        }
    }
};
