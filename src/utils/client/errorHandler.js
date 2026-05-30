module.exports = (client) => {
    client.on('error', (error) => {
        console.error('Discord client error:', error);
    });

    client.on('warn', (warning) => {
        console.warn('Discord client warning:', warning);
    });
};
