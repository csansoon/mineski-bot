const { prefix } = require('../config.json');

module.exports = {
	name: 'help',
    aliases: ['ayuda','commands','comandos'],
    description: 'Lista de todos los comandos o información de un comando en específico.',
    icon: '❓',
    needs_args: false,
    usage: '<comando> (opcional)',
    guildOnly: true,
	execute(message, args) {
        const data = [];
        const { commands } = message.client;

        if (!args.length) {
            data.push('Lista de todos los comandos:')
            message.client.commands.map(command => {
                let nombre = "";
                if (command.icon) nombre += command.icon + ' ';
                else nombre += '+ ';
                nombre += command.name;
                let icons = [];
                if (command.admin) icons.push('⭐');
                if (command.guildOnly) icons.push('☁');
                if (icons.length) nombre += `[${icons.join(', ')}]`
                data.push(nombre);
            });
            //data.push(' + ' + commands.map(command => command.name).join('\n + '));
            data.push(`Puedes usar \`\`${prefix}${this.name} ${this.usage}\`\` para obtener información de un comando en específico.`)
        }

        else if (args.length) {

            const commandName = args[0].toLowerCase();
            const command = commands.get(commandName) || commands.find(c => c.aliases && c.aliases.includes(commandName));

            if (!command) {
                return message.reply(`⛔ No existe el comando \`${commandName}\`.`);
            }

            data.push(`**Comando:** ${command.name}`);
            if (command.icon) data.push(`**Icono:** ${command.icon}`);
            if (command.aliases) data.push(`**Aliases:** \`${command.aliases.join('\`, \`')}\``);
            if (command.description) data.push(`**Descripción:** ${command.description}`);
            if (command.usage) data.push(`**Uso:** \`\`${prefix}${command.name} ${command.usage}`);
            if (command.cooldown) data.push(`**Cooldown:** ${command.cooldown} segundos`);
            if (command.guildOnly) data.push(`☁ Este comando sólo puede ser usado en servidores.`);
            if (command.admin) data.push(`⭐ Este comando sólo pueden usarlo administradores.`)

        }
        message.channel.send(data, {split: true });
    },
};