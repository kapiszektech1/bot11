const { 
    EmbedBuilder, 
    ActionRowBuilder, 
    StringSelectMenuBuilder, 
    ModalBuilder, 
    TextInputBuilder, 
    TextInputStyle, 
    ChannelType, 
    PermissionFlagsBits, 
    ButtonBuilder, 
    ButtonStyle,
    MessageFlags,
    AttachmentBuilder
} = require('discord.js');

const CONFIG = {
    PANEL_CHANNEL: '1457675861271646208', 
    LOG_CHANNEL: '1458466040550785251', // Kanał logów
    CATEGORIES: {
        POMOC: '1457675859560235076',
        ZNAJDZ: '1457675859560235078',
        COLLAB: '1457675859560235079'
    },
    ROLES: {
        POMOC: ['1457675858553864274', '1457675858537091222', '1457675858537091221', '1457675858537091220'],
        ZNAJDZ: ['1457675858553864274', '1457675858537091222', '1457675858537091221', '1457675858537091220'],
        COLLAB: ['1457675858553864274', '1457675858537091222', '1457675858537091221']
    },
    COLOR: 0x00008B, 
    IMAGE: 'https://cdn.discordapp.com/attachments/1458122275973890222/1458464723531202622/image.png?ex=695fbc9f&is=695e6b1f&hm=e76babee672f3a54d6da72d46f347d069f9f45e3b471ea7eb02407934f7d87cb'
};

// Funkcja logująca akcje do kanału logów
async function logAction(guild, actionEmbed) {
    const logChannel = await guild.channels.fetch(CONFIG.LOG_CHANNEL).catch(() => null);
    if (logChannel) await logChannel.send({ embeds: [actionEmbed] });
}

async function createTicketChannel(interaction, categoryKey, reason) {
    if (!interaction.deferred && !interaction.replied) {
        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
    }

    const guild = interaction.guild;
    const categoryId = CONFIG.CATEGORIES[categoryKey.toUpperCase()];
    const allowedRoles = CONFIG.ROLES[categoryKey.toUpperCase()];

    const ticketChannel = await guild.channels.create({
        name: `${categoryKey}-${interaction.user.username}`,
        type: ChannelType.GuildText,
        parent: categoryId,
        permissionOverwrites: [
            { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] },
            { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
            ...allowedRoles.map(id => ({ id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }))
        ]
    });

    const ticketEmbed = new EmbedBuilder()
        .setTitle(`PANEL TICKET: ${categoryKey.toUpperCase()}`)
        .setColor(CONFIG.COLOR)
        .addFields(
            { name: '**Powód**', value: `\`\`\`${reason}\`\`\`` },
            { name: '**ID Użytkownika**', value: `\`${interaction.user.id}\``, inline: true },
            { name: '**Czas stworzenia**', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true },
            { name: '**Notka**', value: 'Moderacja wkrótce odpowie. Prosimy o cierpliwość. Czas odpowiadania wynosi do 24h' }
        )
        .setImage(CONFIG.IMAGE)
        .setFooter({ text: 'VAULT REP Security' });

    const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('ticket_claim').setLabel('Claim').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('ticket_close').setLabel('Close').setStyle(ButtonStyle.Danger)
    );

    await ticketChannel.send({ content: '@here', embeds: [ticketEmbed], components: [buttons] });
    await interaction.editReply(`Ticket został otwarty: ${ticketChannel}`);

    // Log otwarcia
    const logEmbed = new EmbedBuilder()
        .setTitle('🆕 TICKET OTWARTY')
        .setColor(0x00FF00)
        .addFields(
            { name: 'Użytkownik', value: `${interaction.user.tag} (${interaction.user.id})` },
            { name: 'Kategoria', value: categoryKey.toUpperCase() },
            { name: 'Kanał', value: ticketChannel.name }
        )
        .setTimestamp();
    await logAction(guild, logEmbed);
}

