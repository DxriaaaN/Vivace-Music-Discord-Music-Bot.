// Comando slash para limpiar caché
const { SlashCommandBuilder } = require('discord.js');
const { useMainPlayer } = require('discord-player');
const dotenv = require('dotenv');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cleancache')
        .setDescription('Limpia la caché del reproductor de música'),

    async run(interaction) {
        try {
            // Cargar las Variables
            dotenv.config({ path: './config/.env' });

            //Datos Usuario
            const { user: author } = interaction;
            const userMention = `<@${author.id}>`;

            //Verificacion ID Developer
            const ID = process.env.IDOwner;
            const rolDeveloper = `${ID}`; //----> Tu ID de Discord.

            if (interaction.user.id !== rolDeveloper) return interaction.editReply('Solo mi creador puede usar este comando!.');

            // Obtener la instancia del player
            const player = useMainPlayer();

            // Obtener estadísticas antes de la limpieza
            const queuesBefore = player.queues.cache.size;
            let deletedQueues = 0;

            // Limpiar colas inactivas
            const queuesToDelete = [];
            player.queues.cache.forEach((queue, guildId) => {
                if (!queue.isPlaying() && queue.tracks.data.length === 0) {
                    queuesToDelete.push(guildId);
                }
            });

            // Eliminar las colas marcadas
            queuesToDelete.forEach(guildId => {
                const queue = player.queues.cache.get(guildId);
                if (queue) {
                    queue.delete();
                    deletedQueues++;
                }
            });

            // Forzar garbage collection si está disponible
            if (global.gc) {
                global.gc();
            }

            const queuesAfter = player.queues.cache.size;
            const memoryUsage = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);

            console.log(
                `🧹 **Limpieza de caché completada**\n` +
                    `📊 **Estadísticas:**\n` +
                    `• Colas antes: ${queuesBefore}\n` +
                    `• Colas después: ${queuesAfter}\n` +
                    `• Colas eliminadas: ${deletedQueues}\n` +
                    `• Memoria actual en uso: ${memoryUsage}MB`);
        } catch (error) {
            console.error('Error al limpiar caché:', error);
        }
    }
};

// Función automática para limpiar caché periódicamente
function setupAutomaticCacheCleanup(intervalMinutes = 60) {
    const { useMainPlayer } = require('discord-player');

    setInterval(() => {
        try {
            const player = useMainPlayer();
            console.log('🧹 Ejecutando limpieza automática de caché...');

            let deletedQueues = 0;
            const queuesToDelete = [];

            // Identificar colas inactivas
            player.queues.cache.forEach((queue, guildId) => {
                if (!queue.isPlaying() && queue.tracks.data.length === 0) {
                    queuesToDelete.push(guildId);
                }
            });

            // Eliminar las colas identificadas
            queuesToDelete.forEach(guildId => {
                const queue = player.queues.cache.get(guildId);
                if (queue) {
                    queue.delete();
                    deletedQueues++;
                }
            });

            if (deletedQueues > 0) {
                console.log(`✅ Limpieza completada: ${deletedQueues} colas eliminadas`);
            }

            // Forzar garbage collection
            if (global.gc) {
                global.gc();
            }

        } catch (error) {
            console.error('Error en limpieza automática:', error);
        }

    }, intervalMinutes * 60 * 1000);
}

// Exportar la función de limpieza automática
module.exports.setupAutomaticCacheCleanup = setupAutomaticCacheCleanup;