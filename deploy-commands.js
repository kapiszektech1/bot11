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

    // 4. Komenda Elite Panel
    new SlashCommandBuilder()
        .setName('elite-panel')
        .setDescription('Wysyła luksusowy panel informacyjny sekcji Elite (Tylko Zarząd)')
        .setDMPermission(false),

    // 5. [NOWA] Komenda BAN
    new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Trwale banuje użytkownika (Tylko Zarząd)')
        .addUserOption(opt => opt.setName('osoba').setDescription('Użytkownik do zbanowania').setRequired(true))
        .addStringOption(opt => opt.setName('powod').setDescription('Powód bana').setRequired(true))
        .setDMPermission(false),

    // 6. [NOWA] Komenda KICK
    new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Wyrzuca użytkownika z serwera (Tylko Zarząd)')
        .addUserOption(opt => opt.setName('osoba').setDescription('Użytkownik do wyrzucenia').setRequired(true))
        .addStringOption(opt => opt.setName('powod').setDescription('Powód wyrzucenia').setRequired(true))
        .setDMPermission(false),

    // 7. [NOWA] Komenda MUTE
    new SlashCommandBuilder()
        .setName('mute')
        .setDescription('Wycisza użytkownika (Zarząd i Moderacja)')
        .addUserOption(opt => opt.setName('osoba').setDescription('Użytkownik do wyciszenia').setRequired(true))
        .addStringOption(opt => opt.setName('czas').setDescription('Np. 15m, 2h, 1d, 7d').setRequired(true))
        .addStringOption(opt => opt.setName('powod').setDescription('Powód wyciszenia').setRequired(true))
        .setDMPermission(false),

    // 8. [NOWA] Komenda WARN
    new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Nadaje ostrzeżenie użytkownikowi (Zarząd i Moderacja)')
        .addUserOption(opt => opt.setName('osoba').setDescription('Użytkownik do ostrzeżenia').setRequired(true))
        .addStringOption(opt => opt.setName('powod').setDescription('Powód ostrzeżenia').setRequired(true))
        .setDMPermission(false)

].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log('--- VAULT REP: Rozpoczynam odświeżanie komend Slash ---');

        await rest.put(
            Routes.applicationGuildCommands(
                '1458124283707523275', // ID BOTA
                '1457675858163793984'  // ID SERWERA
            ),
            { body: commands },
        );

        console.log('✅ VAULT REP: Pomyślnie zarejestrowano wszystkie komendy, w tym system moderacji.');
    } catch (error) {
        console.error('❌ Błąd rejestracji:', error);
    }
})();
