const { ComponentType, StringSelectMenuBuilder, ActionRowBuilder } = require('discord.js');
const musicSchema = require('../../../functions/database/models/musicSchema');
const Trigger = require('../../../functions/database/models/triggerSchema');

/**
 * Reconstruye el select menu a su estado original consultando los triggers.
 * @param {string | Object} interactionOrGuild - Puede ser la interacción (para extraer la guild) o directamente el guildId.
 * @param {Message} message - El mensaje que contiene el menú.
 */
async function reconstruirMenu(interactionOrGuild, message) {
    // Extraer el guildId: si se pasa una interacción, se extrae; si es un string, se usa directamente.
    const guildId = typeof interactionOrGuild === 'string'
        ? interactionOrGuild
        : interactionOrGuild.guild.id;

// Consultar la DB para obtener los triggers de la guild
const triggersDoc = await Trigger.findOne({ guildId });
let triggerOptions = [];
if (triggersDoc && triggersDoc.triggers.length > 0) {
    triggerOptions = triggersDoc.triggers
        .sort((a, b) => a.trigger.localeCompare(b.trigger))
        .map(t => ({
            label: t.trigger.length > 25 ? t.trigger.slice(0, 22) + '...' : t.trigger,
            description: t.title
                ? (t.title.length > 50 ? t.title.slice(0, 47) + '...' : t.title)
                : 'Sin título',
            value: t.url
        }));
} else {
    triggerOptions = [{
        label: 'Sin triggers',
        description: 'No se han configurado triggers en este servidor.',
        value: 'none'
    }];
}

    // Crear un nuevo select menu usando el builder
    const newSelectMenu = new StringSelectMenuBuilder()
        .setCustomId('music_trigger_menu')
        .setPlaceholder('Selecciona una palabra guardada para reproducir')
        .addOptions(triggerOptions);

    // Construir una nueva ActionRow para el select menu
    const newMenuRow = new ActionRowBuilder().addComponents(newSelectMenu);

    // Si el mensaje tiene otros componentes (por ejemplo, botones), asumimos que el menú es el último
    const otherComponents = message.components.slice(0, message.components.length - 1);
    const newComponents = [...otherComponents, newMenuRow];

    // Actualizar el mensaje con el menú reconstruido
    await message.edit({ components: newComponents });
}

/**
 * Inicia el collector para el menú de triggers en los mensajes configurados,
 * y reconstruye el menú al inicio del bot y luego de cada interacción.
 * @param {Client} client - La instancia del bot.
 */
async function iniciarTriggerCollector(client) {
    try {
        // Obtener todas las configuraciones de música almacenadas en la DB
        const settingsList = await musicSchema.find();
        if (!settingsList || settingsList.length === 0) {
            console.log("No hay configuraciones de música en la DB para iniciar collectors.");
            return;
        }

        // Por cada configuración, buscar el canal y el mensaje para asignar el collector
        for (const settings of settingsList) {
            const channel = await client.channels.fetch(settings.musicSearchChannelId).catch(() => null);
            if (!channel) {
                console.error(`No se encontró el canal para la guild ${settings.guildId}`);
                continue;
            }
            let message;
            try {
                message = await channel.messages.fetch(settings.musicSearchMessageId);
            } catch (err) {
                console.error(`No se encontró el mensaje con el menú de triggers para la guild ${settings.guildId}`);
                continue;
            }

            // Al iniciar el bot, reconstruir el menú para que inicie en su estado original
            await reconstruirMenu(settings.guildId, message);

            // Crear el collector para el select menu (componentes del tipo StringSelect)
            const collector = message.createMessageComponentCollector({
                componentType: ComponentType.StringSelect,
                time: 0 // Collector activo sin límite de tiempo
            });

            collector.on('collect', async interaction => {
                if (interaction.customId !== 'music_trigger_menu') return;

                // Defer para evitar "interaction failed"
                await interaction.deferReply({ ephemeral: true });

                // Capturar la URL seleccionada del trigger
                const triggerUrl = interaction.values[0];
                console.log(`Trigger URL seleccionado: ${triggerUrl}`);

                // Obtener y ejecutar el comando play mediante una fake interaction
                const playCommand = client.musicacommands.get('play');
                if (playCommand) {
                    const fakeInteraction = {
                        options: { getString: () => triggerUrl },
                        id: interaction.id,
                        guildId: interaction.guild.id,
                        member: interaction.member,
                        guild: interaction.guild,
                        channel: interaction.channel,
                        user: interaction.user,
                        reply: async ({ content }) => await interaction.channel.send(content),
                        followUp: async ({ content }) => await interaction.channel.send(content),
                        deferReply: async () => Promise.resolve(),
                        editReply: async ({ embeds, content }) => await interaction.channel.send({ embeds, content })
                    };

                    try {
                        await playCommand.run({ client, interaction: fakeInteraction });
                    } catch (error) {
                        console.error('Error al ejecutar el comando play mediante fake interaction:', error);
                    }
                }

                // Luego de procesar, reconstruir el menú para volver al estado original
                await reconstruirMenu(interaction, message);

                // Confirmar la acción al usuario
                await interaction.editReply(`Reproduciendo Trigger Seleccionado`);
            });

            collector.on('end', collected => {
                console.log(`Collector de triggers finalizado para la guild ${settings.guildId}. Total de interacciones: ${collected.size}`);
            });

            console.log(`Collector de triggers iniciado en el canal: ${channel.name} (Guild ${settings.guildId})`);
        }
    } catch (error) {
        console.error('Error al iniciar el collector de triggers:', error);
    }
}

async function actualizarMenusTriggers(client, guildId) {
    try {
        // Buscar la configuración de música para esta guild
        const settings = await musicSchema.findOne({ guildId });
        if (!settings) {
            console.log(`No hay configuración de música para la guild ${guildId}`);
            return;
        }

        // Obtener el canal y mensaje
        const channel = await client.channels.fetch(settings.musicSearchChannelId).catch(() => null);
        if (!channel) {
            console.error(`No se encontró el canal para la guild ${guildId}`);
            return;
        }

        let message;
        try {
            message = await channel.messages.fetch(settings.musicSearchMessageId);
        } catch (err) {
            console.error(`No se encontró el mensaje con el menú de triggers para la guild ${guildId}`);
            return;
        }

        // Reconstruir el menú con los triggers actualizados
        await reconstruirMenu(guildId, message);
        console.log(`Menú de triggers actualizado para la guild ${guildId}`);
        
    } catch (error) {
        console.error('Error al actualizar menús de triggers:', error);
    }
}


module.exports = { iniciarTriggerCollector, reconstruirMenu, actualizarMenusTriggers };