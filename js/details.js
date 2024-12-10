const API_KEY = '5bbd8414';
const API_URL = `https://www.omdbapi.com/?apikey=${API_KEY}`;

const urlParams = new URLSearchParams(window.location.search);
const movieId = urlParams.get('id');

const moviePoster = document.getElementById('movie-poster');
const movieTitle = document.getElementById('movie-title');
const movieOverview = document.getElementById('movie-overview');
const movieRating = document.getElementById('movie-rating');
const movieActors = document.getElementById('movie-actors');

async function fetchMovieDetails(id) {
  if (!id) return;

  try {
    const response = await fetch(`${API_URL}&i=${id}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    if (data.Response === 'True') {
      displayMovieDetails(data);
    } else {
      throw new Error(data.Error);
    }
  } catch (error) {
    console.error('Error fetching movie details:', error);
    displayError();
  }
}

function displayMovieDetails(movie) {
  const defaultImage = 'assets/no-image.png';
  const formatRating = (rating) =>
    rating !== 'N/A' ? `${rating} / 10` : 'N/A';

  moviePoster.src = movie.Poster !== 'N/A' ? movie.Poster : defaultImage;
  movieTitle.textContent = movie.Title;
  movieRating.textContent = formatRating(movie.imdbRating);
  movieOverview.textContent = movie.Plot || 'No overview available';
  movieActors.textContent = movie.Actors || 'No actors available';
}

function displayError() {
  moviePoster.src = 'assets/no-image.png';
  movieTitle.textContent = 'Error loading movie';
  movieRating.textContent = 'N/A';
  movieOverview.textContent = 'Failed to load movie details';
  movieActors.textContent = 'N/A';
}

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

async function initializeApp() {
  const config = await loadConfig();
  if (!config) return;

  const API_URL = `${config.BASE_URL}/?apikey=${config.API_KEY}`;
  fetchMovieDetails(movieId);
}

// Initialize
initializeApp();
