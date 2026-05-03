import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../api';
import './GameCard.css';

const statusColors = {
  Available: { bg: 'rgba(106,255,218,0.1)', color: '#6affda' },
  Sale:      { bg: 'rgba(255,106,155,0.1)', color: '#ff6a9b' },
  New:       { bg: 'rgba(124,106,255,0.15)', color: '#a08cff' },
};

const StarRating = ({ rating }) => {
  const stars = Math.round(rating / 2);
  return (
    <div className="stars">
      {[1,2,3,4,5].map(i => (
        <span key={i} className={`star ${i <= stars ? 'star--filled' : ''}`}>★</span>
      ))}
      <span className="stars__num">{rating}</span>
    </div>
  );
};

const GameCard = ({
  game,
  onDelete,        // called when owner deletes
  onRemoveSaved,   // called when user removes from saved (MyGamesPage)
  showSaveButton,  // show "+ Save to My Games" (MainPage only)
  showActions,     // show Edit/Delete (MyGamesPage owner)
  showRemove,      // show "Remove from My Games" (MyGamesPage saved tab)
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const status = statusColors[game.status] || statusColors.Available;

  const creatorId = game.createdBy?._id || game.createdBy;
  const isOwner = user && creatorId && String(creatorId) === String(user._id);

  const isSavedInit = user && game.savedBy?.some(id => String(id) === String(user._id));
  const [saved, setSaved] = useState(isSavedInit);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);

  // Save to My Games (MainPage)
  const handleSave = async () => {
    if (!user) return navigate('/login');
    setSaving(true);
    try {
      const res = await API.post(`/games/${game._id}/save`);
      setSaved(res.data.isSaved);
    } catch (err) {
      const msg = err.response?.data?.message || '';
      if (err.response?.status === 401) {
        navigate('/login');
      } else {
        alert(msg || 'Failed to save.');
      }
    } finally {
      setSaving(false);
    }
  };

  // Remove from My Games (MyGamesPage saved tab)
  const handleRemoveSaved = async () => {
    if (!window.confirm(`Remove "${game.title}" from My Games?`)) return;
    setRemoving(true);
    try {
      await API.post(`/games/${game._id}/save`); // toggle = remove
      if (onRemoveSaved) onRemoveSaved(game._id);
    } catch (err) {
      if (err.response?.status === 401) navigate('/login');
      else alert('Failed to remove.');
    } finally {
      setRemoving(false);
    }
  };

  // Delete game (owner)
  const handleDelete = async () => {
    if (!window.confirm(`Delete "${game.title}"?`)) return;
    try {
      await API.delete(`/games/${game._id}`);
      if (onDelete) onDelete(game._id);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete.');
    }
  };

  return (
    <article className="game-card">
      <div className="game-card__accent" />
      <div className="game-card__header">
        <div className="game-card__cover">
          <img src={game.cover} alt={game.title} loading="lazy" />
        </div>
        <div className="game-card__meta">
          <div className="game-card__top">
            <span className="game-card__status" style={{ background: status.bg, color: status.color }}>
              {game.status}
            </span>
            <span className="game-card__year">{game.year}</span>
          </div>
          <h3 className="game-card__title">{game.title}</h3>
          <p className="game-card__developer">{game.developer}</p>
          {game.createdBy?.name && (
            <p className="game-card__owner">by {game.createdBy.name}</p>
          )}
        </div>
      </div>

      <p className="game-card__description">{game.description}</p>

      <div className="game-card__tags">
        {game.tags.map(tag => (
          <span key={tag} className="game-card__tag">{tag}</span>
        ))}
      </div>

      <div className="game-card__footer">
        <div className="game-card__info">
          <span className="game-card__genre">{game.genre}</span>
          <StarRating rating={game.rating} />
        </div>
        <span className="game-card__price">${game.price}</span>
      </div>

      {/* Save to My Games — MainPage only, non-owners */}
      {showSaveButton && user && !isOwner && (
        <button
          className={`game-card__save-btn ${saved ? 'game-card__save-btn--saved' : ''}`}
          onClick={handleSave}
          disabled={saving}
        >
          {saved ? '✓ Saved' : '+ Save to My Games'}
        </button>
      )}

      {/* Remove from My Games — MyGamesPage saved tab */}
      {showRemove && (
        <button
          className="game-card__remove-btn"
          onClick={handleRemoveSaved}
          disabled={removing}
        >
          ✕ Remove from My Games
        </button>
      )}

      {/* Edit / Delete — owner only in MyGamesPage */}
      {showActions && isOwner && (
        <div className="game-card__actions">
          <button
            className="game-card__action-btn game-card__action-btn--edit"
            onClick={() => navigate(`/edit-game/${game._id}`)}
          >
            ✎ Edit
          </button>
          <button
            className="game-card__action-btn game-card__action-btn--delete"
            onClick={handleDelete}
          >
            ✕ Delete
          </button>
        </div>
      )}
    </article>
  );
};

export default GameCard;
