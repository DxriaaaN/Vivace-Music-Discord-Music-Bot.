// embedUpdater.js - Archivo separado para la función de actualización
const { EmbedBuilder } = require('discord.js');
const { useQueue } = require('discord-player');
const musicSchema = require('../../functions/database/models/musicSchema'); // Ajusta la ruta según tu estructura

/**
 * Función para inicializar el sistema de actualización automática de embeds de música
 * @param {Client} client - Cliente de Discord
 */
const initEmbedUpdater = (client) => {
    
    // Función principal para actualizar embeds inactivos
    const updateInactiveEmbeds = async () => {
        try {
            console.log('🔄 Verificando embeds de música inactivos...');
            
            // Obtener todas las configuraciones de música de todos los servidores
            const allSettings = await musicSchema.find({});
            let updatedCount = 0;
            
            for (const settings of allSettings) {
                const { guildId, musicSearchChannelId, nowPlayingMessageId } = settings;
                
                // Verificar que existan los IDs necesarios
                if (!musicSearchChannelId || !nowPlayingMessageId) continue;
                
                try {
                    // Verificar si el servidor sigue siendo accesible
                    const guild = client.guilds.cache.get(guildId);
                    if (!guild) continue;
                    
                    // Obtener la queue del servidor
                    const queue = useQueue(guildId);
                    
                    // Si no hay queue activa O no hay track actual, actualizar embed
                    if (!queue || !queue.currentTrack) {
                        // Buscar el canal
                        const channel = await client.channels.fetch(musicSearchChannelId);
                        if (!channel) continue;
                        
                        // Buscar el mensaje
                        const message = await channel.messages.fetch(nowPlayingMessageId);
                        if (!message) continue;
                        
                        // Crear embed de estado inactivo
                        const inactiveEmbed = new EmbedBuilder()
                            .setColor(parseInt('6B7280', 16)) // Color gris para inactivo
                            .setTitle('🎵 Reproductor de Música')
                            .setDescription('No hay música reproduciéndose actualmente')
                            .addFields(
                                { name: '🎤 Estado:', value: 'Inactivo', inline: true },
                                { name: '🔤 En cola:', value: '0', inline: true },
                                { name: '⏯️ Acción:', value: 'Usa comandos de música para comenzar', inline: true }
                            )
                            .setFooter({ 
                                text: `${client.user.username} • Actualizado automáticamente`, 
                                iconURL: client.user.displayAvatarURL() 
                            })
                            .setTimestamp();
                        
                        // Verificar si el embed actual es diferente antes de actualizar
                        const currentEmbed = message.embeds[0];
                        const needsUpdate = !currentEmbed || 
                            currentEmbed.title !== inactiveEmbed.data.title ||
                            currentEmbed.description !== inactiveEmbed.data.description ||
                            (currentEmbed.fields && currentEmbed.fields[0]?.value !== 'Inactivo');
                        
                        if (needsUpdate) {
                            await message.edit({ embeds: [inactiveEmbed] });
                            updatedCount++;
                            console.log(`✅ Embed actualizado para servidor: ${guild.name} (${guildId})`);
                        }
                    }
                    
                } catch (guildError) {
                    console.log(`❌ Error al procesar servidor ${guildId}:`, guildError.message);
                    continue;
                }
            }
            
            if (updatedCount > 0) {
                console.log(`🎯 Actualización completada: ${updatedCount} embed(s) actualizados`);
            } else {
                console.log('✨ Todos los embeds están actualizados');
            }
            
        } catch (error) {
            console.log('❌ Error general en updateInactiveEmbeds:', error);
        }
    };
    
    // Función para iniciar el sistema de actualización
    const startEmbedUpdater = async () => {
        console.log('🚀 Iniciando sistema de actualización automática de embeds...');
        
        // Ejecutar una verificación inicial después de 30 segundos (dar tiempo al bot para cargar completamente)
        setTimeout(() => {
            updateInactiveEmbeds();
        }, 30000);
        
        // Configurar temporizador para ejecutar cada 15 minutos (900000 ms)
        const embedUpdateInterval = setInterval(updateInactiveEmbeds, 15 * 60 * 1000);
        
        // Limpiar el intervalo cuando el cliente se desconecte
        client.on('disconnect', () => {
            clearInterval(embedUpdateInterval);
            console.log('🛑 Sistema de actualización de embeds detenido por desconexión');
        });
        
        // También limpiar en caso de error fatal
        process.on('SIGINT', () => {
            clearInterval(embedUpdateInterval);
            console.log('🛑 Sistema de actualización de embeds detenido por SIGINT');
        });
        
        console.log('⏰ Sistema de actualización iniciado correctamente (verificación cada 15 minutos)');
        
        return embedUpdateInterval;
    };
    
    return { startEmbedUpdater, updateInactiveEmbeds };
};

module.exports = { initEmbedUpdater };