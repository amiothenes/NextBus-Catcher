import React, { useState, useEffect } from 'react';
import './App.css';
import Panel from './Panel';
import Settings from './Settings';
import Counter from './Counter';
import soundFile from './sound-alert.wav';

function App() {
  const [estimatedTime, setEstimatedTime] = useState(8);
  const [refreshInterval, setRefreshInterval] = useState(20); // Default refresh interval in seconds
  const [isLoading, setIsLoading] = useState(true);
  const [filterValue, setFilterValue] = useState(-2); // Default filter value

  const [agency, setAgency] = useState({value:'ttc',label:"Toronto Transit Commision"}); // Default agency
  const [route, setRoute] = useState({value:'52',label:"52-Lawrence West"}); // Default route
  const [direction, setDirection] = useState({value:"52_0_TOES",label:"East - 52 Lawrence West towards Eglinton Station via Avenue Rd"}); // Default direction
  const [busStop, setBusStop] = useState({value:'5337', label:"Lawrence Ave West At Bathurst St"}); // Default stop - through id
  const [predictionsData, setPredictionsData] = useState({copywrite:"",predictions:{}});

  const [userHasInteracted, setUserHasInteracted] = useState(false);

  const handleUserInteraction = () => {
    setUserHasInteracted(true);
  };

  // Attach the handleUserInteraction function to the events you consider as user interaction
  useEffect(() => {
    window.addEventListener('click', handleUserInteraction);
    window.addEventListener('keydown', handleUserInteraction);

    return () => {
      window.removeEventListener('click', handleUserInteraction);
      window.removeEventListener('keydown', handleUserInteraction);
    };
  }, []);

  const audio = new Audio(soundFile);

  const handleSetEstimatedTime = (time) => {
    setEstimatedTime(time);
  };

  const handleSetRefreshInterval = (interval) => {
    setRefreshInterval(interval);
  };

  const handleSetFilterValue = (filterValue) => {
    setFilterValue(filterValue);
  }

  const handleAgencyChange = (newAgency) => {
    setAgency(newAgency);
  };

  const handleRouteChange = (newRoute) => {
    setRoute(newRoute);
  };

  const handleDirectionChange = (newDirection) => {
    setDirection(newDirection);
  };

  const handleStopsChange = (newStop) => {
    if (/^\d+$/.test(newStop.value)) {
      setBusStop(newStop);
    } else {
      console.log('Invalid bus stop:', newStop.value);
    }
  };

  //fetch the prediction data when bus stop changes
  useEffect(() => {
    let timeoutId;
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res5 = await fetch(`https://retro.umoiq.com/service/publicJSONFeed?command=predictions&a=${agency.value}&stopId=${busStop.value}`);
        const data5 = await res5.json();
        setPredictionsData(data5);
        
      } catch (error) {
        console.error('Error fetching data:', error);
        setIsLoading(true);
      }
    };

    timeoutId = setInterval(fetchData, refreshInterval * 1000); // Convert seconds to milliseconds
    fetchData(); // Fetch data immediately when component mounts

    return () => clearInterval(timeoutId); // Clear interval on component unmount
  }, [refreshInterval,busStop]); // Fetch data when refreshInterval changes

  //setIsLoading to false when useeffect predictionsData is not empty
  useEffect(() => {

    if (predictionsData.predictions) {
      setIsLoading(false);
    } else {
      console.log('No predictions data received');
      setIsLoading(true);
      
    }
  }, [predictionsData]);
  return (
    <div className="App">
      {isLoading ? (
        <p className='loading'>Loading...</p>
      ) : (
        <>
          <Counter predictionsData={predictionsData} />
          <Settings 
            onSetEstimatedTime={handleSetEstimatedTime} 
            onSetRefreshInterval={handleSetRefreshInterval} 
            onSetFilterValue={handleSetFilterValue} 
            onSetAgency={handleAgencyChange}
            onSetRoute={handleRouteChange}
            onSetDirection={handleDirectionChange}
            onSetStops={handleStopsChange}

            startAgency={agency}
            startRoute={route}
            startDirection={direction}
            startStop={busStop}

            startEstimatedTime={estimatedTime}
            startRefreshInterval={refreshInterval}
            startFilterValue={filterValue}
          />
          <Panel
            estimatedTime={estimatedTime}
            predictionsData={predictionsData}
            filterValue={filterValue}
            userHasInteracted={userHasInteracted}
            audio={audio}
          />
        </>
      )}
    </div>
  );
}

export default App;
