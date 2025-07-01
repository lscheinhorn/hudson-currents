import { useEffect, useState } from "react";
import Current from "../Current";
import Weather from "../Weather";
import "./style.css";
import { retryCall, getDay, getMonth, getYear, getNowStr } from "../helper";

// Station mapping with coordinates and station names.
const stationMap = {
  n03020: {
    stationStr: "The Narrows Depth: 11 feet",
    latitude: "40.6064",
    longitude: "-74.0380",
  },
  NYH1920: {
    stationStr: "Brooklyn Bridge Depth: 8 feet",
    latitude: "40.7060",
    longitude: "-73.9977",
  },
  ACT3621: {
    stationStr: "Bay Ridge, west of, Depth: 22 feet",
    latitude: "40.6257",
    longitude: "-74.0540",
  },
  NYH1917: {
    stationStr: "Gowanus Bay Entrance Depth: 15 feet",
    latitude: "40.6625",
    longitude: "-74.0181",
  },
  NYH1918: {
    stationStr: "Red Hook Channel Depth: 3 feet",
    latitude: "40.6723",
    longitude: "-74.0239",
  },
  NYH1915: {
    stationStr: "Robbins Reef Light, 0.6 nm E of, Depth: 11 feet",
    latitude: "40.6552",
    longitude: "-74.0507",
  },
  NYH1914: {
    stationStr: "Constable Hook Approach Depth: 9 feet",
    latitude: "40.6507",
    longitude: "-74.0606",
  },
  n05010: {
    stationStr: "Gowanus Flats LBB 32, Depth: 11 feet",
    latitude: "40.6721",
    longitude: "-74.0399",
  },
  ACT3646: {
    stationStr: "Statue of Liberty, east of",
    latitude: "40.6900",
    longitude: "-74.0300",
  },
  NYH1919: {
    stationStr: "Dimond Reef",
    latitude: "40.6979",
    longitude: "-74.0213",
  },
  NYH1927: {
    stationStr: "Hudson River Entrance",
    latitude: "40.7076",
    longitude: "-74.0253",
  },
  NYH1928: {
    stationStr: "Hudson River, Pier 92",
    latitude: "40.7707",
    longitude: "-74.0028",
  },
  ACT3656: {
    stationStr: "Grants Tomb",
    latitude: "40.8080",
    longitude: "-73.9677",
  },
  HUR0611: {
    stationStr: "George Washington Bridge",
    latitude: "40.8496",
    longitude: "-73.9498",
  },
  NYH1930: {
    stationStr: "Spuyten Duyvil",
    latitude: "40.8779",
    longitude: "-73.9287",
  },
  ACT3671: {
    stationStr: "Riverdale",
    latitude: "40.9000",
    longitude: "-73.9167",
  },
  ACT3676: {
    stationStr: "Mount St. Vincent College, SW of: Depth: 15 feet",
    latitude: "40.9070",
    longitude: "-73.9080",
  },
  ACT3681: {
    stationStr: "Dobbs Ferry",
    latitude: "41.0167",
    longitude: "-73.8833",
  },
  HUR0502: {
    stationStr: "Tappan Zee Bridge Depth: 5 feet",
    latitude: "41.0674",
    longitude: "-73.8815",
  },
  ACT3691: {
    stationStr: "Tarrytown",
    latitude: "41.0833",
    longitude: "-73.8833",
  },
  ACT3696: {
    stationStr: "Ossining",
    latitude: "41.1667",
    longitude: "-73.9000",
  },
  HUR0401: {
    stationStr: "Haverstraw Depth: 4 feet",
    latitude: "41.2092",
    longitude: "-73.9513",
  },
  HUR0503: {
    stationStr: "Stony Point Depth: 14 feet",
    latitude: "41.2416",
    longitude: "-73.9667",
  },
};

// Utility to get today's date string in YYYYMMDD format.
function getTodayString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const day = now.getDate().toString().padStart(2, "0");
  return `${year}${month}${day}`;
}

