![Discord.js](https://img.shields.io/badge/Discord.js-v14-blue)
![Discord Player](https://img.shields.io/badge/Discord_Player-7.2.0-purple)
![MongoDB](https://img.shields.io/badge/MongoDB-green)
![License](https://img.shields.io/badge/license-MIT-pink)

# 🎵 Vivace Music

<div align="center">

<img src="https://imgur.com/SGKJWUL.png" width="180"/>

### Tu experiencia musical en Discord, simplificada.

Bot de música open source para Discord enfocado en simplicidad, automatización y aprendizaje.

Compatible con **YouTube, Spotify, SoundCloud y Apple Music**

</div>

---

# ✨ ¿Qué hace diferente a Vivace?

La idea detrás de Vivace es simple:

> Configurá una vez → enviá música → disfrutá.

Este proyecto fue creado tanto para comunidades hispanohablantes como para desarrolladores que quieran aprender a construir bots musicales modernos utilizando **Discord.js v14** y **Discord Player 7.2.0**.

---

# 🎧 Canal de Música Automático

Usando:

```bash
/setup_music
```

Vivace crea automáticamente un canal dedicado para música.

Este canal permite:

* Reconocimiento automático de enlaces
* Reproducción automática
* Botones interactivos
* Experiencia organizada
* Menos dependencia de comandos

Una vez configurado, simplemente enviás música.

---

# 🔗 Reconocimiento Automático de Enlaces

La principal característica del proyecto.

Pegá enlaces compatibles y Vivace se encargará del resto.

### Plataformas compatibles

✅ YouTube
✅ Spotify
✅ SoundCloud
✅ Apple Music

Ejemplo:

```text
https://open.spotify.com/track/xxxx
```

↓

```text
Bot detecta → agrega → reproduce automáticamente
```

---

# 🏷️ Triggers Personalizados

Guardá canciones, playlists o álbumes utilizando palabras personalizadas.

Ejemplo:

```bash
/add_trigger palabra:phonk url:https://spotify...
```

Luego:

```text
phonk
```

↓

```text
Vivace reproducirá automáticamente el contenido asociado
```

Comandos disponibles:

```bash
/add_trigger
/remove_trigger
/list_triggers
```

---

# 🎛️ Controles Interactivos

Vivace prioriza una experiencia basada en botones.

Funciones disponibles:

* ⏸️ Pausar / Reanudar
* ⏭️ Skip
* 🔀 Shuffle
* 📋 Queue
* 🔁 Loop
* 🔊 Volumen
* 🤖 Autoplay
* 🧹 Limpiar cola
* 🚪 Desconectar

---

# 📚 Sistema de Ayuda Integrado

Vivace incluye un panel interactivo con categorías:

### Música

```bash
/play
/queue
/skip
/loop
/volumen
```

### Mention Commands

```text
@Vivace [link]
@Vivace busca [artista]
@Vivace queue
```

### Search Music

```bash
/setup_music
```

### Triggers

```bash
/add_trigger
/remove_trigger
/list_triggers
```

---

# 🛠️ Tecnologías Utilizadas

* Discord.js v14
* Discord Player 7.2.0
* MongoDB
* Mongoose
* Node.js
* Slash Commands
* Buttons & Select Menus

---

# 📂 Estructura del Proyecto

```text
commands/
events/
models/
functions/
utils/
```

El proyecto está organizado para priorizar:

* Modularidad
* Escalabilidad
* Separación de responsabilidades
* Código comentado
* Facilidad para aprender

---

# ⚙️ Variables de Entorno

Crear archivo:

```env
BOT_TOKEN=
CLIENT_SECRET=
CLIENT_ID=
MONGO_URI=
OWNER_ID=
```

---

# 🚀 Instalación

Instalar dependencias:

```bash
npm install
```

Ejecutar:

```bash
node .
```

---

# 📸 Vista Previa

Agregá screenshots aquí:

* Canal Music Search
* Controles interactivos
* Sistema de Triggers
* Setup automático

---

# 🎥 Objetivo del Proyecto

Vivace no busca ser solamente otro bot musical.

Busca aportar documentación, ejemplos modernos y recursos en español para quienes quieran construir bots escalables usando Discord Player 7.2.0.

---

# ❤️ Contribuciones

Issues, sugerencias y pull requests son bienvenidos.

Si utilizás el proyecto para aprender o construir algo propio, mejor todavía.

---

# 📄 Licencia

MIT
