const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require("discord.js");
const dotenv = require('dotenv');

module.exports = {
	data: new SlashCommandBuilder()
		.setName("serverlist")
		.setDescription("Lista completa de servidores."),

	async run({ interaction, client }) {
		try {

			//cargar variables
			dotenv.config({ path: './config/.env' });

			const pageMap = new Map();
			const messageMap = new Map();

			//Variables Importantes
			const guild = interaction.guild;

			//Numero Pagina
			let index = 1;

			//Verificacion Owner/Developer.
			const ID = process.env.IDOwner;
			const authorizedId = `${ID}`;
			if (interaction.user.id !== authorizedId) return interaction.editReply('No tienes permiso para usar este comando.');

			//Busca y Mapea los Servidores.
			const servers = interaction.client.guilds.cache.sort(
				(a, b) => b.memberCount - a.memberCount
			);
			const svInf = servers.map(
				(sv) => `\`${index++}.\` ` + ` \*\*Name:\*\* \`\`${sv.name}\`\`\n \*\*ID:\*\* \`\`${sv.id}\`\`\n \*\*Member:\*\* \`\`${sv.memberCount}\`\``, 
			);

			//Constantes Pagina y Elementos
			const allElements = svInf;
			const maxPerPage = 5;
			const totalPages = Math.ceil(allElements.length / maxPerPage);
			let pagina = pageMap.get(interaction) || 1;

			//Pagina Actual
			const actualPage = await interaction.editReply({
				embeds: [getEmbedForPage(allElements, pagina, maxPerPage, client)],
				components: [getButtonRow(pagina, totalPages)],
				fetchReply: true,
			});
			messageMap.set(interaction, actualPage);

			//Actualizar Pagina.
			async function updatePage(pagina) {
				pageMap.set(interaction, pagina);
				const message = messageMap.get(interaction);
				await message.edit({
					embeds: [getEmbedForPage(allElements, pagina, maxPerPage, client)],
					components: [getButtonRow(pagina, totalPages)],
					fetchReply: true
				}).catch((error) => {
					if (error); return;
				});
			}

			//Armar Collector
			const collector = await actualPage.createMessageComponentCollector({
				componentType: ComponentType.Button,
			})

			//Configuracion Botones
			collector.on('collect', async (i) => {
				if (!i.isButton()) return;

				await i.deferUpdate().catch((error) => {
					if (error); return;
				});

				let pagina = pageMap.get(interaction) || 1;

				if (i.customId === "prev") {
					if (pagina > 1) {
						pagina--;
					}
				} else if (i.customId === "next") {
					if (pagina < totalPages) {
						pagina++;
					}
				} else if (i.customId === "beginning") {
					pagina = 1;
				} else if (i.customId === "end") {
					pagina = totalPages;
				}

				await updatePage(pagina);
			});

		} catch (error) {
			await interaction.editReply({ content: 'Hubo un error al mostrar la lista de servidores', ephemeral: true });
			console.log('Hubo un error con el comando listServer.js', error);
			return;
		}
	},
};


//Obtiene el embed para cada pagina.
function getEmbedForPage(allElements, pagina, maxPerPage, client) {
	try {
		const startIndex = (pagina - 1) * maxPerPage;
		const endIndex = pagina * maxPerPage;
		const elementsOnPage = allElements.slice(startIndex, endIndex);

		//console.log(allElements);
		const TtlPg = Math.ceil(allElements.length / maxPerPage);

		const embed = new EmbedBuilder()
			.setColor(parseInt('313850', 16))
			.setTitle(`Lista de Servidores ${pagina} de ${TtlPg}`)
			.setDescription(elementsOnPage.join("\n\n"))
			.setTimestamp()
			.setFooter({ text: client.user.username, iconURL: `${client.user.displayAvatarURL()}` });
		return embed;
	} catch (error) {
		console.log('Hubo un problema al cargar los embeds de listServer.js', error);
		return;
	}
}

//Obtiene los botones para cada embed de cada pagina.
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

		const cancel = new ButtonBuilder()
			.setCustomId(`cancelHelp`)
			.setStyle(ButtonStyle.Danger)
			.setEmoji('<:Cancelar:1352153291051630633>');

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
			cancel,
			nextButton,
			endButton
		);
	} catch (error) {
		console.log('Hubo un problema con los botones de listServer.js', error);
		return;
	}
}

