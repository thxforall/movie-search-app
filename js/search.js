let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let config = null;

const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const moviesContainer = document.getElementById('movies-container');
const favoritesContainer = document.getElementById('favorites-container');

// Error handling utility
const handleError = (message, container) => {
  console.error(message);
  container.innerHTML = `<p>${message}</p>`;
};

async function loadConfig() {
  try {
    const response = await fetch('/config.json');
    if (!response.ok) throw new Error('Failed to load config');
    return await response.json();
  } catch (error) {
    console.error('Error loading config:', error);
    return null;
  }
}

async function fetchMovieById(movieId) {
  try {
    const response = await fetch(
      `${config.BASE_URL}/?apikey=${config.API_KEY}&i=${movieId}`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    handleError('Error fetching movie by ID:', error);
    return null;
  }
}

async function initializeApp() {
  config = await loadConfig();
  if (!config) return;

  // Event listener with debounce
  searchBtn.addEventListener('click', () => {
    const query = searchInput.value.trim();
    query
      ? fetchSearchMovies(query, config)
      : alert('Please enter a valid search term');
  });

  // Update fetchSearchMovies function
  async function fetchSearchMovies(query, config) {
    try {
      const response = await fetch(
        `${config.BASE_URL}/?apikey=${config.API_KEY}&s=${query}`
      );
      const data = await response.json();

      if (data.Response === 'True') {
        displayMovies(data.Search, config);
      } else {
        handleError('No results found.', moviesContainer);
      }
    } catch (error) {
      handleError('Error fetching search movies.', moviesContainer);
    }
  }

  updateFavorites();
}

// Create movie card HTML
const createMovieCard = (movie) => {
  const movieCard = document.createElement('div');
  movieCard.className = 'movie-card';
  movieCard.dataset.movieId = movie.imdbID;
  movieCard.innerHTML = `
    <img src="${
      movie.Poster !== 'N/A' ? movie.Poster : config.DEFAULT_POSTER
    }" alt="${movie.Title}">
    <h3>${movie.Title}</h3>
    <button class="favorite-btn">${
      favorites.includes(movie.imdbID)
        ? 'Remove from Favorites'
        : 'Add to Favorites'
    }</button>
  `;
  return movieCard;
};

function displayMovies(movies) {
  moviesContainer.innerHTML = '';
  movies.forEach((movie) => {
    const movieCard = createMovieCard(movie);

    movieCard.addEventListener('click', (event) => {
      if (event.target.classList.contains('favorite-btn')) {
        toggleFavorite(movie.imdbID);
        event.target.textContent = favorites.includes(movie.imdbID)
          ? 'Remove from Favorites'
          : 'Add to Favorites';
      } else if (event.target !== event.currentTarget) {
        window.location.href = `details.html?id=${movie.imdbID}`;
      }
    });

    moviesContainer.appendChild(movieCard);
  });
}

function toggleFavorite(movieId) {
  favorites = favorites.includes(movieId)
    ? favorites.filter((id) => id !== movieId)
    : [...favorites, movieId];

  localStorage.setItem('favorites', JSON.stringify(favorites));
  updateFavorites();
  updateButtonTexts();
}

async function updateFavorites() {
  localStorage.setItem('favorites', JSON.stringify(favorites));
  favoritesContainer.innerHTML = '';

  const moviePromises = favorites.map(fetchMovieById);
  const movies = await Promise.all(moviePromises);

  movies.filter(Boolean).forEach((movie) => {
    const movieCard = createMovieCard(movie);

    movieCard.addEventListener('click', (event) => {
      if (event.target.classList.contains('favorite-btn')) {
        toggleFavorite(movie.imdbID);
        event.target.textContent = favorites.includes(movie.imdbID)
          ? 'Remove from Favorites'
          : 'Add to Favorites';
      } else if (event.target !== event.currentTarget) {
        window.location.href = `details.html?id=${movie.imdbID}`;
      }
    });

    favoritesContainer.appendChild(movieCard);
  });
}

function updateButtonTexts() {
  document.querySelectorAll('.favorite-btn').forEach((button) => {
    const movieCard = button.closest('.movie-card');
    const movieId = movieCard.dataset.movieId;
    button.textContent = favorites.includes(movieId)
      ? 'Remove from Favorites'
      : 'Add to Favorites';
  });
}

// Initialize
initializeApp();
