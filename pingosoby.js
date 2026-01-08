// --- PLIK: pingosoby.js ---
const CONFIG = {
    VERIFIED_ROLE_ID: '1457675858486755375',
    TARGET_CHANNELS: [
        '1457675905617887428', 
        '1457675903617335297', 
        '1457675921359372371'
    ],
    DELETE_AFTER_MS: 3000
};

// Funkcja wymuszająca zatrzymanie procesu
const delay = ms => new Promise(res => setTimeout(res, ms));

module.exports = {
    handleRolePing: async (oldMember, newMember) => {
        const hadRole = oldMember.roles.cache.has(CONFIG.VERIFIED_ROLE_ID);
        const hasRole = newMember.roles.cache.has(CONFIG.VERIFIED_ROLE_ID);

        // Reagujemy tylko na dodanie rangi
        if (!hadRole && hasRole) {
            console.log(`[VAULT REP] 🚨 WYKRYTO WERYFIKACJĘ: ${newMember.user.tag}. Odpalam system Ghost-Ping.`);

            // Przetwarzamy kanały sekwencyjnie, by nie przeciążyć API
            for (const channelId of CONFIG.TARGET_CHANNELS) {
                try {
                    const channel = await newMember.guild.channels.fetch(channelId);
                    if (!channel) continue;

                    // 1. WYSYŁKA (Wymuszamy fresh mention)
                    const sentMsg = await channel.send({ 
                        content: `<@${newMember.id}>`,
                        allowedMentions: { users: [newMember.id] } 
                    });
                    
                    console.log(`[VAULT REP] Ping wysłany na ${channelId}. Czekam ${CONFIG.DELETE_AFTER_MS}ms...`);

                    // 2. SZTYWNE CZEKANIE
                    await delay(CONFIG.DELETE_AFTER_MS);

                    // 3. AGRESYWNE USUWANIE (Próba bezpośrednia + Fetch)
                    try {
                        // Pobieramy wiadomość prosto z serwerów Discorda, żeby mieć pewność, że bot ją "trzyma"
                        const freshMsg = await channel.messages.fetch(sentMsg.id);
                        if (freshMsg) {
                            await freshMsg.delete();
                            console.log(`[VAULT REP] ✅ Wiadomość usunięta pomyślnie z ${channelId}`);
                        }
                    } catch (innerError) {
                        // Jeśli fetch zawiedzie, próbujemy ostatni raz przez ID
                        await channel.messages.delete(sentMsg.id).catch(() => {});
                        console.log(`[VAULT REP] ⚠️ Użyto alternatywnej metody usuwania na ${channelId}`);
                    }

                } catch (error) {
                    console.error(`[VAULT REP] ❌ Krytyczny błąd na kanale ${channelId}:`, error);
                }
            }
        }
    }
};
