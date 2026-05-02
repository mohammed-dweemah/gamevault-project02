const express = require('express');
const router = express.Router();
const Game = require('../models/Game');
const requireAuth = require('../middleware/requireAuth');

// GET /api/games — fetch all games (public, with optional filters)
router.get('/', async (req, res) => {
  try {
    const { search, genre, sortBy, myGames } = req.query;

    // Build filter query
    const query = {};

    if (myGames === 'true' && req.session?.userId) {
      query.createdBy = req.session.userId;
    }

    if (genre && genre !== 'All') {
      query.genre = genre;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { developer: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    // Build sort
    let sort = {};
    switch (sortBy) {
      case 'rating-desc': sort = { rating: -1 }; break;
      case 'rating-asc':  sort = { rating:  1 }; break;
      case 'year-desc':   sort = { year:   -1 }; break;
      case 'year-asc':    sort = { year:    1 }; break;
      case 'price-asc':   sort = { price:   1 }; break;
      case 'price-desc':  sort = { price:  -1 }; break;
      case 'title-asc':   sort = { title:   1 }; break;
      default:            sort = { rating: -1 };
    }

    const games = await Game.find(query)
      .sort(sort)
      .populate('createdBy', 'name email');

    res.status(200).json({ games, total: games.length });
  } catch (err) {
    console.error('Get games error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// GET /api/games/:id — fetch single game (public)
router.get('/:id', async (req, res) => {
  try {
    const game = await Game.findById(req.params.id).populate('createdBy', 'name email');
    if (!game) return res.status(404).json({ message: 'Game not found.' });
    res.status(200).json({ game });
  } catch (err) {
    console.error('Get game error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// POST /api/games — create game (auth required)
router.post('/', requireAuth, async (req, res) => {
  try {
    const { title, genre, platform, developer, year, rating, price, status, cover, description, tags } = req.body;

    if (!title || !genre || !platform || !developer || !year || rating == null || price == null || !description) {
      return res.status(400).json({ message: 'All required fields must be filled.' });
    }

    const game = await Game.create({
      title,
      genre,
      platform,
      developer,
      year: Number(year),
      rating: Number(rating),
      price: Number(price),
      status: status || 'Available',
      cover: cover || `https://placehold.co/80x100/7c6aff/ffffff?text=${encodeURIComponent(title.slice(0, 3).toUpperCase())}`,
      description,
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : []),
      createdBy: req.session.userId, // Link game to logged-in user
    });

    await game.populate('createdBy', 'name email');

    res.status(201).json({ message: 'Game added successfully.', game });
  } catch (err) {
    console.error('Create game error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// PUT /api/games/:id — update game (auth + ownership required)
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { title, genre, platform, developer, year, rating, price, status, cover, description, tags } = req.body;

    // Server-side authorization: Mongoose query checks BOTH _id AND createdBy === session userId
    const game = await Game.findOneAndUpdate(
      {
        _id: req.params.id,
        createdBy: req.session.userId, // AUTHORIZATION CHECK
      },
      {
        title,
        genre,
        platform,
        developer,
        year: Number(year),
        rating: Number(rating),
        price: Number(price),
        status,
        cover,
        description,
        tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : []),
      },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    if (!game) {
      return res.status(403).json({
        message: 'Game not found or you are not authorized to edit it.',
      });
    }

    res.status(200).json({ message: 'Game updated successfully.', game });
  } catch (err) {
    console.error('Update game error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// DELETE /api/games/:id — delete game (auth + ownership required)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    // Server-side authorization: only delete if createdBy === session userId
    const game = await Game.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.session.userId, // AUTHORIZATION CHECK
    });

    if (!game) {
      return res.status(403).json({
        message: 'Game not found or you are not authorized to delete it.',
      });
    }

    res.status(200).json({ message: 'Game deleted successfully.' });
  } catch (err) {
    console.error('Delete game error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
