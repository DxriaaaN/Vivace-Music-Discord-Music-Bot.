const { SlashCommandBuilder } = require('discord.js');
const fetch = require('node-fetch');
const dotenv = require('dotenv');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bannerbot')
        .setDescription('Actualiza el banner del bot.')
        .addAttachmentOption(option =>
            option.setName('banner')
                .setDescription('La imagen o gif del banner para el bot.')
                .setRequired(true)),

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
            if (interaction.user.id !== rolDeveloper) return interaction.editReply('Solo mi creador puede usar este comando!.');

            //Verificacion carga archivo
            const bannerAttachment = interaction.options.getAttachment('banner');
            if (!bannerAttachment || !bannerAttachment.contentType.startsWith("image/")) return interaction.editReply('Por favor, introduce un archivo valido (JPG, PNG, GIF)');

            //Constantes //---->  Throw Errors
            const response = await fetch(bannerAttachment.url)

            const buffer = await response.buffer().catch(error => {
                console.error('Hubo un error con el buffer', error);
                throw error;
            });;

            const base64 = await buffer.toString('base64').catch(error => {
                console.error('Hubo un problema con base64', error);
                throw error;
            });;

            const imageData = `data:${bannerAttachment.contentType};base64,${base64}`;

            //Errores Servidor
            if (!response.ok) {
                if (response.status === 404) return null;
                throw new Error(`HTTP Error! Status: ${response.status}`);
            };

            //Actualizar Banner Bot
            const patchResponse = await fetch(`https://discord.com/api/v9/users/@me`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bot ${client.token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ banner: imageData })
            });

            //Errores Servidor
            if (!patchResponse.ok) {
                const errorData = await patchResponse.json();
                throw new Error('Hubo un problema con patchResponse', errorData.message);
            };

            await interaction.editReply({ content: `${userMention} El banner del bot ha sido actualizado con exito.` });
            return;
        } catch (error) {
            await interaction.editReply({ content: 'Hubo un problema al actualizar el banner del bot', ephemeral: true });
            console.log('Hubo un error al cambiar el banner', error);
            return;
        };
    },
};
