module.exports = {
	name: 'locate',
    aliases: ['ALIAS1', 'ALIAS2'],
    icon: '🧭',
    description: 'Añade un nuevo sitio en el mapa.',
    needs_args: false,
    usage: '<titulo> <x> <y>(opcional) <z>',
    admin: true,
    guildOnly: true,
	execute(message, args) {
        
        message.channel.send(`❓ Cómo se llama la nueva localización?`);

        const filter = m => m.author.id == message.author.id;
        const collector = message.channel.createMessageCollector(filter, {time: 15000 });

        collector.on('collect', m => {
            console.log(`Collected message: ${m.content}`);
            collector.stop();
        });

        collector.on('end', collected => {
            if (!collected.size) {
                message.channel.send(`⏰ Whoops ${message.author}, se te ha pasado el tiempo límite... Prueba otra vez.`);
            }
            console.log(`END. Collected ${collected.size} items`);
        });
    },
};