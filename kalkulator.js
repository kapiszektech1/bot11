const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Inicjalizacja AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const aiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const userCarts = new Map();

// --- FUNKCJA ZCZYTYWANIA WAGI PRZEZ AI ---
async function getWeightFromAI(itemName, size) {
    try {
        const prompt = `Jesteś ekspertem logistyki paczek z Chin. Podaj TYLKO liczbę (gramy) dla przedmiotu: "${itemName}" ${size ? `w rozmiarze ${size}` : ''}. 
        Zasady: Buty z boxem ok. 1400g, Hoodie 900g, T-shirt 250g, Kurtka 1200g. 
        Zwróć TYLKO liczbę bez żadnego tekstu.`;
        
        const result = await aiModel.generateContent(prompt);
        const response = await result.response;
        const weightText = response.text().replace(/\D/g, '');
        const weight = parseInt(weightText);
        return isNaN(weight) ? 500 : weight;
    } catch (e) {
        console.error("Błąd AI:", e);
        return 500;
    }
}

// --- FUNKCJA GENERUJĄCA PANEL STEROWANIA ---
function createMainPanel(interaction) {
    const userId = interaction.user.id;
    const userName = interaction.user.username;
    const cart = userCarts.get(userId) || [];
    const totalWeight = cart.reduce((sum, item) => sum + item.weight, 0);

    const embed = new EmbedBuilder();
    embed.setTitle('📦 KALKULATOR WYSYŁKI VAULT AI');
    embed.setDescription(`Witaj **${userName}**! Dodawaj przedmioty, a ja oszacuję wagę i cenę najtańszej dostawy.\n\n**🛒 TWOJA LISTA:**\n${cart.map((i, n) => `**${n+1}.** ${i.name} (\`${i.weight}g\`)`).join('\n') || "_Koszyk jest pusty_"}\n\n**⚖️ ŁĄCZNA WAGA:** \`${totalWeight}g\``);
    embed.setColor(0x00008B);
    embed.setThumbnail('https://cdn.discordapp.com/attachments/1458122275973890222/1459848674631749825/wymiary-paczki.png');
    embed.setFooter({ text: 'VAULT REP • Wszystkie dane zczytuje AI' });

    // PANCERNE PRZYCISKI (ROZBITA SKŁADNIA)
    const btnAdd = new ButtonBuilder();
    btnAdd.setCustomId('calc_add');
    btnAdd.setLabel('➕ DODAJ PRZEDMIOT');
    btnAdd.setButtonStyle(1); // Primary

    const btnRemove = new ButtonBuilder();
    btnRemove.setCustomId('calc_remove');
    btnRemove.setLabel('🗑️ USUŃ OSTATNI');
    btnRemove.setButtonStyle(4); // Danger

    const btnSummary = new ButtonBuilder();
    btnSummary.setCustomId('calc_summary');
    btnSummary.setLabel('📊 PODSUMUJ PACZKĘ');
    btnSummary.setButtonStyle(3); // Success

    const row = new ActionRowBuilder();
    row.addComponents(btnAdd, btnRemove, btnSummary);

    return { embeds: [embed], components: [row] };
}

