const { prefix } = require('../config.json');
const Discord = require('discord.js');

module.exports = {
	name: 'help',
    aliases: ['ayuda','commands','comandos'],
    resumen: 'Muestra este mensaje.',
    description: 'Lista de todos los comandos o información de un comando en específico.',
    icon: '❓',
    needs_args: false,
    usage: '<comando> (opcional)',
    guildOnly: true,
	execute(message, args) {
        const { commands } = message.client;

        var textoMensaje = "";
        var embed = new Discord.MessageEmbed();

        if (!args.length) {
            textoMensaje = "Hey, aquí tienes una lista con todos mis comandos:"
            embed.title = "Comandos:"
            embed.description = `Lista con todos mis comandos disponibles.`;
            //embed.description += `\n*El icono ☁ marca los comandos que sólo puedes usar en un servidor y no funcionan por DM*`;
            //embed.description += `\n*El icono ⭐ marca los comandos que sólo pueden usar los administradores del servidor*`;
            embed.description += `\nSi necesitas más información sobre un comando en específico,\nescribe "\`${prefix}${this.name} <COMANDO>\`" y te diré qué hace y cómo funciona :D\n`;
            embed.description += "\n**TODOS LOS COMANDOS:**\n";

            embed.color = "#0599f5";

            message.client.commands.map(command => {
                let nombre = "";
                if (command.icon) nombre += command.icon + ' ';
                nombre += command.name;
                let resumen = "Este comando no tiene resumen wtf";
                if (command.resumen) resumen = command.resumen;
                let icons = [];
                if (command.guildOnly) icons.push('☁');
                if (command.admin) icons.push('⭐');
                //if (icons.length) nombre += `[${icons.join('')}]`
                embed.fields.push({
                    name: nombre,
                    value: resumen,
                    inline: true
                })
            });
            embed.footer = {text: `Escribe "${prefix}${this.name} <comando>\" para obtener más información sobre un comando en específico.`};
        }

        else if (args.length) {

            const commandName = args[0].toLowerCase();
            const command = commands.get(commandName) || commands.find(c => c.aliases && c.aliases.includes(commandName));

            if (!command) {
                return message.reply(`⛔ No existe el comando \`${commandName}\`.`);
            }

            embed.color = "#00ad28";

            if (command.icon) embed.title = command.icon;
            embed.title += command.name;
            embed.fields.push({
                name: "Descripción:",
                value: command.description,
                inline: false
            });
            let value = `Escribe \`${prefix}${command.name}`;
            if (command.usage) value += ` ${command.usage}`;
            value += `\``;
            embed.fields.push({
                name: "Uso:",
                value: value,
                inline: false
            });
            if (command.aliases) {
                value = `También puedes usar \`${prefix}${command.aliases.join(`\`, \`${prefix}`)}\``;
                embed.fields.push({
                    name: "Aliases:",
                    value: value,
                    inline: false
                })
            }
            if (command.admin || command.guildOnly) {
                value = "";
                if (command.admin) {
                    value += `\n⭐ Este es un comando sólo para administradores`;
                    embed.color = "#f5c905";
                }
                if (command.guildOnly) value += `\n☁ No puedes usar este comando a través de DM, sólo en servidores.`;
                embed.fields.push({
                    name: "Restricciones:",
                    value: value,
                    inline: false
                })
            }

        }
        message.channel.send(textoMensaje, { embed: embed });
    },
};