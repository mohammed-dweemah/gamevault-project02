import React, { useState, useEffect, useCallback } from 'react';
import API from '../../api';
import GameCard from '../../components/GameCard/GameCard';
import './MainPage.css';

const SORT_OPTIONS = [
  { value: 'rating-desc', label: 'Highest Rated' },
  { value: 'rating-asc',  label: 'Lowest Rated' },
  { value: 'year-desc',   label: 'Newest First' },
  { value: 'year-asc',    label: 'Oldest First' },
  { value: 'price-asc',   label: 'Price: Low to High' },
  { value: 'price-desc',  label: 'Price: High to Low' },
  { value: 'title-asc',   label: 'A → Z' },
];

const MainPage = () => {
  const [games, setGames]     = useState([]);
  const [genres, setGenres]   = useState(['All']);
  const [search, setSearch]   = useState('');
  const [genre, setGenre]     = useState('All');
  const [sortBy, setSortBy]   = useState('rating-desc');
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [totalAll, setTotalAll] = useState(0);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  // Fetch games from API (server-side filtering + sorting)
  const fetchGames = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.append('search', debouncedSearch);
      if (genre !== 'All') params.append('genre', genre);
      params.append('sortBy', sortBy);

      const res = await API.get(`/games?${params.toString()}`);
      setGames(res.data.games);

      // Get total count without filters for display
      if (!debouncedSearch && genre === 'All') {
        setTotalAll(res.data.total);
      }

      // Extract unique genres from fetched games for filter dropdown
      if (!debouncedSearch && genre === 'All') {
        const allRes = await API.get('/games');
        const uniqueGenres = ['All', ...new Set(allRes.data.games.map(g => g.genre))];
        setGenres(uniqueGenres);
        setTotalAll(allRes.data.total);
      }
    } catch (err) {
      setError('Failed to load games. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, genre, sortBy]);

  useEffect(() => { fetchGames(); }, [fetchGames]);

  const handleClearFilters = () => {
    setSearch('');
    setGenre('All');
    setSortBy('rating-desc');
  };

  const hasActiveFilters = search !== '' || genre !== 'All' || sortBy !== 'rating-desc';

  return (
    <main className="main-page">
      {/* Hero */}
      <section className="main-page__hero">
        <div className="main-page__hero-glow" />
        <div className="main-page__hero-content">
          <span className="main-page__eyebrow">◈ Game Library</span>
          <h1 className="main-page__headline">
            Discover Your<br />
            <span className="main-page__headline-accent">Next Adventure</span>
          </h1>
          <p className="main-page__subheadline">
            {totalAll > 0 ? `${totalAll} handpicked titles across every genre` : 'Explore the library'}
          </p>
        </div>
      </section>

      {/* Controls */}
      <section className="main-page__controls">
        <div className="main-page__controls-inner">
          <div className="search-bar">
            <span className="search-bar__icon">⌕</span>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search games, developers, tags..."
              className="search-bar__input"
            />
            {search && (
              <button className="search-bar__clear" onClick={() => setSearch('')}>✕</button>
            )}
          </div>

          <div className="filter-group">
            <select value={genre} onChange={e => setGenre(e.target.value)} className="filter-select">
              {genres.map(g => (
                <option key={g} value={g}>{g === 'All' ? 'All Genres' : g}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="filter-select">
              {SORT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {hasActiveFilters && (
            <button className="clear-btn" onClick={handleClearFilters}>Clear Filters</button>
          )}
        </div>

        <div className="main-page__results-bar">
          <span className="main-page__count">
            {loading ? 'Loading...' : games.length === 0
              ? 'No results found'
              : `Showing ${games.length}${totalAll && games.length !== totalAll ? ` of ${totalAll}` : ''} games`
            }
          </span>
          {genre !== 'All' && (
            <span className="main-page__active-filter">
              Genre: <strong>{genre}</strong>
            </span>
          )}
        </div>
      </section>

      {/* Grid */}
      <section className="main-page__grid-section">
        {error ? (
          <div className="main-page__empty">
            <span className="main-page__empty-icon">⚠</span>
            <h3>Something went wrong</h3>
            <p>{error}</p>
            <button className="clear-btn" onClick={fetchGames}>Try Again</button>
          </div>
        ) : loading ? (
          <div className="main-page__loading">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="game-card-skeleton" />
            ))}
          </div>
        ) : games.length > 0 ? (
          <div className="main-page__grid">
            {games.map(game => (
              <GameCard key={game._id} game={game} />
            ))}
          </div>
        ) : (
          <div className="main-page__empty">
            <span className="main-page__empty-icon">◎</span>
            <h3>No games found</h3>
            <p>Try adjusting your search or filters.</p>
            <button className="clear-btn" onClick={handleClearFilters}>Reset Filters</button>
          </div>
        )}
      </section>
    </main>
  );
};

export default MainPage;
