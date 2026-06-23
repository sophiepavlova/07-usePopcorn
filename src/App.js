import { useEffect, useState, useRef } from 'react';
import StarRating from './StarRating.js';
import { useMovies } from './useMovies.js';

// const tempQuery = 'harry potter';
const KEY = 'fb582b3f';

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

export default function App() {
  const [query, setQuery] = useState('');

  const [selectedId, setSelectedId] = useState(null);
  const [watched, setWatched] = useState(function () {
    const storedValue = JSON.parse(localStorage.getItem('watched'));
    return storedValue || [];
  });
  // const [watched, setWatched] = useState([]);

  const { movies, isLoading, error } = useMovies(query);

  function handleSelectMovie(id) {
    setSelectedId(() => (id === selectedId ? null : id));
  }

  function handleCloseMovie() {
    setSelectedId(null);
  }

  function handleAddWatched(movie) {
    setWatched((watched) => [...watched, movie]);
    // localStorage.setItem('watched', JSON.stringify([...watched, movie]));
  }

  function handleDeleteWatched(id) {
    setWatched((watched) => watched.filter((movie) => movie.imdbId !== id));
  }

  useEffect(
    function () {
      localStorage.setItem('watched', JSON.stringify(watched));
    },
    [watched],
  );

  return (
    <>
      <NavBar>
        <Search query={query} setQuery={setQuery} />
        <NumResults movies={movies} />
      </NavBar>
      <Main>
        <Box>
          {isLoading && <Loader />}
          {!isLoading && !error && (
            <MovieList movies={movies} onSelectMovie={handleSelectMovie} />
          )}
          {error && <ErrorMessage message={error} />}
        </Box>
        <Box>
          {selectedId ? (
            <MovieDetails
              selectedId={selectedId}
              onCloseMovie={handleCloseMovie}
              onAddWatched={handleAddWatched}
              watched={watched}
            />
          ) : (
            <>
              <WatchedSummary watched={watched} />
              <WatchedMoviesList
                watched={watched}
                onDeleteWatched={handleDeleteWatched}
              />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}

function Loader() {
  return <p className='loader'>Loading...</p>;
}

function ErrorMessage({ message }) {
  return (
    <p className='error'>
      <span>🛑</span>
      {message}
    </p>
  );
}

function NavBar({ children }) {
  return (
    <nav className='nav-bar'>
      <Logo />
      {children}
    </nav>
  );
}
function Logo() {
  return (
    <div className='logo'>
      <span role='img'>🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}

function Search({ query, setQuery }) {
  const inputEl = useRef(null);

  useEffect(
    function () {
      // console.log(inputEl.current);
      function callback(e) {
        if (document.activeElement === inputEl.current) return;
        if (e.code === 'Enter') {
          inputEl.current.focus();
        }
      }
      document.addEventListener('keydown', callback);
      return () => document.removeEventListener('keydown', callback);
    },
    [setQuery],
  );

  return (
    <input
      className='search'
      type='text'
      placeholder='Search movies...'
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      ref={inputEl}
    />
  );
}

function NumResults({ movies }) {
  return (
    <p className='num-results'>
      Found <strong>{movies.length}</strong> results
    </p>
  );
}

function Main({ children }) {
  return <main className='main'>{children}</main>;
}

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className='box'>
      <button className='btn-toggle' onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? '–' : '+'}
      </button>
      {isOpen && children}
    </div>
  );
}

function MovieList({ movies, onSelectMovie }) {
  return (
    <ul className='list list-movies'>
      {movies?.map((movie) => (
        <Movie movie={movie} key={movie.imdbID} onSelectMovie={onSelectMovie} />
      ))}
    </ul>
  );
}

function Movie({ movie, onSelectMovie }) {
  return (
    <li onClick={() => onSelectMovie(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function MovieDetails({ selectedId, onCloseMovie, onAddWatched, watched }) {
  const [movie, setMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState('');
  const [avgRating, setAvgRating] = useState(0);
  const isWatched = watched.map((mov) => mov.imdbId).includes(selectedId);

  const countRef = useRef(0);

  useEffect(
    function () {
      if (userRating) countRef.current = countRef.current + 1;
    },
    [userRating],
  );
  // console.log(isWatched);
  const watchedUserRating = watched.find(
    (move) => move.imdbId === selectedId,
  )?.userRating;

  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Releaased: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movie;
  // console.log(title, year);
  // console.log(movie.Title);

  // console.log(watched);

  // 🛑Wrong way to do it:
  // if (imdbRating > 8) {
  //   const [isTop, setIsTop] = useState(true);
  // }
  // const [isTop, setIsTop] = useState(imdbRating > 8);
  // console.log(isTop);
  // useEffect(
  //   function () {
  //     setIsTop(imdbRating > 8);
  //   },
  //   [imdbRating],
  // );

  // if (imdbRating > 7) return <p>Great movie!</p>;

  function handleAdd() {
    const newWatchedMovie = {
      imdbId: selectedId,
      title,
      year,
      poster,
      runtime: Number(runtime.split(' ').at(0)),
      imdbRating: Number(imdbRating),
      userRating,
      CurrentRatingDecisions: countRef.current,
    };

    onAddWatched(newWatchedMovie);
    onCloseMovie();
    // setAvgRating(Number(imdbRating));
    // setAvgRating((cur) => (cur + userRating) / 2);
  }

  useEffect(
    function () {
      function callback(e) {
        if (e.code === 'Escape') onCloseMovie();
        // console.log('Closed');
      }
      document.addEventListener('keydown', callback);
      return function () {
        document.removeEventListener('keydown', callback);
      };
    },
    [onCloseMovie],
  );

  useEffect(
    function () {
      async function getMovieDetails() {
        setIsLoading(true);
        const res = await fetch(
          `https://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`,
        );
        const data = await res.json();
        // console.log(data);
        setMovie(data);
        setIsLoading(false);
      }

      getMovieDetails();
    },
    [selectedId],
  );
  // console.log(userRating);
  useEffect(
    function () {
      if (!title) return;
      document.title = `Movie | ${title}`;
      // 🚩A clean-up function for the effect
      return function () {
        document.title = 'usePopcorn';
        // console.log(`Clenup after the movie ${title}`);
      };
    },
    [title],
  );

  return (
    <div className='details'>
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <header>
            <button className='btn-back' onClick={onCloseMovie}>
              &larr;
            </button>
            <img src={poster} alt={`The Poster of ${title}`}></img>
            <div className='details-overview'>
              <h2>{title}</h2>
              <p>
                {released} &bull; {runtime}
              </p>
              <p>{genre}</p>
              <p>
                <span>⭐️</span>
                {imdbRating} imdb Rating
              </p>
            </div>
          </header>
          {/* <p>{avgRating}</p> */}
          <section>
            <div className='rating'>
              {!isWatched ? (
                <>
                  <StarRating
                    maxRating={10}
                    size={24}
                    onSetMovieRating={setUserRating}
                  />
                  {userRating > 0 && (
                    <button className='btn-add' onClick={handleAdd}>
                      + Add to list
                    </button>
                  )}
                </>
              ) : (
                <p>
                  You rated this movie with {watchedUserRating}{' '}
                  <span>⭐️</span>{' '}
                </p>
              )}
            </div>
            <p>
              <em>{plot}</em>
            </p>
            <p>Starring {actors}</p>
            <p>Directed by {director}</p>
          </section>
        </>
      )}
    </div>
  );
}

function WatchedSummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));
  return (
    <div className='summary'>
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
}

function WatchedMoviesList({ watched, onDeleteWatched }) {
  return (
    <ul className='list'>
      {watched.map((movie) => (
        <WatchedMovie
          movie={movie}
          key={movie.imdbId}
          onDeleteWatched={onDeleteWatched}
        />
      ))}
    </ul>
  );
}

function WatchedMovie({ movie, onDeleteWatched }) {
  return (
    <>
      <li>
        <img src={movie.poster} alt={`${movie.title} poster`} />
        <h3>{movie.title}</h3>
        <div>
          <p>
            <span>⭐️</span>
            <span>{movie.imdbRating}</span>
          </p>
          <p>
            <span>🌟</span>
            <span>{movie.userRating}</span>
          </p>
          <p>
            <span>⏳</span>
            <span>{movie.runtime} min</span>
          </p>
          <button
            className='btn-delete'
            onClick={() => onDeleteWatched(movie.imdbId)}
          >
            -
          </button>
        </div>
      </li>
    </>
  );
}
