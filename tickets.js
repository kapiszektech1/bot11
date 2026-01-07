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
    MessageFlags
} = require('discord.js');

const CONFIG = {
    PANEL_CHANNEL: '1457675885367787570', 
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
            { name: 'Powód', value: `\`\`\`${reason}\`\`\`` },
            { name: 'ID Użytkownika', value: `\`${interaction.user.id}\``, inline: true },
            { name: 'Czas stworzenia', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true },
            { name: 'Notka', value: 'Moderacja wkrótce odpowie. Prosimy o cierpliwość. Czas odpowiadania wynosi do 24h' }
        )
        .setImage(CONFIG.IMAGE)
        .setFooter({ text: 'VAULT REP Security' });

    const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('ticket_claim').setLabel('Claim').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('ticket_close').setLabel('Close').setStyle(ButtonStyle.Danger)
    );

    await ticketChannel.send({ content: '@here', embeds: [ticketEmbed], components: [buttons] });
    await interaction.editReply(`Ticket został otwarty: ${ticketChannel}`);
}

module.exports = {
    sendTicketPanel: async (client) => {
        const channel = await client.channels.fetch(CONFIG.PANEL_CHANNEL).catch(() => null);
        if (!channel) return;

        const embed = new EmbedBuilder()
            .setTitle('CENTRUM ZGŁOSZEŃ VAULT REP')
            .setDescription('**Potrzebujesz wsparcia?**\nWybierz odpowiednią kategorię z listy poniżej, aby otworzyć nowy Ticket. Pamiętaj aby nie tworzyć ticketów bez potrzeby!')
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
        // 1. WYBÓR KATEGORII Z LISTY
        if (interaction.isStringSelectMenu() && interaction.customId === 'ticket_select') {
            const category = interaction.values[0];

            // COLLAB: Od razu tworzy kanał (bez pytań)
            if (category === 'collab') {
                return await createTicketChannel(interaction, 'collab', 'Współpraca (Collab)');
            }

            // POMOC LUB ZNAJDŹ: Pokazuje Modal
            const modal = new ModalBuilder()
                .setCustomId(`modal_${category}`)
                .setTitle(`NOWY TICKET: ${category.toUpperCase()}`);

            const input = new TextInputBuilder()
                .setCustomId('problem_input')
                .setLabel(category === 'znajdz' ? 'Do czego mogę znaleźć link?' : 'W czym mogę pomóc?')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true);

            modal.addComponents(new ActionRowBuilder().addComponents(input));
            await interaction.showModal(modal);
        }

        // 2. WYSŁANIE MODALU (POMOC / ZNAJDŹ)
        if (interaction.isModalSubmit()) {
            const categoryKey = interaction.customId.split('_')[1];
            const reason = interaction.fields.getTextInputValue('problem_input');
            await createTicketChannel(interaction, categoryKey, reason);
        }

        // 3. OBSŁUGA PRZYCISKÓW (CLAIM / CLOSE)
        if (interaction.isButton()) {
            const categoryName = interaction.channel.name.split('-')[0].toUpperCase();
            const allowedRoles = CONFIG.ROLES[categoryName] || [];

            if (interaction.customId === 'ticket_claim') {
                if (!allowedRoles.some(roleId => interaction.member.roles.cache.has(roleId))) {
                    return interaction.reply({ content: '> Nie masz uprawnień do przejęcia tego Ticketu!', ephemeral: true });
                }

                const creator = interaction.channel.permissionOverwrites.cache.find(p => p.type === 1 && !allowedRoles.includes(p.id));
                await interaction.channel.permissionOverwrites.set([
                    { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                    { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
                    ...(creator ? [{ id: creator.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }] : [])
                ]);

                const claimEmbed = new EmbedBuilder()
                    .setDescription(`> Ten Ticket jest teraz obsługiwany wyłącznie przez **${interaction.user.username}**.`)
                    .setColor(CONFIG.COLOR);
                await interaction.reply({ embeds: [claimEmbed] });
            }

            if (interaction.customId === 'ticket_close') {
                if (!allowedRoles.some(roleId => interaction.member.roles.cache.has(roleId))) {
                    return interaction.reply({ content: '> Nie masz uprawnień do zamknięcia tego Ticketu ❌.', ephemeral: true });
                }

                await interaction.reply('**> Ticket zostanie usunięty za 5 sekund...**');
                setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
            }
        }
    }
};
