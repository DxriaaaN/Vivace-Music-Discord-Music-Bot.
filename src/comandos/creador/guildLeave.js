const { SlashCommandBuilder } = require('discord.js');
const dotenv = require('dotenv');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaveguild')
        .setDescription('Usalo para abandonar una guild donde este presente.')
        .addStringOption(option =>
            option.setName('guildid')
                .setDescription('Introduce una ID de servidor valida')
                .setRequired(true)),
    async run({ client, interaction }) {
        try {
            // Cargar las Variables
            dotenv.config({ path: './config/.env' });

            //Datos Usuario
            const { user: author } = interaction;
            const userMention = `<@${author.id}>`;

            //Verificacion Rol Owner/Developer
            const ID = process.env.IDOwner;
            const rolDeveloper = `${ID}`;
            if (interaction.user.id !== rolDeveloper) return await interaction.editReply('Solamente mi creador puede usar este comando !.');
                
            // Obtener el ID del servidor desde el comando
            const guildId = interaction.options.getString('guildid');
            const guild = client.guilds.cache.get(guildId);

            // Verificar si el bot está en el servidor especificado
            if (!guild) return await interaction.editReply('No estoy en el servidor especificado.');
            
            //Bloquear mismo servidor
            if (guild === guildId) return await interaction.editReply('No puedo abandonar el mismo servidor desde donde se ejecuta el comando!')
                
            // Intentar abandonar el servidor
            await guild.leave().catch(error => {
                console.error('Hubo un problema al abandonar la guild', error);
                throw error;
            });

            //Retorno Respuesta
            await interaction.editReply(`${userMention} He abandonado el servidor: \`\`${guild.name}\`\` con exito!`);

        } catch (error) {
            console.error(`No pude abandonar el servidor: ${guild.name}`, error);
            await interaction.editReply({ content: 'Ocurrió un error al intentar abandonar el servidor.', ephemeral: true });
            return;
        }
    },
};
