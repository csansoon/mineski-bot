module.exports = {
	name: 'reload',
    aliases: ['recargar', 'recarga', 'compilar', 'compila'],
    description: 'Recarga todos los comandos del Bot.',
    icon: '🔄',
    args: false,
    usage: '<comandos> (opcional)',
    guildOnly: false,
	execute(message, args) {
        //if (!args.length) return message.channel.send(`You didn't pass any command to reload, ${message.author}!`);

        function reload(command) {
            
            message.channel.send(`⏳ Recargando comando \`${command.name}\`...`);

            delete require.cache[require.resolve(`./${command.name}.js`)];

            try {
                const newCommand = require(`./${command.name}.js`);
                message.client.commands.set(newCommand.name, newCommand);
            } catch (error) {
                console.error(error);
                message.channel.send(`💥 Ha habido un error recargando el comando \`${command.name}\`:\n\`${error.message}\``);
            }
        }

        if (args.length) {
            const commandName = args[0].toLowerCase();
            const command = message.client.commands.get(commandName)
                || message.client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

            if (!command) return message.channel.send(`⛔ No existe el comando \`${commandName}\`.`);

            reload(command);
            message.channel.send(`✅ He recargado el comando \`${command.name}\` :)`);
        }

        else {
            message.channel.send("Voy a recargar toodos los comandos.");
            message.client.commands.map(command => reload(command));
            message.channel.send(`✅ He recargado rodos los comandos :D`);
        }
    },
};