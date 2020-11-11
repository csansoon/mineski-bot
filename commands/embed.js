const { DiscordAPIError } = require("discord.js");
const Discord = require('discord.js');

module.exports = {
	name: 'embed',
    icon: ':speech_balloon:',
    description: 'Crea un nuevo embed',
    needs_args: true,
    min_args: 2,
    usage: '<título> <"descripción">',
    admin: false,
    guildOnly: true,
	execute(message, args) {
        const newEmbed = new Discord.MessageEmbed()
        newEmbed.setColor('#0099ff');
        newEmbed.setTitle(args[0]);

        var description = "";

        if (args[1][0] != '"') description = args[1];
        else {
            let j = 1;
            while (j != args.length && args[j][args[j].length - 1] != '"')
                j++;
            
            args[1] = args[1].substr(1, args[1].length - 1);
            args[j] = args[j].substr(0, args[j].length - 1);
            for (var i = 1; i <= j; i++) {
                if (i > 1) description += " ";
                description += args[i];
            }
        }
        newEmbed.setDescription(description);

        message.channel.send(newEmbed);
    },
};