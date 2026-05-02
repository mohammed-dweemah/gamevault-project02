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
  const [tab, setTab]         = useState('all'); // 'all' | 'created' | 'saved'

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

  const handleSaveToggle = (gameId, isSaved) => {
    if (!isSaved) {
      setGames(prev => prev.filter(g => g._id !== gameId));
    }
  };

  // Filter by tab
  const creatorId = user?._id;
  const createdGames = games.filter(g => String(g.createdBy?._id || g.createdBy) === String(creatorId));
  const savedGames   = games.filter(g => String(g.createdBy?._id || g.createdBy) !== String(creatorId));
  const displayGames = tab === 'created' ? createdGames : tab === 'saved' ? savedGames : games;

  return (
    <main className="my-games-page">
      <div className="my-games-page__hero-glow" />
      <div className="my-games-page__container">

        <div className="my-games-page__header">
          <span className="my-games-page__eyebrow">◈ My Collection</span>
          <h1 className="my-games-page__title">Your Game Library</h1>
          <p className="my-games-page__subtitle">
            Games added or saved by <strong>{user?.name}</strong>
          </p>
        </div>

        {/* Tabs */}
        <div className="my-games-page__tabs">
          <button
            className={`my-games-page__tab ${tab === 'all' ? 'my-games-page__tab--active' : ''}`}
            onClick={() => setTab('all')}
          >
            All ({games.length})
          </button>
          <button
            className={`my-games-page__tab ${tab === 'created' ? 'my-games-page__tab--active' : ''}`}
            onClick={() => setTab('created')}
          >
            Created ({createdGames.length})
          </button>
          <button
            className={`my-games-page__tab ${tab === 'saved' ? 'my-games-page__tab--active' : ''}`}
            onClick={() => setTab('saved')}
          >
            Saved ({savedGames.length})
          </button>
        </div>

        <div className="my-games-page__toolbar">
          <span className="my-games-page__count">
            {loading ? '' : `${displayGames.length} game${displayGames.length !== 1 ? 's' : ''}`}
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
            {[...Array(3)].map((_, i) => <div key={i} className="game-card-skeleton" />)}
          </div>
        ) : displayGames.length === 0 ? (
          <div className="my-games-page__empty">
            <span className="my-games-page__empty-icon">◎</span>
            <h3>{tab === 'saved' ? 'No saved games yet' : 'No games yet'}</h3>
            <p>
              {tab === 'saved'
                ? 'Browse the library and click "+ Save to My Games"'
                : "You haven't added any games yet."}
            </p>
            {tab !== 'saved' && (
              <Link to="/add-game" className="my-games-page__add-btn">+ Add Your First Game</Link>
            )}
          </div>
        ) : (
          <div className="my-games-page__grid">
            {displayGames.map(game => (
              <GameCard
                key={game._id}
                game={game}
                onDelete={handleDelete}
                onSaveToggle={handleSaveToggle}
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
