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
    LOG_CHANNEL: '1458466040550785251',
    ADMIN_ROLE: '1457675858553864274',
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

async function logAction(guild, title, fields, color = 0x2B2D31) {
    const logChannel = await guild.channels.fetch(CONFIG.LOG_CHANNEL).catch(() => null);
    if (!logChannel) return;

    const logEmbed = new EmbedBuilder()
        .setAuthor({ name: 'VAULT REP | System Logów', iconURL: guild.iconURL() || null })
        .setTitle(title)
        .addFields(fields)
        .setColor(color)
        .setTimestamp()
        .setFooter({ text: 'Security Logs' });

    await logChannel.send({ embeds: [logEmbed] });
}

async function createTicketChannel(interaction, categoryKey, reason) {
    if (!interaction.deferred && !interaction.replied) {
        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
    }

    const guild = interaction.guild;
    const categoryId = CONFIG.CATEGORIES[categoryKey.toUpperCase()];
    const allowedRoles = CONFIG.ROLES[categoryKey.toUpperCase()];

    const ticketChannel = await guild.channels.create({
        name: `🎫-${categoryKey}-${interaction.user.username}`,
        type: ChannelType.GuildText,
        parent: categoryId,
        permissionOverwrites: [
            { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] },
            { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AttachFiles] },
            ...allowedRoles.map(id => ({ id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }))
        ]
    });

    const ticketEmbed = new EmbedBuilder()
        .setTitle(`🎫 ZGŁOSZENIE: ${categoryKey.toUpperCase()}`)
        .setDescription(`Witaj ${interaction.user}! Opisz dokładnie swoją sprawę. Administracja zajmie się tym najszybciej jak to możliwe.`)
        .setColor(CONFIG.COLOR)
        .addFields(
            { name: '👤 Użytkownik', value: `> ${interaction.user.tag}`, inline: true },
            { name: '🆔 ID', value: `> ${interaction.user.id}`, inline: true },
            { name: '⏰ Otwarto', value: `> <t:${Math.floor(Date.now() / 1000)}:R>`, inline: true },
            { name: '📝 Powód', value: `\`\`\`${reason}\`\`\`` }
        )
        .setImage(CONFIG.IMAGE)
        .setFooter({ text: 'VAULT REP | Czas odpowiedzi: do 24h' });

    const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('ticket_claim').setLabel('Przejmij (Claim)').setStyle(ButtonStyle.Primary).setEmoji('🔒'),
        new ButtonBuilder().setCustomId('ticket_close').setLabel('Zamknij (Close)').setStyle(ButtonStyle.Danger).setEmoji('⚠️')
    );

    await ticketChannel.send({ content: `${interaction.user} | <@&${allowedRoles[0]}>`, embeds: [ticketEmbed], components: [buttons] });
    await interaction.editReply({ content: `✅ Twój ticket został utworzony: ${ticketChannel}` });

    await logAction(guild, '🆕 Nowy Ticket', [
        { name: 'Otwierający', value: `${interaction.user.tag}`, inline: true },
        { name: 'Kategoria', value: `${categoryKey.toUpperCase()}`, inline: true },
        { name: 'Kanał', value: `${ticketChannel.name}`, inline: true }
    ], 0x00FF00);
}

