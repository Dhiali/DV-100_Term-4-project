document.addEventListener('DOMContentLoaded', () => {
    const movieInput = document.getElementById('movie-input');
    const addButton = document.getElementById('add-button');
    const watchlist = document.getElementById('watchlist');

    addButton.addEventListener('click', () => {
        const movieTitle = movieInput.value.trim();
        if (movieTitle) {
            addMovie(movieTitle);
            movieInput.value = ''; // Clear input field
        }
    });

    function addMovie(title) {
        const li = document.createElement('li');
        li.textContent = title;

        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remove';
        removeButton.classList.add('remove-button');

        removeButton.addEventListener('click', () => {
            watchlist.removeChild(li);
        });

        li.appendChild(removeButton);
        watchlist.appendChild(li);
    }
});

var swipper = new Swipper(".coming-container" , {
    spaceBetween: 20,
    loop: true,
    autoplay: {
        delay: 55000,
        disableOnInteraction: false,
    },
    centeredSlides: true,
    breakpoints: {
        0: {
            slidesPerView: 2,
        },
        568: {
            slidesPerView: 3,
        },
        768: {
            slidesPerView: 4,
        },
        968: {
            slidesPerView: 5,
        },
    }
})
