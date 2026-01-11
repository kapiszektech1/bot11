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
    IMAGE: 'https://cdn.discordapp.com/attachments/1458122275973890222/1458464723531202622/image.png'
};

// Funkcja pomocnicza do tworzenia kanału
async function createTicketChannel(interaction, categoryKey, reason) {
    if (!interaction.deferred && !interaction.replied) {
        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
    }

    try {
        const guild = interaction.guild;
        const catKey = categoryKey.toUpperCase();
        const categoryId = CONFIG.CATEGORIES[catKey];
        const allowedRoles = CONFIG.ROLES[catKey];

        const ticketChannel = await guild.channels.create({
            name: `🎫-${categoryKey}-${interaction.user.username}`,
            type: ChannelType.GuildText,
            parent: categoryId,
            permissionOverwrites: [
                { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AttachFiles, PermissionFlagsBits.ReadMessageHistory] },
                ...allowedRoles.map(id => ({ id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] }))
            ]
        });

        const ticketEmbed = new EmbedBuilder()
            .setTitle(`🎫 ZGŁOSZENIE: ${catKey}`)
            .setDescription(`Witaj ${interaction.user}! Opisz dokładnie swoją sprawę. Administracja zajmie się tym najszybciej jak to możliwe.`)
            .setColor(CONFIG.COLOR)
            .addFields(
                { name: '👤 Użytkownik', value: `> ${interaction.user.tag}`, inline: true },
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
    } catch (err) {
        console.error("Błąd tworzenia kanału:", err);
        await interaction.editReply({ content: '❌ Wystąpił błąd podczas tworzenia kanału ticketu.' });
    }
}

module.exports = {
    // 1. WYWOŁANIE PANELU (/panel-ticket)
    execute: async function(interaction) {
        if (!interaction.member.roles.cache.has(CONFIG.ADMIN_ROLE)) {
            return interaction.reply({ content: '❌ Nie posiadasz uprawnień!', flags: [MessageFlags.Ephemeral] });
        }

        const embed = new EmbedBuilder()
            .setAuthor({ name: 'VAULT REP SECURITY SYSTEM', iconURL: interaction.guild.iconURL() || null })
            .setTitle('🛡️ CENTRUM WSPARCIA I ZGŁOSZEŃ')
            .setDescription('Wybierz odpowiednią kategorię z menu poniżej.\n\n**🆘 Pomoc** | **🔍 Znajdź** | **🤝 Collab**')
            .setColor(CONFIG.COLOR)
            .setImage(CONFIG.IMAGE);

        const menu = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('ticket_select')
                .setPlaceholder('📂 Wybierz cel swojego zgłoszenia...')
                .addOptions([
                    { label: 'Pomoc / Wsparcie', value: 'pomoc', emoji: '🆘' },
                    { label: 'Znajdź Link', value: 'znajdz', emoji: '🔍' },
                    { label: 'Współpraca', value: 'collab', emoji: '🤝' }
                ])
        );

        await interaction.channel.send({ embeds: [embed], components: [menu] });
        await interaction.reply({ content: '✅ Panel ticketów wysłany.', flags: [MessageFlags.Ephemeral] });
    },

    // 2. OBSŁUGA PRZYCISKÓW I MENU
    handleInteraction: async function(interaction) {
        // Menu wyboru
        if (interaction.isStringSelectMenu() && interaction.customId === 'ticket_select') {
            const category = interaction.values[0];
            if (category === 'collab') return await createTicketChannel(interaction, 'collab', 'Zgłoszenie w sprawie współpracy.');

            const modal = new ModalBuilder()
                .setCustomId(`modal_${category}`)
                .setTitle(`FORMULARZ: ${category.toUpperCase()}`);

            const input = new TextInputBuilder()
                .setCustomId('problem_input')
                .setLabel('Opisz sprawę:')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true)
                .setMinLength(10);

            modal.addComponents(new ActionRowBuilder().addComponents(input));
            return await interaction.showModal(modal);
        }

        // Formularze Modal
        if (interaction.isModalSubmit() && interaction.customId.startsWith('modal_')) {
            const categoryKey = interaction.customId.split('_')[1];
            const reason = interaction.fields.getTextInputValue('problem_input');
            return await createTicketChannel(interaction, categoryKey, reason);
        }

        // Przyciski wewnątrz ticketu
        if (interaction.isButton()) {
            if (interaction.customId === 'ticket_claim') {
                await interaction.reply({ content: `🔒 Zgłoszenie przejęte przez **${interaction.user}**.`, ephemeral: false });
                // (Opcjonalnie tutaj zmiana uprawnień kanału)
            }

            if (interaction.customId === 'ticket_close') {
                await interaction.reply('💾 **Kanał zostanie usunięty za 5 sekund.**');
                setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
            }
        }
    }
};
