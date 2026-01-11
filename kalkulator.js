const { EmbedBuilder, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const aiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Używamy globalnego obiektu do przechowywania koszyków
if (!global.userCarts) {
    global.userCarts = new Map();
}

async function getWeightFromAI(itemName, size) {
    try {
        const prompt = `Podaj TYLKO liczbę (gramy) dla: "${itemName}" ${size ? `rozmiar ${size}` : ''}. Zasady: Buty z boxem 1400, Hoodie 900, T-shirt 250, Kurtka 1200. Podaj samą liczbę.`;
        const result = await aiModel.generateContent(prompt);
        const text = result.response.text();
        const weight = parseInt(text.replace(/\D/g, ''));
        console.log(`🤖 AI LOG: ${itemName} -> ${weight}g`);
        return isNaN(weight) || weight < 50 ? 500 : weight;
    } catch (e) {
        console.error("❌ BŁĄD AI:", e.message);
        return 500;
    }
}

function createMainPanel(interaction) {
    const userId = interaction.user.id;
    const cart = global.userCarts.get(userId) || [];
    const totalWeight = cart.reduce((sum, item) => sum + item.weight, 0);

    const embed = new EmbedBuilder()
        .setTitle('📦 VAULT REP • KALKULATOR WAGI')
        .setDescription(`Witaj **${interaction.user.username}**!\n\n**🛒 TWOJA LISTA:**\n${cart.map((i, n) => `> \`${n+1}.\` **${i.name}** — \`${i.weight}g\``).join('\n') || "*Koszyk jest pusty...*"}\n\n**⚖️ ŁĄCZNA WAGA:** \`${totalWeight}g\``)
        .setColor(0x5865F2)
        .setThumbnail('https://cdn.discordapp.com/attachments/1458122275973890222/1459848674631749825/wymiary-paczki.png');

    const row = {
        type: 1,
        components: [
            { type: 2, style: 1, label: '➕ DODAJ', custom_id: 'calc_add' },
            { type: 2, style: 4, label: '🗑️ USUŃ', custom_id: 'calc_remove' },
            { type: 2, style: 3, label: '📊 PODSUMUJ PACZKĘ', custom_id: 'calc_summary' }
        ]
    };

    return { embeds: [embed], components: [row] };
}

module.exports = {
    execute: async (interaction) => {
        global.userCarts.set(interaction.user.id, []);
        await interaction.reply(createMainPanel(interaction));
    },

    handleInteraction: async (interaction) => {
        const userId = interaction.user.id;
        if (!global.userCarts.has(userId)) global.userCarts.set(userId, []);
        let cart = global.userCarts.get(userId);

        if (interaction.customId === 'calc_add') {
            const modal = new ModalBuilder().setCustomId('modal_ai').setTitle('Dodaj przedmiot');
            const r1 = new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('name').setLabel("Model produktu").setStyle(1).setRequired(true));
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
            
            cart.push({ name: size ? `${name} [${size}]` : name, weight });
            global.userCarts.set(userId, cart);
            await interaction.editReply(createMainPanel(interaction));
        }

        if (interaction.customId === 'calc_remove') {
            cart.pop();
            global.userCarts.set(userId, cart);
            await interaction.editReply(createMainPanel(interaction));
        }

        if (interaction.customId === 'calc_summary') {
            // SPRAWDZENIE KOSZYKA Z GLOBALNEJ ZMIENNEJ
            const finalCart = global.userCarts.get(userId) || [];
            
            if (finalCart.length === 0) {
                return await interaction.reply({ content: '❌ Twój koszyk jest pusty!', ephemeral: true });
            }
            
            const totalWeight = finalCart.reduce((a, b) => a + b.weight, 0);
            const units = Math.ceil(totalWeight / 500);
            const totalCost = (31.91 + (units - 1) * 30.96 + 37.63).toFixed(2);

            const summary = new EmbedBuilder()
                .setTitle('📊 FINALNA WYCENA VAULT REP')
                .setColor(0x2ECC71)
                .addFields(
                    { name: '⚖️ Łączna waga:', value: `> **${totalWeight}g**`, inline: true },
                    { name: '💰 Cena dostawy:', value: `> **${totalCost} PLN**`, inline: true },
                    { name: '🚀 KUPON:', value: 'Kod **lucky8** (56 PLN taniej): [ZAREJESTRUJ SIĘ](https://ikako.vip/r/xhm44)' }
                );

            await interaction.reply({ embeds: [summary] });
        }
    }
};
