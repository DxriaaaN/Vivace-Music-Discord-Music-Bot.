const MusicSettings = require('../../../functions/database/models/musicSchema');
const Trigger = require('../../../functions/database/models/triggerSchema'); 

module.exports = (client) => {
    client.on('guildDelete', async (guild) => {

        //Datos Guild
        const guildId = guild.id;
        const guildName = guild.name;

        try {
            // Eliminar configuración de MusicSettings para este servidor
            const musicConfigDeleteResult = await MusicSettings.findOneAndDelete({ guildId });

            if (musicConfigDeleteResult) {
                console.log(`Configuración de música eliminada para el servidor [Name: ${guildName} - ID: ${guildId}]`);
            } else {
                console.warn(`No se encontró configuración de música para el servidor [Name: ${guildName} - ID: ${guildId}]`);
            }

            // Eliminar configuración de Trigger para este servidor
            const triggerConfigDeleteResult = await Trigger.findOneAndDelete({ guildId });

            if (triggerConfigDeleteResult) {
                console.log(`Configuración de triggers eliminada para el servidor [Name: ${guildName} - ID: ${guildId}]`);
            } else {
                console.warn(`No se encontró configuración de triggers para el servidor [Name: ${guildName} - ID: ${guildId}]`);
            }

        } catch (error) {
            console.error(`Error al eliminar la configuración del servidor [Name: ${guildName} - ID: ${guildId}]`, error);
        }
    });
};
