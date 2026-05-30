// Importacion Modulos y Librerias
const dotenv = require('dotenv');
const dns = require ("node:dns/promises");
dns.setServers(["1.1.1.1"]);
const { Client, GatewayIntentBits } = require('discord.js');
const { Player, useMainPlayer } = require('discord-player');
const { YoutubeiExtractor } = require('discord-player-youtubei');
const { SpotifyExtractor } = require("discord-player-spotify");

//Base de Datos
const { initializeMongoose } = require('./src/functions/database/mongoose');


//Carga y Registro de Comandos
const { registerCommands } = require('./src/functions/client/registerCommands.js');
const { loadCommands } = require('./src/functions/client/loadCommands.js');
const guildAddHandler = require('./src/utils/commands/guildAdd.js');

//Eventos Error
const errorManager = require('./src/utils/client/errorManager.js');

//Eventos
const interactionCreateHandler = require('./src/events/client/interactionCreate');
const connectionCreateHandler = require('./src/events/client/connectionCreate');
const inviteHandler = require('./src/events/client/invite.js');
const mentionHandler = require('./src/events/client/mention.js');
const voiceStateUpdateHandler = require('./src/events/client/voiceStateUpdate.js');

//Eventos Musica
const musicEventHandler = require('./src/events/music/musicManager.js');
const { setupAutomaticCacheCleanup } = require('./src/comandos/creador/cleanCache.js');
const { DefaultExtractors } = require('@discord-player/extractor');
const { initEmbedUpdater } = require('./src/events/music/automaticUpdate.js');
const { ALL } = require('dns');

//Cargar las Variables
dotenv.config({ path: './config/.env' });
const TOKEN = process.env.tokenBot;

//Creacion y Asignacion Cliente Discord
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.MessageContent,
    ],
});

//Reproductor Música y Extractor
client.player = new Player(client);
const player = useMainPlayer();

async function setupExtractors() {
    await player.extractors.register(YoutubeiExtractor, {
        useYoutubeDL: true,
        logLevel: "ALL",
    });
    await player.extractors.loadMulti(DefaultExtractors);
}

// Ejecuta la función de configuración
setupExtractors().catch(err => console.error("Error cargando extractores:", err));

//Eventos
require('events').EventEmitter.defaultMaxListeners = 15;

//Cargar Mapas
client.musicacommands = new Map();
client.creadorcommands = new Map();
client.settingscommands = new Map();
client.helpcommands = new Map();
client.triggerscommands = new Map();
client.radiocommands = new Map();

let commands = [];
loadCommands(client, commands);
registerCommands(client, commands);
guildAddHandler(client, commands);


//Manejador de Eventos
interactionCreateHandler(client);
connectionCreateHandler(client);
errorManager(client);
musicEventHandler(client);
inviteHandler(client);
mentionHandler(client);
setupAutomaticCacheCleanup(120)
voiceStateUpdateHandler(client);


//Arrancar bot
initializeMongoose()
    .then(() => {
        console.log("Conexión a MongoDB exitosa");

        // Arrancar bot
        client.on("clientReady", () => {
            console.log(`Entrando como ${client.user.tag}`);
            client.user.setActivity('With The ❤️');
            registerCommands(client, commands);
            initEmbedUpdater();
        });

        client.login(TOKEN);
    })
    .catch((err) => {
        console.error("No se pudo establecer conexión a MongoDB", err);
    });
