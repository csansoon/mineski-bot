module.exports = {
    name: 'avatar',
    aliases: ['icon', 'icono', 'picture'],
    description: 'Muestra el avatar de un usuario!',
    needs_args: true,
    min_args: 1,
    usage: '<users>',
    guildOnly: true,
    cooldown: 5,
	execute(message, args) {
        if (!message.mentions.users.size) { return message.channel.send(usage); }
    
        const avatarList = message.mentions.users.map(user => {
            return `${user.username}'s avatar: <${user.displayAvatarURL({ format: "png", dynamic: true })}>`;
        });
    
        // send the entire array of strings as a message
        // by default, discord.js will `.join()` the array with `\n`
        message.channel.send(avatarList);
    },
};