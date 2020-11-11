module.exports = {
	name: 'clean',
    aliases: ['clear'],
    icon: '🧹',
    description: 'Elimina mensajes del chat que no estén pinneados.',
    needs_args: true,
    min_args: 1,
    usage: '<cantidad>',
    admin: true,
    guildOnly: true,
	async execute(message, args) {
        const amount = parseInt(args[0]) + 1;

        if (isNaN(amount) || amount < 0) {
            return message.channel.send(`💥 "${amount}" no es un número válido!`);
        }

        if (amount < 2) {
            return message.channel.send(`💥 Debes eliminar al menos 1 mensaje.`);
        }

        const channelMessages = message.channel.messages;

        const pinnedMessages = await channelMessages.fetchPinned();
        let amountPinnedMessages = pinnedMessages.size;

        const messages = await channelMessages.fetch();
        const messagesLimit = Math.min(amount + amountPinnedMessages, messages.size);

        console.log(messagesLimit);

        var count = 0;

        await message.channel.messages.fetch({ limit: messagesLimit })
            .then(messages => {
                messages.forEach(msg => {
                    if (count < amount && !msg.pinned) {
                        ++count;
                        //console.log(`Eliminendo mensaje (count = ${count}).`);
                        msg.delete();
                    }
                })
        });
        //while (count < messagesLimit) {};
        return message.channel.send(`🔎 ${count - 1} mensajes eliminados.`);
    },
};