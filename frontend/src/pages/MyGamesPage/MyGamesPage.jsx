import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api';
import { useAuth } from '../../context/AuthContext';
import GameCard from '../../components/GameCard/GameCard';
import './MyGamesPage.css';

const MyGamesPage = () => {
  const { user } = useAuth();
  const [games, setGames]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  const fetchMyGames = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await API.get('/games?myGames=true');
      setGames(res.data.games);
    } catch {
      setError('Failed to load your games.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMyGames(); }, []);

  const handleDelete = (deletedId) => {
    setGames(prev => prev.filter(g => g._id !== deletedId));
  };

  return (
    <main className="my-games-page">
      <div className="my-games-page__hero-glow" />

      <div className="my-games-page__container">
        <div className="my-games-page__header">
          <span className="my-games-page__eyebrow">◈ My Collection</span>
          <h1 className="my-games-page__title">Your Game Library</h1>
          <p className="my-games-page__subtitle">
            Games added by <strong>{user?.name}</strong>
          </p>
        </div>

        <div className="my-games-page__toolbar">
          <span className="my-games-page__count">
            {loading ? '' : `${games.length} game${games.length !== 1 ? 's' : ''}`}
          </span>
          <Link to="/add-game" className="my-games-page__add-btn">
            + Add New Game
          </Link>
        </div>

        {error && (
          <div className="my-games-page__error">
            {error}
            <button onClick={fetchMyGames}>Retry</button>
          </div>
        )}

        {loading ? (
          <div className="my-games-page__loading">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="game-card-skeleton" />
            ))}
          </div>
        ) : games.length === 0 ? (
          <div className="my-games-page__empty">
            <span className="my-games-page__empty-icon">◎</span>
            <h3>No games yet</h3>
            <p>You haven't added any games to the library yet.</p>
            <Link to="/add-game" className="my-games-page__add-btn">
              + Add Your First Game
            </Link>
          </div>
        ) : (
          <div className="my-games-page__grid">
            {games.map(game => (
              <GameCard
                key={game._id}
                game={game}
                onDelete={handleDelete}
                showActions={true}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default MyGamesPage;
