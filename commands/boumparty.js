const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js')
const { SlashCommandBuilder } = require('@discordjs/builders')
const dico = require('../dico.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('boumparty')
        .setDescription('Play Boumparty !'),

    async execute(interaction) {

        // get USER and CHANNEL
        const player = interaction.user
        const channel = interaction.channel

        // get TIMESTAMP
        const timestamps = interaction.createdAt.toString().split(' ')
        timestamps.length = 5
        let timestamp = ''

        for (const el of timestamps) {
            timestamp += `${el} `
        }

        // Create a THREAD
        const thread = await channel.threads.create({
            name:`${player.tag} ${timestamp} 💣`,
            autoArchive: 30,
            reason: 'Lancement d\'une nouvelle partie de Boumparty !',
            rateLimitPerUser: 2,
        })

        if (thread.joinable) {
            await thread.join()
            await thread.members.add(player.id)
        }

        // MESSAGE + BUTTONS
        const row = new MessageActionRow()
			.addComponents(
				[
                    new MessageButton()
                    .setCustomId('play')
					.setLabel('Jouer')
					.setStyle('SUCCESS')
                    .setEmoji('💣'),

                    new MessageButton()
					.setCustomId('rules')
					.setLabel('Help')
					.setStyle('PRIMARY')
                    .setEmoji('📙'),

                    new MessageButton()
                    .setCustomId('cancel')
					.setLabel('Annuler')
					.setStyle('DANGER'),
                ],
			);

        // Create the EMBED
        const gameEmbed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle(`${player.tag} ${timestamp} 💣`)
            .setDescription('Trouvez un mot selon la syllabe !')

        thread.send({ embeds: [gameEmbed], components: [row], ephemeral: true })

        // Handle the BUTTONS interaction
        const filter2 = (btnInt) => {
            return interaction.user.id === btnInt.user.id
        }

        const collector2 = thread.createMessageComponentCollector({
            filter2,
            max: 3,
            time: 15000,
        })

        collector2.on('collect', (i) => {

            // CLICK on PLAY
            if (i.customId === 'play') {
                playBoumparty(i)
            }

            // CLICK on HELP
            if (i.customId === 'rules') {
                console.log('click on rules');
            }

            // CLICK on CANCEL
            if (i.customId === 'cancel') {
                thread.delete('Done with this thread')
                    .then(deletedThread => console.log(deletedThread))
                    .catch(console.error)
            }

        })
    },
}

const playBoumparty = async (i) => {
    const filter = m => m.content.includes('discord');
    const collector = await i.channel.createMessageCollector({ filter, time: 15000 });

    collector.on('collect', m => {
        console.log(`Collected ${m.content}`);
    });

    collector.on('end', collected => {
        console.log(`Collected ${collected.size} items`);
    });
    const editedEmbed = updateEmbed()
    i.update({ embeds: [ editedEmbed ], components: [] })

}

const updateEmbed = () => {
    return new MessageEmbed()
            .setColor('#0099ff')
            .setDescription('Updated !')
}