import React from 'react';
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
    <div className="stars" aria-label={`Rating: ${rating}/10`}>
      {[1,2,3,4,5].map(i => (
        <span key={i} className={`star ${i <= stars ? 'star--filled' : ''}`}>★</span>
      ))}
      <span className="stars__num">{rating}</span>
    </div>
  );
};

const GameCard = ({ game, onDelete, showActions }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const status = statusColors[game.status] || statusColors.Available;

  // Safe ownership check — compare as strings to avoid ObjectId mismatch
  const creatorId = game.createdBy?._id || game.createdBy;
  const isOwner = user && creatorId && String(creatorId) === String(user._id);

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${game.title}"? This cannot be undone.`)) return;
    try {
      await API.delete(`/games/${game._id}`);
      if (onDelete) onDelete(game._id);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete game.');
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

      {/* Edit/Delete: only shown to the owner */}
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
