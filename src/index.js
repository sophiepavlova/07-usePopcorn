import React from 'react';
import ReactDOM from 'react-dom/client';
import { useState } from 'react';
// import './index.css';
// import App from './App';

import StarRating from './StarRating';
function Test() {
  const [movieRating, setMovieRating] = useState(0);
  return (
    <div>
      {' '}
      <StarRating
        color='blue'
        maxRating={9}
        onSetMovieRating={setMovieRating}
      />
      <p>This movie was rated {movieRating} stars</p>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* <App /> */}
    <StarRating
      maxRating={5}
      messages={['Terrible', 'Bad', 'Ok', 'Good', 'Lovely!']}
    />
    <StarRating color='purple' size={24} className='test' />
    <StarRating
      maxRating={3}
      color='red'
      size={100}
      messages={['Great job!', 'Marvelous', 'Splendid!']}
      defaultRating={3}
    />
    <Test />
  </React.StrictMode>,
);
