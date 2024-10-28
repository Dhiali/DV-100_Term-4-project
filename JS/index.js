const API_KEY = '38e31e29ce2d56fe120f64eb8b9c0aa1'; // Your TMDb API key
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';
const MOVIE_CONTAINER = document.getElementById('movie-container');
const SEARCH_BAR = document.getElementById('search-bar');

// Function to fetch 25 popular movies
function getMovies() {
    const url = `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=en-US&page=1`;

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not OK');
            }
            return response.json();
        })
        .then(data => {
            displayMovies(data.results.slice(0, 25)); // Display the first 25 movies
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
}



// Function to fetch movies based on search query
function searchMovies(query) {
    const url = `${BASE_URL}/search/movie?api_key=${API_KEY}&language=en-US&query=${encodeURIComponent(query)}`;

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not OK');
            }
            return response.json();
        })
        .then(data => {
            displayMovies(data.results); // Display the search results
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
}

// Function to display movies in the DOM

// Event listener for the search bar
SEARCH_BAR.addEventListener('input', () => {
    const query = SEARCH_BAR.value.trim();
    if (query) {
        searchMovies(query); // Fetch movies based on the search query
    } else {
        getMovies(); // Revert to original random movies if search is empty
    }
});

// Initial fetch of random movies
getMovies();
function displayMovies(movies) {
    MOVIE_CONTAINER.innerHTML = ''; // Clear previous movies if any
    if (movies.length === 0) {
        MOVIE_CONTAINER.innerHTML = '<p>No movies found.</p>'; // Handle no results
        return;
    }
    movies.forEach(movie => {
        const movieElement = document.createElement('div');
        movieElement.classList.add('movie');

        // Add movie image, title, and rating
        movieElement.innerHTML = `
            <img src="${IMG_URL + movie.poster_path}" alt="${movie.title}" class="movie-poster" data-id="${movie.id}">
            <div class="movie-info">
                <h3>${movie.title}</h3>
                <p>Rating: ${movie.vote_average}</p>
            </div>
        `;

        MOVIE_CONTAINER.appendChild(movieElement);
    });
}

