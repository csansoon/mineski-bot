module.exports = {
	name: 'editembed', //Debe ser todo minusculas!
    aliases: ['editarembed', 'embededit'],
    icon: '✏',
    resumen: 'Edita un embed.',
    description: 'Abre un editor de embeds interactivo',
    needs_args: true,
    min_args: 1,
    usage: '<ID_MENSAJE>',
    admin: false,
    guildOnly: true,
	execute(message, args) {
        const channel = message.channel;
        channel.messages.fetch(args[0], true)
        .then(embedmsg => {
        
            // Comprobar si el mensaje contiene embeds
            if (embedmsg.embeds.size == 0) return channel.send(`⚠ Ese mensaje no tiene ningún embed!`);

            const embed = embedmsg.embeds[0];
            
            const index = {
                title: "Editando mensaje...",
                url: `http://discord.com/channels/${channel.guild.id}/${channel.id}/${embedmsg.id}`,
                description: 
                "Pulsa los siguientes botones para editar el mensaje:\n" +
                "🖊 Editar título\n" +
                "🔗 Editar link del título\n" +
                "📋 Editar descripción\n" +
                "➕ Añadir campo\n" +
                "➖ Eliminar campo\n" + 
                "🔽 Editar pie de página\n" +
                "🌈 Cambiar color\n" +
                "🗑 Eliminar mensaje\n" +
                "✅ Finalizar edición"
            };

            channel.send({ embed: index }).then(editmsg => {
                editmsg.react("🖊");
                editmsg.react("🔗");
                editmsg.react("📋");
                editmsg.react("➕");
                editmsg.react("➖");
                editmsg.react("🔽");
                editmsg.react("🌈");
                editmsg.react("🗑");
                editmsg.react("✅");

                message.delete();

                const filter = () => true;
                const collector = editmsg.createReactionCollector(filter);

                var sentMessage;

                collector.on('collect', (reaction, user) => {
                    if (user.id == editmsg.author.id) return;


                    if (reaction.emoji.toString() == "🖊") {
                        channel.send(`🖊 ${user}, escribe el nuevo título:`)
                        .then(askmsg => sentMessage = askmsg);
                        const filter = m => m.author.id == user.id;
                        const collector = channel.createMessageCollector(filter, { time: 15000 });

                        collector.on('collect', m => {
                            collector.stop();
                        });

                        collector.on('end', collected => {
                            if (!collected.size)
                                channel.send(`⏰ Se te ha acabado el tiempo para responder, ${user}. Vuelve a intentarlo.`)
                                .then(msg => {
                                    sentMessage.delete();
                                    msg.delete({ timeout: 10000 })
                                })
                                .catch(console.error);
                            else {
                                // LEER ARGUMENTOS
                                embed.setTitle(collected.array()[0].content);
                                collected.array()[0].delete();
                                embedmsg.edit({ embed: embed });
                            }
                        sentMessage.delete();
                        });
                    }


                    else if (reaction.emoji.toString() == "🔗") {
                        channel.send(` ${user}, escribe el nuevo link:\n*Tip: escribe sólo "\`.\`" si quieres eliminar el link.*`)
                        .then(askmsg => sentMessage = askmsg);
                        const filter = m => m.author.id == user.id;
                        const collector = channel.createMessageCollector(filter, { time: 15000 });

                        collector.on('collect', m => {
                            collector.stop();
                        });

                        collector.on('end', collected => {
                            if (!collected.size)
                                channel.send(`⏰ Se te ha acabado el tiempo para responder, ${user}. Vuelve a intentarlo.`)
                                .then(msg => {
                                    sentMessage.delete();
                                    msg.delete({ timeout: 10000 });
                                })
                                .catch(console.error);
                            else {
                                if (collected.array()[0].content == ".") {
                                    embed.url = "";
                                    embedmsg.edit({ embed: embed });
                                }
                                else {
                                    // LEER ARGUMENTOS
                                    try {
                                        const url = new URL(collected.array()[0].content);
                                        embed.setURL(url);
                                        embedmsg.edit({ embed: embed });
                                    }

                                    catch(error) {
                                        channel.send(`⚠ Esa URL no es válida.`)
                                        .then(errormsg => {
                                            errormsg.delete({ timeout: 10000 })
                                        })
                                        .catch(console.error);
                                    }
                                }
                                collected.array()[0].delete();
                            }
                        sentMessage.delete();
                        });
                    }


                    else if (reaction.emoji.toString() == "📋") {
                        channel.send(`📋 ${user}, escribe la nueva descripción:\n*Tip: escribe sólo "\`.\`" si quieres eliminar la descripción.*`)
                        .then(askmsg => sentMessage = askmsg);
                        const filter = m => m.author.id == user.id;
                        const collector = channel.createMessageCollector(filter, { time: 15000 });

                        collector.on('collect', m => {
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
                                // LEER ARGUMENTOS
                                if (collected.array()[0].content == ".") embed.description = "";
                                else embed.setDescription(collected.array()[0].content);
                                collected.array()[0].delete();
                                embedmsg.edit({ embed: embed });
                            }
                            sentMessage.delete();
                        });   
                    }


                    else if (reaction.emoji.toString() == "➕") {
                        channel.send(`💭 ${user}, escribe 2 mensajes, uno con el título y otro con la descripción del campo.\n*Tip: añade el texto "\`[inline]\`" al final de la descripción para activar esta característica.*`)
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
                                let setInline = description.includes('[inline]');
                                if (setInline) description = description.replace("[inline]","");
                                
                                
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
                                    let coords = args.slice(1);
                                    embed.addField(title, description, setInline);

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
                        var count = 0;

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


                    else if (reaction.emoji.toString() == "🔽") {
                        channel.send(`📋 ${user}, escribe el nuevo pie de página:\n*Tip: escribe sólo "\`.\`" si quieres eliminar el pie de página.*`)
                        .then(askmsg => sentMessage = askmsg);
                        const filter = m => m.author.id == user.id;
                        const collector = channel.createMessageCollector(filter, { time: 15000 });

                        collector.on('collect', m => {
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
                                // LEER ARGUMENTOS
                                if (collected.array()[0].content == ".") embed.footer = "";
                                else embed.setFooter(collected.array()[0].content);
                                collected.array()[0].delete();
                                embedmsg.edit({ embed: embed });
                            }
                            sentMessage.delete();
                        });
                    }


                    else if (reaction.emoji.toString() == "🌈") {
                        channel.send(` ${user}, escribe el código HEX del nuevo color:`)
                        .then(askmsg => sentMessage = askmsg);
                        const filter = m => m.author.id == user.id;
                        const collector = channel.createMessageCollector(filter, { time: 15000 });

                        collector.on('collect', m => {
                            collector.stop();
                        });

                        collector.on('end', collected => {
                            if (!collected.size)
                                channel.send(`⏰ Se te ha acabado el tiempo para responder, ${user}. Vuelve a intentarlo.`)
                                .then(msg => {
                                    sentMessage.delete();
                                    msg.delete({ timeout: 10000 });
                                })
                                .catch(console.error);
                            else {
                                // LEER ARGUMENTOS
                                try {
                                    embed.setColor(collected.array()[0].content);
                                    embedmsg.edit({ embed: embed });
                                }

                                catch(error) {
                                    channel.send(`⚠ Ese color no es válido.`)
                                    .then(errormsg => {
                                        errormsg.delete({ timeout: 10000 })
                                    })
                                    .catch(console.error);
                                }
                                collected.array()[0].delete();
                            }
                        sentMessage.delete();
                        });
                        
                    }


                    else if (reaction.emoji.toString() == "🗑") {
                        embedmsg.delete();
                        collector.stop();
                    }


                    else if (reaction.emoji.toString() == "✅") collector.stop();

                    reaction.users.remove(user);

                });

                collector.on('end', collected => {
                    editmsg.delete();
                });

            });

        })
        .catch(error => {
            //console.log(error);

            // Comprobar si el mensaje no existe
            if (error.message == "Unknown Message") return channel.send(`⚠ Uhmm... No he encontrado ningún mensaje con esa id en este canal...`);

            // Comprobar otros errores:
            return channel.send(`💥 Ha habido un error: \`\`\`${error}\`\`\``);
        })
    },
};