require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Game = require('./models/Game');

const MONGO_URI = process.env.MONGO_URI;

const games = [
  {
    title: 'Elden Ring',
    genre: 'Action RPG',
    platform: 'PC / PS5 / Xbox',
    developer: 'FromSoftware',
    year: 2022,
    rating: 9.5,
    price: 59.99,
    status: 'Available',
    cover: 'https://placehold.co/80x100/7c6aff/ffffff?text=ER',
    description: 'An open world action RPG set in the Lands Between, featuring vast exploration and challenging combat.',
    tags: ['Open World', 'Fantasy', 'Challenging', 'Story-Rich'],
  },
  {
    title: 'The Legend of Zelda: Tears of the Kingdom',
    genre: 'Action Adventure',
    platform: 'Nintendo Switch',
    developer: 'Nintendo',
    year: 2023,
    rating: 9.8,
    price: 69.99,
    status: 'Available',
    cover: 'https://placehold.co/80x100/ff6a9b/ffffff?text=TK',
    description: 'Link explores the skies and depths of Hyrule in this massive open-world adventure.',
    tags: ['Open World', 'Adventure', 'Puzzle', 'Nintendo'],
  },
  {
    title: 'Red Dead Redemption 2',
    genre: 'Open World',
    platform: 'PC / PS4 / Xbox',
    developer: 'Rockstar Games',
    year: 2018,
    rating: 9.7,
    price: 39.99,
    status: 'Sale',
    cover: 'https://placehold.co/80x100/6affda/111111?text=RDR',
    description: 'An epic tale of life in America at the dawn of the modern age set in the vast open world of 1899.',
    tags: ['Open World', 'Western', 'Story-Rich', 'Realistic'],
  },
  {
    title: 'God of War Ragnarök',
    genre: 'Action Adventure',
    platform: 'PS5 / PS4',
    developer: 'Santa Monica Studio',
    year: 2022,
    rating: 9.4,
    price: 49.99,
    status: 'Available',
    cover: 'https://placehold.co/80x100/f4c542/111111?text=GOW',
    description: 'Kratos and Atreus embark on a mythic journey through the Nine Realms to prevent Ragnarök.',
    tags: ['Action', 'Mythology', 'Story-Rich', 'Combat'],
  },
  {
    title: 'Cyberpunk 2077',
    genre: 'RPG',
    platform: 'PC / PS5 / Xbox',
    developer: 'CD Projekt Red',
    year: 2020,
    rating: 8.5,
    price: 29.99,
    status: 'Sale',
    cover: 'https://placehold.co/80x100/ff6a9b/ffffff?text=CP',
    description: 'An open-world action RPG set in Night City, a megalopolis obsessed with power and body modification.',
    tags: ['Cyberpunk', 'Open World', 'RPG', 'Futuristic'],
  },
  {
    title: 'Hollow Knight',
    genre: 'Metroidvania',
    platform: 'PC / Switch / PS4',
    developer: 'Team Cherry',
    year: 2017,
    rating: 9.2,
    price: 14.99,
    status: 'Available',
    cover: 'https://placehold.co/80x100/7c6aff/ffffff?text=HK',
    description: 'A challenging 2D action-adventure through a vast ruined kingdom of insects and heroes.',
    tags: ['Indie', 'Metroidvania', 'Challenging', 'Dark'],
  },
  {
    title: 'Baldur\'s Gate 3',
    genre: 'RPG',
    platform: 'PC / PS5',
    developer: 'Larian Studios',
    year: 2023,
    rating: 9.8,
    price: 59.99,
    status: 'New',
    cover: 'https://placehold.co/80x100/6affda/111111?text=BG3',
    description: 'A legendary RPG where your choices shape an epic story set in the Forgotten Realms.',
    tags: ['RPG', 'Fantasy', 'Co-op', 'Story-Rich'],
  },
  {
    title: 'Hades',
    genre: 'Roguelike',
    platform: 'PC / Switch / PS4',
    developer: 'Supergiant Games',
    year: 2020,
    rating: 9.3,
    price: 24.99,
    status: 'Available',
    cover: 'https://placehold.co/80x100/f4c542/111111?text=HAD',
    description: 'Defy the god of the dead as you hack and slash your way out of the Underworld.',
    tags: ['Roguelike', 'Mythology', 'Indie', 'Action'],
  },
  {
    title: 'Stardew Valley',
    genre: 'Simulation RPG',
    platform: 'PC / Switch / Mobile',
    developer: 'ConcernedApe',
    year: 2016,
    rating: 9.0,
    price: 14.99,
    status: 'Available',
    cover: 'https://placehold.co/80x100/7c6aff/ffffff?text=SV',
    description: 'Build the farm of your dreams in this relaxing farming simulation RPG.',
    tags: ['Farming', 'Relaxing', 'Indie', 'Simulation'],
  },
  {
    title: 'Sekiro: Shadows Die Twice',
    genre: 'Action RPG',
    platform: 'PC / PS4 / Xbox',
    developer: 'FromSoftware',
    year: 2019,
    rating: 9.1,
    price: 34.99,
    status: 'Sale',
    cover: 'https://placehold.co/80x100/ff6a9b/ffffff?text=SEK',
    description: 'Carve your own clever path to vengeance in this dark, twisted new adventure from FromSoftware.',
    tags: ['Samurai', 'Challenging', 'Action', 'Japan'],
  },
  {
    title: 'The Witcher 3: Wild Hunt',
    genre: 'RPG',
    platform: 'PC / PS5 / Xbox / Switch',
    developer: 'CD Projekt Red',
    year: 2015,
    rating: 9.6,
    price: 19.99,
    status: 'Sale',
    cover: 'https://placehold.co/80x100/6affda/111111?text=W3',
    description: 'Play as Geralt of Rivia, a monster hunter in a vast open world full of meaningful choices.',
    tags: ['Open World', 'Fantasy', 'Story-Rich', 'RPG'],
  },
  {
    title: 'Minecraft',
    genre: 'Sandbox',
    platform: 'PC / Console / Mobile',
    developer: 'Mojang',
    year: 2011,
    rating: 9.0,
    price: 26.99,
    status: 'Available',
    cover: 'https://placehold.co/80x100/7c6aff/ffffff?text=MC',
    description: 'Build, explore and survive in an infinite blocky world with limitless creativity.',
    tags: ['Sandbox', 'Creative', 'Survival', 'Multiplayer'],
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB connected');

    // Create a system user for seeded games
    let systemUser = await User.findOne({ email: 'system@gamevault.com' });
    if (!systemUser) {
      systemUser = await User.create({
        name: 'GameVault',
        email: 'system@gamevault.com',
        password: 'SystemPass123!',
      });
      console.log('✅ System user created');
    }

    // Only seed if no games exist
    const existingGames = await Game.countDocuments();
    if (existingGames > 0) {
      console.log(`ℹ️  Database already has ${existingGames} games. Skipping seed.`);
      process.exit(0);
    }

    // Insert all games
    const gamesWithUser = games.map(g => ({ ...g, createdBy: systemUser._id }));
    await Game.insertMany(gamesWithUser);
    console.log(`✅ ${games.length} games seeded successfully!`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  }
}

seed();
