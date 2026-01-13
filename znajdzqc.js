const { Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        // ID Twojego kanału (QC)
        const targetChannelId = '1457675988027572317';

        // Ignoruj boty i wiadomości spoza kanału
        if (message.author.bot || message.channel.id !== targetChannelId) return;

        const content = message.content;
        let itemId = null;

        // 1. Logika wyciągania ID (obsługuje Kakobuy, Weidian, 1688)
        // Szuka wzorca itemID=12345 lub itemID%3D12345 (dla linków zakodowanych)
        const idPattern = /(?:itemID|id)(?:=|%3D)(\d+)/i;
        const match = content.match(idPattern);

        if (match && match[1]) {
            itemId = match[1];
        }

        // Jeśli znaleziono ID, budujemy wiadomość
        if (itemId) {
            const qcUrl = `https://finderqc.com/product/Weidian/${itemId}`;

            // Tworzenie estetycznego Embedu
            const embed = new EmbedBuilder()
                .setColor('#2b2d31') // Ciemny, elegancki kolor
                .setTitle('🔎┃ SYSTEM KONTROLI JAKOŚCI (QC)')
                .setDescription(`Pomyślnie wyodrębniono ID produktu: **\`${itemId}\`**\nKliknij przycisk poniżej, aby sprawdzić rzeczywiste zdjęcia magazynowe.`)
                .addFields(
                    { 
                        name: '⚠️ Nie widzisz zdjęć?', 
                        value: '> Jeśli po kliknięciu folder jest pusty, oznacza to, że ten przedmiot nie był często kupowany. **Zalecamy poszukać innego sprzedawcy (lepszy batch)**, który posiada historię zamówień i sprawdzone QC.' 
                    }
                )
                .setFooter({ text: 'VAULT REPS SYSTEM', iconURL: message.guild.iconURL() })
                .setTimestamp();

            // Tworzenie przycisku
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setLabel('Otwórz Galerię QC')
                        .setStyle(ButtonStyle.Link)
                        .setURL(qcUrl)
                        .setEmoji('📸')
                );

            // Odpowiedź bota
            try {
                await message.reply({ embeds: [embed], components: [row] });
            } catch (error) {
                console.error('Błąd podczas wysyłania QC:', error);
            }
        }
    },
};
