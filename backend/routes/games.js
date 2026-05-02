const express = require('express');
const router = express.Router();
const Game = require('../models/Game');
const requireAuth = require('../middleware/requireAuth');

// GET /api/games — fetch all games
router.get('/', async (req, res) => {
  try {
    const { search, genre, sortBy, myGames } = req.query;
    const query = {};

    if (myGames === 'true' && req.session?.userId) {
      query.$or = [
        { createdBy: req.session.userId },
        { savedBy: req.session.userId },
      ];
    }

    if (genre && genre !== 'All') query.genre = genre;

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { developer: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

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

    const games = await Game.find(query).sort(sort).populate('createdBy', 'name email');
    res.status(200).json({ games, total: games.length });
  } catch (err) {
    console.error('Get games error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// GET /api/games/:id
router.get('/:id', async (req, res) => {
  try {
    const game = await Game.findById(req.params.id).populate('createdBy', 'name email');
    if (!game) return res.status(404).json({ message: 'Game not found.' });
    res.status(200).json({ game });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// POST /api/games — create game
router.post('/', requireAuth, async (req, res) => {
  try {
    const { title, genre, platform, developer, year, rating, price, status, cover, description, tags } = req.body;
    if (!title || !genre || !platform || !developer || !year || rating == null || price == null || !description) {
      return res.status(400).json({ message: 'All required fields must be filled.' });
    }
    const game = await Game.create({
      title, genre, platform, developer,
      year: Number(year), rating: Number(rating), price: Number(price),
      status: status || 'Available',
      cover: cover || `https://placehold.co/80x100/7c6aff/ffffff?text=${encodeURIComponent(title.slice(0,3).toUpperCase())}`,
      description,
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : []),
      createdBy: req.session.userId,
    });
    await game.populate('createdBy', 'name email');
    res.status(201).json({ message: 'Game added successfully.', game });
  } catch (err) {
    console.error('Create game error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// POST /api/games/:id/save — toggle save to My Games
router.post('/:id/save', requireAuth, async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) return res.status(404).json({ message: 'Game not found.' });

    const userId = req.session.userId;

    // Can't save your own game (already in My Games as creator)
    if (game.createdBy.toString() === userId) {
      return res.status(400).json({ message: 'This is already your game.' });
    }

    const isSaved = game.savedBy.some(id => id.toString() === userId);

    if (isSaved) {
      game.savedBy = game.savedBy.filter(id => id.toString() !== userId);
    } else {
      game.savedBy.push(userId);
    }

    await game.save();
    res.status(200).json({
      message: isSaved ? 'Removed from My Games.' : 'Added to My Games.',
      isSaved: !isSaved,
    });
  } catch (err) {
    console.error('Save error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// PUT /api/games/:id — update (owner only)
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { title, genre, platform, developer, year, rating, price, status, cover, description, tags } = req.body;
    const game = await Game.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.session.userId },
      { title, genre, platform, developer,
        year: Number(year), rating: Number(rating), price: Number(price),
        status, cover, description,
        tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : []),
      },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    if (!game) return res.status(403).json({ message: 'Not found or unauthorized.' });
    res.status(200).json({ message: 'Game updated successfully.', game });
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// DELETE /api/games/:id — delete (owner only)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const game = await Game.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.session.userId,
    });
    if (!game) return res.status(403).json({ message: 'Not found or unauthorized.' });
    res.status(200).json({ message: 'Game deleted successfully.' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
