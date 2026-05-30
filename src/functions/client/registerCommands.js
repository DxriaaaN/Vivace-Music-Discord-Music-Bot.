const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const dotenv = require('dotenv');


const registerCommands = async (client, commands) => {
    try {
        dotenv.config({ path: '../../../config/.env' });
        const token = process.env.tokenBot;
        if (!token) {
            console.error('No se encontro el token dentro de .env');
            return;
        }

        const rest = new REST({ version: '10' }).setToken(token);
        const guild_ids = client.guilds.cache.map(guild => guild.id);

        for (const guildId of guild_ids) {
            try {

                const guild = client.guilds.cache.get(guildId);
                const guildName = guild.name;

                await rest.put(
                     Routes.applicationGuildCommands(process.env.clientID, guildId),
                    { body: commands }
                );

                console.log(`Comandos preparados para el servidor [Name: ${guildName} - ID: ${guildId}]`);
            } catch (error) {
                console.error(`Error en el servidor [Name: ${guildName.name} - ID: ${guildId}]\n`, error);
                throw error;
            }
        }
    } catch (error) {
        console.log('Ocurrio un error en registerCommands', error.message)
        return
    }
};

module.exports = { registerCommands };
