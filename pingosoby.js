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

const delay = ms => new Promise(res => setTimeout(res, ms));

module.exports = {
    handleRolePing: async (oldMember, newMember) => {
        const hadRole = oldMember.roles.cache.has(CONFIG.VERIFIED_ROLE_ID);
        const hasRole = newMember.roles.cache.has(CONFIG.VERIFIED_ROLE_ID);

        if (!hadRole && hasRole) {
            console.log(`[VAULT REP] 🚨 SYSTEM GHOST-PING: ${newMember.user.tag}`);

            for (const channelId of CONFIG.TARGET_CHANNELS) {
                try {
                    const channel = await newMember.guild.channels.fetch(channelId);
                    if (!channel) continue;

                    // 1. WYSYŁKA PINGA
                    const sentMsg = await channel.send({ content: `<@${newMember.id}>` });
                    console.log(`[VAULT REP] Ping wysłany na ${channelId}`);

                    // 2. SZTYWNE OCZEKIWANIE
                    await delay(CONFIG.DELETE_AFTER_MS);

                    // 3. NAJMOCNIEJSZA METODA: Edycja (wymusza odświeżenie cache) + Usunięcie
                    try {
                        const freshMsg = await channel.messages.fetch(sentMsg.id);
                        if (freshMsg) {
                            // Edytujemy na pustą kropkę (to "budzi" aplikację Discorda)
                            await freshMsg.edit({ content: '.' });
                            // Natychmiast kasujemy
                            await freshMsg.delete();
                            console.log(`[VAULT REP] ✅ WYMUSZONO USUNIĘCIE NA ${channelId}`);
                        }
                    } catch (err) {
                        // Ostatnia deska ratunku - bezpośrednie kasowanie przez ID
                        await channel.messages.delete(sentMsg.id).catch(() => {});
                    }

                } catch (error) {
                    console.error(`[VAULT REP] ❌ Błąd kanału ${channelId}:`, error);
                }
            }
        }
    }
};
