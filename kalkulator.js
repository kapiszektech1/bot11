const { EmbedBuilder, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Inicjalizacja AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const aiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Stabilny zapis koszyków
if (!global.vaultCarts) { global.vaultCarts = {}; }

async function getWeightFromAI(itemName, size) {
    try {
        const prompt = `Podaj TYLKO liczbę (gramy) dla: "${itemName}" ${size ? `rozmiar ${size}` : ''}. Buty 1400, Hoodie 900, T-shirt 250, Kurtka 1200. Sama liczba.`;
        const result = await aiModel.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const weight = parseInt(text.replace(/\D/g, ''));
        // Jeśli AI odpowie poprawnie, zwróci wagę. Jeśli nie, 555g (znak dla Ciebie)
        return isNaN(weight) || weight < 10 ? 555 : weight; 
    } catch (e) {
        console.error("BŁĄD AI:", e.message);
        return 556; // 556g oznacza brak połączenia z Gemini
    }
}

function createMainPanel(interaction) {
    const userId = interaction.user.id;
    const cart = global.vaultCarts[userId] || [];
    const totalWeight = cart.reduce((sum, item) => sum + item.weight, 0);

    const embed = new EmbedBuilder()
        .setTitle('📦 VAULT REP • KALKULATOR WAGI')
        .setDescription(
            `Witaj **${interaction.user.username}**!\n\n` +
            `**🛒 TWOJA LISTA:**\n${cart.map((i, n) => `> \`${n+1}.\` **${i.name}** — \`${i.weight}g\``).join('\n') || "*Koszyk jest pusty...*"}\n\n` +
            `**⚖️ ŁĄCZNA WAGA:** \`${totalWeight}g\``
        )
        .setColor(0x00008B)
        .setThumbnail('https://cdn.discordapp.com/attachments/1458122275973890222/1459848674631749825/wymiary-paczki.png')
        .setFooter({ text: 'VAULT AI • Wszystkie dane zczytuje AI' });

    const row = {
        type: 1,
        components: [
            { type: 2, style: 1, label: '➕ DODAJ', custom_id: 'calc_add' },
            { type: 2, style: 4, label: '🗑️ USUŃ', custom_id: 'calc_remove' },
            { type: 2, style: 3, label: '📊 PODSUMUJ', custom_id: 'calc_summary' }
        ]
    };

    return { embeds: [embed], components: [row] };
}

module.exports = {
    execute: async (interaction) => {
        global.vaultCarts[interaction.user.id] = [];
        await interaction.reply(createMainPanel(interaction));
    },

    handleInteraction: async (interaction) => {
        const userId = interaction.user.id;
        if (!global.vaultCarts[userId]) global.vaultCarts[userId] = [];

        if (interaction.customId === 'calc_add') {
            const modal = new ModalBuilder().setCustomId('modal_ai').setTitle('Dodaj przedmiot');
            const r1 = new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('name').setLabel("Co chcesz dodać?").setStyle(1).setRequired(true));
            const r2 = new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('size').setLabel("Rozmiar").setStyle(1).setRequired(false));
            const r3 = new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('weight_manual').setLabel("Waga ręcznie (g)").setStyle(1).setRequired(false));
            modal.addComponents(r1, r2, r3);
            return await interaction.showModal(modal);
        }

        if (interaction.isModalSubmit() && interaction.customId === 'modal_ai') {
            await interaction.deferUpdate();
            const name = interaction.fields.getTextInputValue('name');
            const size = interaction.fields.getTextInputValue('size');
            const manual = interaction.fields.getTextInputValue('weight_manual');
            
            const weight = (manual && !isNaN(manual)) ? parseInt(manual) : await getWeightFromAI(name, size);
            
            global.vaultCarts[userId].push({ name: size ? `${name} [${size}]` : name, weight });
            await interaction.editReply(createMainPanel(interaction));
        }

        if (interaction.customId === 'calc_remove') {
            global.vaultCarts[userId].pop();
            await interaction.editReply(createMainPanel(interaction));
        }

        if (interaction.customId === 'calc_summary') {
            const finalCart = global.vaultCarts[userId];
            
            if (!finalCart || finalCart.length === 0) {
                // To wyśle wiadomość widoczną dla wszystkich, jeśli koszyk zniknie
                return await interaction.reply({ content: '❌ Błąd: Koszyk jest pusty w pamięci bota!', ephemeral: false });
            }

            const totalWeight = finalCart.reduce((a, b) => a + b.weight, 0);
            const units = Math.ceil(totalWeight / 500);
            const totalCost = (31.91 + (units - 1) * 30.96 + 37.63).toFixed(2);

            const summaryEmbed = new EmbedBuilder()
                .setTitle('📊 FINALNA WYCENA VAULT AI')
                .setColor(0x00FF00)
                .setDescription(`Wycena dla paczki użytkownika **${interaction.user.username}**:`)
                .addFields(
                    { name: '⚖️ Waga całkowita:', value: `> **${totalWeight}g**`, inline: true },
                    { name: '💰 Cena (ETL):', value: `> **${totalCost} PLN**`, inline: true },
                    { name: '🚀 KUPON:', value: 'Kod **lucky8** (56 PLN taniej): [ZAREJESTRUJ SIĘ](https://ikako.vip/r/xhm44)' }
                )
                .setThumbnail('https://cdn.discordapp.com/attachments/1458122275973890222/1459848869591519414/2eHEXQxjAULa95rfIgEmY8lbP85-mobile.jpg');

            await interaction.reply({ embeds: [summaryEmbed] });
        }
    }
};
