const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

//Funcion para generar botones en setup_music
function generateMusicControlButtons() {
    
    const row1 = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder().setCustomId('stop_music').setLabel('Pausar').setStyle(ButtonStyle.Danger).setEmoji('<:detenerelcirculo:1351223129665704057>'),
            new ButtonBuilder().setCustomId('resume_music').setLabel('Reanudar').setStyle(ButtonStyle.Primary).setEmoji('<:tocar:1351223119121219695> '),
            new ButtonBuilder().setCustomId('skip_music').setLabel('Skipear').setStyle(ButtonStyle.Primary).setEmoji('<:angulodoblepequenoderecho:1351224119613722634>'),
            new ButtonBuilder().setCustomId('queue_music').setLabel('Lista Actual').setStyle(ButtonStyle.Primary).setEmoji('<:menuhamburguesa:1351222635899388017>')
        );

    const row2 = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder().setCustomId('shuffle_music').setLabel('Shuffle').setStyle(ButtonStyle.Primary).setEmoji('<:flechascruzadas:1351224145635049614>'),
            new ButtonBuilder().setCustomId('repeat_music').setLabel('Repetición').setStyle(ButtonStyle.Success).setEmoji('<:actualizar:1351222039113105418>'),
            new ButtonBuilder().setCustomId('autoplay_music').setLabel('Autoplay').setStyle(ButtonStyle.Success).setEmoji('<:actualizar:1351222039113105418>'),
            new ButtonBuilder().setCustomId('loopoff_music').setLabel('Loop Off').setStyle(ButtonStyle.Danger).setEmoji('<:rotarexclamacion:1351224132280385566>'),
        );

    const row3 = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder().setCustomId('clear_music').setLabel('Limpiar Queue').setStyle(ButtonStyle.Danger).setEmoji('<:basuracircular:1351224106929885315>'),
            new ButtonBuilder().setCustomId('leave_music').setLabel('Abandonar').setStyle(ButtonStyle.Danger).setEmoji('<:manolimite:1351223340077154456>'),
        );

    return [row1, row2, row3];
}

module.exports = { generateMusicControlButtons };

