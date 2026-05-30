const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ChannelType, ComponentType, StringSelectMenuBuilder } = require('discord.js');
const musicSchema = require('../../functions/database/models/musicSchema'); // Esquema de configuración de música
const Trigger = require('../../functions/database/models/triggerSchema'); // Esquema de triggers
const { generateMusicControlButtons } = require('../../utils/commands/buttonUtils');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup_music')
        .setDescription('Configura el canal de búsqueda de música y sus controles.')
        .addStringOption(option =>
            option.setName('thumbnail')
                .setDescription('URL del thumbnail personalizado para este servidor')
                .setRequired(false)),
    async run({ interaction, client }) {
        try {
            // Verificar permisos de usuario
            if (!interaction.member.permissions.has('MANAGE_CHANNELS')) {
                return interaction.editReply({ content: 'No tienes permisos para ejecutar este comando.', ephemeral: true });
            }

            // Datos importantes
            const guild = interaction.guild;
            const member = interaction.user;
            const defaultThumbnail = "https://media.discordapp.net/attachments/1068657997406031874/1349317902817300510/thumbnailMusic.png?ex=67d2a9b9&is=67d15839&hm=37b73a66e6dd654bbf3d181dcfbd4eea077ca34c5b84582113b49085ebdd2ef1&=&format=webp&quality=lossless&width=648&height=648";
            const thumbnailUrl = interaction.options.getString('thumbnail') ? interaction.options.getString('thumbnail') : defaultThumbnail;

            // Cargar o crear la configuración de la guild en la BD
            let settings = await musicSchema.findOne({ guildId: guild.id });
            if (!settings) {
                settings = new musicSchema({
                    guildId: guild.id,
                    musicSearchChannelId: null, 
                    musicSearchMessageId: null,  
                    nowPlayingMessageId: null,   
                    thumbnailUrl: thumbnailUrl
                });
            }

            // Buscar o crear el canal de música
            let musicSearchChannel = guild.channels.cache.get(settings.musicSearchChannelId);
            if (!musicSearchChannel) {
                try {
                    musicSearchChannel = await guild.channels.create({
                        name: 'music-search',
                        type: ChannelType.GuildText,
                        topic: 'Simplemente pega un enlace y disfruta de la magia!.'
                    });
                    settings.musicSearchChannelId = musicSearchChannel.id;
                    await settings.save();
                } catch (error) {
                    console.error('Error al crear el canal de música:', error);
                    return interaction.editReply({ content: 'Hubo un problema al crear el canal de música.', ephemeral: true });
                }
            }   

            // Obtener los emojis personalizados del servidor
            const spotify = guild.emojis.cache.find(e => e.name === 'spotify') || '🟢';
            const youtube = guild.emojis.cache.find(e => e.name === 'youtube') || '🔴';
            const soundcloud = guild.emojis.cache.find(e => e.name === 'soundcloud') || '🟡';
            const musica = guild.emojis.cache.find(e => e.name === 'music') || '🎵';


            // Crear el embed principal
            const embed = new EmbedBuilder()
                .setColor(parseInt('313850', 16))
                .setAuthor({ name: guild.name, iconURL: guild.iconURL() })
                .setTitle(`Music Search ${musica}`)
                .setDescription(`**Envía un enlace de música y lo reproduciré automáticamente.**\n\n**Plataformas compatibles:**\n${spotify} Spotify | ${youtube} YouTube | ${soundcloud} SoundCloud`)
                .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
                .setTimestamp()
                .setImage(thumbnailUrl);

            const nowPlayingEmbed = new EmbedBuilder()
                .setColor(parseInt('313850', 16))
                .setTitle('No hay canciones reproduciéndose!.')
                .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
                .setDescription('Cuando una canción comience, la información aparecerá aquí.');

            // Crear los botones de control
            const [row1, row2, row3] = generateMusicControlButtons();

            // Enviar el mensaje de "now playing"
            const nowPlayingMessage = await musicSearchChannel.send({ embeds: [nowPlayingEmbed] });


            //INICIO MENU COLLECTOR

            // Cargar los triggers del servidor para el menú desplegable
            let triggersDoc = await Trigger.findOne({ guildId: guild.id });
            let triggerOptions = [];
            if (triggersDoc && triggersDoc.triggers.length > 0) {
                triggerOptions = triggersDoc.triggers.map(t => {
                    return {
                        label: t.trigger.length > 25 ? t.trigger.slice(0, 22) + '...' : t.trigger,
                        description: t.title ? (t.title.length > 50 ? t.title.slice(0, 47) + '...' : t.title) : 'Sin título',
                        value: t.url // Se usará para enviar al comando play
                    };
                });
            } else {
                triggerOptions = [{
                    label: 'Sin triggers',
                    description: 'No se han configurado triggers en este servidor.',
                    value: 'none'
                }];
            }

            // Crear el menú desplegable (select menu)
            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('music_trigger_menu')
                .setPlaceholder('Selecciona una palabra guardada para reproducir')
                .addOptions(triggerOptions);

            const menuRow = new ActionRowBuilder().addComponents(selectMenu);

            //INICIO FIN MENU COLLECTOR

            // Enviar el mensaje principal con embed, botones y el menú desplegable (todos anclados al mismo mensaje)
            const sentMessage = await musicSearchChannel.send({ 
                embeds: [embed], 
                components: [row1, row2, row3, menuRow] 
            });

            // Guardar los IDs de los mensajes en la BD
            settings.musicSearchMessageId = sentMessage.id;
            settings.nowPlayingMessageId = nowPlayingMessage.id;
            await settings.save();

            await interaction.editReply({ content: 'El canal de búsqueda de música ha sido configurado.', ephemeral: true });
        } catch (error) {
            console.error('Error en setup_music:', error);
            return interaction.editReply({ content: 'Hubo un error al configurar el canal de música.', ephemeral: true });
        }
    }
};
