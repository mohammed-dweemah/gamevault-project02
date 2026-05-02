const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    genre: { type: String, required: true, trim: true },
    platform: { type: String, required: true, trim: true },
    developer: { type: String, required: true, trim: true },
    year: { type: Number, required: true },
    rating: { type: Number, required: true, min: 0, max: 10 },
    price: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['Available', 'Sale', 'New'], default: 'Available' },
    cover: { type: String, default: '' },
    description: { type: String, required: true, trim: true },
    tags: { type: [String], default: [] },
    // User who created this game
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // Users who saved this game to their My Games
    savedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Game', gameSchema);
