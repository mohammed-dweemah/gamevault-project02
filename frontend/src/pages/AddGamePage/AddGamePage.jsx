import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../../api';
import './AddGamePage.css';

const GENRES = ['Action RPG', 'Action Adventure', 'RPG', 'JRPG', 'Open World',
  'Platformer', 'Metroidvania', 'Roguelike', 'Simulation RPG', 'Strategy', 'Other'];
const STATUSES = ['Available', 'Sale', 'New'];

const emptyForm = {
  title: '', genre: '', platform: '', developer: '',
  year: new Date().getFullYear(), rating: '', price: '',
  status: 'Available', cover: '', description: '', tags: '',
};

const AddGamePage = () => {
  const { id } = useParams(); // If id exists → edit mode
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm]     = useState(emptyForm);
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  // Load existing game data in edit mode
  useEffect(() => {
    if (!isEdit) return;
    const fetchGame = async () => {
      try {
        const res = await API.get(`/games/${id}`);
        const g = res.data.game;
        setForm({
          title: g.title, genre: g.genre, platform: g.platform,
          developer: g.developer, year: g.year, rating: g.rating,
          price: g.price, status: g.status, cover: g.cover,
          description: g.description, tags: g.tags.join(', '),
        });
      } catch {
        setError('Failed to load game data.');
      } finally {
        setFetching(false);
      }
    };
    fetchGame();
  }, [id, isEdit]);

  const handleChange = e => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.title || !form.genre || !form.platform || !form.developer ||
        !form.year || form.rating === '' || form.price === '' || !form.description) {
      return setError('Please fill in all required fields.');
    }
    setLoading(true);
    try {
      if (isEdit) {
        await API.put(`/games/${id}`, form);
      } else {
        await API.post('/games', form);
      }
      navigate('/my-games');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save game.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <main className="add-game-page">
        <div className="add-game-page__loading">Loading game data...</div>
      </main>
    );
  }

  return (
    <main className="add-game-page">
      <div className="add-game-page__hero-glow" />

      <div className="add-game-page__container">
        <div className="add-game-page__header">
          <span className="add-game-page__eyebrow">◈ {isEdit ? 'Edit Game' : 'Add Game'}</span>
          <h1 className="add-game-page__title">
            {isEdit ? 'Update Game Details' : 'Add to Library'}
          </h1>
          <p className="add-game-page__subtitle">
            {isEdit ? 'Modify the details of your game.' : 'Share a great game with the community.'}
          </p>
        </div>

        {error && <div className="add-game-page__error">{error}</div>}

        <form className="add-game-form" onSubmit={handleSubmit}>
          <div className="add-game-form__grid">
            {/* Title */}
            <div className="add-game-form__group add-game-form__group--full">
              <label className="add-game-form__label">Title <span className="req">*</span></label>
              <input
                type="text" name="title" value={form.title} onChange={handleChange}
                placeholder="e.g. Elden Ring" className="add-game-form__input"
              />
            </div>

            {/* Genre */}
            <div className="add-game-form__group">
              <label className="add-game-form__label">Genre <span className="req">*</span></label>
              <select name="genre" value={form.genre} onChange={handleChange} className="add-game-form__input">
                <option value="">Select genre...</option>
                {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>

            {/* Platform */}
            <div className="add-game-form__group">
              <label className="add-game-form__label">Platform <span className="req">*</span></label>
              <input
                type="text" name="platform" value={form.platform} onChange={handleChange}
                placeholder="e.g. PC / PS5 / Xbox" className="add-game-form__input"
              />
            </div>

            {/* Developer */}
            <div className="add-game-form__group">
              <label className="add-game-form__label">Developer <span className="req">*</span></label>
              <input
                type="text" name="developer" value={form.developer} onChange={handleChange}
                placeholder="e.g. FromSoftware" className="add-game-form__input"
              />
            </div>

            {/* Year */}
            <div className="add-game-form__group">
              <label className="add-game-form__label">Year <span className="req">*</span></label>
              <input
                type="number" name="year" value={form.year} onChange={handleChange}
                min="1970" max={new Date().getFullYear() + 2}
                className="add-game-form__input"
              />
            </div>

            {/* Rating */}
            <div className="add-game-form__group">
              <label className="add-game-form__label">Rating (0–10) <span className="req">*</span></label>
              <input
                type="number" name="rating" value={form.rating} onChange={handleChange}
                min="0" max="10" step="0.1" placeholder="e.g. 9.5"
                className="add-game-form__input"
              />
            </div>

            {/* Price */}
            <div className="add-game-form__group">
              <label className="add-game-form__label">Price ($) <span className="req">*</span></label>
              <input
                type="number" name="price" value={form.price} onChange={handleChange}
                min="0" step="0.01" placeholder="e.g. 59.99"
                className="add-game-form__input"
              />
            </div>

            {/* Status */}
            <div className="add-game-form__group">
              <label className="add-game-form__label">Status</label>
              <select name="status" value={form.status} onChange={handleChange} className="add-game-form__input">
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Cover URL */}
            <div className="add-game-form__group add-game-form__group--full">
              <label className="add-game-form__label">Cover Image URL <span className="add-game-form__optional">(optional)</span></label>
              <input
                type="url" name="cover" value={form.cover} onChange={handleChange}
                placeholder="https://... (leave blank for auto-generated)"
                className="add-game-form__input"
              />
            </div>

            {/* Description */}
            <div className="add-game-form__group add-game-form__group--full">
              <label className="add-game-form__label">Description <span className="req">*</span></label>
              <textarea
                name="description" value={form.description} onChange={handleChange}
                placeholder="A brief description of the game..."
                className="add-game-form__textarea" rows={3}
              />
            </div>

            {/* Tags */}
            <div className="add-game-form__group add-game-form__group--full">
              <label className="add-game-form__label">Tags <span className="add-game-form__optional">(comma-separated)</span></label>
              <input
                type="text" name="tags" value={form.tags} onChange={handleChange}
                placeholder="e.g. Open World, Fantasy, Story-Driven"
                className="add-game-form__input"
              />
            </div>
          </div>

          <div className="add-game-form__actions">
            <button type="button" className="add-game-form__cancel" onClick={() => navigate(-1)}>
              Cancel
            </button>
            <button type="submit" className="add-game-form__submit" disabled={loading}>
              {loading ? 'Saving...' : isEdit ? '✓ Save Changes' : '+ Add Game'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
};

export default AddGamePage;
