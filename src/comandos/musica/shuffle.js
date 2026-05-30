const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { useQueue } = require("discord-player");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("shuffle")
        .setDescription("Mezcla la lista de reproducción actual"),

    run: async ({ client, interaction }) => {
        try {
            //Usuario y Mencion
            const { user: author } = interaction;
            const userMention = `<@${author.id}>`;

            //Queue y Canal/Cliente
            const queue = useQueue(interaction.guildId);
            const userVoiceChannel = interaction.member.voice.channel;
            const clientVoiceChannel = interaction.guild.members.me.voice.channel.id;
            const userVoiceChannelID = userVoiceChannel.id;


            // Verificar si el usuario está en un canal de voz
            if (!userVoiceChannel) {
                await interaction.editReply({ content: `${userMention} Debes unirte a un canal de voz para usar este comando`, ephemeral: true });
                return;
            }

            // Verificar si hay una canción en cola
            if (!queue || !queue.currentTrack) {
                await interaction.editReply({ content: `${userMention} No hay una cancion reproduciendose actualmente`, ephemeral: true });
                return;
            }

            // Verificar si el usuario está en el mismo canal de voz que el bot
            if (queue || queue.currentTrack) {
                if (clientVoiceChannel != userVoiceChannelID) {
                    await interaction.editReply({ content: `${userMention} No estas en el mismo canal que yo.` })
                    return;
                };
            };

            // Mezclar la cola
            const songsData = queue.tracks.size;
            queue.tracks.shuffle();
            const shuffleEmbed = new EmbedBuilder()
                .setColor(parseInt('313850', 16))
                .setTitle(' Lista de reproducción mezclada 🎶')
                .setDescription(`${userMention}La lista de reproducción ha sido mezclada exitosamente.`)
                .addFields(
                    { name: `Nº Canciones`, value: `${songsData ?? '0'}`, inline: true }
                )
                .setFooter({ text: client.user.username, iconURL: `${client.user.displayAvatarURL()}` })
                .setTimestamp();
            await interaction.editReply({ embeds: [shuffleEmbed] });
        } catch (error) {
            console.error(error);
            await interaction.editReply('Ocurrió un error al intentar mezclar la lista de reproducción.');
        }
    },
};

