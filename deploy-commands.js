const { REST, Routes, SlashCommandBuilder } = require('discord.js');
require('dotenv').config();

// Definicja wszystkich komend bota
const commands = [
    // 1. Komenda Panelu Kuponów
    new SlashCommandBuilder()
        .setName('panel-kupony')
        .setDescription('Wysyła ciemnoniebieski panel KakoBuy (Tylko dla Zarządu)')
        .setDMPermission(false),

    // 2. Komenda Panelu Ticketów
    new SlashCommandBuilder()
        .setName('panel-ticket')
        .setDescription('Wysyła estetyczny panel ticketów VAULT REP')
        .setDMPermission(false),

    // 3. Komenda Link
    new SlashCommandBuilder()
        .setName('link')
        .setDescription('Wysyła link do przedmiotów z informacją o bonusach')
        .addStringOption(option => 
            option.setName('url')
                .setDescription('Wklej tutaj link do przedmiotów')
                .setRequired(true))
        .setDMPermission(false),

    // 4. [NOWA] Komenda Elite Panel
    new SlashCommandBuilder()
        .setName('elite-panel')
        .setDescription('Wysyła luksusowy panel informacyjny sekcji Elite (Tylko Zarząd)')
        .setDMPermission(false)
].map(command => command.toJSON());

// Inicjalizacja REST
const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

// Funkcja rejestracji
(async () => {
    try {
        console.log('--- VAULT REP: Rozpoczynam odświeżanie komend Slash ---');

        // Rejestracja dla konkretnego serwera
        await rest.put(
            Routes.applicationGuildCommands(
                '1458124283707523275', // ID BOTA
                '1457675858163793984'  // ID SERWERA
            ),
            { body: commands },
        );

        console.log('✅ VAULT REP: Zarejestrowano pomyślnie: /panel-kupony, /panel-ticket, /link oraz /elite-panel');
    } catch (error) {
        console.error('❌ Błąd rejestracji:', error);
    }
})();
