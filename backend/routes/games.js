const express      = require('express');
const router       = express.Router();
const Game         = require('../models/Game');
const requireAuth  = require('../middleware/requireAuth');
const requireAdmin = require('../middleware/requireAdmin');

// GET /api/games — public
router.get('/', async (req, res) => {
  try {
    const { search, genre, sortBy, myGames } = req.query;
    const query = {};

    if (myGames === 'true' && req.session?.userId) {
      query.$or = [
        { createdBy:   req.session.userId },
        { savedBy:     req.session.userId },
        { purchasedBy: req.session.userId },
      ];
    }

    if (genre && genre !== 'All') query.genre = genre;

    if (search) {
      query.$or = [
        { title:     { $regex: search, $options: 'i' } },
        { developer: { $regex: search, $options: 'i' } },
        { tags:      { $regex: search, $options: 'i' } },
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

    const games = await Game.find(query).sort(sort).populate('createdBy', 'name email role');
    res.status(200).json({ games, total: games.length });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// GET /api/games/:id — public
router.get('/:id', async (req, res) => {
  try {
    const game = await Game.findById(req.params.id).populate('createdBy', 'name email role');
    if (!game) return res.status(404).json({ message: 'Game not found.' });
    res.status(200).json({ game });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// POST /api/games — ADMIN ONLY
router.post('/', requireAdmin, async (req, res) => {
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
    await game.populate('createdBy', 'name email role');
    res.status(201).json({ message: 'Game added successfully.', game });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// POST /api/games/:id/save — toggle save (auth required, users only)
router.post('/:id/save', requireAuth, async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) return res.status(404).json({ message: 'Game not found.' });

    const userId = req.session.userId;
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
    res.status(500).json({ message: 'Server error.' });
  }
});

// POST /api/games/:id/purchase — purchase game (auth required, users only)
router.post('/:id/purchase', requireAuth, async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) return res.status(404).json({ message: 'Game not found.' });

    const userId = req.session.userId;

    // Admin cannot purchase games
    if (req.session.userRole === 'admin') {
      return res.status(403).json({ message: 'Admins cannot purchase games.' });
    }

    // Prevent purchasing own (admin-created) game
    if (game.createdBy.toString() === userId) {
      return res.status(400).json({ message: 'You cannot purchase your own game.' });
    }

    // Prevent purchasing the same game twice
    const alreadyOwned = game.purchasedBy.some(id => id.toString() === userId);
    if (alreadyOwned) {
      return res.status(400).json({ message: 'You already own this game.' });
    }

    game.purchasedBy.push(userId);
    await game.save();

    res.status(200).json({
      message: 'Purchase successful! Game added to My Games.',
      owned: true,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// PUT /api/games/:id — ADMIN ONLY
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { title, genre, platform, developer, year, rating, price, status, cover, description, tags } = req.body;
    const game = await Game.findByIdAndUpdate(
      req.params.id,
      {
        title, genre, platform, developer,
        year: Number(year), rating: Number(rating), price: Number(price),
        status, cover, description,
        tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : []),
      },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email role');

    if (!game) return res.status(404).json({ message: 'Game not found.' });
    res.status(200).json({ message: 'Game updated successfully.', game });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// DELETE /api/games/:id — ADMIN ONLY
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const game = await Game.findByIdAndDelete(req.params.id);
    if (!game) return res.status(404).json({ message: 'Game not found.' });
    res.status(200).json({ message: 'Game deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