// Helper function to format a date string (used for tide predictions).
function formatTime(dateString) {
  const date = new Date(dateString);
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const meridian = hours >= 12 ? "pm" : "am";
  if (hours > 12) {
    hours -= 12;
  } else if (hours === 0) {
    hours = 12;
  }
  return `${hours}:${minutes} ${meridian}`;
}


export default function Data() {
  // State declarations.
  const [currents, setCurrents] = useState(null);
  const [weather, setWeather] = useState({ isLoading: true });
  const [localForecastInfo, setLocalForecastInfo] = useState(null);
  const [dataType, setDataType] = useState("Currents");
  const [dataTypeInactive, setDataTypeInactive] = useState("Wind");
  const [tidePredictions, setTidePredictions] = useState(null);
  const [fallbackTideStation, setFallbackTideStation] = useState(null);
  const [tides, setTides] = useState({ prevTide: null, nextTide: null });
  const [isMounted, setIsMounted] = useState(false);
  const [detailedForecast, setDetailedForecast] = useState("");
  const [dailyIdx, setDailyIdx] = useState(0);
  const defaultStation = "NYH1928";
  const [tideStation, setTideStation] = useState("8518750");

  const [queryParams, setQueryParams] = useState({
    begin_date: null,
    end_date: null,
    range: 24,
    date: "today",
    station: defaultStation,
    stationStr: stationMap[defaultStation].stationStr,
    product: "currents_predictions",
    units: "english",
    time_zone: "lst_ldt",
    application: "luke_scheinhorn",
    format: "json",
    interval: "MAX_SLACK",
    latitude: stationMap[defaultStation].latitude,
    longitude: stationMap[defaultStation].longitude,
  });

  // Refresh time state.
  const now = new Date();
  const [refreshTime, setRefreshTime] = useState({
    time: getNowStr(now),
    day: getDay(now, "short"),
    month: getMonth(now),
    year: getYear(now),
    date: now.getDate(),
    string: `${getDay(now, "short")} ${getMonth(now)} ${now.getDate()}, ${getYear(now)} ${getNowStr(now)}`,
  });

  // Fetch currents predictions.
  useEffect(() => {
    const getCurrents = async () => {
      const baseUrl = "https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?";
      const params = new URLSearchParams();
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value) {
          params.append(key, value);
        }
      });
      const url = baseUrl + params.toString();
      try {
        let data = await fetch(url).then((response) => response.json());
        // Assuming structure: data.current_predictions.cp
        data = data["current_predictions"]["cp"];
        setCurrents(data);
      } catch (error) {
        console.error("Error fetching currents data:", error);
      }
    };

    getCurrents();
    if (!currents) {
      retryCall(getCurrents, currents, "currents");
    }
  }, [queryParams]);

  // TIDE PREDICTIONS:
  // Try fetching tide predictions for the current station. If none are returned, use the nearest station.
  useEffect(() => {
    const getTidePredictions = async (tideStation) => {
        const baseUrl = "https://api.tidesandcurrents.noaa.gov/api/prod/datagetter";
        const params = new URLSearchParams({
          station: tideStation,
          begin_date: getTodayString(),
          end_date: getTodayString(),
          product: "predictions",
          interval: "hilo",
          datum: "MLLW",
          units: "english",
          time_zone: "lst_ldt", // Changed to local time
          application: "luke_scheinhorn",
          format: "json",
        });
        const url = `${baseUrl}?${params.toString()}`;
        try {
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          console.log(`Full tide API response for station ${tideStation}:`, data);
          if (!data.predictions || data.predictions.length === 0) {
            console.warn(`No tide predictions found for station ${tideStation}`);
            return null;
          }
          console.log(`Tide predictions for station ${tideStation}:`, data.predictions);
          return data.predictions;
        } catch (error) {
          console.error("Error fetching tide predictions for station", tideStation, error);
          return null;
        }
      };

    const fetchTides = async () => {
      let predictions = await getTidePredictions(tideStation);
      if (!predictions || predictions.length === 0) {
        // No tide data for selected station. Find the nearest station.
        let selectedCoords = { lat: Number(queryParams.latitude), lon: Number(queryParams.longitude) };
        let nearestStation = null;
        let minDistance = Infinity;
        for (const key in stationMap) {
          if (key === queryParams.station) continue;
          const station = stationMap[key];
          const lat = Number(station.latitude);
          const lon = Number(station.longitude);
          const distance = Math.sqrt(Math.pow(lat - selectedCoords.lat, 2) + Math.pow(lon - selectedCoords.lon, 2));
          if (distance < minDistance) {
            minDistance = distance;
            nearestStation = key;
          }
        }
        if (nearestStation) {
          predictions = await getTidePredictions(nearestStation);
          if (predictions && predictions.length > 0) {
            setFallbackTideStation(nearestStation);
          }
        }
      } else {
        // Tide data available for the selected station.
        setFallbackTideStation(null);
      }
      console.log("Final tide predictions:", predictions);
      setTidePredictions(predictions);
    };
    

    fetchTides();
  }, [tideStation, queryParams.station, queryParams.latitude, queryParams.longitude]);

  // Process tide predictions to determine previous and next tide events.
  useEffect(() => {
    if (!tidePredictions) return;
    const now = new Date();
    let prev = null;
    let next = null;
    tidePredictions.forEach((pred) => {
      const predTime = new Date(pred.t);
      if (predTime.getTime() <= now.getTime()) {
        if (!prev || predTime.getTime() > new Date(prev.t).getTime()) {
          prev = pred;
        }
      } else {
        if (!next || predTime.getTime() < new Date(next.t).getTime()) {
          next = pred;
        }
      }
    });
    console.log("Computed previous tide:", prev, "and next tide:", next);
    setTides({ prevTide: prev, nextTide: next });
    
  }, [tidePredictions]);

  // Fetch weather forecast information.
  useEffect(() => {
    const getWeather = async () => {
      try {
        const response = await fetch(
          `https://api.weather.gov/points/${queryParams.latitude},${queryParams.longitude}`
        );
        if (!response.ok) {
          console.error("There was an error fetching weather", response.statusText);
          throw new Error(response.statusText);
        }
        const json = await response.json();
        setLocalForecastInfo(json);
      } catch (error) {
        console.error(`There was an error fetching weather. Error message: ${error}`);
      }
    };
    getWeather();
    if (!localForecastInfo) {
      retryCall(getWeather, localForecastInfo, "localForecastInfo");
    }
    
  }, [queryParams.latitude]);

  
  // Fetch detailed weather forecast using local forecast info.
  useEffect(() => {
    if (!localForecastInfo) return;
    const dailyUrl = localForecastInfo.properties.forecast;
    const hourlyUrl = localForecastInfo.properties.forecastHourly;

    const getForecastHourly = () => {
      fetch(hourlyUrl)
        .then((response) => {
          if (!response.ok) {
            alert("The server is unable to provide hourly weather data right now. Please try again later.");
            throw Error(response.statusText);
          }
          return response.json();
        })
        .then((json) => {
          setWeather((prev) => ({
            ...prev,
            forecastHourly: json.properties.periods,
          }));
        })
        .catch((error) => {
          console.error(`Error fetching hourly forecast: ${error}`);
        });
    };

    getForecastHourly();
    if (!weather.forecastHourly) {
      retryCall(getForecastHourly, weather.forecastHourly, "weather.forecastHourly");
    }

    const getForecastDaily = () => {
      fetch(dailyUrl)
        .then((response) => {
          if (!response.ok) {
            throw Error(response.statusText);
          }
          return response.json();
        })
        .then((json) => {
          setWeather((prev) => ({
            ...prev,
            forecastDaily: json.properties.periods,
            isLoading: false,
          }));
        })
        .catch((error) => {
          console.error(`Error fetching daily forecast: ${error}`);
        });
    };

    getForecastDaily();
    if (!weather.forecastDaily) {
      retryCall(getForecastDaily, weather.forecastDaily, "weather.forecastDaily");
    }
  }, [localForecastInfo]);

  // Update detailed forecast based on daily index and forecast data.
  useEffect(() => {
    if (weather.isLoading || !weather.forecastDaily) return;
    setDetailedForecast(weather.forecastDaily[dailyIdx].detailedForecast);
    setQueryParams((prev) => {
      const startTime = weather.forecastDaily[dailyIdx].startTime;
      const beginDate = startTime.slice(0, 4) + startTime.slice(5, 7) + startTime.slice(8, 10);
      if (prev.interval !== "MAX_SLACK") {
        setDailyIdx(0);
        return { ...prev, begin_date: null, end_date: null, date: "today" };
      } else {
        return { ...prev, begin_date: beginDate, date: null };
      }
    });
  }, [weather.forecastDaily, dailyIdx, weather.isLoading]);

  // Mark component as mounted.
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Handle station change using stationMap.
  const handleStationChange = ({ target }) => {
    const value = target.value;
    const stationDetails = stationMap[value];
    if (stationDetails) {
      setQueryParams((prev) => ({
        ...prev,
        station: value,
        stationStr: stationDetails.stationStr,
        latitude: stationDetails.latitude,
        longitude: stationDetails.longitude,
      }));
    }
  };

  // Handle interval change.
  const handleIntervalChange = ({ target }) => {
    const value = target.value;
    setQueryParams((prev) => ({
      ...prev,
      interval: value,
    }));
  };

  // Handle tide station change.
  const handleTideStationChange = ({ target }) => {
    const value = target.value;
    setTideStation(value)
  };

  const handleIndexInc = () => {
    const length = weather.forecastDaily ? weather.forecastDaily.length : 0;
    if (dailyIdx < length - 1) {
      setDailyIdx(dailyIdx + 1);
    }
  };

  const handleIndexDec = () => {
    if (dailyIdx !== 0) {
      setDailyIdx(dailyIdx - 1);
    }
  };

  const handleDataToggle = () => {
    if (dataType === "Currents") {
      setDataType("Wind");
      setDataTypeInactive("Currents");
    } else {
      setDataType("Currents");
      setDataTypeInactive("Wind");
    }
  };

  const reload = () => window.location.reload(false);

  return (
    <div className="data">
      {dataType === "Currents" ? (
        <h1>Hudson River Currents</h1>
      ) : (
        <h1>Hudson River Wind</h1>
      )}

      <div className="space-around">
        <h2>Station</h2>
        <select value={queryParams.station} onChange={handleStationChange} title="Station">
          {Object.keys(stationMap).map((key) => (
            <option key={key} value={key}>
              {stationMap[key].stationStr.split("Depth")[0]}
            </option>
          ))}
        </select>
      </div>
      <a
        className="btn btn-primary"
        href={`http://www.google.com/maps/place/${queryParams.latitude},${queryParams.longitude}/@${queryParams.latitude},${queryParams.longitude},13z`}
        target="_blank"
        rel="noreferrer"
      >
        VIEW STATION LOCATION
      </a>

      <div className="space-around">
        <h2>Tide Station</h2>
        <select value={tideStation} onChange={handleTideStationChange} title="Tide Station">
          <option value="8518750">The Battery</option>
          <option value="8518902">Dyckman Marina</option>
        </select>
      </div>  

      
      {(tides.prevTide || tides.nextTide) && (
        <div className="container">
          <div className="space-around">
            <p>{refreshTime.string}</p>
            <div className="border">
              <h2 id="forecast">Tides</h2>
              <div className="space-around">
                <p>
                  {tides.prevTide
                    ? `Previous: ${tides.prevTide.type === "H" ? "High" : "Low"} - ${formatTime(tides.prevTide.t)}`
                    : "No previous tide"}
                </p>
                <p>
                  {tides.nextTide
                    ? `Next: ${tides.nextTide.type === "H" ? "High" : "Low"} - ${formatTime(tides.nextTide.t)}`
                    : "No next tide"}
                </p>
              </div>
              {fallbackTideStation && (
                <p className="fallback-notice">
                  Tide data is not available for the selected station. Displaying tide data for the nearest station:{" "}
                  {stationMap[fallbackTideStation].stationStr.split("Depth")[0]}.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {dataType === "Currents" ? (
        <div>
          <div className="space-around">
            <h2>Time interval</h2>
            <select value={queryParams.interval} onChange={handleIntervalChange} title="Time interval">
              <option value="MAX_SLACK">Slack & Max Flood / Ebb</option>
              <option value="30">30 Minutes</option>
              <option value="60">1 Hour</option>
            </select>
          </div>
          <div className="container">
            <div className="space-around">
              <div className="border">
                <h2 id="forecast">Forecast</h2>
                <div id="day-picker" className="side-by-side">
                  {queryParams.interval === "MAX_SLACK" && (
                    <button aria-label="Back 12 hours" className="btn btn-primary" onClick={handleIndexDec}>
                      {"<"}
                    </button>
                  )}
                  <div className="center">
                    <h4>{weather.isLoading ? "" : weather.forecastDaily[dailyIdx].name}</h4>
                  </div>
                  {queryParams.interval === "MAX_SLACK" && (
                    <button aria-label="Forward 12 hours" className="btn btn-primary" onClick={handleIndexInc}>
                      {">"}
                    </button>
                  )}
                </div>
                <p>{weather.isLoading ? "Loading forecast..." : detailedForecast}</p>
              </div>
            </div>
            <div className="container">
              <div id="day-picker" className="side-by-side">
                <button className="btn btn-primary" onClick={handleDataToggle}>
                  Get {dataTypeInactive}
                </button>
                <button className="btn btn-primary" onClick={reload}>
                  Refresh
                </button>
              </div>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Tide</th>
                <th>Speed (knots)</th>
              </tr>
            </thead>
            <tbody>
              {currents &&
                currents.map((current, index) => (
                  <Current current={current} weather={weather} key={index} />
                ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div>
          <div className="container">
            <div className="space-around">
              <div className="border">
                <h2 id="forecast">Forecast</h2>
                <div id="day-picker" className="side-by-side">
                  <button aria-label="Back 12 hours" className="btn btn-primary" onClick={handleIndexDec}>
                    {"<"}
                  </button>
                  <div>
                    <h4>{weather.isLoading ? "" : weather.forecastDaily[dailyIdx].name}</h4>
                  </div>
                  <button aria-label="Forward 12 hours" className="btn btn-primary" onClick={handleIndexInc}>
                    {">"}
                  </button>
                </div>
                <p>{weather.isLoading ? "Loading forecast..." : detailedForecast}</p>
              </div>
            </div>
            <div className="container">
              <div id="day-picker" className="side-by-side">
                <button className="btn btn-primary" onClick={handleDataToggle}>
                  Get {dataTypeInactive}
                </button>
                <button className="btn btn-primary" onClick={reload}>
                  Refresh
                </button>
              </div>
            </div>
            <div className="table">
              <table>
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Speed (knots)</th>
                    <th>Direction</th>
                    <th>Forecast</th>
                    <th>Temperature</th>
                    <th>Precipitation</th>
                  </tr>
                </thead>
                <tbody>
                  {weather.forecastHourly &&
                    weather.forecastHourly.map((weatherData, key) => (
                      <Weather weather={weatherData} key={key} />
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      <p>Data is fetched from NOAA Tides and Currents API</p>
      <p>Created by: Luke Scheinhorn</p>
    </div>
  );
}