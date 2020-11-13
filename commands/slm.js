module.exports = {
	name: 'slm',
    icon: '📌',
    description: 'Establece un mensaje como el mensaje de coordenadas.',
    needs_args: true,
    min_args: 1,
    usage: '<message_id>',
    admin: true,
    guildOnly: true,
    removeMessage: true,
	execute(message, args) {
        message.channel.messages.fetch(args[0])
        .then(msg => {
            msg.react("➕");
            msg.react('➖');
            msg.channel.send(`✅ Mensaje establecido correctamente. El contenido era: "${msg.embeds[0].title}"`)
            .then(mesg => {
                mesg.delete({ timeout: 500 })
              })
              .catch(console.error);
            
            // REACTION COLLECTOR
            const filter = (reaction, user) => reaction.message.id == args[0];
            const collector = msg.createReactionCollector(filter);
            const command = msg.client.commands.get('locationreact');

            collector.on('collect', command.execute);
        })
        .catch(error => {
            message.channel.send(`💥 Ha habido un error obteniendo el mensaje: \`\`\`${error}\`\`\``);
        });
    },
};