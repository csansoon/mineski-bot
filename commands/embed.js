const { DiscordAPIError } = require("discord.js");
const Discord = require('discord.js');

module.exports = {
	name: 'embed',
    icon: ':speech_balloon:',
    description: 'Crea un nuevo embed',
    needs_args: true,
    min_args: 1,
    usage: '<título>',
    admin: false,
    guildOnly: true,
	async execute(message, args) {
        const newEmbed = {
            color: '#0099ff',
            title: `${args.join(' ')}`,
            author: {
                name: message.author.username,
                iconURL: message.author.displayAvatarURL()
            }
        }
        //newEmbed.setAuthor(message.author.username, message.author.displayAvatarURL());
        await message.channel.send({ embed: newEmbed })
        .then (embedmsg => {
            const command = message.client.commands.get('editembed');
            const msgid = embedmsg.id;
            command.execute(message,[msgid]);
        });

    },
};