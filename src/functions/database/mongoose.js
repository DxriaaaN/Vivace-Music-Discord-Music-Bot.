const mongoose = require("mongoose");
const dotenv = require('dotenv');
mongoose.set("strictQuery", true);

//Variables .env
dotenv.config({path: '../../../config/.env'});

//MusicSettings
const musicSchema = require('./models/musicSchema');
const triggerSchema = require('./models/triggerSchema');
const embedSchema = require('./models/embedSchema');

module.exports = {
  async initializeMongoose() {
    console.log(`Conectando a MongoDb...`);
    try {
      await mongoose.connect(process.env.MONGO_CONNECTION || '');

      if (mongoose.connect) {
        console.log("Mongoose: Se establecio conexion con la base de datos")
      } else {
        console.error('Mongoose: Fallo al conectar la base de datos"')
      }

      return mongoose.connection;
    } catch (error) {
      console.error("Mongoose: Fallo al conectar la base de datos", error);
      process.exitCode = 1;
    };
  },
  schemas: {
    musicSchema,
    triggerSchema,
    embedSchema
  }
};
