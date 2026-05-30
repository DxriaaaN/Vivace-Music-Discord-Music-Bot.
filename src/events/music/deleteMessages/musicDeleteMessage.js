const musicSchema = require('../../../functions/database/models/musicSchema'); // Importar el esquema de Mongoose

module.exports = (client) => {
    // Función para chequear y limpiar mensajes periódicamente
    async function checkAndCleanMessages() {
        try {
            // Buscar todas las configuraciones de la base de datos
            const allSettings = await musicSchema.find();

            for (const guildSettings of allSettings) {
                const { guildId, musicSearchChannelId, musicSearchMessageId, nowPlayingMessageId } = guildSettings;

                // Asegurarse de que los IDs de los mensajes y del canal estén disponibles antes de continuar
                if (!musicSearchChannelId || !musicSearchMessageId || !nowPlayingMessageId) {
                    console.log(`Saltando limpieza en guild ${guildId}: configuración incompleta`);
                    continue;
                }

                // Verificar que el guild existe y está disponible
                const guild = client.guilds.cache.get(guildId);
                if (!guild) {
                    console.log(`Guild ${guildId} no encontrada o no disponible`);
                    continue;
                }

                try {
                    const channel = await client.channels.fetch(musicSearchChannelId).catch(() => null);
                    if (!channel) {
                        console.log(`Canal ${musicSearchChannelId} no encontrado en guild ${guild.name} (${guildId})`);
                        continue;
                    }

                    const messages = await channel.messages.fetch({ limit: 100 }).catch(() => null);
                    if (!messages) {
                        console.log(`No se pudieron obtener mensajes del canal ${musicSearchChannelId}`);
                        continue;
                    }

                    messages.forEach(message => {
                        // Verificar que el mensaje no sea el de control ni el de Now Playing antes de borrarlo
                        if (message.id !== musicSearchMessageId && message.id !== nowPlayingMessageId) {
                            console.log(`Eliminando mensaje ${message.id} en canal ${musicSearchChannelId} (Guild: ${guild.name})`);
                            message.delete().catch(error => {
                                console.error(`Error al eliminar mensaje ${message.id}:`, error);
                            });
                        }
                    });
                } catch (error) {
                    console.error(`Error al limpiar mensajes en la guild ${guild.name} (${guildId}):`, error);
                }
            }
        } catch (error) {
            console.error('Error general en checkAndCleanMessages:', error);
        }
    }

    // Evento 'ready' para realizar la carga inicial y establecer el intervalo de limpieza
    client.on('ready', async () => {
        console.log('Bot preparado, iniciando limpieza de mensajes.');
        
        // Esperar un poco para asegurar que el cliente esté completamente listo
        setTimeout(async () => {
            await checkAndCleanMessages(); // Limpieza inicial
            setInterval(checkAndCleanMessages, 30000); // Intervalo de limpieza cada 30 segundos
        }, 2000);
    });

    // Evento 'messageCreate' para manejar la creación de nuevos mensajes
    client.on('messageCreate', async message => {
        try {
            // Verificar si el mensaje se envió en un servidor
            if (!message.guild) return;

            // Cargar la configuración del servidor desde la base de datos
            const guildSettings = await musicSchema.findOne({ guildId: message.guild.id });

            // Asegurarse de que la configuración del servidor exista y sea válida
            if (!guildSettings || !guildSettings.musicSearchChannelId || !guildSettings.musicSearchMessageId || !guildSettings.nowPlayingMessageId) {
                return; // Salir si no hay configuración válida
            }

            const { musicSearchChannelId, musicSearchMessageId, nowPlayingMessageId } = guildSettings;

            // Verificar si el mensaje se envió en el canal de música configurado
            if (message.channel.id === musicSearchChannelId) {
                console.log(`Mensaje recibido en canal de música configurado: ${message.id} (Guild: ${message.guild.name})`);

                // No borrar los mensajes de control ni de Now Playing
                if (message.id === musicSearchMessageId) {
                    console.log(`Mensaje ${message.id} es el mensaje de control, no se eliminará.`);
                    return;
                }

                if (message.id === nowPlayingMessageId) {
                    console.log(`Mensaje ${message.id} es el mensaje de "Now Playing", no se eliminará.`);
                    return;
                }

                // Verificar si el mensaje ya fue eliminado después de 15 segundos
                setTimeout(async () => {
                    try {
                        const fetchedMessage = await message.channel.messages.fetch(message.id).catch(() => null); 
                        if (!fetchedMessage) {
                            console.log(`Mensaje ${message.id} ya fue eliminado.`);
                            return;
                        }

                        // Borrar el mensaje si aún existe
                        await fetchedMessage.delete();
                        console.log(`Mensaje ${message.id} eliminado correctamente.`);
                    } catch (error) {
                        console.error(`Error al eliminar el mensaje ${message.id}:`, error);
                    }
                }, 15000); // Eliminar mensajes después de 15 segundos
            }
        } catch (error) {
            console.error('Error en messageCreate event:', error);
        }
    });
};