module.exports = {
    sendTicketPanel: async (client) => {
        const channel = await client.channels.fetch(CONFIG.PANEL_CHANNEL).catch(() => null);
        if (!channel) return;
        const embed = new EmbedBuilder()
            .setTitle('**CENTRUM TICKETÓW VAULT REP**')
            .setDescription('> **Potrzebujesz wsparcia?**\n > Wybierz odpowiednią kategorię z listy poniżej, aby otworzyć nowy Ticket.')
            .setColor(CONFIG.COLOR)
            .setImage(CONFIG.IMAGE);

        const menu = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('ticket_select')
                .setPlaceholder('Wybierz kategorię Ticketu...')
                .addOptions([
                    { label: 'Pomoc', value: 'pomoc', emoji: '🆘' },
                    { label: 'Znajdź', value: 'znajdz', emoji: '🔍' },
                    { label: 'Collab', value: 'collab', emoji: '🤝' }
                ])
        );
        await channel.send({ embeds: [embed], components: [menu] });
    },

    handleInteraction: async (interaction) => {
        if (interaction.isStringSelectMenu() && interaction.customId === 'ticket_select') {
            const category = interaction.values[0];
            if (category === 'collab') return await createTicketChannel(interaction, 'collab', 'Współpraca (Collab)');

            const modal = new ModalBuilder().setCustomId(`modal_${category}`).setTitle(`NOWY TICKET: ${category.toUpperCase()}`);
            const input = new TextInputBuilder()
                .setCustomId('problem_input')
                .setLabel(category === 'znajdz' ? 'Do czego mogę znaleźć link?' : 'W czym mogę pomóc?')
                .setStyle(TextInputStyle.Paragraph).setRequired(true);

            modal.addComponents(new ActionRowBuilder().addComponents(input));
            await interaction.showModal(modal);
        }

        if (interaction.isModalSubmit()) {
            const categoryKey = interaction.customId.split('_')[1];
            const reason = interaction.fields.getTextInputValue('problem_input');
            await createTicketChannel(interaction, categoryKey, reason);
        }

        if (interaction.isButton()) {
            const channelNameParts = interaction.channel.name.split('-');
            const categoryName = channelNameParts[0].toUpperCase();
            const allowedRoles = CONFIG.ROLES[categoryName] || [];

            if (interaction.customId === 'ticket_claim') {
                if (!allowedRoles.some(roleId => interaction.member.roles.cache.has(roleId))) {
                    return interaction.reply({ content: '> Nie masz uprawnień!', ephemeral: true });
                }

                const creator = interaction.channel.permissionOverwrites.cache.find(p => p.type === 1 && !allowedRoles.includes(p.id));
                await interaction.channel.permissionOverwrites.set([
                    { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                    { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
                    ...(creator ? [{ id: creator.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }] : [])
                ]);

                await interaction.reply({ embeds: [new EmbedBuilder().setDescription(`> Ticket przejęty przez **${interaction.user.username}**.`).setColor(CONFIG.COLOR)] });

                // Log Claim
                await logAction(interaction.guild, new EmbedBuilder()
                    .setTitle('🔒 TICKET CLAIMED')
                    .setColor(0xFFA500)
                    .addFields(
                        { name: 'Moderator', value: `${interaction.user.tag}` },
                        { name: 'Kanał', value: interaction.channel.name }
                    ).setTimestamp());
            }

            if (interaction.customId === 'ticket_close') {
                if (!allowedRoles.some(roleId => interaction.member.roles.cache.has(roleId))) {
                    return interaction.reply({ content: '> Nie masz uprawnień!', ephemeral: true });
                }

                await interaction.reply('**> Generowanie transkrypcji i zamykanie...**');

                // TRANSKRYPCJA
                const messages = await interaction.channel.messages.fetch({ limit: 100 });
                let transcript = `TRANSKRYPCJA TICKETU: ${interaction.channel.name}\n`;
                transcript += `Data zamknięcia: ${new Date().toLocaleString()}\n`;
                transcript += `Zamknięty przez: ${interaction.user.tag}\n`;
                transcript += `------------------------------------------\n\n`;

                messages.reverse().forEach(m => {
                    const content = m.content || (m.embeds.length > 0 ? "[Wiadomość z Embedem]" : "[Brak treści]");
                    transcript += `[${m.createdAt.toLocaleString()}] ${m.author.tag}: ${content}\n`;
                });

                const buffer = Buffer.from(transcript, 'utf-8');
                const attachment = new AttachmentBuilder(buffer, { name: `transcript-${interaction.channel.name}.txt` });

                // Log Zamknięcia z plikiem
                const logChannel = await interaction.guild.channels.fetch(CONFIG.LOG_CHANNEL).catch(() => null);
                if (logChannel) {
                    await logChannel.send({ 
                        content: `📁 **Transkrypcja zakończonego ticketu: ${interaction.channel.name}**`,
                        files: [attachment] 
                    });
                }

                setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
            }
        }
    }
};
