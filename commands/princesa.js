const editembed = require("./editembed");

module.exports = {
	name: 'princesa',
    aliases: ['jugarprincesa', 'playprincesa'],
    icon: '♠',
    description: 'Empezar un juego de La Princesa con los jugadores establecidos.',
    needs_args: true,
    min_args: 2,
    usage: '<Jugadores>',
    admin: false,
    guildOnly: true,
	async execute(message, args) {
        var users = message.mentions.users.array();

        if (users.length < 2) return message.channel.send(`⚠ Se necesitan por lo menos a 2 jugadores para jugar.`);
        if (users.length > 5) return message.channel.send(`⚠ No pueden jugar más de 5 jugadores.`);

        var manos = [];
        users.map(user => { manos.push([{
            user: user,
            vivo: true,
            escudo: false,
            message: null
        }])});

        const carta1 = "🗡️";
        const carta2 = "👁️";
        const carta3 = "⚔️";
        const carta4 = "🛡️";
        const carta5 = "5️⃣";
        const carta6 = "🔁";
        const carta7 = "7️⃣";
        const carta8 = "👑";

        
        var cartas = [
            carta1, carta1, carta1, carta1, carta1,
            carta2, carta2,
            carta3, carta3,
            carta4, carta4,
            carta5, carta5,
            carta6,
            carta7,
            carta8
        ];

        var embedPartida = {
            color: '#0099ff',
            title: `La Princesa`,
            description: `Historial:\n`
        }

        var mensajePublico;
        //message.channel.send(`Cartas: ${carta1}, ${carta2}, ${carta3}, ${carta4}, ${carta5}, ${carta6}, ${carta7}, ${carta8}`);

        //message.channel.send(`Empezando partida con los jugadores:\n${users.join(', ')}`);

        function copiarEmbed() {
            let copia = {
                color: embedPartida.color,
                title: embedPartida.title,
                description: embedPartida.description,
                fields: embedPartida.fields
            };
            return copia;
        }

        function barajar(array) {
            array.sort(() => Math.random() - 0.5);
        }

        function cartasDe(userIndex) {
            return manos[userIndex].slice(1);
        }

        function user(userIndex) {
            return manos[userIndex][0].user;
        }

        function actualizarHistorial(texto) {
            embedPartida.description += texto;
            enviarEmbed();
        }

        function robarCarta(userIndex) {
            manos[userIndex].push(cartas[0]);
            cartas.shift();
            actualizarHistorial(`${manos[userIndex][0].user} ha robado una carta.\n`);
        }

        function matar(userIndex) {
            manos[userIndex][0].vivo = false;
            actualizarHistorial(`${manos[userIndex][0].user} ha muerto.💀\n`);
        }

        function descartar(userIndex) {
            if (!manos[userIndex][0].vivo) actualizarHistorial(`${manos[userIndex][0].user} no puede descartarse, está muerto.\n`);
            else if (manos[userIndex].slice(1).length == 0) actualizarHistorial(`${manos[userIndex][0].user} no puede descartarse, no tiene cartas.\n`);
            else {
                let cartaDescartada = manos[userIndex].slice(1)[manos[userIndex].slice(1).length-1];
                manos[userIndex].pop();
                actualizarHistorial(`${manos[userIndex][0].user} ha descartado ${cartaDescartada}\n`);
                if (cartaDescartada == carta8) matar(userIndex);
                else robarCarta(userIndex);
            }
        }

        var mensajesEnviados = 0;
        var mensajePublicoEnviado = false;
        
        function esperarEnvioMensaje() {
            if (mensajesEnviados < manos.length || !mensajePublicoEnviado) {
                setTimeout(function(){esperarEnvioMensaje()},100);
            }
            else {
                empezarJuego();
            }
        }

        function enviarPrimerMensaje() {
            manos.map(mano => {
                
                var embedIndividual = copiarEmbed();
                embedIndividual.title = mano[0].user.username;
                embedIndividual.description += `Se han repartido las cartas.\n`;
                if (mano.slice(1).length)
                    embedIndividual.fields = [{
                        name: "Tus cartas:",
                        value: mano.slice(1).join(' ')
                    }]; 
                
                mano[0].user.send({ embed: embedIndividual }).then(msg => {
                    mano[0].message = msg;
                    mensajesEnviados++;
                });
            });

            message.channel.send({ embed:embedPartida }).then(msg => {
                mensajePublico = msg;
                mensajePublicoEnviado = true;
            });
        }

        function enviarEmbed() {
            manos.map(mano => {
                let embedIndividual = copiarEmbed();

                if (!partidaActiva) {
                    embedIndividual.color = "#f5d442";
                }
                else if (!mano[0].vivo) {
                    embedIndividual.footer = {text: `💀 Estás muerto 💀`};
                    embedIndividual.color = "#f54242";
                    embedIndividual.fields = [
                    {
                        name: "Cartas restantes",
                        value: cartas.length,
                        inline: true
                    }
                ]; 
                }
                else {
                    if (mano.slice(1).length) {
                        embedIndividual.fields = [{
                            name: "Tus cartas:",
                            value: mano.slice(1).join(' '),
                            inline: true
                        },
                        {
                            name: "Cartas restantes",
                            value: cartas.length,
                            inline: true
                        }
                    ]; 
                        embedIndividual.color = "#00a103";
                    }
                    if (mano[0].escudo) {
                        embedIndividual.footer = {text: `${carta4} Tienes un escudo activo ${carta4}`};
                        embedIndividual.color = "#00bfff";
                    }
                }
                mano[0].message.edit({ embed: embedIndividual });
            });
            var embedPublico = copiarEmbed();
            embedPublico.fields = [
                {
                    name: "Cartas restantes",
                    value: cartas.length,
                    inline: true
                }
            ]; 
            mensajePublico.edit({ embed: embedPublico });
        }

        var partidaActiva = true;
        var turno = 0;
        var finTurno = false;

        function esperarTurno() {
            if (!finTurno && partidaActiva) {
                setTimeout(function(){esperarTurno()},100);
            }
            else {
                do {
                    turno++;
                    if (turno >= manos.length) turno = 0;
                } while (!manos[turno][0].vivo)
                jugarSiguienteTurno(turno);
            }
        }

        function jugarSiguienteTurno(userIndex) {
            finTurno = false;
            
            var numUsersVivos = 0;
            var numUsersVivosDeVerdad = 0;
            
            for (let i = 0; i < manos.length; ++i) {
                if (manos[i][0].vivo && !manos[i][0].escudo && manos[i][0].user != manos[userIndex][0].user) {
                    numUsersVivos++;
                }
                if (manos[i][0].vivo) numUsersVivosDeVerdad++;
            }
            
            let noQuedanCartas = (cartas.length < 2);
            let noQuedanUsers = (numUsersVivosDeVerdad < 2);
            if (noQuedanCartas || noQuedanUsers) {
                if (noQuedanCartas) actualizarHistorial(`🏁 No quedan más cartas que robar. 🏁`);
                if (noQuedanUsers) actualizarHistorial(`🏁 No quedan más jugadores vivos. 🏁`);
                partidaActiva = false;
                return acabarPartida();
            }
            
            manos[userIndex][0].escudo = false;
            robarCarta(turno);
            enviarEmbed();
            let emojisCartas = []
            var cartasJugables = manos[userIndex].slice(1);
            var descartarCartas = false;
            var textoTurno = `Es tu turno, elije una carta:\n`;

            if (numUsersVivos == 0) {
                if (cartasJugables.indexOf(carta1) >= 0) {
                    cartasJugables.splice(cartasJugables.indexOf(carta1),1);
                    textoTurno += `❌ No puedes usar ${carta1} porque no hay más jugadores vivos sin escudos! ❌\n`;
                }
                if (cartasJugables.indexOf(carta2) >= 0) {
                    cartasJugables.splice(cartasJugables.indexOf(carta2),1);
                    textoTurno += `❌ No puedes usar ${carta2} porque no hay más jugadores vivos sin escudos! ❌\n`;
                }
                if (cartasJugables.indexOf(carta3) >= 0) {
                    cartasJugables.splice(cartasJugables.indexOf(carta3),1);
                    textoTurno += `❌ No puedes usar ${carta3} porque no hay más jugadores vivos sin escudos! ❌\n`;
                }
                if (cartasJugables.indexOf(carta6) >= 0) {
                    cartasJugables.splice(cartasJugables.indexOf(carta6),1);
                    textoTurno += `❌ No puedes usar ${carta6} porque no hay más jugadores vivos sin escudos! ❌\n`;
                }
            }

            if (cartasJugables.includes(carta7) && (cartasJugables.includes(carta5) || cartasJugables.includes(carta8))) {
                cartasJugables = [carta7];
                textoTurno += `⚠ Sólo puedes jugar ${carta7} tienes una ${carta5} o una ${carta8} ⚠\n`;
            }

            if (cartasJugables.length == 0) {
                descartarCartas = true;
                textoTurno += `💥 No te queda ninguna carta que puedas jugar, descarta una: 💥`;
            }
            
            manos[userIndex][0].user.send(textoTurno).then(msg => {

                if (descartarCartas) {
                    manos[userIndex].slice(1).forEach(emoji => {
                        emojisCartas.push(emoji);
                        msg.react(emoji);
                    });
                }
                else {
                    cartasJugables.forEach(emoji => {
                        emojisCartas.push(emoji);
                        msg.react(emoji);
                    });
                }

                const filter = () => true;
                const collector = msg.createReactionCollector(filter);
                var cartaJugada;
    
                collector.on('collect', (reaction, user) => {
                    if (user != manos[userIndex][0].user) return;
                    if (emojisCartas.includes(reaction.emoji.toString())) {
                        cartaJugada = reaction.emoji.toString();
                        collector.stop();
                    }
                });
    
                collector.on('end', collected => {
                    msg.delete();

                    // Eliminar carta usada:
                    manos[userIndex].splice(manos[userIndex].slice(1).indexOf(cartaJugada) + 1, 1);

                    if (descartarCartas) {
                        actualizarHistorial(`${manos[userIndex][0].user} no puede jugar y descarta ${cartaJugada}.`);
                        finTurno = true;
                    }

                    // CARTA 1:
                    else if (cartaJugada == carta1) {
                        actualizarHistorial(`${manos[userIndex][0].user} lanza ${carta1} contra `);
                        var textoCarta = `Elije a un jugador para atacar:\n`;
                        var indexUsersVivos = [];
                        for (let i = 0; i < manos.length; ++i) {
                            if (manos[i][0].vivo && !manos[i][0].escudo && manos[i][0].user != manos[userIndex][0].user) {
                                indexUsersVivos.push(i);
                            }
                        }
                        for (let i = 0; i < indexUsersVivos.length; ++i) {
                            textoCarta += `${numEmoji(i+1)}: ${manos[indexUsersVivos[i]][0].user}\n`;
                        }

                        manos[userIndex][0].user.send(textoCarta).then(msg2 => {
                            try {
                                for (let i = 0; i < indexUsersVivos.length; ++i)
                                    msg2.react(numEmoji(i + 1));
                                const filter2 = () => true;
                                const collector2 = msg2.createReactionCollector(filter2);
                                var selectedUserIndex = 0;
                    
                                collector2.on('collect', (reaction2, user2) => {
                                    if (user2 != manos[userIndex][0].user) return;

                                    selectedUserIndex = emojiNum(reaction2.emoji.toString()) - 1;
                                    if (selectedUserIndex < 0) return;

                                    collector2.stop();
                                });
                    
                                collector2.on('end', collected => {
                                    msg2.delete();
                                    actualizarHistorial(`${manos[indexUsersVivos[selectedUserIndex]][0].user} y le acusa de tener `);
                                    var textoCarta2 = `Qué carta crees que tiene?:\n`;
                                    var cartasPosibles = [carta2, carta3, carta4, carta5, carta6, carta7, carta8];

                                    manos[userIndex][0].user.send(textoCarta2).then(msg3 => {
                                        for (let i = 0; i < cartasPosibles.length; ++i)
                                            msg3.react(cartasPosibles[i]);
                                        const filter3 = () => true;
                                        const collector3 = msg3.createReactionCollector(filter3);
                                        var selectedEmoji = "";
                            
                                        collector3.on('collect', (reaction3, user3) => {
                                            if (user3 != manos[userIndex][0].user) return;

                                            selectedEmoji = reaction3.emoji.toString();
                                            if (!cartasPosibles.includes(selectedEmoji)) return;

                                            collector3.stop();
                                        });
                            
                                        collector3.on('end', collected => {
                                            msg3.delete();
                                            actualizarHistorial(`${selectedEmoji}.`);
                                            var textoCarta3 = `${manos[userIndex][0].user} te acusa de tener: ${selectedEmoji}\n`;
                                            let hasPerdido = manos[indexUsersVivos[selectedUserIndex]].slice(1).includes(selectedEmoji);

                                            if (hasPerdido) textoCarta3 += `Ha acertado, has muerto. 💀\n`;
                                            else textoCarta3 += `Ha fallado, no pasa nada. 🤷‍♂️\n`;
                                            textoCarta3 += `Pulsa ✅ para continuar la partida.`;

                                            manos[indexUsersVivos[selectedUserIndex]][0].user.send(textoCarta3).then(msg4 => {
                                                msg4.react(`✅`);
                                                const filter4 = () => true;
                                                const collector4 = msg4.createReactionCollector(filter4);
                                    
                                                collector4.on('collect', (reaction4, user4) => {
                                                    if (user4 != manos[indexUsersVivos[selectedUserIndex]][0].user) return;
                                                    if (reaction4.emoji.toString() != '✅') return;

                                                    collector4.stop();
                                                });
                                    
                                                collector4.on('end', collected => {
                                                    msg4.delete();
                                                    if (hasPerdido) {
                                                        actualizarHistorial(`(✅)\n`);
                                                        matar(indexUsersVivos[selectedUserIndex]);
                                                    }
                                                    else {
                                                        actualizarHistorial(`(❌)\n`);
                                                    }
                                                    finTurno = true;
                                                });
                                            });
                                        });
                                    });
                                });
                            }
                            catch (error) { console.log("Ha habido un error ejectuando la carta1"); }
                        });
                    }

                    else if (cartaJugada == carta2) {
                        actualizarHistorial(`${manos[userIndex][0].user} lanza ${cartaJugada} para ver la carta de `);
                        var textoCarta = `Elije a un jugador para ver su carta:\n`;
                        var indexUsersVivos = [];
                        for (let i = 0; i < manos.length; ++i) {
                            if (manos[i][0].vivo && !manos[i][0].escudo && manos[i][0].user != manos[userIndex][0].user) indexUsersVivos.push(i);
                        }
                        for (let i = 0; i < indexUsersVivos.length; ++i) {
                            textoCarta += `${numEmoji(i+1)}: ${manos[indexUsersVivos[i]][0].user}\n`;
                        }

                        manos[userIndex][0].user.send(textoCarta).then(msg2 => {
                            for (let i = 0; i < indexUsersVivos.length; ++i)
                                try { msg2.react(numEmoji(i + 1)); }
                                catch (error) {}
                            const filter2 = () => true;
                            const collector2 = msg2.createReactionCollector(filter2);
                            var selectedUserIndex = 0;
                
                            collector2.on('collect', (reaction2, user2) => {
                                if (user2 != manos[userIndex][0].user) return;

                                selectedUserIndex = emojiNum(reaction2.emoji.toString()) - 1;
                                if (selectedUserIndex < 0) return;

                                collector2.stop();
                            });
                
                            collector2.on('end', collected => {
                                msg2.delete();
                                actualizarHistorial(`${manos[indexUsersVivos[selectedUserIndex]][0].user}.\n`);
                                var textoCarta2 = `${manos[indexUsersVivos[selectedUserIndex]][0].user} tiene esta carta: ${manos[indexUsersVivos[selectedUserIndex]].slice(1).join(' ')}.\nPulsa ✅ para acabar tu turno.`;

                                manos[userIndex][0].user.send(textoCarta2).then(msg3 => {
                                    msg3.react('✅');
                                    const filter3 = () => true;
                                    const collector3 = msg3.createReactionCollector(filter3);
                                    var selectedEmoji = "";
                        
                                    collector3.on('collect', (reaction3, user3) => {
                                        if (user3 != manos[userIndex][0].user) return;

                                        selectedEmoji = reaction3.emoji.toString();
                                        if (selectedEmoji != '✅') return;

                                        collector3.stop();
                                    });
                        
                                    collector3.on('end', collected => {
                                        msg3.delete();
                                        finTurno = true;
                                    });
                                });
                            });
                        });
                    }

                    else if (cartaJugada == carta3) {
                        actualizarHistorial(`${manos[userIndex][0].user} lanza ${cartaJugada} para retar en duelo a muerte a\n`);
                        var textoCarta = `Elije a un jugador para retar a muerte:\n`;
                        var indexUsersVivos = [];
                        for (let i = 0; i < manos.length; ++i) {
                            if (manos[i][0].vivo && !manos[i][0].escudo && manos[i][0].user != manos[userIndex][0].user) indexUsersVivos.push(i);
                        }
                        for (let i = 0; i < indexUsersVivos.length; ++i) {
                            textoCarta += `${numEmoji(i+1)}: ${manos[indexUsersVivos[i]][0].user}\n`;
                        }

                        manos[userIndex][0].user.send(textoCarta).then(msg2 => {
                            for (let i = 0; i < indexUsersVivos.length; ++i)
                                try { msg2.react(numEmoji(i + 1)); }
                                catch(error) {}
                            const filter2 = () => true;
                            const collector2 = msg2.createReactionCollector(filter2);
                            var selectedUserIndex = 0;
                
                            collector2.on('collect', (reaction2, user2) => {
                                if (user2 != manos[userIndex][0].user) return;

                                selectedUserIndex = emojiNum(reaction2.emoji.toString()) - 1;
                                if (selectedUserIndex < 0) return;

                                collector2.stop();
                            });
                
                            collector2.on('end', collected => {
                                msg2.delete();
                                actualizarHistorial(`${manos[indexUsersVivos[selectedUserIndex]][0].user}.\n`);

                                var heGanado = valorCarta(manos[userIndex][manos[userIndex].length-1]) > valorCarta(manos[indexUsersVivos[selectedUserIndex]][manos[indexUsersVivos[selectedUserIndex]].length-1]);

                                var textoCarta2 = `${manos[indexUsersVivos[selectedUserIndex]][0].user} tiene esta carta: ${manos[indexUsersVivos[selectedUserIndex]].slice(1).join(' ')}.\n`;
                                if (heGanado) textoCarta2 += `Has ganado.\n`;
                                else textoCarta2 += `Has perdido.\n`;
                                textoCarta2 += `Pulsa ✅ para acabar tu turno.`;

                                manos[userIndex][0].user.send(textoCarta2).then(msg3 => {
                                    msg3.react('✅');
                                    const filter3 = () => true;
                                    const collector3 = msg3.createReactionCollector(filter3);
                                    var selectedEmoji = "";
                        
                                    collector3.on('collect', (reaction3, user3) => {
                                        if (user3 != manos[userIndex][0].user) return;

                                        selectedEmoji = reaction3.emoji.toString();
                                        if (selectedEmoji != '✅') return;

                                        collector3.stop();
                                    });
                        
                                    collector3.on('end', collected => {
                                        msg3.delete();

                                        if (heGanado) {
                                            actualizarHistorial(`${manos[indexUsersVivos[selectedUserIndex]][0].user} ha perdido con ${manos[indexUsersVivos[selectedUserIndex]][manos[indexUsersVivos[selectedUserIndex]].length-1]}\n`);
                                            matar(indexUsersVivos[selectedUserIndex]);
                                        }
                                        else {
                                            actualizarHistorial(`${manos[userIndex][0].user} ha perdido con ${manos[userIndex][manos[userIndex].length-1]}\n`);
                                            matar(userIndex);
                                        }

                                        finTurno = true;
                                    });
                                });
                            });
                        });
                    }

                    else if (cartaJugada == carta4) {
                        actualizarHistorial(`${manos[userIndex][0].user} lanza ${cartaJugada} y ahora tiene escudo durante un turno.\n`);
                        manos[userIndex][0].escudo = true;
                        finTurno = true;
                    }

                    else if (cartaJugada == carta5) {
                        actualizarHistorial(`${manos[userIndex][0].user} lanza ${cartaJugada} y obliga a descartarse a `);
                        var textoCarta = `Elije a un jugador para que se descarte:\n`;
                        var indexUsersVivos = [];
                        for (let i = 0; i < manos.length; ++i) {
                            if (manos[i][0].vivo && !manos[i][0].escudo) indexUsersVivos.push(i);
                        }
                        for (let i = 0; i < indexUsersVivos.length; ++i) {
                            textoCarta += `${numEmoji(i+1)}: ${manos[indexUsersVivos[i]][0].user}\n`;
                        }
                        manos[userIndex][0].user.send(textoCarta).then(msg2 => {
                            for (let i = 0; i < indexUsersVivos.length; ++i)
                                try { msg2.react(numEmoji(i + 1)); }
                                catch(error) {}
                            const filter2 = () => true;
                            const collector2 = msg2.createReactionCollector(filter2);
                            var selectedUserIndex = 0;
                
                            collector2.on('collect', (reaction2, user2) => {
                                if (user2 != manos[userIndex][0].user) return;

                                selectedUserIndex = emojiNum(reaction2.emoji.toString()) - 1;
                                if (selectedUserIndex < 0) return;

                                collector2.stop();
                            });
                
                            collector2.on('end', collected => {
                                msg2.delete();
                                actualizarHistorial(`${manos[indexUsersVivos[selectedUserIndex]][0].user}.\n`);

                                descartar(indexUsersVivos[selectedUserIndex]);

                                finTurno = true;
                            });
                        });
                    }

                    else if (cartaJugada == carta6) {
                        actualizarHistorial(`${manos[userIndex][0].user} lanza ${cartaJugada} hacia \n`);
                        var textoCarta = `Elije a un jugador para intercambiar cartas:\n`;
                        var indexUsersVivos = [];
                        for (let i = 0; i < manos.length; ++i) {
                            if (manos[i][0].vivo && !manos[i][0].escudo && manos[i][0].user != manos[userIndex][0].user) indexUsersVivos.push(i);
                        }
                        for (let i = 0; i < indexUsersVivos.length; ++i) {
                            textoCarta += `${numEmoji(i+1)}: ${manos[indexUsersVivos[i]][0].user}\n`;
                        }
                        manos[userIndex][0].user.send(textoCarta).then(msg2 => {
                            for (let i = 0; i < indexUsersVivos.length; ++i)
                                try { msg2.react(numEmoji(i + 1)); }
                                catch(error) {}
                            const filter2 = () => true;
                            const collector2 = msg2.createReactionCollector(filter2);
                            var selectedUserIndex = 0;
                
                            collector2.on('collect', (reaction2, user2) => {
                                if (user2 != manos[userIndex][0].user) return;

                                selectedUserIndex = emojiNum(reaction2.emoji.toString()) - 1;
                                if (selectedUserIndex < 0) return;

                                collector2.stop();
                            });
                
                            collector2.on('end', collected => {
                                msg2.delete();
                                actualizarHistorial(`${manos[indexUsersVivos[selectedUserIndex]][0].user}.\n`);

                                let miCarta = manos[userIndex][manos[userIndex].length-1];
                                manos[userIndex][manos[userIndex].length-1] = manos[indexUsersVivos[selectedUserIndex]][manos[indexUsersVivos[selectedUserIndex]].length-1];
                                manos[indexUsersVivos[selectedUserIndex]][manos[indexUsersVivos[selectedUserIndex]].length-1] = miCarta;

                                actualizarHistorial(`${manos[userIndex][0].user} y ${manos[indexUsersVivos[selectedUserIndex]][0].user} han intercambiado cartas.\n`);

                                finTurno = true;
                            });
                        });
                    }

                    else if (cartaJugada == carta7) {
                        actualizarHistorial(`${manos[userIndex][0].user} lanza ${cartaJugada}\n`);
                        finTurno = true;
                    }

                    else if (cartaJugada == carta8) {
                        actualizarHistorial(`${manos[userIndex][0].user} lanza ${cartaJugada}\n`);
                        matar(userIndex);
                        finTurno = true;
                    }
                });
            });
            esperarTurno();
        }


        function acabarPartida() {
            var indexUsersVivos = [];

            var maxValue = 0;
            var ganadores = [];
            for (let i = 0; i < manos.length; ++i) {
                if (manos[i][0].vivo) {
                    indexUsersVivos.push(i);
                    if (valorCarta(manos[i][manos[i].length-1]) == maxValue) {
                        ganadores.push(i);
                    }
                    else if (valorCarta(manos[i][manos[i].length-1]) > maxValue) {
                        maxValue = valorCarta(manos[i][manos[i].length-1]);
                        ganadores = [i];
                    }
                }
            }

            var finishFields = [];

            for (let i = 0; i < indexUsersVivos.length; ++i) {
                let nombreUser = `${manos[indexUsersVivos[i]][0].user.username}`;
                if (ganadores.includes(indexUsersVivos[i])) nombreUser = `👑${manos[indexUsersVivos[i]][0].user.username}👑`;
                let valueUser = manos[indexUsersVivos[i]][manos[indexUsersVivos[i]].length-1];
                finishFields.push({
                    name: nombreUser,
                    value: valueUser,
                    inline: true
                });
            }
            if (indexUsersVivos.length > 1 && cartas.length) {
                let nombreCarta = `🎴 Carta restante 🎴`;
                let valueCarta = cartas[cartas.length-1];
                finishFields.push({
                    name: nombreCarta,
                    value: valueCarta,
                    inline: true
                });
            }

            embedPartida.fields = finishFields;
            enviarEmbed();
        }
        
        // ENVIAR PRIMER MENSAJE:
        enviarPrimerMensaje();
        esperarEnvioMensaje();

        function empezarJuego() {
            
            // BARAJAR CARTAS Y ORDEN:
            barajar(cartas);
            barajar(manos); // [0] = info; [1..] = cartas
            
            // REPARTIR CARTAS
            for (let i = 0; i < manos.length; i++) {
                robarCarta(i);
            }
            
            
            //while (cartas.length > 1) {
                //robarCarta(turno);
                //enviarEmbed();
                jugarSiguienteTurno(turno);
                
                //turno++;
                if (turno >= manos.length) turno = 0;
            //}
           
        }

        function numEmoji(n) {
            switch(n) {
                case 0: return '0️⃣';
                case 1: return '1️⃣';
                case 2: return '2️⃣';
                case 3: return '3️⃣';
                case 4: return '4️⃣';
                case 5: return '5️⃣';
                case 6: return '6️⃣';
                case 7: return '7️⃣';
                case 8: return '8️⃣';
                case 9: return '9️⃣';
                case 10: return '🔟';
                default: return '❓';
            }
        }

        function emojiNum(e) {
            if (e == '0️⃣') return 0;
            if (e == '1️⃣') return 1;
            if (e == '2️⃣') return 2;
            if (e == '3️⃣') return 3;
            if (e == '4️⃣') return 4;
            if (e == '5️⃣') return 5;
            if (e == '6️⃣') return 6;
            if (e == '7️⃣') return 7;
            if (e == '8️⃣') return 8;
            if (e == '9️⃣') return 9;
            if (e == '🔟') return 10;
            return -1;
        }

        function valorCarta(carta){
            if (carta == carta1) return 1;
            if (carta == carta2) return 2;
            if (carta == carta3) return 3;
            if (carta == carta4) return 4;
            if (carta == carta5) return 5;
            if (carta == carta6) return 6;
            if (carta == carta7) return 7;
            if (carta == carta8) return 8;
            return 0;
        }
    },
};