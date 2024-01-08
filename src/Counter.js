import React, { useState, useEffect } from 'react';

function Counter({predictionsData}) {
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    setCounter(0);
    const counterInterval = setInterval(() => {
      setCounter(counter => counter + 1);
    }, 1000);

    return () => {
      clearInterval(counterInterval);
    };
  }, [predictionsData]);

  return (
    <div className='counter'>{counter}</div>
  );
}

export default Counter;