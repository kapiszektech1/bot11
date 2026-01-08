// --- PLIK: pingosoby.js ---
const { Collection } = require('discord.js');

// Konfiguracja dla 02,03
const CONFIG = {
    VERIFIED_ROLE_ID: '1457675858486755375',
    TARGET_CHANNELS: [
        '1457675905617887428', 
        '1457675903617335297', 
        '1457675921359372371'
    ],
    DELETE_AFTER_MS: 3000 // 3 sekundy
};

module.exports = {
    handleRolePing: async (oldMember, newMember) => {
        // Sprawdzamy, czy użytkownik nie miał rangi, a teraz ją otrzymał
        const hadRole = oldMember.roles.cache.has(CONFIG.VERIFIED_ROLE_ID);
        const hasRole = newMember.roles.cache.has(CONFIG.VERIFIED_ROLE_ID);

        if (!hadRole && hasRole) {
            console.log(`[VAULT REP] Nowa weryfikacja: ${newMember.user.tag}. Rozpoczynam kierowanie na kanały.`);

            for (const channelId of CONFIG.TARGET_CHANNELS) {
                try {
                    const channel = await newMember.guild.channels.fetch(channelId);
                    if (!channel) continue;

                    // Wysyłamy samego pinga
                    const pingMessage = await channel.send(`${newMember}`);

                    // Usuwamy po 3 sekundach
                    setTimeout(async () => {
                        try {
                            await pingMessage.delete();
                        } catch (err) {
                            // Ignorujemy błąd, jeśli wiadomość już została usunięta
                        }
                    }, CONFIG.DELETE_AFTER_MS);

                } catch (error) {
                    console.error(`Błąd podczas pingowania na kanale ${channelId}:`, error);
                }
            }
        }
    }
};