module.exports = {
    execute: async (interaction) => {
        if (!interaction.member.roles.cache.has(CONFIG.ADMIN_ROLE)) {
            return interaction.reply({ content: '❌ Nie posiadasz uprawnień!', flags: [MessageFlags.Ephemeral] });
        }

        const embed = new EmbedBuilder()
            .setAuthor({ name: 'VAULT REP SECURITY SYSTEM', iconURL: interaction.guild.iconURL() || null })
            .setTitle('🛡️ CENTRUM WSPARCIA I ZGŁOSZEŃ')
            .setDescription(
                'Wybierz odpowiednią kategorię z menu poniżej, aby skontaktować się z administracją.\n\n' +
                '**🆘 Pomoc** - Problemy techniczne i pytania.\n' +
                '**🔍 Znajdź** - Pomoc w odnalezieniu konkretnych linków.\n' +
                '**🤝 Collab** - Propozycje współpracy i partnerstwa.'
            )
            .setColor(CONFIG.COLOR)
            .setImage(CONFIG.IMAGE)
            .setFooter({ text: 'Prosimy o nienadużywanie systemu ticketów.' });

        const menu = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('ticket_select')
                .setPlaceholder('📂 Wybierz cel swojego zgłoszenia...')
                .addOptions([
                    { label: 'Pomoc / Wsparcie', value: 'pomoc', emoji: '🆘', description: 'Ogólna pomoc techniczna' },
                    { label: 'Znajdź Link', value: 'znajdz', emoji: '🔍', description: 'Szukasz konkretnego linku?' },
                    { label: 'Współpraca', value: 'collab', emoji: '🤝', description: 'Partnerstwa i wspólne projekty' }
                ])
        );

        await interaction.channel.send({ embeds: [embed], components: [menu] });
        await interaction.reply({ content: '✅ Panel został pomyślnie wysłany.', flags: [MessageFlags.Ephemeral] });
    },

    handleInteraction: async (interaction) => {
        if (interaction.isStringSelectMenu() && interaction.customId === 'ticket_select') {
            const category = interaction.values[0];
            if (category === 'collab') return await createTicketChannel(interaction, 'collab', 'Zgłoszenie w sprawie współpracy.');

            const modal = new ModalBuilder()
                .setCustomId(`modal_${category}`)
                .setTitle(`FORMULARZ: ${category.toUpperCase()}`);

            const input = new TextInputBuilder()
                .setCustomId('problem_input')
                .setLabel(category === 'znajdz' ? 'Czego dokładnie szukasz?' : 'Opisz swój problem:')
                .setPlaceholder('Wpisz tutaj treść zgłoszenia...')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true)
                .setMinLength(10);

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
            const categoryName = channelNameParts[1]?.toUpperCase(); 
            const allowedRoles = CONFIG.ROLES[categoryName] || [];

            if (interaction.customId === 'ticket_claim') {
                if (!allowedRoles.some(roleId => interaction.member.roles.cache.has(roleId))) {
                    return interaction.reply({ content: '❌ Nie masz uprawnień!', flags: [MessageFlags.Ephemeral] });
                }

                const creatorId = interaction.channel.permissionOverwrites.cache.find(p => p.type === 1 && !allowedRoles.includes(p.id))?.id;

                await interaction.channel.permissionOverwrites.set([
                    { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                    { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
                    ...(creatorId ? [{ id: creatorId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }] : [])
                ]);

                await interaction.reply({ embeds: [new EmbedBuilder().setDescription(`🔒 Zgłoszenie przejęte przez **${interaction.user}**.`).setColor(CONFIG.COLOR)] });

                await logAction(interaction.guild, '🔒 Ticket Przejęty', [
                    { name: 'Moderator', value: `${interaction.user.tag}`, inline: true },
                    { name: 'Kanał', value: `${interaction.channel.name}`, inline: true }
                ], 0xFFA500);
            }

            if (interaction.customId === 'ticket_close') {
                if (!allowedRoles.some(roleId => interaction.member.roles.cache.has(roleId))) {
                    return interaction.reply({ content: '❌ Brak uprawnień!', flags: [MessageFlags.Ephemeral] });
                }

                await interaction.reply('💾 **Generowanie logów... Kanał zostanie usunięty za 5 sekund.**');

                const messages = await interaction.channel.messages.fetch({ limit: 100 });
                let transcript = `--- TRANSKRYPCJA VAULT REP: ${interaction.channel.name} ---\nData: ${new Date().toLocaleString('pl-PL')}\nZamknął: ${interaction.user.tag}\n----------------------------------------------------\n\n`;

                messages.reverse().forEach(m => {
                    transcript += `[${m.createdAt.toLocaleString('pl-PL')}] ${m.author.tag}: ${m.content || "[Załącznik/Embed]"}\n`;
                });

                const attachment = new AttachmentBuilder(Buffer.from(transcript, 'utf-8'), { name: `log-${interaction.channel.name}.txt` });

                const logChannel = await interaction.guild.channels.fetch(CONFIG.LOG_CHANNEL).catch(() => null);
                if (logChannel) {
                    await logChannel.send({ 
                        content: `📁 **Raport: \`${interaction.channel.name}\`**`,
                        files: [attachment] 
                    });
                }

                setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
            }
        }
    }
};
