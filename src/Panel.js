import React, { useState, useEffect } from 'react';
import './App.css';

function Panel({estimatedTime, predictionsData, filterValue, userHasInteracted, audio}) {
  predictionsData = predictionsData.predictions; //one layer deeper - should be an array, one item makes it not

  // Ensure predictionsData is an array
  predictionsData = Array.isArray(predictionsData) ? predictionsData : [predictionsData];

  // to get the directionTitle, loop through all routes in predictionData
  // and get the first one that has direction.title in it
  
  //direction title is the first one that has a direction.title in it
  let directionTitle = "";
  for (let i = 0; i < predictionsData.length; i++) {
      let direction = predictionsData[i].direction;
      if (Array.isArray(direction)) {
          // If direction is an array, loop through it and get the title of the first object
          for (let j = 0; j < direction.length; j++) {
              if (direction[j].title) {
                  directionTitle = direction[j].title.replace(/[0-9]/g, '').replace('Express ', '');
                  break;
              }
          }
      } else if (direction && direction.title) {
          // If direction is an object, get its title directly
          directionTitle = direction.title.replace(/[0-9]/g, '').replace('Express ', '');
      }
      if (directionTitle) {
          break;
      }
  }

  //now do the samething for the stopTitle
  let stopTitle = "";
  for (let i = 0; i < predictionsData.length; i++) {
    if (predictionsData[i].stopTitle) {
      stopTitle = predictionsData[i].stopTitle;
      break;
    }
  }

  //and for the agencyTitle
  let agencyTitle = "";
  for (let i = 0; i < predictionsData.length; i++) {
    if (predictionsData[i].agencyTitle) {
      agencyTitle = predictionsData[i].agencyTitle;
      break;
    }
  }
  
  const filteredBuses = predictionsData
    .flatMap((route) =>
      route.direction && Array.isArray(route.direction) // Check if route.direction is an array
        ? route.direction.flatMap(direction => direction.prediction) // Combine predictions of all directions
            .filter(bus => bus.minutes - estimatedTime >= filterValue)
            .map(bus => ({ ...bus, routeTag: route.routeTag })) // Include routeTag in each bus object
        : route.direction // Check if route.direction exists
          ? Array.isArray(route.direction.prediction) // Check if route.direction.prediction is an array
            ? route.direction.prediction
                .filter(bus => bus.minutes - estimatedTime >= filterValue)
                .map(bus => ({ ...bus, routeTag: route.routeTag })) // Include routeTag in each bus object
            : [route.direction.prediction] // Convert single bus prediction to an array
                .filter(bus => bus.minutes - estimatedTime >= filterValue)
                .map(bus => ({ ...bus, routeTag: route.routeTag })) // Include routeTag in each bus object
          : []
    )
    .sort((a, b) => (a.minutes - estimatedTime) - (b.minutes - estimatedTime));
  
  return (
    <div className='Panel'>
      <div className='titleDiv'>
        <h1 className='directionTitle'>{directionTitle}</h1>
        <h3 className='directionTitle'>{stopTitle}</h3>
      </div>
      <div className='busPanel'>
        {filteredBuses.length === 0 ? (
          <p className='no-buses'>There are no buses scheduled at this time.</p>
        ) : (
          filteredBuses.map((bus, i) => (
            <div key={bus.vehicle} className='individual-bus' id={`indiv-bus-${i}`} title={`Vehicle ID: ${bus.vehicle}`}>
            <div className='insideRouteTag' style={{
              backgroundColor: bus.routeTag.startsWith('9') && bus.routeTag.length === 3 ? '#00923f' : bus.routeTag.startsWith('3') && bus.routeTag.length === 3 ? '#024182' : '#da251d'}}>{bus.branch}</div>
              <p>
                {bus.minutes - estimatedTime <= 0
                  ? (() => {
                    if (userHasInteracted) {
                      audio.play(); // Play audio when "LEAVE NOW" is displayed
                    }
                    return `LEAVE NOW (${bus.minutes - estimatedTime})`;
                    })()
                  : `Leave in ${bus.minutes - estimatedTime} minutes to catch this bus.`}
              </p>
            </div>
          ))
        )}
      </div>
      <div className='agencyTitle'>
        <h3>{agencyTitle}</h3>
      </div>
    </div>
  );
}

export default Panel;
