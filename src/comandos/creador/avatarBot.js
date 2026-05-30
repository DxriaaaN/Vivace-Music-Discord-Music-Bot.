const { SlashCommandBuilder } = require('discord.js');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const dotenv = require('dotenv');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('avatarbot')
        .setDescription('Actualiza el avatar del bot')
        .addAttachmentOption(option =>
            option.setName('avatar')
                .setDescription('El nuevo avatar para el bot.')
                .setRequired(true)
        ),

    async run({ client, interaction }) {
        try {
            //Cargar las Variables
            dotenv.config({ path: './config/.env' });


            //Datos Usuario
            const { user: author } = interaction;
            const userMention = `<@${author.id}>`;

            //Verificar Rol Desarrollador
            const ID = process.env.IDOwner;

            const rolDeveloper = `${ID}`;
            if (interaction.user.id !== rolDeveloper) return interaction.editReply('Solamente mi creador puede usar este comando!');


            //Cargar archivo del Avatar
            const avatarAttachment = interaction.options.getAttachment('avatar')
            if (!avatarAttachment.contentType.startsWith('image/')) return interaction.editReply('Por favor, proporciona un archivo de imagen válido.');


            //Convertir imagen a base64

            const response = await fetch(avatarAttachment.url);
            const buffer = await response.buffer();
            const base64Avatar = `data:${avatarAttachment.contentType};base64,${buffer.toString('base64')}`;

            //Errores Servidor
            if (!response.ok) {
                if (response.status === 404) return null;
                throw new Error(`HTTP Error! Status: ${response.status}`);
            }

            //Errores conversion. 
            if (!buffer || !base64Avatar) return interaction.editReply('Hubo un problema al convertir la imagen');

            //Actualizar el avatar
            await client.user.setAvatar(base64Avatar).catch(error => {
                console.log('No se pudo actualizar el avatar', error);
                throw error;
            });

            //Devolver respuesta
            await interaction.editReply(`${userMention} El avatar del bot ha sido actualizado con éxito.`);
            return;
        } catch (error) {
            await interaction.editReply({ content: 'Hubo un problema al actualizar el avatar del bot', ephemeral: true });
            console.log('Hubo un problema al cambiar el avatar', error);
            return;
        };
    },
};