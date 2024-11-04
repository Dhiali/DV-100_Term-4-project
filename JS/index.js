const API_KEY = '38e31e29ce2d56fe120f64eb8b9c0aa1'; 
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';
const MOVIE_CONTAINER = $('#movie-container');
const SEARCH_BAR = $('#search-bar');
const SEARCH__BAR = $('#search-bar1');
const SEARCH_RESULTS = $('#search-results');

$('#search-loading').on('click', function() {
    window.location.href = '/pages/Libary.html'; 
});

let allMovies = []; 
let displayedMovies = []; 


// Function to fetch movies using the discover endpoint
function getMovies() {
    let page = 1;

    function fetchPage() {
        const url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=en-US&sort_by=popularity.desc&page=${page}`;

        $.get(url)
            .done(data => {
                console.log(`Fetched ${data.results.length} movies from page ${page}.`);
                allMovies.push(...data.results); 

                
                if (allMovies.length < 25 && data.results.length > 0) {
                    page++;
                    fetchPage(); 
                } else {
                    displayedMovies = allMovies.slice(0, 25); // Display the first 25 movies
                    displayMovies(displayedMovies); 
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
            allMovies = data.results; // Update the allMovies array with the search results
            displayedMovies = allMovies.slice(0, 25); // Set displayedMovies to the first 25 results
            displayMovies(displayedMovies); // Display the search results
            displaySearchResults(data.results); // Display search results in a dropdown
        })
        .fail(error => {
            console.error('Error fetching data:', error);
        });
}

// Event listener for the search bar
SEARCH_BAR.on('input', function() {
    const query = $(this).val().trim();
    console.log('Search query:', query); 
    if (query) {
        searchMovies(query); // Fetch movies based on the search query
    } else {
        getMovies(); // Revert to original random movies if search is empty
    }
});

SEARCH__BAR.on('input', function() {
    const query = $(this).val().trim();
    console.log('Search query:', query); 
    if (query) {
        searchMovies(query);
    } else {
        getMovies(); 
    }
});

// Function to filter movies based on the selected category
function filterMovies(filterType) {
    let filteredMovies;

    switch (filterType) {
        case 'all':
            filteredMovies = allMovies; 
            break;
        case 'horror':
            filteredMovies = allMovies.filter(movie => movie.genre_ids.includes(27)); 
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

    displayedMovies = filteredMovies.slice(0, 25); 
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



function displayMovies(movies) {
    MOVIE_CONTAINER.empty(); // Clear previous movies if any
    if (movies.length === 0) {
        MOVIE_CONTAINER.html('<p>No movies found.</p>'); 
        return;
    }
    
    const moviesToDisplay = movies.slice(0, 25); 
    moviesToDisplay.forEach(movie => {
        const movieElement = $(`
            <div class="movie">
                <img src="${IMG_URL + movie.poster_path}" alt="${movie.title}" class="movie-poster" data-id="${movie.id}">
                <div class="movie-info">
                    <h3>${movie.title}</h3>
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

    // Event listener for movie poster clicks for smaller screens
    $('.movie-poster').on('click', function() {
        const movieDiv = $(this).closest('.movie');
        movieDiv.toggleClass('active'); // Toggle active class to show/hide movie info
    });
}


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


    $('#watchlist-button').data('id', movie.id); 
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
            <iframe width="560" height="315" src="https://www.youtube.com/embed/${trailer.key}" frameborder="0" allowfullscreen></iframe>
        `);
    } else {
        $('#trailer-container').html('<p>No trailer available.</p>');
    }
}


if (window.location.pathname === '/pages/im.html') {
    const movieId = getMovieId();
    fetchMovieDetails(movieId);
}

function redirectToLibrary(event) {
    event.preventDefault(); 
    window.location.href = '/pages/Libary.html'; 
}


// Function to fetch movies based on search query
function searchMovies(query) {
    const url = `${BASE_URL}/search/movie?api_key=${API_KEY}&language=en-US&query=${encodeURIComponent(query)}`;

    $.get(url)
        .done(data => {
            allMovies = data.results; // Update the allMovies array with search results
            displayedMovies = allMovies.slice(0, 25); // Set displayedMovies to the first 25 results
            displayMovies(displayedMovies); // Display the search results
            displaySearchResults(data.results); // Display search results in dropdown
        })
        .fail(error => {
            console.error('Error fetching data:', error);
        });
}


$(document).ready(function() {
    $('#search-bar1').on('input', function() {
        const query = $(this).val().trim();
        if (query) {
            searchMovies(query); 
        } else {
            $('#search-results').empty(); 
            $('#search-results').hide(); 
        }
    });
});

function displaySearchResults(movies) {
    SEARCH_RESULTS.empty(); // Clear previous results
    if (movies.length === 0) {
        SEARCH_RESULTS.hide(); // Hide dropdown if no results
        return;
    }

    // Create dropdown items for each movie
    movies.forEach(movie => {
        const resultItem = $(`
            <div class="search-result-item" data-id="${movie.id}">
                <img src="${IMG_URL + movie.poster_path}" alt="${movie.title}" class="search-result-poster">
                <span>${movie.title}</span>
            </div>
        `);
        SEARCH_RESULTS.append(resultItem);

        
        resultItem.on('click', function() {
            window.location.href = `/pages/im.html?id=${movie.id}`; // Redirect to movie details page
        });
    });

    SEARCH_RESULTS.show(); // Show dropdown with results
}

// Event listener for the search bar
SEARCH__BAR.on('input', function() {
    const query = $(this).val().trim();
    if (query) {
        searchMovies(query); // Fetch movies based on the search query
    } else {
        SEARCH_RESULTS.empty(); // Clear results if search is empty
        SEARCH_RESULTS.hide(); // Hide dropdown if search is empty
    }
});

// Hide dropdown when clicking outside
$(document).on('click', function(event) {
    if (!$(event.target).closest('#search').length) {
        SEARCH_RESULTS.hide(); // Hide dropdown if clicked outside
    }
});

// Function to fetch similar movies
async function fetchSimilarMovies(movieId) {
    try {
        const response = await fetch(`${BASE_URL}/movie/${movieId}/similar?api_key=${API_KEY}&language=en-US&page=1`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        displaySimilarMovies(data.results); // Pass the results to display function
    } catch (error) {
        console.error('Error fetching similar movies:', error);
    }
}
function getNewlyReleasedMovies() {
    const url = `${BASE_URL}/movie/now_playing?api_key=${API_KEY}&language=en-US&page=1`;

    $.get(url)
        .done(data => {
            console.log(data); // Log the fetched data
            const movies = data.results; // Get the results
            let sliderContent = '';

            movies.forEach((movie, index) => {
                const activeClass = index === 0 ? 'active' : ''; // Set the first movie as active
                sliderContent += `
                    <div class="carousel-item ${activeClass}">
                        <img src="${IMG_URL + movie.poster_path}" class="poster1" alt="${movie.title}">
                        <div class="carousel-caption d-none d-md-block">
                            <h5>${movie.title}</h5>
                            <p>Rating: ${movie.vote_average}</p>
                        </div>
                    </div>
                `;
            });

            $('#sliderContent').html(sliderContent); 
        })
        .fail(error => {
            console.error('Error fetching newly released movies:', error);
        });
}

$(document).ready(function() {
    getNewlyReleasedMovies(); // Fetch and display the movies when the page loads
});



const watchlistContainer = $('#watchlist-container');

// Function to load watchlist from local storage
function loadWatchlist() {
    const watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
    displayWatchlist(watchlist);
}

// Function to display the watchlist
function displayWatchlist(watchlist) {
    watchlistContainer.empty(); // Clear previous content

    if (watchlist.length === 0) {
        watchlistContainer.html('<p>Your watchlist is empty.</p>');
        return;
    }

    watchlist.forEach(movie => {
        const movieElement = $(`
            <div class="col-md-3">
                <div class="movie">
                    <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}" class="movie-poster">
                    <h5>${movie.title}</h5>
                    <button class="remove-from-watchlist btn btn-danger" data-id="${movie.id}">Remove</button>
                </div>
            </div>
        `);
        watchlistContainer.append(movieElement);
    });

    // Add event listeners for the remove buttons
    $('.remove-from-watchlist').on('click', function() {
        const movieId = $(this).data('id');
        removeFromWatchlist(movieId);
    });
}

// Function to remove a movie from the watchlist
function removeFromWatchlist(movieId) {
 const watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
    const updatedWatchlist = watchlist.filter(movie => movie.id !== movieId);
    localStorage.setItem('watchlist', JSON.stringify(updatedWatchlist));
    loadWatchlist();
}

// Load the watchlist on page load
$(document).ready(function() {
loadWatchlist();
});



// Function to add a movie to the watchlist
function addToWatchlist(movieId) {
    const watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
    const movie = allMovies.find(movie => movie.id === movieId); 
    if (movie && !watchlist.some(m => m.id === movieId)) { 
        watchlist.push(movie);
        localStorage.setItem('watchlist', JSON.stringify(watchlist));
        alert(`${movie.title} has been added to your watchlist!`); 
    
    }
}

// Add event listeners for the add to watchlist buttons
$(document).on('click', '.add-to-watchlist', function() {
    const movieId = $(this).data('id');
    addToWatchlist(movieId);
});

// Link to the watchlist page
$('.watchlist-button').on('click', function() {
    window.location.href = '.pages/watchlist.html';
});




// sign in+sign up
const form = document.getElementById('form')
const username = document.getElementById('username')
const email = document.getElementById('email')
const password = document.getElementById('password')

form.addEventListener('submit', e => {
    e.preventDefault();
    validatesInputs();
});


const setError = (element, message) => {
    const inputControl = element.parentElement;
    const errorDisplay = inputControl.querySelector('.error');
    errorDisplay.innerText = message;
    inputControl.classList.add('error'); 
    inputControl.classList.remove('success'); 
}

const setSuccess = element => {
    const inputControl = element.parentElement;
    const errorDisplay = inputControl.querySelector('error');

    errorDisplay.innerText = '';
    inputControl.classList.add('success');
    inputControl.classList.remove('error');
};

const isValidEmail = email => {
    const re = /^(([^<>([\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)¦(".+"))@((\[[0-9{1,3}\.[.0-9{1,3}\.[0-9{1,3}\.[0-9{1,3}\])¦(([a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

const validatesInputs = () => {
    const usernameValue = username.value.trim();
    const emailValue = email.value.trim();
    const passwordValue = password.value.trim();

    if(usernameValue === '') {
        setError(username, 'Username is required');
    } else {
         setSuccess(username);
    }

    if(emailValue === '') {
        setError(email, 'Email is required');
    } else if (!isValidEmail(emailValue)) {
        setError(email, 'Provide a valid email address');
    } else {
        setSuccess(email);
    }

    

    if(passwordValue === '') {
        setError(password, 'Password is required');
    } else if (passwordValue.length < 8) {
        setError(password, 'Password must be at least 8 characters.')
    } else {
        setSuccess(password);
    }

}





