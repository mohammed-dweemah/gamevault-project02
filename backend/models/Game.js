const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [1, 'Title cannot be empty'],
    },
    genre: {
      type: String,
      required: [true, 'Genre is required'],
      trim: true,
    },
    platform: {
      type: String,
      required: [true, 'Platform is required'],
      trim: true,
    },
    developer: {
      type: String,
      required: [true, 'Developer is required'],
      trim: true,
    },
    year: {
      type: Number,
      required: [true, 'Year is required'],
      min: [1970, 'Year must be 1970 or later'],
      max: [new Date().getFullYear() + 2, 'Year too far in the future'],
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [0, 'Rating must be between 0 and 10'],
      max: [10, 'Rating must be between 0 and 10'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    status: {
      type: String,
      enum: ['Available', 'Sale', 'New'],
      default: 'Available',
    },
    cover: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    // Required: field reference linking the game to the User who created it
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator is required'],
    },
  },
  { timestamps: true }
);

// Index for faster queries
gameSchema.index({ createdBy: 1 });
gameSchema.index({ genre: 1 });
gameSchema.index({ title: 'text', developer: 'text' });

module.exports = mongoose.model('Game', gameSchema);
