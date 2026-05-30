const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require("discord.js");
const Trigger = require('../../functions/database/models/triggerSchema');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('list_triggers')
        .setDescription('Muestra todas las palabras clave disponibles'),
    async run({ client, interaction }) {
        try {
            const guildId = interaction.guild.id;

            // Buscar el documento para la guild
            let triggerDoc = await Trigger.findOne({ guildId });
            if (!triggerDoc || triggerDoc.triggers.length === 0) {
                return interaction.editReply({
                    content: 'No hay palabras clave configuradas en este servidor.',
                    ephemeral: true,
                });
            }

            // Mapea los triggers a un array de strings con el formato deseado
            let index = 1;
            const allElements = triggerDoc.triggers.map(t => {
                return `${index++}. **Trigger:** \`\`${t.trigger}\`\`\n
            **Titulo:** [${t.title}](${t.url})`;
            });
            
            // Configuración de la paginación
            const maxPerPage = 5;
            const totalPages = Math.ceil(allElements.length / maxPerPage);
            let pagina = 1;

            // Función que retorna el embed correspondiente a la página actual
            function getEmbedForPage(allElements, pagina, maxPerPage, client) {
                try {
                    const startIndex = (pagina - 1) * maxPerPage;
                    const endIndex = pagina * maxPerPage;
                    const elementsOnPage = allElements.slice(startIndex, endIndex);
                    const embed = new EmbedBuilder()
                        .setColor(parseInt('313850', 16))
                        .setTitle(`Lista de Playlist Favoritas - Página ${pagina} de ${totalPages}`)
                        .setDescription(elementsOnPage.join("\n\n"))
                        .setTimestamp()
                        .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() });
                    return embed;
                } catch (error) {
                    console.error('Error en getEmbedForPage:', error);
                    return;
                }
            }

            // Función que retorna la ActionRow con los botones según la página actual
            function getButtonRow(pagina, totalPages) {
                try {
                    const beginningButton = new ButtonBuilder()
                        .setCustomId("beginning")
                        .setEmoji("<:SkipTotalIzq:1352153238895460352>")
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(pagina === 1);

                    const prevButton = new ButtonBuilder()
                        .setCustomId("prev")
                        .setEmoji("<:SkipIzquierdo:1352153187750248510>")
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(pagina === 1);

                    //const cancelButton = new ButtonBuilder()
                      //  .setCustomId("cancel")
                      //  .setEmoji("❌")
                      //  .setStyle(ButtonStyle.Danger);

                    const nextButton = new ButtonBuilder()
                        .setCustomId("next")
                        .setEmoji("<:SkipDerecha:1352153159895875595>")
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(pagina === totalPages);

                    const endButton = new ButtonBuilder()
                        .setCustomId("end")
                        .setEmoji("<:SkipTotal:1352153173598670848>")
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(pagina === totalPages);

                    return new ActionRowBuilder().addComponents(
                        beginningButton,
                        prevButton,
                       // cancelButton,
                        nextButton,
                        endButton
                    );
                } catch (error) {
                    console.error('Error en getButtonRow:', error);
                    return;
                }
            }

            // Enviar la respuesta inicial con el embed de la primera página y los botones correspondientes
            const initialMessage = await interaction.editReply({
                embeds: [getEmbedForPage(allElements, pagina, maxPerPage, client)],
                components: [getButtonRow(pagina, totalPages)],
                fetchReply: true,
            });

            // Crear el collector para los botones
            const collector = initialMessage.createMessageComponentCollector({
                componentType: ComponentType.Button,
                time: 60000 // 1 minuto de tiempo de espera
            });

            collector.on("collect", async (i) => {
                if (!i.isButton()) return;
                await i.deferUpdate();

                // Actualiza la página según el botón presionado
                if (i.customId === "beginning") {
                    pagina = 1;
                } else if (i.customId === "prev") {
                    if (pagina > 1) pagina--;
                } else if (i.customId === "next") {
                    if (pagina < totalPages) pagina++;
                } else if (i.customId === "end") {
                    pagina = totalPages;
                } else if (i.customId === "cancel") {
                    collector.stop("cancelled");
                    return await interaction.editReply({ components: [] });
                }

                // Actualiza el mensaje con el nuevo embed y botones
                await initialMessage.edit({
                    embeds: [getEmbedForPage(allElements, pagina, maxPerPage, client)],
                    components: [getButtonRow(pagina, totalPages)]
                });
            });

            collector.on("end", async () => {
                await initialMessage.edit({ components: [] });
            });
        } catch (error) {
            console.error('Hubo un error en list_triggers', error);
            return interaction.editReply({
                content: 'Ocurrió un error al mostrar la lista de triggers.',
                ephemeral: true
            });
        }
    },
};
