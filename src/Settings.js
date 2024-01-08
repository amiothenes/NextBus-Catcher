import React, { useState, useEffect } from 'react';
import Select from 'react-select';

function Settings({onSetEstimatedTime,
                    onSetRefreshInterval,
                    onSetFilterValue,
                    onSetAgency,
                    onSetRoute,
                    onSetStops,
                    startAgency,
                    startRoute,
                    startDirection,
                    startStop,
                    startEstimatedTime,
                    startRefreshInterval,
                    startFilterValue,}) {

  const [etaTime, setEtaTime] = useState(startEstimatedTime); // Default ETA time
  const [refreshInterval, setRefreshInterval] = useState(startRefreshInterval); // Default refresh interval
  const [filterValue, setFilterValue] = useState(startFilterValue); // Default filter value

  const [agency, setAgency] = useState(startAgency); // Default agency 
  const [route, setRoute] = useState(startRoute); // Default route 
  const [stop, setStop] = useState(startStop); // Default stop 
  const [direction, setDirection] = useState(startDirection); // Default direction

  const [routeData, setRouteData] = useState([]);
  const [stopsData, setStopsData] = useState([]);
  const [agencyData, setAgencyData] = useState([]);
  const [directionData, setDirectionData] = useState([]);

  useEffect(() => {
    const fetchRouteData = async () => {
      const res = await fetch(`https://retro.umoiq.com/service/publicJSONFeed?command=agencyList`);
      const data = await res.json();
      if (data.agency && data.agency.length > 0) {
        setAgencyData(data.agency);
      }
    };

    fetchRouteData();
  }, []);

  useEffect(() => {
    const fetchRouteData = async () => {
      const res = await fetch(`https://retro.umoiq.com/service/publicJSONFeed?command=routeList&a=${agency.value}`);
      const data = await res.json();
      if (data.route && data.route.length > 0) {
        setRouteData(data.route);
      }
    };

    fetchRouteData();
  }, [agency]);

  useEffect(() => {
    const fetchDirectionsData = async () => {
      const res = await fetch(`https://retro.umoiq.com/service/publicJSONFeed?command=routeConfig&a=${agency.value}&r=${route.value}`);
      const data = await res.json();
      if (data.route && data.route.stop && data.route.direction && data.route.stop.length > 0) {
        setDirectionData(data.route.direction);
        setStopsData(data.route.stop);
      } else {
        console.log("No directions found for this route");
      }
    };

    fetchDirectionsData();
  }, [route]);

  useEffect(() => {
    const selectedDirection = directionData.find(dir => dir.tag === direction.value);
    const stopTags = selectedDirection?.stop?.map(stop => stop.tag) || [];
    const filteredStops = stopsData.filter(stop => stopTags.includes(stop.tag));
    setStopsData(filteredStops);
  }, [direction]);

  const handleSubmit = (event) => {
    event.preventDefault();
    onSetEstimatedTime(etaTime);
    onSetRefreshInterval(refreshInterval);
    onSetFilterValue(filterValue);

    onSetAgency(agency);
    onSetRoute(route);
    onSetStops(stop);
  };              

  const infoTitleETA = "Use this to calculate when to leave home for catching the bus on time.";
  const infoTitleRefresh = "Set data refresh interval in seconds.";
  const infoTitleFilter = "Filter out buses that are arriving in less than this value in minutes.";
  const infoTitleAgency = "Set the agency providing the data.";
  const infoTitleRoute = "Set the bus route.";
  const infoTitleDirection = "Which direction the bus is going to narrow down the bus stop selection.";
  const infoTitleStop = "Set the bus stop.";

  return (
    <form className='settings' onSubmit={handleSubmit}>
      <h2 className='settingsTitle'>Settings</h2>
      <label title={infoTitleAgency}> Agency:</label>

      <Select
        id="agencyInput"
        value={agency}
        options={agencyData && agencyData.map((agency) => ({
          value: agency.tag,
          label: agency.title
        }))}
        onChange={(event) => {
          setAgency(event);
          onSetAgency(event);
          setRoute({value:"", label:" -- select an option -- "});
          setDirection({value:"", label:" -- select an option -- "});
          setStop({value:"", label:" -- select an option -- "});
        }}
      />
      <label title={infoTitleRoute}> Route:</label>

      <Select
        id="routeInput"
        value={route}
        options={routeData && routeData.map((route) => ({
          value: route.tag,
          label: route.title
        }))}
        onChange={(event) => {
          setRoute(event);
          onSetRoute(event);
          setDirection({value:"", label:" -- select an option -- "});
          setStop({value:"", label:" -- select an option -- "});
        }}
      />
      <label title={infoTitleDirection}> Direction:</label>
      <Select
        id="directionInput"
        value={direction}
        options={directionData && directionData.map((direction) => ({
          value: direction.tag,
          label: direction.title
        }))}
        onChange={(event) => {
          setDirection(event);
          setStop({value:"", label:" -- select an option -- "});
        }}
      />

      <label title={infoTitleStop}> Stop:</label>
      <Select
        id="stopsInput"
        value={stop}
        options={stopsData && stopsData.map((stop) => ({
          value: stop.stopId,
          label: stop.title
        })) || []}
        onChange={(event) => {
          setStop(event);
          onSetStops(event);
        }}
      />



      <label title={infoTitleETA}>Stop ETA:</label>
      <input
        type="number"
        id="etaInput"
        title={infoTitleETA}
        value={etaTime}
        placeholder=" in minutes"
        onChange={(event) => setEtaTime(event.target.value)}
      />
      <label title={infoTitleRefresh}>Data Refresh Interval:</label>
      <input
        type="number"
        id="intervalInput"
        title={infoTitleRefresh}
        value={refreshInterval}
        placeholder=" in seconds"
        onChange={(event) => setRefreshInterval(event.target.value)}
      />
      <label title={infoTitleFilter}>Filter Value:</label>
      <input
        type="number"
        id="filterInput"
        title={infoTitleFilter}
        value={filterValue}
        placeholder=" in minutes"
        onChange={(event) => setFilterValue(event.target.value)}
      />
      <input
        className="saveSettings"
        type="submit"
        value="Save Settings"
      />
    </form>
  );
}

export default Settings;
