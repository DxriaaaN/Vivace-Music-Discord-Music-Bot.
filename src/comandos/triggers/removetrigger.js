const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const Trigger = require('../../functions/database/models/triggerSchema');
const musicSchema = require('../../functions/database/models/musicSchema');
const { reconstruirMenu } = require('../../events/music/interactions/musicCollector');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remove_trigger')
        .setDescription('Elimina una palabra clave existente')
        .addStringOption(option =>
            option.setName('trigger')
                .setDescription('La palabra clave que deseas eliminar')
                .setRequired(true)),
    async run({ client, interaction }) {
        try {
            const trigger = interaction.options.getString('trigger').toLowerCase();
            const guildId = interaction.guild.id;

            // Buscar el documento de triggers para la guild
            let triggerDoc = await Trigger.findOne({ guildId });
            if (!triggerDoc) {
                return interaction.editReply({
                    content: `No hay triggers configurados en este servidor.`,
                    ephemeral: true,
                });
            }

            // Buscar y eliminar el trigger
            const index = triggerDoc.triggers.findIndex(t => t.trigger === trigger);
            if (index === -1) {
                return interaction.editReply({
                    content: `La palabra \`${trigger}\` no existe.`,
                    ephemeral: true,
                });
            }

            // Eliminar trigger y guardar
            triggerDoc.triggers.splice(index, 1);
            await triggerDoc.save().catch(error => {
                console.error('Ocurrió un error al guardar removeTrigger:', error);
                throw error;
            });

            // Recargar el menú si existe configuración de música
            const settings = await musicSchema.findOne({ guildId });
            if (settings?.musicSearchChannelId && settings?.musicSearchMessageId) {
                const channel = await client.channels.fetch(settings.musicSearchChannelId);
                if (channel) {
                    const menuMessage = await channel.messages.fetch(settings.musicSearchMessageId);
                    console.log('Actualizando Menu')
                    await reconstruirMenu(guildId, menuMessage);
                }
            }
            
            
            //ACTUALIZAR MENU EMBED
            try{
                await actualizarMenusTriggers(client, guildId);
                console.log(`Menu de triggers actualizado despues de eliminar: ${trigger}`)
            }catch(error){
                console.error(`Error al actualizar el menu de triggers`, error)
            }

            // Enviar confirmación al usuario
            const embed = new EmbedBuilder()
                .setColor(parseInt('313850', 16))
                .setTitle('Trigger eliminado')
                .setDescription(`La palabra clave \`\`${trigger}\`\` ha sido eliminada.`)
                .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error('Ocurrió un error en removeTrigger:', error);
            interaction.editReply('Ocurrió un error intentando eliminar la palabra.');
        }
    },
};

