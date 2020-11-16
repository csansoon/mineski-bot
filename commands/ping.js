module.exports = {
	name: 'ping',
    description: 'Prueba la velocidad de respuesta del bot.',
    resumen: 'pong!',
    icon:'🏓',
    needs_args: false,
    guildOnly: false,
    cooldown: 10,
	execute(message, args) {
		message.channel.send('🏓 Pong.');
    },
};