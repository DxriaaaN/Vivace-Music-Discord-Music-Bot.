const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const validUrl = require('valid-url');
const Trigger = require('../../functions/database/models/triggerSchema');
const { actualizarMenusTriggers } = require('../../events/music/interactions/musicCollector')
const { getUrlInfo, getUrlYoutube, getUrlYoutubePlaylist, getUrlSpotify, getUrlYoutubeBe } = require('../../utils/commands/triggers/getUrlInfo');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('add_trigger')
        .setDescription('Agrega una nueva palabra clave y un enlace asociado')
        .addStringOption(option =>
            option.setName('trigger')
                .setDescription('Nombre para tu lista o cancion favorita')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('url')
                .setDescription('El enlace de la canción o playlist')
                .setRequired(true)),
    async run({ client, interaction }) {
        try {
            const trigger = interaction.options.getString('trigger').toLowerCase();

            const url = interaction.options.getString('url');

            const guildId = interaction.guild.id;

            //Verificar Autenticidad URL
            if (!validUrl.isUri(url)) return interaction.editReply('El enlace proporcionado no es válido.');

            //Verificar BD Trigger Existente
            // Buscar Guild Existente
            let triggerDoc = await Trigger.findOne({ guildId }).catch(error => {
                console.error('Hubo un problema al buscar trigger en BD', error);
                throw error;
            });

            //Crear Trigger Schema SI no existe trigger.
            if (!triggerDoc) {
                triggerDoc = new Trigger({
                    guildId,
                    triggers: [
                    ],
                })            
            }
                
            // Revisar Trigger Coincidencia.
            const existingTrigger = triggerDoc.triggers.find(t => t.trigger === trigger);
            if (existingTrigger) return interaction.editReply(`La palabra elegida \*\*${trigger}\*\* ya existe. Prueba con otra o revisa las existentes con \`\`/list_triggers\`\``)



            //Verificar Tipo de Fuente (Source)
            const sourceUrl = await getUrlInfo(url);
            console.log(sourceUrl);
            const source = sourceUrl

            //Switch Source If/Else If 
            const optionUrl = source;
            if (optionUrl === 'Youtube Video') {
                try {
                    //Api Rest Info URL
                    const infoUrl = await getUrlYoutube(url);

                    const titleTrigger = infoUrl.title;
                    const urlTrigger = infoUrl.url;
                    const authorTrigger = interaction.user

                    //Guardar BD
                    await saveBDSupported(trigger, urlTrigger, titleTrigger, authorTrigger, optionUrl).catch(error => {
                        console.error('Error al guardar BD Soportada Youtube Video', error);
                        throw error;
                    });;

                    //Generar Embed
                    const videoYTEmbed = generateEmbed(trigger, urlTrigger, titleTrigger, authorTrigger, optionUrl, client);

                    //Devolver EMBED
                    await interaction.editReply({ embeds: [videoYTEmbed] });
                } catch (error) {
                    console.error('Ocurrio un error en YT Video', error);
                    throw error;
                }

            }else if(optionUrl === 'Youtube Corto') {
                try {
                    //Api Rest Info URL
                    const infoUrl = await getUrlYoutubeBe(url);

                    const titleTrigger = infoUrl.title;
                    const urlTrigger = infoUrl.url;
                    const authorTrigger = interaction.user

                    //Guardar BD
                    await saveBDSupported(trigger, urlTrigger, titleTrigger, authorTrigger, optionUrl).catch(error => {
                        console.error('Error al guardar BD Soportada Youtube Video', error);
                        throw error;
                    });;

                    //Generar Embed
                    const videoYTBe = generateEmbed(trigger, urlTrigger, titleTrigger, authorTrigger, optionUrl, client);

                    //Devolver EMBED
                    await interaction.editReply({ embeds: [videoYTBe] });
                } catch (error) {
                    console.error('Ocurrio un error en YT Corto', error);
                    throw error;
                }
            }else if (optionUrl === 'Youtube Playlist') {
                try {
                    //Api Rest Info URL
                    const infoUrl = await getUrlYoutubePlaylist(url);

                    const titleTrigger = infoUrl.title;
                    const urlTrigger = infoUrl.url;
                    const authorTrigger = interaction.user

                    //Guardar BD
                    await saveBDSupported(trigger, urlTrigger, titleTrigger, authorTrigger, optionUrl).catch(error => {
                        console.error('Error al guardar BD Soportada Youtube Playlist', error);
                        throw error;
                    });;

                    //Generar Embed
                    const playlistYTEmbed = generateEmbed(trigger, urlTrigger, titleTrigger, authorTrigger, optionUrl, client);

                    //Devolver EMBED
                    await interaction.editReply({ embeds: [playlistYTEmbed] });
                } catch (error) {
                    console.error('Ocurrio un error en YT Playlist', error);
                    throw error;
                }

            } else if (optionUrl === 'Spotify') {
                try {
                    //Api Rest Info URL
                    const infoUrl = await getUrlSpotify(url);
                    const titleTrigger = infoUrl.title;
                    const urlTrigger = infoUrl.url;
                    const authorTrigger = interaction.user

                    //Guardar BD
                    await saveBDSupported(trigger, url, titleTrigger, authorTrigger, optionUrl).catch(error => {
                        console.error('Error al guardar BD Soportada Spotify', error);
                        throw error;
                    });;

                    //Generar Embed
                    const spotifyEmbed = generateEmbed(trigger, urlTrigger, titleTrigger, authorTrigger, optionUrl, client);

                    //Devolver EMBED
                    await interaction.editReply({ embeds: [spotifyEmbed] });
                } catch (error) {
                    console.error('Ocurrio un error en Spotify', error);
                    throw error;
                }

            } else if (optionUrl === 'SoundCloud') {
                try {
                    //Api Rest Info URL
                    const infoUrl = await getUrlSpotify(url);

                    const titleTrigger = infoUrl.title;
                    const urlTrigger = infoUrl.url;
                    const authorTrigger = interaction.user

                    //Guardar BD
                    await saveBDSupported(trigger, url, titleTrigger, authorTrigger, optionUrl).catch(error => {
                        console.error('Error al guardar BD Soportada SoundCloud', error);
                        throw error;
                    });

                    //Generar Embed
                    const soundCloudEmbed = generateEmbed(trigger, urlTrigger, titleTrigger, authorTrigger, optionUrl, client);

                    //Devolver EMBED
                    await interaction.editReply({ embeds: [soundCloudEmbed] });
                } catch (error) {
                    console.error('Ocurrio un error en SoundCloud', error);
                    throw error;
                }
            } else if (optionUrl === 'Desconocido') {
                try {
                    //Informacion Default 
                    const urlTrigger = url;
                    const titleTrigger = 'Desconocido'
                    const authorTrigger = interaction.user
                    const palabraTrigger = trigger;

                    //Guardar BD
                    await saveBDUnsopported(palabraTrigger, urlTrigger, authorTrigger, optionUrl).catch(error => {
                        console.error('Error al guardar BD No Soportada en Desconocido', error);
                        throw error;
                    })

                    //Generar Embed
                    const unsupportedEmbed = generateEmbed(palabraTrigger, urlTrigger, titleTrigger, authorTrigger, optionUrl, client);

                    //Devolver EMBED
                    await interaction.editReply({ embeds: [unsupportedEmbed] });
                } catch (error) {
                    console.error('Ocurrio un error en fuente no soportada', error);
                    throw error;
                }
            };
            
            //ACTUALIZAR MENSAJE TRIGGER
            try {
                await actualizarMenusTriggers(client, guildId);
                console.log(`Menu de triggers actualizado despues de agregar: ${trigger}` )
            }catch(error){
                console.error('Error al actualizar el menu de triggers', error);
            }


            //Funcion BD Soportados;
            async function saveBDSupported(trigger, url, title, author, source) {

                // Agregar el nuevo trigger
                triggerDoc.triggers.push({
                    trigger: trigger,
                    url: url,
                    title: title,
                    author: author.id,
                    source: source,
                });

                await triggerDoc.save().then(console.log(`Fue posible guardar el nuevo trigger ${trigger} - ${url}`)).catch(error => {
                    console.error('No fue posible agregar el nuevo Trigger BD', error);
                    throw error;
                });
            };

            //Funcion BD No Soportados;
            async function saveBDUnsopported(trigger, url, author, source) {

                // Agregar el nuevo trigger
                triggerDoc.triggers.push({
                    trigger: trigger,
                    url: url,
                    title: 'Desconocido',
                    author: author.id,
                    source: 'Desconocido',
                });
                await triggerDoc.save().catch(error => {
                    console.error('No fue posible agregar el nuevo Trigger BD', error);
                    throw error;
                });

            };

            //Funcion EmbedSupport & No Support
            function generateEmbed(trigger, url, title, author, source, client) {
                try {
                    const validateSource = source;
                    if (validateSource === 'Spotify' || validateSource === 'Youtube Video' || validateSource === 'Youtube Playlist' || validateSource === 'Youtube Corto' || validateSource === 'SoundCloud') {

                        //Generar Titulo Embebido + Mencion Usuario.
                        const titleLink = `[${title}](${url})`;
                        const authorMention = `<@${author.id}>`

                        //Embed Source Soportadas
                        const embedSupported = new EmbedBuilder()
                            .setColor(parseInt('313850', 16))
                            .setTitle('Trigger Agregado')
                            .setDescription(`Aqui tienes un breve detalle de lo que agregaste!.`)
                            .addFields([
                                { name: 'Trigger', value: `\`\`${trigger}\`\`` },
                                { name: 'URL', value: `${titleLink}` },
                                { name: 'Autor', value: `${authorMention}` },
                                { name: 'Fuente', value: `\`\`${source}\`\`` }
                            ])
                            .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
                            .setTimestamp();

                        return embedSupported;
                    } else if (validateSource === 'Desconocido') {

                        //Generar Mencion Usuario.
                        const authorMention = `<@${author.id}>`

                        // Enviar confirmación al usuario
                        const embedUnsuported = new EmbedBuilder()
                            .setColor(parseInt('313850', 16))
                            .setTitle('Trigger Agregado')
                            .setDescription(`Aqui tienes un breve detalle de que agregaste!.`)
                            .addFields([
                                { name: 'Trigger', value: `\`\`${trigger}\`\`` },
                                { name: 'Url', value: `${url}` },
                                { name: 'Autor', value: `${authorMention}` }
                            ])
                            .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
                            .setTimestamp();

                        return embedUnsuported;
                    } else {
                        console.log('No fue posible generar el embed.');
                        interaction.editReply('Ocurrio un error al determinar la fuente del link.');
                        return;
                    }
                } catch (error) {
                    console.error('Ocurrio un error al generar embed apropiado', error);
                    return;
                }
            };

        } catch (error) {
            console.error('Hubo un error en addTrigger', error);
            return interaction.editReply('No fue posible agregar tu lista/palabra. Intentalo de nuevo');
        }
    },
};
//PENDIENTE DE FIX TUKI
