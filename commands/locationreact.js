const { Discord } = require("discord.js");

module.exports = {
	name: 'locationreact',
    resumen: 'Esto lo voy a quitar',
    description: 'Nueva reacción en el mensaje de localizaciónes',
    needs_args: false,
    admin: false,
    guildOnly: true,
    reactCommand: true,
	execute(reaction, user) {
        if (user.id != "775422019822026762") {
            if (reaction.emoji.toString() == "➕") {
                console.log(`${user.username} quiere añadir una location.`);
                addElement();
                reaction.users.remove(user);
            }
            else if (reaction.emoji.toString() == "➖") {
                console.log(`${user.username} quiere eliminar una location.`);
                removeElement();
                reaction.users.remove(user);
            }
            else {
                reaction.remove();
            }
        }

        function addElement() {
            const channel = reaction.message.channel;
            var sentMessage;
            channel.send(`💭 ${user}, escribe el nombre (sin espacios) y las coordenadas del sitio que quieras añadir, por ejemplo:\`\`\`nombre_del_sitio x y z\`\`\``)
            .then(message => sentMessage = message);
            const filter = m => m.author.id == user.id;
            const collector = channel.createMessageCollector(filter, { time: 15000 });

            collector.on('collect', message => {
                collector.stop();
            })

            collector.on('end', collected => {
                if (!collected.size) channel.send(`⏰ Se te ha acabado el tiempo para responder, ${user}. Vuelve a intentarlo.`)
                .then(msg => {
                    sentMessage.delete();
                    msg.delete({ timeout: 10000 })
                  })
                  .catch(console.error);
                else {
                    // LEER ARGUMENTOS
                    collected.array()[0].delete();
                    const args = collected.array()[0].content.slice().trim().split(/ +/);
                    if (args.length < 2) return channel.send(`⚠ Umm... Seguro que lo has escrito bien...? Vuelve a probar, anda.`)
                    .then(msg => {
                        sentMessage.delete();
                        msg.delete({ timeout: 10000 })
                      })
                      .catch(console.error);
                    
                    // LEER EMBED
                    var embed = reaction.message.embeds[0];

                    // BUSCAR SI EL ELEMENTO YA EXISTE
                    let currentField = embed.fields.find(field => field.name == args[0]);
                    if (currentField) return channel.send(`⚠ \`\`${currentField.name}\`\` ya existe... Vuelve a probar con otro nombre.`)
                    .then(msg => {
                        msg.delete({ timeout: 10000 })
                      })
                      .catch(console.error);
                    
                    // PONER NUEVO ELEMENTO
                    let coords = args.slice(1);
                    embed.addField(args[0], coords.join(' '), true);

                    // EDITAR EMBED
                    reaction.message.edit(embed);
                    return channel.send(`✅ ${args[0]} añadido correctamente :D`)
                    .then(msg => {
                        sentMessage.delete();
                        msg.delete({ timeout: 10000 })
                      })
                      .catch(console.error);
                }
            })
        }

        function removeElement() {
            const channel = reaction.message.channel;
            var sentMessage;
            channel.send(`💭 ${user}, escribe el nombre del elemento que quieres eliminar.`)
            .then(message => sentMessage = message);
            const filter = m => m.author.id == user.id;
            const collector = channel.createMessageCollector(filter, { time: 15000 });

            collector.on('collect', message => {
                collector.stop();
            })

            collector.on('end', collected => {
                if (!collected.size) channel.send(`⏰ Se te ha acabado el tiempo para responder, ${user}. Vuelve a intentarlo.`)
                .then(msg => {
                    sentMessage.delete();
                    msg.delete({ timeout: 10000 })
                  })
                  .catch(console.error);
                else {    
                    collected.array()[0].delete();

                    // LEER ARGUMENTOS
                    const args = collected.array()[0].content.slice().trim().split(/ +/);
                    if (args.length > 1 ) return channel.send(`⚠ Umm... Seguro que eliminar el elemento? Sólo tienes que poner el nombre eh.`)
                    .then(msg => {
                        sentMessage.delete();
                        msg.delete({ timeout: 10000 })
                      })
                      .catch(console.error);
                    
                    // LEER EMBED
                    var embed = reaction.message.embeds[0];

                    // BUSCAR SI EL ELEMENTO YA EXISTE
                    let fields = embed.fields;
                    let searchedField = fields.find(field => field.name == args[0]);
                    if (!searchedField) return channel.send(`⚠ Uhh... \`\`${args[0]}\`\` no existe... Seguro que se llama así?`)
                    .then(msg => {
                        sentMessage.delete();
                        msg.delete({ timeout: 10000 })
                      })
                      .catch(console.error);
                    let fieldIndex = fields.indexOf(searchedField);
                    
                    // ELIMINAR ELEMENTO
                    fields.splice(fieldIndex, 1);
                    embed.fields = fields;

                    // EDITAR EMBED
                    reaction.message.edit(embed);
                    return channel.send(`✅ ${args[0]} eliminado correctamente :D`)
                    .then(msg => {
                        sentMessage.delete();
                        msg.delete({ timeout: 10000 })
                      })
                      .catch(console.error);
                }
            })
        }
    },
};