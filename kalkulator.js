const { EmbedBuilder, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

// Baza danych wag - 02,03, tutaj bot szuka słów kluczowych
const wagiBaza = {
    buty: 1400, jordan: 1450, dunk: 1300, af1: 1400, adidas: 1200, yeezy: 1100,
    bluza: 900, hoodie: 950, trapstar: 850, corteiz: 800, tracksuit: 1100,
    koszulka: 250, tee: 280, tshirt: 250, shirt: 250,
    kurtka: 1200, jacket: 1300, puffer: 1500,
    spodnie: 700, pants: 750, jeans: 800,
    skarpetki: 50, socks: 50, czapka: 150, cap: 150
};

if (!global.vaultCarts) { global.vaultCarts = new Map(); }

function createMainPanel(interaction) {
    const userId = interaction.user.id;
    const cart = global.vaultCarts.get(userId) || [];
    
    // Obliczamy sumę bezpiecznie, pilnując by waga była liczbą
    const totalWeight = cart.reduce((sum, item) => sum + (Number(item.weight) || 0), 0);

    const embed = new EmbedBuilder()
        .setTitle('📦 VAULT REP • KALKULATOR WAGI')
        .setDescription(`Witaj **${interaction.user.username}**!\n\n**🛒 TWOJA LISTA:**\n${cart.map((i, n) => `> **${n+1}.** ${i.name} — \`${i.weight}g\``).join('\n') || "_Koszyk jest pusty..._"}\n\n**⚖️ ŁĄCZNA WAGA:** \`${totalWeight}g\``)
        .setColor(0x00008B)
        .setThumbnail('https://cdn.discordapp.com/attachments/1458122275973890222/1459848674631749825/wymiary-paczki.png')
        .setFooter({ text: 'VAULT REP • System szacowania wagi' });

    const row = new ActionRowBuilder().addComponents(
        { type: 2, style: 1, label: '➕ DODAJ', custom_id: 'calc_add' },
        { type: 2, style: 4, label: '🗑️ USUŃ', custom_id: 'calc_remove' },
        { type: 2, style: 3, label: '📊 PODSUMUJ', custom_id: 'calc_summary' }
    );

    return { embeds: [embed], components: [row] };
}

module.exports = {
    execute: async (interaction) => {
        global.vaultCarts.set(interaction.user.id, []);
        await interaction.reply(createMainPanel(interaction)).catch(() => {});
    },

    handleInteraction: async (interaction) => {
        const userId = interaction.user.id;
        if (!global.vaultCarts.has(userId)) global.vaultCarts.set(userId, []);
        let cart = global.vaultCarts.get(userId);

        if (interaction.customId === 'calc_add') {
            const modal = new ModalBuilder().setCustomId('modal_ai').setTitle('Dodaj przedmiot');
            modal.addComponents(
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('name').setLabel("Co chcesz dodać?").setStyle(1).setRequired(true)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('size').setLabel("Rozmiar").setStyle(1).setRequired(false)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('weight_manual').setLabel("Waga ręcznie (g)").setStyle(1).setRequired(false))
            );
            return await interaction.showModal(modal).catch(() => {});
        }

        if (interaction.isModalSubmit() || interaction.isButton()) {
            if (!interaction.deferred && !interaction.replied) await interaction.deferUpdate().catch(() => {});

            if (interaction.customId === 'modal_ai') {
                const nameInput = interaction.fields.getTextInputValue('name');
                const sizeInput = interaction.fields.getTextInputValue('size');
                const manualInput = interaction.fields.getTextInputValue('weight_manual');
                
                // --- LOGIKA WYBORU WAGI ---
                let finalWeight = 800; // Domyślna

                if (manualInput && !isNaN(manualInput)) {
                    finalWeight = parseInt(manualInput);
                } else {
                    // Szukamy w bazie
                    const n = nameInput.toLowerCase();
                    for (const [key, value] of Object.entries(wagiBaza)) {
                        if (n.includes(key)) {
                            finalWeight = value;
                            break;
                        }
                    }
                }
                
                cart.push({ 
                    name: sizeInput ? `${nameInput} [${sizeInput}]` : nameInput, 
                    weight: Number(finalWeight) 
                });

                global.vaultCarts.set(userId, cart);
                await interaction.editReply(createMainPanel(interaction)).catch(() => {});
            }

            if (interaction.customId === 'calc_remove') {
                cart.pop();
                global.vaultCarts.set(userId, cart);
                await interaction.editReply(createMainPanel(interaction)).catch(() => {});
            }

            if (interaction.customId === 'calc_summary') {
                if (cart.length === 0) return await interaction.followUp({ content: '❌ Koszyk jest pusty!', ephemeral: true });

                const totalWeight = cart.reduce((a, b) => a + b.weight, 0);
                const units = Math.ceil(totalWeight / 500);
                const totalCost = (31.91 + (units - 1) * 30.96 + 37.63).toFixed(2);

                const summaryEmbed = new EmbedBuilder()
                    .setTitle('📊 FINALNA WYCENA VAULT REP')
                    .setColor(0x00FF00)
                    .addFields(
                        { name: '⚖️ Waga całkowita:', value: `> **${totalWeight}g**`, inline: true },
                        { name: '💰 Cena (ETL):', value: `> **${totalCost} PLN**`, inline: true },
                        { name: '🚀 KUPON:', value: 'Kod **lucky8**: [ZAREJESTRUJ SIĘ](https://ikako.vip/r/xhm44)' }
                    )
                    .setThumbnail('https://cdn.discordapp.com/attachments/1458122275973890222/1459848869591519414/2eHEXQxjAULa95rfIgEmY8lbP85-mobile.jpg');

                await interaction.followUp({ embeds: [summaryEmbed] }).catch(() => {});
                await interaction.followUp({ content: "# ✨ WITAMY!\nJEŚLI CHCESZ PONOWNIE OBLICZYĆ WAGĘ, WPISZ KOMENDĘ: `/obliczwage` 📦" }).catch(() => {});
            }
        }
    }
};
