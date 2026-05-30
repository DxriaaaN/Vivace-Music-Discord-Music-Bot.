const { useQueue } = require('discord-player');
const { state } = require('../../utils/client/mutedState');

module.exports = (client) => {
    
    // Al arrancar, verificar si el bot ya está muteado en algún servidor.//
    client.once('ready', () => {
        client.guilds.cache.forEach(guild => {
            const botMember = guild.members.cache.get(client.user.id);
            if (botMember?.voice?.serverMute) {
                state.isMuted = true;
                console.log(`Bot Inicio Muteado En ${guild.name}.`);
            }
        });
    });

 // Al detectar cambios en el estado de voz del bot, verifica si fue muteado o desmuteado.//
    client.on('voiceStateUpdate', (oldState, newState) => {
        if (newState.id !== client.user.id) return;

        const wasMuted = oldState.serverMute;
        const nowMuted = newState.serverMute;

        if (wasMuted === nowMuted) return;

        if (nowMuted) {
            state.isMuted = true;

            const queue = useQueue(newState.guild.id);

            if (!queue || !queue.isPlaying()) {
                console.log(`Bot fue muteado en ${newState.guild.name}. Sistema bloqueado para agregar canciones.`);
            } else {
                queue.metadata.channel?.send('Fui muteada por un moderador. La cola fue destruida. Esperá a que me desmuteen para volver a usar comandos de música.');
                queue.delete();
            }

        } else {
            state.isMuted = false;
            console.log(`Bot fue desmuteado en ${newState.guild.name}. Sistema desbloqueado para agregar canciones.`);
        }
    });
};