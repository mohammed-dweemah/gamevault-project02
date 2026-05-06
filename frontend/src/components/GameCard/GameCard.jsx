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

const COVER_COLORS = [
  '#7c6aff','#ff6a9b','#6affda','#f4c542','#ff8c42','#42c8ff','#a8ff42','#ff42a8',
];

const getColor = (title = '') => COVER_COLORS[title.charCodeAt(0) % COVER_COLORS.length];

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

// Cover image with fallback
const GameCover = ({ cover, title }) => {
  const [imgError, setImgError] = useState(false);
  const abbr = title?.slice(0, 3).toUpperCase() || '???';
  const color = getColor(title);

  if (!cover || imgError) {
    return (
      <div className="game-card__cover-fallback" style={{ background: color }}>
        <span>{abbr}</span>
      </div>
    );
  }

  return (
    <img
      src={cover}
      alt={title}
      loading="lazy"
      className="game-card__cover-img"
      onError={() => setImgError(true)}
    />
  );
};

const GameCard = ({
  game,
  onDelete,
  onRemoveSaved,
  showSaveButton,
  showActions,
  showRemove,
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

  const handleSave = async () => {
    if (!user) return navigate('/login');
    setSaving(true);
    try {
      const res = await API.post(`/games/${game._id}/save`);
      setSaved(res.data.isSaved);
    } catch (err) {
      if (err.response?.status === 401) navigate('/login');
      else alert(err.response?.data?.message || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveSaved = async () => {
    if (!window.confirm(`Remove "${game.title}" from My Games?`)) return;
    setRemoving(true);
    try {
      await API.post(`/games/${game._id}/save`);
      if (onRemoveSaved) onRemoveSaved(game._id);
    } catch (err) {
      if (err.response?.status === 401) navigate('/login');
      else alert('Failed to remove.');
    } finally {
      setRemoving(false);
    }
  };

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
          <GameCover cover={game.cover} title={game.title} />
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

      {showSaveButton && user && !isOwner && (
        <button
          className={`game-card__save-btn ${saved ? 'game-card__save-btn--saved' : ''}`}
          onClick={handleSave}
          disabled={saving}
        >
          {saved ? '✓ Saved' : '+ Save to My Games'}
        </button>
      )}

      {showRemove && (
        <button
          className="game-card__remove-btn"
          onClick={handleRemoveSaved}
          disabled={removing}
        >
          ✕ Remove from My Games
        </button>
      )}

      {showActions && isOwner && (
        <div className="game-card__actions">
          <button
            className="game-card__action-btn game-card__action-btn--edit"
            onClick={() => navigate(`/edit-game/${game._id}`)}
          >✎ Edit</button>
          <button
            className="game-card__action-btn game-card__action-btn--delete"
            onClick={handleDelete}
          >✕ Delete</button>
        </div>
      )}
    </article>
  );
};

export default GameCard;
