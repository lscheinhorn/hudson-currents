import Current from '../Current'
import Weather from '../Weather'

import './style.css'
import { useEffect, useState, useRef } from 'react'
import Clock from 'react-live-clock'
import { retryCall, getDay, getMonth } from "../helper"

export default function Data () {
    const [ currents, setCurrents ] = useState()
    // const [ dateRefreshed ] = useState(new Date())
    // const [ userLocation, setUserLocation ] = useState()
    const [ domain ] = useState( "https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?" )
    const [ weather, setWeather ] = useState({isLoading: true})
    const [ isMounted, setIsMounted ] = useState(false)
    const [ dataDate, setDataDate ] = useState()
    const [ dataDateStr, setDataDateStr ] = useState()
    const [ detailedForecast, setDetailedForecast ] = useState()
    const [ localForecastInfo, setLocalForecastInfo ] = useState()
    const [ dataType, setDataType ] = useState("Currents")
    const [ dataTypeInactive, setDataTypeInactive ] = useState("Wind")

    const [queryParams, setQueryParams] = useState({
        begin_date: null,
        end_date: null,
        range: 24,
        date: "today",
        station: "HUR0611",
        stationStr: "George Washington Bridge",
        product: "currents_predictions",
        units: "english",
        time_zone: "lst_ldt",
        application: "luke_scheinhorn",
        format: "json",
        interval: "MAX_SLACK",
        latitude: "40.8496",
        longitude: "-73.9498"
    })

    useEffect(() => {

        const getCurrentUrl = () => {
            let urlArr = [ domain ]
            for ( const param in queryParams ) {
                if ( queryParams[param] ) {
                    urlArr.push(param)
                    urlArr.push("=")
                    urlArr.push(queryParams[param])
                    urlArr.push("&")
                }
                
            }
            urlArr.pop()
            const url = urlArr.join("")
            return url
        }


        const getCurrents = async () => {
            let data = await fetch(getCurrentUrl())
                .then(response => response.json())
                .then(json => json);
            data = data["current_predictions"]["cp"]
            setCurrents(data)

        }


        // const getLocation = () => {
        //     if (navigator.geolocation) {
        //         navigator.geolocation.getCurrentPosition(setPosition, showError)
        //     } else {
        //         console.log("Geolocation is not supported by this browser.")
        //     }
        // }
        
        // const setPosition = (position) => {
        //     setUserLocation(position.coords)
        // }

        // const showError = (error) => {
        //     switch(error.code) {
        //         case error.PERMISSION_DENIED:
        //             alert("User denied the request for Geolocation.")
        //             break;
        //         case error.POSITION_UNAVAILABLE:
        //             alert("Location information is unavailable.")
        //             break;
        //         case error.TIMEOUT:
        //             alert("The request to get user location timed out.")
        //             break;
        //         case error.UNKNOWN_ERROR:
        //             alert("An unknown error occurred.")
        //             break;
        //         default:
        //             alert("error")
        //     }
        // }

        // getLocation()

        getCurrents()

        if ( !currents ) {
            retryCall(getCurrents, currents, "currents")
        }

    }, [queryParams, domain] )

    useEffect(() => {
        if (!isMounted) {
            return
        }

        const getDataDate = () => {
            let date = new Date(currents[0].Time)
            return date
        }

        
        const getDataDateStr = (date) => {
            const newDate = new Date(date)
            return `${getDay(newDate)} ${getMonth(newDate)} ${newDate.getDate()}`
        }

        setDataDate(getDataDate)
        setDataDateStr(getDataDateStr(dataDate))

    },  [currents])

    const handleIntervalChange = ({ target }) => {
        const value = target.value
        setQueryParams( prevState => {
            return {
                ...prevState,
                interval: value
            }
        })
    }

    const handleStationChange = ({ target }) => {
        const value = target.value
        let stationStr 
        let latitude
        let longitude
        if ( value === "NYH1927") {
            stationStr = "Hudson River Entrance"
            latitude = "40.7076"
            longitude = "-74.0253"
        } else if ( value === "NYH1928") {
            stationStr = "Hudson River, Pier 92"
            latitude = "40.7707"
            longitude = "-74.0028"
        } else if ( value === "ACT3656") {
            stationStr = "Grants Tomb"
            latitude = "40.8080"
            longitude = "-73.9677"
        } else if ( value === "HUR0611") {
            stationStr = "George Washington Bridge"
            latitude = "40.8496"
            longitude = "-73.9498"
        } else if ( value === "NYH1930") {
            stationStr = "Spuyten Duyvil"
            latitude = "40.8779"
            longitude = "-73.9287"
        } else if ( value === "ACT3671") {
            stationStr = "Riverdale"
            latitude = "40.9000"
            longitude = "-73.9167"
        } else if ( value === "ACT3676") {
            stationStr = "Mount St. Vincent College, SW of: Depth: 15 feet"
            latitude = "40.9070"
            longitude = "-73.9080"
        } else if ( value === "ACT3681") {
            stationStr = "Dobbs Ferry"
            latitude = "41.0167"
            longitude = "-73.8833"
        } else if ( value === "HUR0502") {
            stationStr = "Tappan Zee Bridge Depth: 5 feet"
            latitude = "41.0674"
            longitude = "-73.8815"
        } else if ( value === "ACT3691") {
            stationStr = "Tarrytown"
            latitude = "41.0833"
            longitude = "-73.8833"
        } else if ( value === "ACT3696") {
            stationStr = "Ossining"
            latitude = "41.1667"
            longitude = "-73.9000"
        } else if ( value === "HUR0401") {
            stationStr = "Haverstraw Depth: 4 feet"
            latitude = "41.2092"
            longitude = "-73.9513"
        } else if ( value === "HUR0503") {
            stationStr = "Stony Point Depth: 14 feet"
            latitude = "41.2416"
            longitude = "-73.9667"
        }
        setQueryParams( prevState => {
            return {
                ...prevState,
                station: value,
                stationStr: stationStr,
                latitude: latitude,
                longitude: longitude
            }
        })
    }

    // const handleDateChange = ({ target }) => {
    //     const value = target.value
    //     setQueryParams( prevState => {
    //         return {
    //             ...prevState,
    //             date: value
    //         }
    //     })
    // }
    

    
    useEffect(() => {
        // if (!isMounted) {
        //     return
        // }
        const getWeather = async () => {
            await fetch(`https://api.weather.gov/points/${queryParams.latitude},${queryParams.longitude}`)
                .then(response => {
                    if (!response.ok) {
                        throw Error(response.statusText);
                    } else {
                        return response.json()
                    }
                })
                .then(json => {
                    setLocalForecastInfo(json)
                })
                .catch(error => {
                    console.log(`There was an error fetching weather. Error message: ${error}`)
                })
        }
        getWeather()
        
        if ( !localForecastInfo ) {
            retryCall(getWeather, localForecastInfo, "localForecaseInfo")
        }

    }, [queryParams.latitude] )


    
    
    useEffect( () => {
        if (!isMounted) {
            return
        }

        let dailyUrl = localForecastInfo["properties"]["forecast"]
        let hourlyUrl = localForecastInfo["properties"]["forecastHourly"]

        const getForecast = async () => {

            const getForecastHourly = () => {
                fetch(hourlyUrl)
                    .then(response => {
                        if (!response.ok) {
                            throw Error(response.statusText);
                        } else {
                            return response.json()
                        }
                    })
                    .then(json => {
                        setWeather((prev) => {
                            return {
                                ...prev,
                                forecastHourly: json["properties"]["periods"]
                            }
                        })
                    })
                    .catch(error => {
                        console.log(`There was an error fetching your hourly forecast. Error message: ${error}`)
                    })


            }

            getForecastHourly()


            if ( !weather.forecastHourly ) {
                retryCall(getForecastHourly, weather.forecastHourly, "weather.forecastHourly")
            }


           
           
            const getForecastDaily = () => {
                fetch(dailyUrl)
                    .then(response => {
                        if (!response.ok) {
                            throw Error(response.statusText);
                        } else {
                            return response.json()
                        }
                    })
                    .then(json => {
                        setWeather((prev) => {
                            return {
                                ...prev,
                                forecastDaily: json["properties"]["periods"],
                                isLoading: false
                            }
                        })
                    })
                    .catch(error => {
                        console.log(`There was a problem fetching your daily forecast. Error message ${error}`)
                    })

                

            }

            getForecastDaily()

            if ( !weather.forecastDaily ) {
                retryCall(getForecastDaily, weather.forecastDaily, "weather.forecastDaily")
            }
        }

        getForecast()

    }, [localForecastInfo] )
    

    const reload = () => window.location.reload(false)

    const [ dailyIdx, setDailyIndex ] = useState(0)

   const handleIndexInc = () => {
        const length = weather.forecastDaily.length
        console.log("length", length)
        if ( dailyIdx < length - 1 ) {
            setDailyIndex(dailyIdx + 1)
        }
   }

   const handleIndexDec = () => {
        if ( dailyIdx !== 0 ) {
            setDailyIndex(dailyIdx - 1)
        }
    }

    const handleDataToggle = () => {
        if ( dataType === "Currents" ) {
            setDataType("Wind")
            setDataTypeInactive("Currents")
        } else {
            setDataType("Currents")
            setDataTypeInactive("Wind")
        }
    }

    const isHidden = (data) => {
        return data === dataType ? "hidden" : ""
    }

    useEffect(() => {
        if(weather.isLoading) {
            return
        }
        
        setDetailedForecast(weather.forecastDaily[Number(dailyIdx)].detailedForecast)
        setQueryParams(( prev ) => {
            const startTime = weather.forecastDaily[Number(dailyIdx)].startTime
            const beginDate = startTime.slice(0, 4) + startTime.slice(5, 7) + startTime.slice(8, 10)
            return {
                ...prev,
                begin_date: beginDate,
                date: null
            }
        })

    }, [weather.forecastDaily, dailyIdx])

    useEffect(() => {
        if(isMounted) {
            console.log("detailedForecast", detailedForecast)
        }
    }, [detailedForecast])

    useEffect(() => {
        setIsMounted(true)
    }, [])

    return (
        <div className="data" >
            <div className="container">
                <div id="day-picker" className="side-by-side">
                    <button className="btn btn-primary" onClick={ reload }>{"Refresh"}</button>
                    
                    <button className="btn btn-primary" onClick={ handleDataToggle }>Get { dataTypeInactive }</button>
                </div>                
            </div>
            { dataType === "Currents" ? 
                <h1>Hudson River Currents</h1> : 
                <h1>Hudson River Wind</h1>
            }
            
            <div className="space-around">
                <h2>Station</h2>
                <select value={ queryParams.station } onChange={ handleStationChange } title="Station">
                    <option value="NYH1927">Hudson River Entrance Depth: 7 ft</option>
                    <option value="NYH1928">Hudson River, Pier 92 Depth: 6 ft</option>
                    <option value="ACT3656">Grants Tomb Depth: 18 ft</option>
                    <option value="HUR0611">George Washington Bridge Depth: 14 ft</option>
                    <option value="NYH1930">Spuyten Duyvil Depth: 9 ft</option>
                    <option value="ACT3671">Riverdale</option>
                    <option value="ACT3676">Mount St. Vincent College</option>
                    <option value="ACT3681">Dobbs Ferry</option>
                    <option value="HUR0502">Tappan Zee Bridge (Depth 5ft)</option>
                    <option value="ACT3691">Tarrytown</option>
                    <option value="ACT3696">Ossining</option>
                    <option value="HUR0401">Haverstraw</option>
                    <option value="HUR0503">Stony Point</option>
                </select>
            </div>
           
            
            
            { dataType === "Currents" ? 
                
                <div>
                    <div className="space-around" >
                        <h2>Time interval</h2>
                            <select value={ queryParams.interval } onChange={ handleIntervalChange } title="Time interval">
                                <option value="MAX_SLACK">Slack & Max Flood / Ebb</option>
                                <option value="30">30 Minutes</option>
                                <option value="60">1 Hour</option>
                            </select>
                    </div>
                    <div className="container" >
                        <div className="space-around">
                            <div className="border">

                                <h2 id="forecast" >Forecast</h2>
                                <div id="day-picker" className="side-by-side">
                                    <button className="btn btn-primary" onClick={ handleIndexDec }>{"<"}</button>
                                    <div>
                                        <h4>{ weather.isLoading ? "" : weather.forecastDaily[Number(dailyIdx)].name }</h4>
                                    </div>
                                    <button className="btn btn-primary" onClick={ handleIndexInc }>{">"}</button>
                                </div>
                                
                                <p>{ weather.isLoading ? "Loading forecast..." : detailedForecast }</p>
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
                            {
                                currents?.map((current, key) => <Current 
                                                                    current={ current } 
                                                                    weather={ weather }
                                                                    key={ key }
                                                                />)
                            }
                        </tbody>
                    </table>
                </div> :


                
                <div>
                    <table>
                        <thead>
                            <tr>
                                <th>Time</th>
                                <th>Speed</th>
                                <th>Direction</th>
                                <th>Forecast</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                weather.forecastHourly?.map((weather, key) => <Weather 
                                                                    weather={ weather }
                                                                    key={ key }
                                                                />)
                            }
                        </tbody>
                    </table>
                </div>
            }
            <p>Data is fetched from NOAA Tides and Currents API</p>
            <p>Created by: Luke Scheinhorn</p>
        </div>
    )
}


