module.exports = {
	name: 'ping',
    description: 'Ping!',
    icon:'🏓',
    needs_args: false,
    guildOnly: false,
    cooldown: 10,
	execute(message, args) {
		message.channel.send('🏓 Pong.');
    },
};