module.exports = {
    execute: async (interaction) => {
        userCarts.set(interaction.user.id, []);
        const panel = createMainPanel(interaction);
        await interaction.reply({ ...panel, ephemeral: true });
    },

    handleInteraction: async (interaction) => {
        const userId = interaction.user.id;
        let cart = userCarts.get(userId) || [];

        // 1. OBSŁUGA OTWIERANIA MODALA
        if (interaction.customId === 'calc_add') {
            const modal = new ModalBuilder();
            modal.setCustomId('modal_ai');
            modal.setTitle('Dodaj przedmiot do paczki');

            const nameInput = new TextInputBuilder();
            nameInput.setCustomId('name');
            nameInput.setLabel("Podaj pełny model produktu.");
            nameInput.setPlaceholder("np. Jordan 4 Military Black");
            nameInput.setStyle(1); // Short
            nameInput.setRequired(true);

            const sizeInput = new TextInputBuilder();
            sizeInput.setCustomId('size');
            sizeInput.setLabel("Podaj rozmiar (opcjonalnie)");
            sizeInput.setPlaceholder("np. 42.5 / L");
            sizeInput.setStyle(1); // Short
            sizeInput.setRequired(false);

            const weightInput = new TextInputBuilder();
            weightInput.setCustomId('weight_manual');
            weightInput.setLabel("Podaj wagę ręcznie (opcjonalnie)");
            weightInput.setPlaceholder("W gramach, np. 1250");
            weightInput.setStyle(1); // Short
            weightInput.setRequired(false);

            const r1 = new ActionRowBuilder().addComponents(nameInput);
            const r2 = new ActionRowBuilder().addComponents(sizeInput);
            const r3 = new ActionRowBuilder().addComponents(weightInput);

            modal.addComponents(r1, r2, r3);
            return await interaction.showModal(modal);
        }

        // 2. LOGIKA PO ZATWIERDZENIU MODALA
        if (interaction.isModalSubmit() && interaction.customId === 'modal_ai') {
            await interaction.deferUpdate();
            
            const name = interaction.fields.getTextInputValue('name');
            const size = interaction.fields.getTextInputValue('size');
            const manualWeight = interaction.fields.getTextInputValue('weight_manual');

            let finalWeight;
            if (manualWeight && !isNaN(manualWeight)) {
                finalWeight = parseInt(manualWeight);
            } else {
                finalWeight = await getWeightFromAI(name, size);
            }

            const displayName = size ? `${name} [${size}]` : name;
            cart.push({ name: displayName, weight: finalWeight });
            userCarts.set(userId, cart);

            const panel = createMainPanel(interaction);
            await interaction.editReply(panel);
        }

        // 3. USUWANIE OSTATNIEGO ELEMENTU
        if (interaction.customId === 'calc_remove') {
            if (cart.length > 0) {
                cart.pop();
                userCarts.set(userId, cart);
            }
            const panel = createMainPanel(interaction);
            await interaction.editReply(panel);
        }

        // 4. FINALNE PODSUMOWANIE
        if (interaction.customId === 'calc_summary') {
            if (cart.length === 0) return await interaction.reply({ content: 'Twój koszyk jest pusty!', ephemeral: true });

            const totalWeight = cart.reduce((a, b) => a + b.weight, 0);
            const units = Math.ceil(totalWeight / 500);
            const totalCost = (31.91 + (units - 1) * 30.96 + 37.63).toFixed(2);

            const summaryEmbed = new EmbedBuilder();
            summaryEmbed.setTitle('📊 FINALNA WYCENA VAULT REP');
            summaryEmbed.setColor(0x00FF00);
            summaryEmbed.setThumbnail('https://cdn.discordapp.com/attachments/1458122275973890222/1459848869591519414/2eHEXQxjAULa95rfIgEmY8lbP85-mobile.jpg');
            summaryEmbed.addFields(
                { name: '📦 Twoja paczka:', value: cart.map((i, n) => `\`${n+1}.\` ${i.name} (${i.weight}g)`).join('\n') },
                { name: '⚖️ Łączna waga:', value: `**${totalWeight}g**`, inline: true },
                { name: '💰 Cena dostawy ETL:', value: `**${totalCost} PLN**`, inline: true },
                { name: '🚀 KUPON:', value: 'Wpisz **lucky8** (56 PLN taniej) i załóż konto: [KLIKNIJ TUTAJ](https://ikako.vip/r/xhm44)' }
            );

            await interaction.followUp({ embeds: [summaryEmbed], ephemeral: true });

            // Tekst końcowy (zgodnie z Twoją prośbą)
            const footerText = "# ✨ WITAMY!\nJEŚLI CHCESZ PONOWNIE OBLICZYĆ WAGĘ I CENĘ SWOJEJ PACZKI, WPISZ KOMENDĘ: `/obliczwage` 📦";
            await interaction.followUp({ content: footerText, ephemeral: true });
        }
    }
};
