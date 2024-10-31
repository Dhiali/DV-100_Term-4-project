const API_KEY = '38e31e29ce2d56fe120f64eb8b9c0aa1'; // Your TMDb API key
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';
const MOVIE_CONTAINER = $('#movie-container');
const SEARCH_BAR = $('#search-bar');

let allMovies = []; // Store all fetched movies
let displayedMovies = []; // Store currently displayed movies

// Function to fetch movies using the discover endpoint
function getMovies() {
    let page = 1;

    function fetchPage() {
        const url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=en-US&sort_by=popularity.desc&page=${page}`;

        $.get(url)
            .done(data => {
                console.log(`Fetched ${data.results.length} movies from page ${page}.`);
                allMovies.push(...data.results); // Add results to the allMovies array

                // If we have less than 25 movies, fetch the next page
                if (allMovies.length < 25 && data.results.length > 0) {
                    page++;
                    fetchPage(); // Fetch the next page
                } else {
                    displayedMovies = allMovies.slice(0, 25); // Display the first 25 movies
                    displayMovies(displayedMovies); // Display the first 25 movies
                }
            })
            .fail(error => {
                console.error('Error fetching data:', error);
            });
    }

    fetchPage(); // Start fetching movies
}

// Function to fetch movies based on search query
function searchMovies(query) {
    const url = `${BASE_URL}/search/movie?api_key=${API_KEY}&language=en-US&query=${encodeURIComponent(query)}`;

    $.get(url)
        .done(data => {
            allMovies = data.results; // Update the allMovies array with search results
            displayedMovies = allMovies.slice(0, 25); // Set displayedMovies to the first 25 results
            displayMovies(displayedMovies); // Display the search results
        })
        .fail(error => {
            console.error('Error fetching data:', error);
        });
}

// Event listener for the search bar
SEARCH_BAR.on('input', function() {
    const query = $(this).val().trim();
    if (query) {
        searchMovies(query); // Fetch movies based on the search query
    } else {
        getMovies(); // Revert to original random movies if search is empty
    }
});

// Function to filter movies based on the selected category
function filterMovies(filterType) {
    let filteredMovies;

    switch (filterType) {
        case 'all':
            filteredMovies = allMovies; // Show all movies
            break;
        case 'horror':
            filteredMovies = allMovies.filter(movie => movie.genre_ids.includes(27)); // Genre ID for Horror is 27
            break;
        case '2024':
            filteredMovies = allMovies.filter(movie => new Date(movie.release_date).getFullYear() === 2024);
            break;
        case 'high-rated':
            filteredMovies = allMovies.filter(movie => movie.vote_average > 3.5);
            break;
        default:
            filteredMovies = allMovies;
    }

    displayedMovies = filteredMovies.slice(0, 25); // Update displayedMovies to the first 25 of the filtered results
    displayMovies(displayedMovies); // Display the filtered movies
}

// Event listeners for filter buttons
$('#all-movies').on('click', function() {
    filterMovies('all');
});

$('#horror-movies').on('click', function() {
    filterMovies('horror');
});

$('#2024-movies').on('click', function() {
    filterMovies('2024');
});

$('#high-rated-movies').on('click', function() {
    filterMovies('high-rated');
});

// Function to display movies
function displayMovies(movies) {
    MOVIE_CONTAINER.empty(); // Clear previous movies if any
    if (movies.length === 0) {
        MOVIE_CONTAINER.html('<p>No movies found.</p>'); // Handle no results
        return;
    }
    // Limit to 25 movies if more than 25 are found
    const moviesToDisplay = movies.slice(0, 25); 
    moviesToDisplay.forEach(movie => {
        const movieElement = $(`
            <div class="movie">
                <img src="${IMG_URL + movie.poster_path}" alt="${movie.title}" class="movie-poster" data-id="${movie.id}">
                <div class="movie-info">
                    <h3>${movie.title}</h3>
                    <p>Rating: ${movie.vote_average}</p>
                    <div class="button-container">
                    <button class="add-to-watchlist" data-id="${movie.id}">Add to Watchlist</button>
                    <a href="/pages/im.html?id=${movie.id}" class="Details">View Details</a>
                     </div>
                </div>
            </div>
        `);
        MOVIE_CONTAINER.append(movieElement);
    });

    // Event listener for "Add to Watchlist" button
$('.add-to-watchlist').on('click', function() {
    const movieId = $(this).data('id');
    addToWatchlist(movieId);
});
}

// Initial fetch of random movies
getMovies();

// Function to get the movie ID from the URL
function getMovieId() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// Function to fetch movie details
async function fetchMovieDetails(movieId) {
    try {
        const response = await fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&append_to_response=credits,videos`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const movie = await response.json();
        displayMovieDetails(movie);
    } catch (error) {
        console.error('Error fetching movie details:', error);
        alert('Error fetching movie details. Please try again later.');
    }
}

// Function to display movie details
function displayMovieDetails(movie) {
    $('#movie-title').text(movie.title);
    $('#movie-poster').attr('src', `${IMG_URL}${movie.poster_path}`);
    $('#movie-synopsis').text(movie.overview);
    $('#movie-rating').text(movie.vote_average);

    // Display directors
    const directors = movie.credits.crew.filter(crewMember => crewMember.job === 'Director');
    $('#movie-directors').text(directors.map(d => d.name).join(', '));

    // Display actors
    const actors = movie.credits.cast.slice(0, 5); // Get the first 5 actors
    $('#movie-actors').text(actors.map(a => a.name).join(', '));

    // Display trailer
    const trailer = movie.videos.results.find(video => video.type === 'Trailer');
    if (trailer) {
        $('#trailer-container').html(`
            <h3>Trailer</h3>
            <iframe width="560" height="315" src="https://www.youtube.com/embed/${trailer.key}" frameborder="0" allowfullscreen></iframe>
        `);
    } else {
        $('#trailer-container').html('<p>No trailer available.</p>');
    }
}

// Initialize the movie details page
if (window.location.pathname === '/pages/im.html') {
    const movieId = getMovieId();
    fetchMovieDetails(movieId);
}

function redirectToLibrary(event) {
    event.preventDefault(); // Prevent the default form submission
    window.location.href = '/pages/Libary.html'; // Change this to the actual URL of your library page
}

