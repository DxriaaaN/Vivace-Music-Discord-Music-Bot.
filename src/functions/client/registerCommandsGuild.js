const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const dotenv = require('dotenv');

dotenv.config({ path: '../../../config/.env' });

const registerCommandsGuild = async (client, guildId, commands) => {

    //Datos Guild
    const guild = client.guilds.cache.get(guildId);
    const guildName = guild.name;

    //Obtener Token
    const token = process.env.tokenBot;

    if (!token) {
        console.error('Error al obtener token del bot');
        return;
    }

    //Registrar Comandos
    const rest = new REST({ version: '10' }).setToken(token);
    try {
        await rest.put(
            Routes.applicationGuildCommands(process.env.clientID, guildId),
            { body: commands }
        );
        console.log(`Comandos registrados en el servidor [Name: ${guildName} - ID: ${guildId}]`);
    } catch (error) {
        console.error(`Error al registrar comandos en el servidor [Name: ${guildName} - ID: ${guildId}]`, error);
        process.exitCode = 1;
    }
};

module.exports = { registerCommandsGuild };
