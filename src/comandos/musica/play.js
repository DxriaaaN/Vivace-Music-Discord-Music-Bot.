const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, VoiceChannel } = require('discord.js');
const { Track, QueryType, useMainPlayer, useQueue } = require('discord-player');
const { getUrlSpotify } = require('../../utils/commands/triggers/getUrlInfo');
const { Result } = require('@sapphire/shapeshift');
const { state } = require('../../utils/client/mutedState');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Reproduce una canción, playlist o álbum <3')
        .addStringOption(option =>
            option.setName('url')
                .setDescription('Busca tu canción favorita <3')
                .setRequired(true)),

    run: async ({ client, interaction }) => {

        try {
            // Variables iniciales
            // const MAX_QUEUE_SIZE = 1000;
            const player = useMainPlayer();
            const userVoiceChannel = interaction.member.voice.channel;
            const queue = useQueue(interaction.guildId);
            const { user: author } = interaction;
            // const guildId = interaction.guildId
            const userMention = `<@${author.id}>`;

            // Verificar que el usuario esté en un canal de voz
            if (!userVoiceChannel) {
                return interaction.editReply({
                    embeds: [new EmbedBuilder()
                        .setColor(parseInt('313850', 16))
                        .setDescription('Necesitas estar en un canal de voz para usar este comando :D')
                        .setFooter({ text: client.user.username, iconURL: `${client.user.displayAvatarURL()}` })
                        .setTimestamp()]
                });
            }

            // Obtener la canción solicitada
            const song = interaction.options.getString('url');

            // Comprobar si se proporcionó una canción
            if (!song) {
                await interaction.editReply({
                    embeds: [new EmbedBuilder()
                        .setColor(parseInt('313850', 16))
                        .setDescription(`El enlace ingresado no es válido, por favor intenta de nuevo ${userMention}`)
                        .setFooter({ text: client.user.username, iconURL: `${client.user.displayAvatarURL()}` })
                        .setTimestamp()]
                });
                return;
            }

            // Comprobar si el bot y el usuario están en el mismo canal de voz
            if (queue && queue.isPlaying()) {
                let interaccionuser = interaction.member.voice.channel.id;
                let interaccionclient = interaction.guild.members.me.voice.channel.id;
                if (interaccionclient != interaccionuser) {
                    await interaction.channel.send(`${userMention} Debes estar en el mismo canal que yo para usar play.`);
                    return;
                }
            }

            // Verificar si el bot está en un canal de voz diferente y si la cola está vacía
            const botVoiceChannel = interaction.guild.members.me.voice.channel;
            if (botVoiceChannel && botVoiceChannel.id !== userVoiceChannel.id) {
                if (!queue || !queue.isPlaying() || queue.tracks.size === 0) {
                    await interaction.guild.members.me.voice.disconnect();
                    await player.voiceUtils.join(userVoiceChannel);
                } else {
                    return interaction.editReply({
                        embeds: [new EmbedBuilder()
                            .setColor(parseInt('313850', 16))
                            .setDescription(`${userMention} Ya estoy reproduciendo música en otro canal. Únete a mi canal de voz o espera a que termine.`)
                            .setFooter({ text: client.user.username, iconURL: `${client.user.displayAvatarURL()}` })
                            .setTimestamp()]
                    });
                }
            }

            // Al inicio del comando, antes de cualquier lógica
            if (state.isMuted) {
                await player.voiceUtils.join(userVoiceChannel);
                return interaction.channel.send('🔇 Estoy muteado en el servidor. Esperá a que un moderador me desmutee.');
            }


            let embed = new EmbedBuilder()
                .setColor(parseInt('313850', 16))
                .setDescription('Estoy buscando lo que pediste >.<')
                .setTimestamp()
                .setFooter({ text: client.user.username, iconURL: `${client.user.displayAvatarURL()}` });

            const msg = await interaction.editReply({ embeds: [embed], fetchReply: true });

            try {
                // Identificadores de Enlaces (Origen)

                // Definir la expresión regular para enlaces
                const linkRegex = /^(http|https):\/\/[^ "]+$/;

                //YoutubeMix (Nativo de Youtubei, se mantiene el regex por si hay cambios en Youtube)
                // const youtubeMixRegex = /^https?:\/\/(www\.)?youtube\.com\/watch\?v=[^&]+&list=RD[^&]+(&|$)/;

                //SoundCloud (Fuera de Servicio por cambios en SoundCloud, se mantiene el regex por si vuelven a funcionar)
                // const soundcloudTrackRegex = /^https?:\/\/(www\.)?soundcloud\.com\/[^\/]+\/[^\/]+(?:\?.*)?$/i;
                // const soundcloudPlaylistRegex = /^https?:\/\/(www\.)?soundcloud\.com\/[^\/]+\/sets\/[^\/]+(?:\?.*)?$/i;

                //Apple (Fuera de Servicio por cambios en Apple Music, se mantiene el regex por si vuelven a funcionar)
                // const appleSong = /^https?:\/\/(?:music|itunes)\.apple\.com\/(?:[a-zA-Z]{2,3}\/)?album\/[^\/]+\/\d+\?i=\d+.*$/i;
                // const appleAlbum = /^https?:\/\/(?:music|itunes)\.apple\.com\/(?:[a-zA-Z]{2,3}\/)?album\/[^\/]+\/\d+.*$/i;
                // const applePlaylist = /^https?:\/\/(?:music|itunes)\.apple\.com\/(?:[a-zA-Z]{2,3}\/)?playlist\/[^\/]+\/[a-zA-Z0-9.\-]+.*$/i;

                //Spotify
                const spotifySongs = /^https?:\/\/(?:www\.)?open\.spotify\.com\/(?:intl-\w{2}\/|intl-es\/)?(?:track\/\S+|playlist\/\S+|album\/\S+)/;

                let research;

                //COMPRUEBA TEXTO
                if (!linkRegex.test(song)) {
                    // Si no es un enlace, se asume que es una búsqueda de texto
                    research = await player.search(song, {
                        requestedBy: interaction.member,
                        searchEngine: QueryType.AUTO_SEARCH,
                    });

                    if (!research.hasTracks()) {
                        return interaction.editReply({
                            embeds: [new EmbedBuilder()
                                .setColor(parseInt('313850', 16))
                                .setDescription('No he podido encontrar resultados 😔')
                                .setTimestamp()
                                .setFooter({ text: client.user.username, iconURL: `${client.user.displayAvatarURL()}` })
                            ]
                        });
                    }

                    // Presentar opciones al usuario
                    embed = new EmbedBuilder()
                        .setColor(parseInt('313850', 16))
                        .setTitle('Escribe en el chat el número de la canción que quieres')
                        .setDescription('De no ingresar nada, se elegirá la primera opción.')
                        .setTimestamp()
                        .setFooter({ text: client.user.username, iconURL: `${client.user.displayAvatarURL()}` });

                    const choices = research.tracks.slice(0, 5);
                    choices.forEach((track, index) => {
                        embed.addFields(
                            { name: `Opción ${index + 1}: ${track.title}`, value: `Por: ${track.author}` },
                            { name: 'Duración:', value: `${track.duration}`, inline: true }
                        );
                    });

                    await msg.edit({ embeds: [embed] });

                    const filter = (m) => m.author.id === interaction.user.id;
                    try {
                        const collected = await interaction.channel.awaitMessages({ filter, max: 1, time: 10000, errors: ['time'] });
                        const responseMessage = collected.first();
                        const choice = parseInt(responseMessage.content);
                        if (isNaN(choice) || choice < 1 || choice > choices.length) {
                            research.tracks = [choices[0]];
                        } else {
                            research.tracks = [choices[choice - 1]];
                        }
                        responseMessage.delete();
                    } catch {
                        research.tracks = [choices[0]];
                    }
                } else { //MANEJADOR DE ENLACES UNICAMENTE.
                    try {

                        // Si es un enlace, determinar el 'searchEngine' POR DEFAULT.
                        let searchEngine = QueryType.AUTO;


                        /*
                        //Soundcloud Music (Fuera de Servicio Extractor Roto)
                            try {
                                if (soundcloudTrackRegex.test(song)) {
                                    searchEngine = QueryType.SOUNDCLOUD_TRACK;
                                } else if (soundcloudPlaylistRegex.test(song)) {
                                    searchEngine = QueryType.SOUNDCLOUD_PLAYLIST;
                                }
                            } catch (error) {
                                return message.channel.send('Reproduce/Agrega una cancion antes de iniciar la reproduccion de Soundcloud.');
                            }
                            */

                        /*
                        //Apple Music (Fuera de Servicio Extractor Roto)
                        if (appleSong.test(song)) {
                            searchEngine = QueryType.APPLE_MUSIC_SONG;
                        } else if (appleAlbum.test(song)) {
                            searchEngine = QueryType.APPLE_MUSIC_ALBUM;
                        } else if (applePlaylist.test(song)) {
                            searchEngine = QueryType.APPLE_MUSIC_PLAYLIST;
                        }
                        */

                        // Realizar la búsqueda con el 'searchEngine' DEFAULT EN CASO DE NO CUMPLIRSE LOS ANTERIORES.
                        research = await player.search(song, {
                            requestedBy: interaction.member,
                            searchEngine: searchEngine,
                        });
                        //Si no se pudo encontrar con ninguno de los dos metodos anteriores.
                        if (!research.hasTracks()) {
                            embed = new EmbedBuilder()
                                .setColor(parseInt('313850', 16))
                                .setDescription('No pude encontrar lo que me pediste')
                                .setFooter({ text: client.user.username, iconURL: `${client.user.displayAvatarURL()}` })
                                .setTimestamp();
                            await msg.edit({ embeds: [embed] });
                            return;
                        }
                    } catch (error) {
                        console.log(error);
                    }
                }

                // Límites de duración y tamaño de cola
                const MAX_TRACK_DURATION = 3 * 60 * 60; // 3 horas en segundos. DURACION MAXIMA DE VIDEO INDIVIDUAL (BUFFER SIZE Y WATERMARK DINAMICO SEGUN DURACION. // MEMORIA / REFACTORIZAR BD.)
                const MAX_QUEUE_SIZE = 1000; // LIMITE DE CANCIONES EN LA QUEUE. (MEMORIA / REFACTORIZAR BD POR SERVIDOR (GUILD_ID)) ----> musicSchema (CREACION DE CANAL)

                // Función para convertir duración en formato "HH:MM:SS" o "MM:SS" a segundos  ----> REFACTORIZAR UTILS
                function convertDurationToSeconds(duration) {
                    // MANEJAR DURACIONES EN FORMATO "HH:MM:SS", "MM:SS" O "SS"
                    const parts = duration.split(':').map(Number);

                    if (parts.length === 3) {
                        // Formato: HH:MM:SS
                        return parts[0] * 3600 + parts[1] * 60 + parts[2];
                    } else if (parts.length === 2) {
                        // Formato: MM:SS
                        return parts[0] * 60 + parts[1];
                    }
                    return 0;
                }

                // Add this check after you get the research result but before playing/adding to queue
                // Función auxiliar MUY agresiva para reducir memoria
                const getUltraLowMemoryOptions = (durationStr) => {
                    const seconds = convertDurationToSeconds(durationStr);
                    const minutes = seconds / 60;

                    if (minutes > 60) { // Videos >1h
                        return {
                            waterMark: 1 << 24, // 1MB
                            buffering: 35000,   // 10 segundos
                            volume: 50
                        };
                    } else if (minutes > 30) { // Videos >30min
                        return {
                            waterMark: 1 << 28, // 2MB
                            buffering: 35000,   // 15 segundos
                            volume: 50
                        };
                    } else if (minutes > 10) { // Videos >5min
                        return {
                            waterMark: 1 << 30, // 4MB
                            buffering: 35000,   // 25 segundos
                            volume: 50
                        };
                    }

                    return {
                        waterMark: 1 << 22, // 4MB para videos cortos
                        buffering: 30000,   // 30 segundos
                        volume: 50
                    };
                };

                if (research && research.tracks) {
                    // Filter out tracks that exceed the duration limit
                    const filteredTracks = research.tracks.filter(track => {
                        const durationInSeconds = convertDurationToSeconds(track.duration);
                        return durationInSeconds <= MAX_TRACK_DURATION;
                    }).map(track => {
                        const options = getUltraLowMemoryOptions(track.duration);
                        track._dynamicWaterMark = options.waterMark;
                        track._bufferingTimeout = options.buffering;
                        track._volume = options.volume;
                        return track;
                    });

                    if (filteredTracks.length === 0 && research.tracks.length > 0) {
                        return await msg.edit({
                            embeds: [new EmbedBuilder()
                                .setColor(parseInt('313850', 16))
                                .setDescription('Lo siento, no pude encontrar lo que buscaste o el video supera las 3H')
                                .setTimestamp()
                                .setFooter({ text: client.user.username, iconURL: `${client.user.displayAvatarURL()}` })
                            ]
                        });
                    }
                    // Update research with filtered tracks
                    research.tracks = filteredTracks;
                }

                
                if (research?.tracks?.length + (queue?.size ?? 0) > MAX_QUEUE_SIZE) {
                    return await msg.edit({
                        embeds: [new EmbedBuilder()
                            .setColor(parseInt('313850', 16))
                            .setDescription(`No puedo agregar mas de ${MAX_QUEUE_SIZE} canciones de una playlist.`)
                            .setTimestamp()
                            .setFooter({ text: client.user.username, iconURL: `${client.user.displayAvatarURL()}` })
                        ]
                    });
                }

                // Reproducir la canción o agregarla a la cola
                const res = await player.play(interaction.member.voice.channel.id, research, {
                    nodeOptions: {
                        metadata: {
                            channel: interaction.channel,
                            client: interaction.guild.members.me,
                            requestedBy: interaction.user,
                            guild: interaction.guild,
                        },
                        volume: 50,
                        maxSize: MAX_QUEUE_SIZE,
                        bufferingTimeout: research.tracks?.[0]?._bufferingTimeout || 25000, // MUY reducido
                        highWaterMark: research.tracks?.[0]?._dynamicWaterMark || 1 << 22, // 2MB por defecto
                        leaveOnStop: true,
                        leaveOnStopCooldown: 0,
                        leaveOnEnd: true,
                        leaveOnEndCooldown: 60000,
                        leaveOnEmpty: true,
                        leaveOnEmptyCooldown: 60000,
                        skipOnNoStream: true,
                        disableVolume: false,
                        smoothVolume: true
                    },

                })

                //Ver cancion actual en consola
                console.log(`Reproduciendo [${res.track.title}] en el canal [${interaction.member.voice.channel.name}]`);

                //Sistema de Radio URL
                const radioUrls = [
                    'https://live.truckers.fm/?1710903442447',
                    'https://secure.streaming01.dwservers.net/8100/'
                ];

                if (radioUrls.includes(song)) {
                    embed = new EmbedBuilder()
                        .setColor(parseInt('313850', 16))
                        .setTitle('Reproduciendo Radio')
                        .setDescription(`Reproduciendo desde: [${song === radioUrls[0] ? 'Truckers FM' : 'Trance FM'}]`)
                        .setFooter({ text: client.user.username, iconURL: `${client.user.displayAvatarURL()}` })
                        .setTimestamp();
                }
                else if (spotifySongs.test(song)) {

                    const infoUrl = await getUrlSpotify(song);
                    res.track.thumbnail = infoUrl.image;
                    embed = new EmbedBuilder()
                        .setColor(parseInt('313850', 16))
                        .setTitle(`${!queue?.currentTrack ? 'Ahora estoy reproduciendo' : 'Canción agregada a la lista'}`)
                        .setThumbnail(res.track.thumbnail)
                        .setDescription(`[${res.track.title}](${res.track.url})\n${res.track.author}`)
                        .setFooter({ text: client.user.username, iconURL: `${client.user.displayAvatarURL()}` })
                        .setTimestamp();
                }
                else {
                    embed = new EmbedBuilder()
                        .setColor(parseInt('313850', 16))
                        .setTitle(`${!queue?.currentTrack ? 'Ahora estoy reproduciendo' : 'Canción agregada a la lista'}`)
                        .setThumbnail(res.track.thumbnail)
                        .setDescription(`[${res.track.title}](${res.track.url})\n${res.track.author}`)
                        .setFooter({ text: client.user.username, iconURL: `${client.user.displayAvatarURL()}` })
                        .setTimestamp();
                }

                // Playlist/Album encontrado
                if (res.searchResult?.playlist) {
                    embed
                        .setTitle('Playlist/Álbum Encontrado ')
                        .setColor(parseInt('313850', 16))
                        .setThumbnail(res?.searchResult?.playlist?.thumbnail || res?.track.thumbnail || 'https://imgur.com/diFr6ky.png')
                        .setDescription(`Se agregaron con exito las canciones.`)
                        .setFooter({ text: client.user.username, iconURL: `${client.user.displayAvatarURL()}` })
                        .addFields(
                            { name: 'Primera Cancion: ', value: `${res?.searchResult?.playlist?.tracks[0]?.title} - ${res?.searchResult?.playlist?.tracks[0]?.author}` },
                            { name: 'Título:', value: `[${res.searchResult.playlist.title}](${res.searchResult.playlist.url})` }
                        );
                }

                await msg.edit({ embeds: [embed] });
            } catch (error) {
                console.error(error);
                return await msg.edit({
                    embeds: [new EmbedBuilder()
                        .setColor(parseInt('313850', 16))
                        .setDescription('No he podido encontrar lo que solicitaste :(')
                        .setTimestamp()
                        .setFooter({ text: client.user.username, iconURL: `${client.user.displayAvatarURL()}` })
                    ]
                });
            }
        } catch (error) {
            console.warn('Error al ejecutar el comando', error);
            if (error.code === 10008) {
                console.warn('Advertencia: No se pudo enviar la respuesta porque el mensaje fue eliminado');
                //await interaction.channel.send('Lo siento, no pude leer tu cancion, enviala nuevamente.').catch(error => {console.log('No fue posible reproducir la cancion', error)})
                return; // Importante: salir de la función para evitar intentar editar el mensaje eliminado
            } else {
                try {
                    await interaction.editReply({ content: 'No fue posible reproducir la canción', ephemeral: true });
                } catch (secondError) {
                    console.warn('No se pudo enviar el mensaje de error', secondError);
                    //await interaction.channel.send('Lo siento ocurrio un error inesperado, intentalo de nuevo!').catch(error => {console.log('No fue posible reproducir la cancion', error)})
                }
                return;
            }
        }
    },
};