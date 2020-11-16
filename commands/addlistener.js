module.exports = {
	name: 'addlistener', //Debe ser todo minusculas!
    aliases: ['listener', 'listento', 'escucha'],
    icon: '👂',
    resumen: 'Hace editable un embed',
    description: 'Permite que cualquier usuario pueda añadir, editar y eliminar campos del embed seleccionado.',
    needs_args: true,
    min_args: 1,
    usage: '<MSG_ID>',
    admin: true,
    guildOnly: true,
	execute(message, args) {
        const channel = message.channel;
        channel.messages.fetch(args[0], true)
        .then(embedmsg => {
        
            // Comprobar si el mensaje contiene embeds
            if (embedmsg.embeds.size == 0) return channel.send(`⚠ Ese mensaje no tiene ningún embed!`);

            const embed = embedmsg.embeds[0];

            let footer;
            if (embed.footer) footer = embed.footer;
            else footer = {text: ""};

            footer.text += `\n⬇️Reacciona con ➕ o ➖ para añadir o eliminar un campo:`;

            embed.footer = footer;

            embedmsg.edit({embed: embed});
            
            embedmsg.react("➕");
            embedmsg.react("➖");

            const filter1 = () => true;
            const collector1 = embedmsg.createReactionCollector(filter1);

            collector1.on('collect', (reaction, user) => {
                if (user.id == embedmsg.author.id) return;

                else if (reaction.emoji.toString() == "➕") {
                    channel.send(`💭 ${user}, escribe 2 mensajes, uno con el título y otro con la descripción del campo.\n`)
                    .then(askmsg => sentMessage = askmsg);
                    const filter = m => m.author.id == user.id;
                    const collector = channel.createMessageCollector(filter, { time: 15000 });
                    var count = 0;

                    collector.on('collect', message => {
                        count++;
                        if (count > 1) collector.stop();
                    });

                    collector.on('end', collected => {
                        if (!collected.size)
                            channel.send(`⏰ Se te ha acabado el tiempo para responder, ${user}. Vuelve a intentarlo.`)
                            .then(msg => {
                                msg.delete({ timeout: 10000 })
                            })
                            .catch(console.error);

                        else if (collected.size < 2)
                            channel.send(`⚠ Sólo has enviado 1 mensaje, ${user}. Tienes que enviar 2 para añadir el campo.`)
                            .then(msg => {
                                collected.array()[0].delete();
                                msg.delete({ timeout: 10000 })
                            })
                            .catch(console.error);

                        else {
                            // BUSCAR SI EL ELEMENTO YA EXISTE
                            let currentField = embed.fields.find(field => field.name == collected.array()[0].content);
                            if (currentField) return channel.send(`⚠ \`\`${currentField.name}\`\` ya existe... Vuelve a probar con otro nombre.`)
                            .then(msg => {
                                sentMessage.delete();
                                msg.delete({ timeout: 10000 })
                            })
                            .catch(console.error);
                            
                            // COMPROBAR INLINE
                            let title = collected.array()[0].content;
                            let description = collected.array()[1].content;
                            
                            
                            if (description == "") {
                                channel.send(`⚠ ${user}, la descripción no puede estar vacía.`)
                                .then(msg => {
                                    collected.array()[0].delete();
                                    msg.delete({ timeout: 10000 })
                                })
                                .catch(console.error);
                            }

                            else {
                                // PONER NUEVO ELEMENTO
                                embed.addField(title, description, true);

                                // EDITAR EMBED
                                embedmsg.edit({ embed: embed });
                            }
                            collected.array()[0].delete();
                            collected.array()[1].delete();
                        }
                        sentMessage.delete();
                    });
                }

                else if (reaction.emoji.toString() == "➖") {
                    channel.send(`💭 ${user}, escribe el título del campo que quieres eliminar.`)
                    .then(askmsg => sentMessage = askmsg);
                    const filter = m => m.author.id == user.id;
                    const collector = channel.createMessageCollector(filter, { time: 15000 });

                    collector.on('collect', message => {
                        collector.stop();
                    });

                    collector.on('end', collected => {
                        if (!collected.size)
                            channel.send(`⏰ Se te ha acabado el tiempo para responder, ${user}. Vuelve a intentarlo.`)
                            .then(msg => {
                                msg.delete({ timeout: 10000 })
                            })
                            .catch(console.error);

                        else {
                            // BUSCAR SI EL ELEMENTO YA EXISTE
                            let fields = embed.fields;
                            let searchedField = fields.find(field => field.name == collected.array()[0].content);
                            if (!searchedField) return channel.send(`⚠ Uhh... \`\`${collected.array()[0].content}\`\` no existe... Seguro que se llama así?`)
                            .then(msg => {
                                sentMessage.delete();
                                collected.array()[0].delete();
                                msg.delete({ timeout: 10000 })
                            })
                            .catch(console.error);
                            let fieldIndex = fields.indexOf(searchedField);
                            
                            // ELIMINAR ELEMENTO
                            fields.splice(fieldIndex, 1);
                            embed.fields = fields;

                            // EDITAR EMBED
                            embedmsg.edit({ embed: embed });

                            collected.array()[0].delete();
                        }
                        sentMessage.delete();
                    });
                    
                }

            reaction.users.remove(user);
            });

            collector1.on('end', collected => {
                embedmsg.reactions.cache.delete("➕");
                embedmsg.reactions.cache.delete("➖");
            });
        });
        
    },
};