// CONFIGURACIONES
const { prefix, token, min_cooldown, locationsChannelId, locationsMessagesId } = require('./config.json');

// INICIAR SESIÓN DEL CLIENTE
const Discord = require('discord.js');
const client = new Discord.Client({partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });
client.commands = new Discord.Collection();
client.login(token);

// CARGAR COMANDOS
const fs = require('fs');
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

// INICIALIZAR COOLDOWNS
const cooldowns = new Discord.Collection();

// ACTIVAR FUNCIONES
client.on('ready', readyDiscord);
client.on('message', readMessage);
//client.on('messageReactionAdd', addReaction);

// LOGIN
function readyDiscord() {
    console.log('✅ Logged in.');
    client.user.setActivity("tus problemas bb💕", { type: 'LISTENING' });
    //setupLocationMessages();
}

// LEER MENSAJES
function readMessage(message) {

    // LEER COMANDOS SEGÚN EL PREFIJO
    if (!message.content.startsWith(prefix) || message.author.bot) return;
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    // COMPROBAR SI EL COMANDO EXISTE
    const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
    if (!command) return;

    // COMPROBAR SI EL COMANDO PUEDE USARSE EN DMs
    if (command.guildOnly && message.channel.type === 'dm') {
        return message.channel.send('⛔ No puedo ejecutar ese comando en DM');
    }

    // COMPROBAR SI EL USUARIO CUMPLE LOS PERMISOS
    if (command.admin && !message.member.hasPermission('ADMINISTRATOR')) {
        return message.channel.send('⛔ Este comando sólo puede ejecutarlo un administrador!');
    }

    // COMPROBAR NECESITA Y CONTIENE ARGUMENTOS
    if (command.needs_args && args.length < command.min_args) {
        return message.channel.send(`💭 Te faltan argumentos, prueba con:\`\`\`${prefix}${command.name} ${command.usage}\`\`\``);
    }

    // COMPROBAR COOLDOWNS
    if (!cooldowns.has(command.name)) {
        cooldowns.set(command.name, new Discord.Collection());
    }
    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown || min_cooldown) * 1000;
    if (timestamps.has(message.author.id)) {
        const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
        if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000;
            return message.reply(`⏳ Espera ${timeLeft.toFixed(1)} segundos más antes de volver a usar el comando \`${command.name}\``);
        }
    }

    
    try {
        // EJECUTAR COMANDO
        command.execute(message, args);
        
        // ESTABLECER COOLDOWN
        timestamps.set(message.author.id, now);
        setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
        
    } catch (error) {

        // RESOLVER ERROR DE EJECUCIÓN
    	console.error(error);
	    message.channel.send('💥 Ha habido un error ejecutando ese comando!');
    }

    // ELIMINAR MENSAJE
    //if (command.removeMessage) message.delete();

}

// LEER REACCIONES
async function addReaction(reaction, user) {
    console.log("Reaccion detectada.");
    // Al recibir una reacción comprobar si es parcial o no
    if (reaction.partial) {
        // Si el mensaje al que pertenece se ha eliminado, el fetch podría dar un error
        // en la API, así que hace falta tenerlo en cuenta
        try {
            await reaction.fetch();
        } catch (error) {
            console.error('Algo ha fallado al hacer fetch de un mensaje: ', error);
            // Acaba si 'reaction.message.author' podría ser undefined/null
            return;
        }
    }
    // Ahora el mensaje está disponible en la cache

    // COMPROBAR ID
    if (reaction.message.id == locationMessageId)
        client.commands.get(locationReact).execute(reaction, user);
}

// EJECUTAR MAPAS DE COORDENADAS:
function setupLocationMessages() {

    // Cargar canal
    client.channels.fetch(locationsChannelId).then(locationsChannel => 
        locationsMessagesId.map(messageId => {

            console.log(messageId);

            if (!locationsChannel) return console.log('wtf');

            locationsChannel.messages.fetch(messageId)
            //locationsChannel.messages.fetch(args[0])
            .then(msg => {
                msg.react("➕");
                msg.react('➖');
                console.log(`✅ Mensaje establecido correctamente. El contenido era: "${msg.embeds[0].title}"`);
                
                // REACTION COLLECTOR
                const filter = (reaction, user) => reaction.message.id == msg.id;
                const collector = msg.createReactionCollector(filter);
                const command = msg.client.commands.get('locationreact');

                collector.on('collect', command.execute);
            })
            .catch(error => {
                message.channel.send(`💥 Ha habido un error obteniendo el mensaje: \`\`\`${error}\`\`\``);
            });
        })
    );

    //Ejecutar por cada mensaje guardado
    
}
