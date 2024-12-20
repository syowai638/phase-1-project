const searchButton = document.getElementById('search-button');
const searchBar = document.getElementById('search-bar');
const movieResults = document.getElementById('movie-results');
const genreFilter = document.getElementById('genre-filter');
const typeFilter = document.getElementById('type-filter');
const sortFilter = document.getElementById('sort-filter');
const randomMovieButton = document.getElementById('random-movie');
const movieDetailModal = document.getElementById('movie-detail-modal');
const movieDetailModalContent = document.createElement('div');
movieDetailModal.appendChild(movieDetailModalContent);

// Your API key
const apiKey = "05f1abcfd0b660f430f9ca05b193bed5";

// Keep track of the current content type (movie or tv)
let contentType = 'movie'; // Default to movie

// Favorites stored in localStorage
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

// Event Listener for Search Button
searchButton.addEventListener('click', async () => {
    const query = searchBar.value; // User's search query
    const genre = genreFilter.value; // Selected genre
    const sortBy = sortFilter.value; // Selected sorting option
    const type = typeFilter.value || contentType; // Selected content type

    try {
        const endpoint = query
            ? `https://api.themoviedb.org/3/search/${type}?query=${query}&api_key=${apiKey}`
            : `https://api.themoviedb.org/3/discover/${type}?api_key=${apiKey}&with_genres=${genre}&sort_by=${sortBy}`;

        const response = await fetch(endpoint);
        const data = await response.json();

        displayMovies(data.results); // Display results
    } catch (error) {
        console.error("Error fetching movies/shows:", error);
    }
});

// Function to display fetched movies/TV shows
function displayMovies(results) {
    movieResults.innerHTML = '';

    if (results.length === 0) {
        movieResults.innerHTML = `<p>No results found. Try another search!</p>`;
        return;
    }

    results.forEach(result => {
        const card = document.createElement('div');
        card.classList.add('movie-card');

        const isFavorite = favorites.find(fav => fav.id === result.id);

        card.innerHTML = `
            <img src="https://image.tmdb.org/t/p/w500${result.poster_path}" alt="${result.title || result.name}">
            <h3>${result.title || result.name}</h3>
            <p>${result.release_date || result.first_air_date || 'Release date not available'}</p>
            <button class="favorite-btn">${isFavorite ? 'Unfavorite' : 'Favorite'}</button>
        `;

        // Add favorite functionality
        const favoriteBtn = card.querySelector('.favorite-btn');
        favoriteBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent triggering card click
            toggleFavorite(result);
            favoriteBtn.textContent = favorites.find(fav => fav.id === result.id) ? 'Unfavorite' : 'Favorite';
        });

        card.addEventListener('click', () => showMovieDetails(result));
        movieResults.appendChild(card);
    });
}

// Function to toggle favorites
function toggleFavorite(movie) {
    const exists = favorites.find(fav => fav.id === movie.id);

    if (exists) {
        favorites = favorites.filter(fav => fav.id !== movie.id);
        alert(`${movie.title || movie.name} removed from favorites.`);
    } else {
        favorites.push(movie);
        alert(`${movie.title || movie.name} added to favorites.`);
    }

    localStorage.setItem('favorites', JSON.stringify(favorites));
}

// Function to show detailed movie/TV show information in a modal
async function showMovieDetails(result) {
    try {
        const response = await fetch(`https://api.themoviedb.org/3/${contentType}/${result.id}?api_key=${apiKey}`);
        const details = await response.json();
        movieDetailModalContent.innerHTML = `
            <h2>${details.title || details.name}</h2>
            <p>${details.overview || 'No description available.'}</p>
            <p>Runtime: ${details.runtime || 'N/A'} minutes</p>
            <button id="close-modal">Close</button>
        `;
        movieDetailModal.style.display = 'flex';

        // Close modal
        document.getElementById('close-modal').addEventListener('click', () => {
            movieDetailModal.style.display = 'none';
        });
    } catch (error) {
        console.error("Error fetching details:", error);
    }
}

// Event Listener for "Surprise Me" button
randomMovieButton.addEventListener('click', async () => {
    const genre = genreFilter.value; // Selected genre

    try {
        const response = await fetch(
            `https://api.themoviedb.org/3/discover/${contentType}?api_key=${apiKey}&with_genres=${genre}`
        );
        const data = await response.json();

        const randomItem = data.results[Math.floor(Math.random() * data.results.length)];
        displayRandomMovie(randomItem);
    } catch (error) {
        console.error("Error fetching random content:", error);
    }
});

// Function to display random movie/TV show details
function displayRandomMovie(item) {
    const randomMovieDetails = document.getElementById('random-movie-details');
    randomMovieDetails.innerHTML = `
        <h2>${item.title || item.name}</h2>
        <p>${item.overview || 'No description available.'}</p>
        <img src="https://image.tmdb.org/t/p/w500${item.poster_path}" alt="${item.title || item.name}">
    `;
}

// Switch between Movies and TV Shows when respective navigation links are clicked
document.getElementById('movies-link').addEventListener('click', () => {
    contentType = 'movie'; // Set content type to movie
    fetchMoviesOrShows();
});

document.getElementById('tv-shows-link').addEventListener('click', () => {
    contentType = 'tv'; // Set content type to TV
    fetchMoviesOrShows();
});

// Fetch movies or TV shows based on content type
async function fetchMoviesOrShows() {
    const genre = genreFilter.value || '';
    const type = contentType;

    try {
        const response = await fetch(
            `https://api.themoviedb.org/3/discover/${type}?api_key=${apiKey}&with_genres=${genre}`
        );
        const data = await response.json();
        displayMovies(data.results);
    } catch (error) {
        console.error("Error fetching content:", error);
    }
}

// Load initial content on page load
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch(`https://api.themoviedb.org/3/${contentType}/popular?api_key=${apiKey}`);
        const data = await response.json();

        displayMovies(data.results);
    } catch (error) {
        console.error("Error fetching initial content:", error);
    }
});
