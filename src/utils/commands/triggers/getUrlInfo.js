
//Youtube Video URL
const YouTube = require("youtube-sr").default;

//Youtube Playlist
const ytpl = require('ytpl');


//Spotify Video URL
const fetch = require('isomorphic-unfetch')
const {getPreview} = require('spotify-url-info')(fetch)

//Soundcloud Video URL
const SoundCloud = require("soundcloud-scraper");
const client = new SoundCloud.Client();
const fs = require("fs");

//Obtener Informacion Youtube Enlaces
async function getUrlYoutube(url) {
    try {
        const videoYT = await YouTube.getVideo(url);
        if (!videoYT) return null;
        //console.log(videoYT);
        return {
            url: videoYT.url ? videoYT.url : 'Desconocido URL',
            title: videoYT.title ? videoYT.title : 'Desconocido',
        };
    } catch (error) {
        console.error('Error al obtener datos de YouTube:', error);
        return {
            url,
            title: 'No Encontrado'
        }
    }
}

//Obtener Informacion Youtube Corto
async function getUrlYoutubeBe(url) {
    try {

        // Extraer el ID usando split (asumiendo que es una URL de youtube.be)
        const videoId = url.split('/').pop();
        const fullUrl = `https://www.youtube.com/watch?v=${videoId}`;

        const videoYT = await YouTube.getVideo(fullUrl);
        if (!videoYT) return null;
        //console.log(videoYT);
        return {
            url: videoYT.url ? videoYT.url : 'Desconocido URL',
            title: videoYT.title ? videoYT.title : 'Desconocido',
        };
    } catch (error) {
        console.error('Error al obtener datos de YouTube:', error);
        return {
            url,
            title: 'No Encontrado'
        }
    }
}

//Obtener Informacion Youtube Playlist
async function getUrlYoutubePlaylist(url) {
    try {
        // Con { pages: 1 } se limita la cantidad de páginas a obtener, lo que suele ser suficiente para la metadata.
        const playlist = await ytpl(url, { pages: 1 });
        if (!playlist) return null;
        return {
            url: playlist.url || 'Desconocido URL',
            title: playlist.title || 'Desconocido'
        };
    } catch (error) {
        console.error('Error al obtener datos de la playlist de YouTube:', error);
        return {
            url,
            title: 'No Encontrado'
        };
    }
}


//Obtener Informacion Spotify Enlaces
async function getUrlSpotify(url) {
    try {
        const videoSpotify = await getPreview(url);
        //console.log(videoSpotify);
        if (!videoSpotify) return null;
        return {
            url: videoSpotify.link,
            title: videoSpotify.title,
            image: videoSpotify.image 
        };
    } catch (error) {
        console.error("Error al obtener datos de Spotify", error);
        return {
            url,
            title: 'No Encontrado',
        }
    }
}

//Obtener Informacion SoundCloud Enlaces
async function getUrlSoundcloud(url) {
    try {
        const videosSoundcloud = await client.getSongInfo(url)
        if (!videosSoundcloud) return null;
        return {
            url: videosSoundcloud.url ? videosSoundcloud.url : 'Desconocido URL',
            title: videosSoundcloud.title ? videosSoundcloud.title : 'Desconocido Title',
        }
    } catch (error) {
        console.error('Error al obtener datos de Soundcloud', error);
        return {
            url,
            title: 'No Encontrado',
        }
    };
}

// Función para obtener información de Apple Music (iTunes Search API)
async function getUrlAppleMusic(url) {
    try {
        const searchQuery = encodeURIComponent(url);
        const apiUrl = `https://itunes.apple.com/search?term=${searchQuery}&media=music&limit=1`;

        const response = await fetch(apiUrl);
        const data = await response.json();
        console.log(response)
        console.log(data)

        if (data.results.length > 0) {
            return {
                url: data.results[0].collectionViewUrl || 'Desconocido URL',
                title: data.results[0].collectionName || 'Desconocido Title',
            };
        } else {
            return {
                url,
                title: 'No encontrado',
            };
        }
    } catch (error) {
        console.error('Error al obtener datos de Apple Music:', error);
        return null;
    }
}

// Función para determinar el tipo de URL y llamar a la función correcta
// Detectar el tipo de URL y asignar source
async function getUrlInfo(url) {

    //Regex Youtube [Cancion, Album, Playlist, Shorts, Links] 
    const regexYTVideos = /^https?:\/\/(?:www\.)?(?:music\.)?youtube\.com\/(?:watch\?v=[a-zA-Z0-9_-]+)(?!.*\/shorts)(?!.*playlist).*$/;
    const regexYTBe = /https?:\/\/youtu\.be\/([a-zA-Z0-9_-]+)/;


    const regexYTPlaylist = /^https?:\/\/(?:www\.)?(?:music\.)?youtube\.com\/(?:playlist\?list=[a-zA-Z0-9_-]+|album\?list=[a-zA-Z0-9_-]+)(?!.*\/shorts).*$/;
    //Regex Spotify [Cancion, Album, Playlist, Paises]
    const regexSpotify = /https?:\/\/(?:www\.)?open\.spotify\.com\/(?:intl-\w{2}\/|intl-es\/)?(?:track\/\S+|playlist\/\S+|album\/\S+)/;

    //Regex Apple [Album, Canciones, Playlist]
    //const regexAppleMusic = /^https?:\/\/(?:music|itunes)\.apple\.com\/(?:[a-zA-Z]{2,3}\/)?(?:album\/[^\/]+\/\d+\?i=\d+.*|playlist\/[^\/]+\/[a-zA-Z0-9.\-]+.*)$/i;

    //Regex Soundcloud [Cancion, Album & Playlist]
    //const regexSoundCloud = /^https?:\/\/(www\.)?soundcloud\.com\/(?:[^\/]+\/[^\/]+(?:\?.*)?|[^\/]+\/sets\/[^\/]+(?:\?.*)?)$/i;

    let source;

    if (regexYTVideos.test(url)) {
        source = 'Youtube Video'
        return source;
    } else if (regexYTPlaylist.test(url)) {
        source = 'Youtube Playlist'
        return source;
    } else if (regexSpotify.test(url)) {
        source = 'Spotify'
        return source;
    } else if (regexYTBe.test(url)){
        source = 'Youtube Corto'
        return source;
    } else {
        return {
            source: 'Desconocido'
        };
    }
}

module.exports = { getUrlYoutube, getUrlSpotify, getUrlSoundcloud, getUrlAppleMusic, getUrlYoutubePlaylist, getUrlYoutubeBe, getUrlInfo };