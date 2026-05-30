const errorHandler = require("./errorHandler");
const globalErrorHandler = require("./globalErrorHandler");
const musicErrorHandler = require("./musicErrorHandler");

module.exports = (client) => {
errorHandler(client);
globalErrorHandler(client);
musicErrorHandler(client);
};