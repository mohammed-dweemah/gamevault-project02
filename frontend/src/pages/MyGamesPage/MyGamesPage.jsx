import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api';
import { useAuth } from '../../context/AuthContext';
import GameCard from '../../components/GameCard/GameCard';
import './MyGamesPage.css';

const MyGamesPage = () => {
  const { user }          = useAuth();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [tab, setTab]         = useState('all');

  const isAdmin = user?.role === 'admin';

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

  const handleDelete      = (id) => setGames(prev => prev.filter(g => g._id !== id));
  const handleRemoveSaved = (id) => setGames(prev => prev.filter(g => g._id !== id));

  const userId       = user?._id;
  const createdGames = games.filter(g => String(g.createdBy?._id || g.createdBy) === String(userId));
  const savedGames   = games.filter(g =>
    String(g.createdBy?._id || g.createdBy) !== String(userId) &&
    !g.purchasedBy?.some(id => String(id) === String(userId))
  );
  const purchasedGames = games.filter(g =>
    g.purchasedBy?.some(id => String(id) === String(userId))
  );

  const displayGames =
    tab === 'created'   ? createdGames   :
    tab === 'saved'     ? savedGames     :
    tab === 'purchased' ? purchasedGames :
    games;

  return (
    <main className="my-games-page">
      <div className="my-games-page__hero-glow" />
      <div className="my-games-page__container">

        <div className="my-games-page__header">
          <span className="my-games-page__eyebrow">◈ My Collection</span>
          <h1 className="my-games-page__title">Your Game Library</h1>
          <p className="my-games-page__subtitle">
            Games added, saved or purchased by <strong>{user?.name}</strong>
            {isAdmin && <span className="my-games-page__admin-tag"> — Admin</span>}
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

          {isAdmin && (
            <button
              className={`my-games-page__tab ${tab === 'created' ? 'my-games-page__tab--active' : ''}`}
              onClick={() => setTab('created')}
            >
              Added by Me ({createdGames.length})
            </button>
          )}

          {!isAdmin && (
            <button
              className={`my-games-page__tab ${tab === 'purchased' ? 'my-games-page__tab--active' : ''}`}
              onClick={() => setTab('purchased')}
            >
              🛒 Purchased ({purchasedGames.length})
            </button>
          )}

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
          {isAdmin && (
            <Link to="/add-game" className="my-games-page__add-btn">+ Add New Game</Link>
          )}
        </div>

        {error && (
          <div className="my-games-page__error">
            {error} <button onClick={fetchMyGames}>Retry</button>
          </div>
        )}

        {loading ? (
          <div className="my-games-page__loading">
            {[...Array(3)].map((_, i) => <div key={i} className="game-card-skeleton" />)}
          </div>
        ) : displayGames.length === 0 ? (
          <div className="my-games-page__empty">
            <span className="my-games-page__empty-icon">◎</span>
            <h3>
              {tab === 'saved'     ? 'No saved games yet'     :
               tab === 'purchased' ? 'No purchased games yet' :
               'No games yet'}
            </h3>
            <p>
              {tab === 'saved'
                ? 'Browse the library and click "+ Save to My Games"'
                : tab === 'purchased'
                ? 'Browse the library and buy a game to see it here.'
                : isAdmin
                ? 'Add your first game from the library.'
                : 'Save or purchase games from the library.'}
            </p>
          </div>
        ) : (
          <div className="my-games-page__grid">
            {displayGames.map(game => {
              const isCreator   = String(game.createdBy?._id || game.createdBy) === String(userId);
              const isPurchased = game.purchasedBy?.some(id => String(id) === String(userId));
              return (
                <GameCard
                  key={game._id}
                  game={game}
                  showSaveButton={false}
                  showActions={isAdmin && isCreator}
                  showRemove={!isCreator && !isPurchased}  // saved (not purchased)
                  onDelete={handleDelete}
                  onRemoveSaved={handleRemoveSaved}
                />
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
};

export default MyGamesPage;
