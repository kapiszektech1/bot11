const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Inicjalizacja AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const aiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const userCarts = new Map();

// --- FUNKCJA ZCZYTYWANIA WAGI PRZEZ AI ---
async function getWeightFromAI(itemName, size) {
    try {
        const prompt = `Jesteś ekspertem logistyki. Podaj TYLKO liczbę (gramy) dla przedmiotu: "${itemName}" ${size ? `w rozmiarze ${size}` : ''}. 
        Zasady: Buty z pudełkiem ok. 1300-1500g, Bluzy hoodie 800-1100g, T-shirty 250g, Kurtki puffer 1200g. 
        Jeśli rozmiar buta < 40, odejmij 150g. Podaj samą liczbę bez tekstu.`;
        
        const result = await aiModel.generateContent(prompt);
        const response = await result.response;
        const weight = parseInt(response.text().replace(/\D/g, ''));
        return isNaN(weight) ? 500 : weight;
    } catch (e) {
        return 500;
    }
}

// --- FUNKCJA GENERUJĄCA PANEL STEROWANIA ---
function createMainPanel(interaction) {
    const userId = interaction.user.id;
    const userName = interaction.user.username;
    const cart = userCarts.get(userId) || [];
    const totalWeight = cart.reduce((sum, item) => sum + item.weight, 0);

    const embed = new EmbedBuilder()
        .setTitle('📦 KALKULATOR WYSYŁKI VAULT AI')
        .setDescription(`Witaj **${userName}**! Dodawaj przedmioty, a ja oszacuję wagę i cenę najtańszej dostawy.\n\n**🛒 TWOJA LISTA:**\n${cart.map((i, n) => `**${n+1}.** ${i.name} (\`${i.weight}g\`)`).join('\n') || "_Koszyk jest pusty_"}\n\n**⚖️ ŁĄCZNA WAGA:** \`${totalWeight}g\``)
        .setColor(0x00008B)
        .setThumbnail('https://cdn.discordapp.com/attachments/1458122275973890222/1459848674631749825/wymiary-paczki.png?ex=6964c586&is=69637406&hm=1e00aaa8f2915a2fb681aefd163e1ec63289608b5bd443dce18b5786d84a1b7f')
        .setFooter({ text: 'VAULT REP • Wszystkie dane zczytuje AI' });

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('calc_add').setLabel('➕ DODAJ PRZEDMIOT').setButtonStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('calc_remove').setLabel('🗑️ USUŃ OSTATNI').setButtonStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId('calc_summary').setLabel('📊 PODSUMUJ PACZKĘ').setButtonStyle(ButtonStyle.Success)
    );

    return { embeds: [embed], components: [row] };
}

module.exports = {
    // KOMENDA /obliczwage
    execute: async (interaction) => {
        userCarts.set(interaction.user.id, []);
        const panel = createMainPanel(interaction);
        await interaction.reply({ ...panel, ephemeral: true });
    },

    handleInteraction: async (interaction) => {
        const userId = interaction.user.id;
        let cart = userCarts.get(userId) || [];

        // 1. MODAL Z 3 PYTANIAMI
        if (interaction.customId === 'calc_add') {
            const modal = new ModalBuilder().setCustomId('modal_ai').setTitle('Dodaj przedmiot do paczki');

            const nameInput = new TextInputBuilder()
                .setCustomId('name').setLabel("Podaj pełny model produktu.").setPlaceholder("np. Jordan 4 Military Black").setStyle(TextInputStyle.Short).setRequired(true);

            const sizeInput = new TextInputBuilder()
                .setCustomId('size').setLabel("Podaj rozmiar (opcjonalnie)").setPlaceholder("np. 42.5 / L").setStyle(TextInputStyle.Short).setRequired(false);

            const weightInput = new TextInputBuilder()
                .setCustomId('weight_manual').setLabel("Podaj wagę ręcznie (opcjonalnie)").setPlaceholder("W gramach, np. 1250").setStyle(TextInputStyle.Short).setRequired(false);

            modal.addComponents(new ActionRowBuilder().addComponents(nameInput), new ActionRowBuilder().addComponents(sizeInput), new ActionRowBuilder().addComponents(weightInput));
            return await interaction.showModal(modal);
        }

        // 2. LOGIKA PO MODALU (EDYCJA PANELU)
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

        // 3. USUWANIE (EDYCJA PANELU)
        if (interaction.customId === 'calc_remove') {
            cart.pop();
            userCarts.set(userId, cart);
            const panel = createMainPanel(interaction);
            await interaction.editReply(panel);
        }

        // 4. PODSUMOWANIE + TEKST KOŃCOWY
        if (interaction.customId === 'calc_summary') {
            if (cart.length === 0) return await interaction.reply({ content: 'Koszyk jest pusty!', ephemeral: true });

            const totalWeight = cart.reduce((a, b) => a + b.weight, 0);
            const units = Math.ceil(totalWeight / 500);
            const totalCost = (31.91 + (units - 1) * 30.96 + 37.63).toFixed(2);

            const summaryEmbed = new EmbedBuilder()
                .setTitle('📊 FINALNA WYCENA VAULT REP')
                .setColor(0x00FF00)
                .setThumbnail('https://cdn.discordapp.com/attachments/1458122275973890222/1459848869591519414/2eHEXQxjAULa95rfIgEmY8lbP85-mobile.jpg?ex=6964c5b5&is=69637435&hm=365702345decfe8d5c8baadc1c7cfe818faa887c08c28ca849e400675fd3f8b2')
                .addFields(
                    { name: '📦 Twoja paczka:', value: cart.map((i, n) => `\`${n+1}.\` ${i.name} (${i.weight}g)`).join('\n') },
                    { name: '⚖️ Łączna waga:', value: `**${totalWeight}g**`, inline: true },
                    { name: '💰 Cena najtańszej dostawy ETL:', value: `**${totalCost} PLN**`, inline: true },
                    { name: '🚀 KUPON:', value: 'Wpisz **lucky8** (56 PLN taniej) i załóż konto: [KLIKNIJ TUTAJ](https://ikako.vip/r/xhm44)' }
                );

            // Wysyłamy embeda z wyceną
            await interaction.followUp({ embeds: [summaryEmbed], ephemeral: true });

            // Wysyłamy Twoją wiadomość tekstową po podsumowaniu
            const footerText = "# ✨ WITAMY!\nJEŚLI CHCESZ PONOWNIE OBLICZYĆ WAGĘ I CENĘ SWOJEJ PACZKI, WPISZ KOMENDĘ: `/obliczwage` 📦";
            await interaction.followUp({ content: footerText, ephemeral: true });
        }
    }
};
