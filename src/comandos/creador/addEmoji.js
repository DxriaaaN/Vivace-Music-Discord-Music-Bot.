const { SlashCommandBuilder, parseEmoji } = require('discord.js');
const { AttachmentBuilder } = require('discord.js');
const fetch = require('node-fetch'); // si estás en un entorno que no tiene fetch global

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addemoji')
        .setDescription('Agrega un emoji personalizado al servidor')
        .addStringOption(option =>
            option
                .setName('emoji')
                .setDescription('El emoji personalizado a agregar')
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName('nombre')
                .setDescription('El nombre que tendrá el emoji en el servidor')
                .setRequired(true)),

    async run({ interaction, client }) {

        const emojiInput = interaction.options.getString('emoji');
        const nombreEmoji = interaction.options.getString('nombre');

        const emoji = parseEmoji(emojiInput);

        if (!emoji || !emoji.id) {
            return await interaction.editReply({ content: '❌ Ese no es un emoji personalizado válido.' });
        }

        // Verifica permisos
        const botMember = await interaction.guild.members.fetchMe();
        if (!botMember.permissions.has('ManageEmojisAndStickers')) {
            return await interaction.editReply({ content: '❌ No tengo permiso para agregar emojis a este servidor.' });
        }

        const extension = emoji.animated ? 'gif' : 'png';
        const url = `https://cdn.discordapp.com/emojis/${emoji.id}.${extension}`;

        try {
            const response = await fetch(url);
            const buffer = await response.buffer();

            const addedEmoji = await interaction.guild.emojis.create({
                attachment: buffer,
                name: nombreEmoji
            });

            await interaction.editReply({
                content: `✅ Emoji agregado correctamente: <${emoji.animated ? 'a' : ''}:${addedEmoji.name}:${addedEmoji.id}>`,
            });

        } catch (error) {
            console.error('Error al agregar emoji:', error);
            await interaction.editReply({
                content: '❌ Ocurrió un error al intentar agregar el emoji.',
            });
        }
    },
};
