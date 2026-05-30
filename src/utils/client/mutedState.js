const { useQueue } = require('discord-player');

const state = { isMuted: false };

function setupMuteDetector(client) {
  client.on('voiceStateUpdate', (oldState, newState) => {
    if (newState.id !== client.user.id) return;

    const wasMuted = oldState.serverMute;
    const nowMuted = newState.serverMute;

    if (wasMuted === nowMuted) return;

    if (nowMuted) {
      state.isMuted = true;

      const queue = useQueue(newState.guild.id);

      if (!queue || !queue.isPlaying()) {
        // Queue vacía o sin reproducir → solo bloquear
        console.log(`[Mute] Bloqueando agregar canciones en ${newState.guild.name}.`);
      } else {
        // Reproduciendo → destruir y avisar
        queue.metadata.channel?.send('🔇 Fui muteado por un moderador. La cola fue destruida.');
        queue.delete();
      }

    } else {
      state.isMuted = false;
      console.log(`[Mute] Desmuteado en ${newState.guild.name}. Sistema desbloqueado.`);
    }
  });
}

module.exports = { state };