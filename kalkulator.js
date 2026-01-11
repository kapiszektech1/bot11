const { EmbedBuilder, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const aiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// --- SYSTEM ZAPISU DANYCH (JSON) ---
const DB_FILE = './carts_db.json';

function saveCart(userId, cart) {
    let data = {};
    if (fs.existsSync(DB_FILE)) data = JSON.parse(fs.readFileSync(DB_FILE));
    data[userId] = cart;
    fs.writeFileSync(DB_FILE, JSON.stringify(data));
}

function getCart(userId) {
    if (!fs.existsSync(DB_FILE)) return [];
    const data = JSON.parse(fs.readFileSync(DB_FILE));
    return data[userId] || [];
}

// --- NAPRAWIONA FUNKCJA AI ---
async function getWeightFromAI(itemName, size) {
    try {
        const prompt = `Podaj TYLKO liczbę (gramy) dla: "${itemName}" ${size ? `rozmiar ${size}` : ''}. Buty 1400, Hoodie 900, Koszulka 250. Sama liczba.`;
        const result = await aiModel.generateContent(prompt);
        // Naprawiony odczyt tekstu
        const text = await result.response.text();
        const weight = parseInt(text.replace(/\D/g, ''));
        return isNaN(weight) || weight < 50 ? 500 : weight;
    } catch (e) {
        console.error("Błąd AI:", e);
        return 550; // Zmienione na 550, żebyś widział, że AI nie pykło
    }
}

function createMainPanel(interaction) {
    const cart = getCart(interaction.user.id);
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
        saveCart(interaction.user.id, []);
        await interaction.reply(createMainPanel(interaction));
    },

    handleInteraction: async (interaction) => {
        const userId = interaction.user.id;

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
            
            const cart = getCart(userId);
            cart.push({ name: size ? `${name} [${size}]` : name, weight });
            saveCart(userId, cart);
            
            await interaction.editReply(createMainPanel(interaction));
        }

        if (interaction.customId === 'calc_remove') {
            const cart = getCart(userId);
            cart.pop();
            saveCart(userId, cart);
            await interaction.editReply(createMainPanel(interaction));
        }

        if (interaction.customId === 'calc_summary') {
            const finalCart = getCart(userId);
            
            if (finalCart.length === 0) {
                return await interaction.reply({ content: '❌ Twój koszyk jest pusty!', ephemeral: true });
            }
            
            const totalWeight = finalCart.reduce((a, b) => a + b.weight, 0);
            const units = Math.ceil(totalWeight / 500);
            const totalCost = (31.91 + (units - 1) * 30.96 + 37.63).toFixed(2);

            const summary = new EmbedBuilder()
                .setTitle('📊 FINALNA WYCENA VAULT REP')
                .setColor(0x2ECC71)
                .setDescription(`Szacowany koszt wysyłki dla wagi **${totalWeight}g**:`)
                .addFields(
                    { name: '💰 Cena dostawy:', value: `> **${totalCost} PLN**`, inline: true },
                    { name: '🚀 KUPON:', value: 'Kod **lucky8**: [KLIKNIJ TUTAJ](https://ikako.vip/r/xhm44)' }
                )
                .setFooter({ text: 'Cena obliczona dla najtańszej linii ETL' });

            await interaction.reply({ embeds: [summary] });
        }
    }
};
