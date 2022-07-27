import Current from '../Current'
import Weather from '../Weather'

import './style.css'
import { useEffect, useState, useRef } from 'react'
import Clock from 'react-live-clock'
import { retryCall, getDay, getMonth } from "../helper"

export default function Data () {
    const [ currents, setCurrents ] = useState()
    const [ dateRefreshed ] = useState(new Date())
    const [ userLocation, setUserLocation ] = useState()
    const [ domain ] = useState( "https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?" )
    const [ weather, setWeather ] = useState({isLoading: true})
    const [ isMounted, setIsMounted ] = useState(false)
    const [ dataDate, setDataDate ] = useState()
    const [ dataDateStr, setDataDateStr ] = useState()
    const [ detailedForecast, setDetailedForecast ] = useState()
    const [ localForecastInfo, setLocalForecastInfo ] = useState()
    const [ dataType, setDataType ] = useState("Currents")


    const [queryParams, setQueryParams] = useState({
        begin_date: null,
        end_date: null,
        range: null,
        date: "today",
        station: "HUR0611",
        stationStr: "George Washington Bridge",
        product: "currents_predictions",
        units: "english",
        time_zone: "lst_ldt",
        application: "luke_scheinhorn",
        format: "json",
        interval: "MAX_SLACK"
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
            const start = new Date()
            let end
            let data = await fetch(getCurrentUrl())
                .then(response => response.json())
                .then(json => json);
            data = data["current_predictions"]["cp"]
            setCurrents(data)
            end = new Date()
            console.log("getCurrents takes ", end.getTime() - start.getTime())

        }


        const getLocation = () => {
            const start = new Date()
            let end
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(setPosition, showError)
            } else {
                alert("Geolocation is not supported by this browser.")
            }
            end = new Date()
            console.log("getLocation takes ", end.getTime() - start.getTime())
        }
        
        const setPosition = (position) => {
            setUserLocation(position.coords)
        }

        const showError = (error) => {
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    alert("User denied the request for Geolocation.")
                    break;
                case error.POSITION_UNAVAILABLE:
                    alert("Location information is unavailable.")
                    break;
                case error.TIMEOUT:
                    alert("The request to get user location timed out.")
                    break;
                case error.UNKNOWN_ERROR:
                    alert("An unknown error occurred.")
                    break;
                default:
                    alert("error")
            }
        }

        getLocation()

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
        if ( value === "NYH1927") {
            stationStr = "Hudson River Entrance"
        } else if ( value === "NYH1928") {
            stationStr = "Hudson River, Pier 92"
        } else if ( value === "ACT3656") {
            stationStr = "Grants Tomb"
        } else if ( value === "NYH1930") {
            stationStr = "George Washington Bridge"
        } else if ( value === "NYH1930") {
            stationStr = "Spuyten Duyvil"
        } else if ( value === "ACT3671") {
            stationStr = "Riverdale"
        }
        setQueryParams( prevState => {
            return {
                ...prevState,
                station: value,
                stationStr: stationStr
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
        if (!isMounted) {
            return
        }
        const getWeather = async () => {
            const start = new Date()
            let end
            await fetch(`https://api.weather.gov/points/${userLocation.latitude},${userLocation.longitude}`)
                .then(response => {
                    if (!response.ok) {
                        throw Error(response.statusText);
                    } else {
                        return response.json()
                    }
                })
                .then(json => {
                    setLocalForecastInfo(json)
                    end = new Date()
                    console.log("getWeather takes ", end.getTime() - start.getTime())
                })
                .catch(error => {
                    console.log(`There was an error fetching weather. Error message: ${error}`)
                })
        }
        getWeather()
        
        if ( !localForecastInfo ) {
            retryCall(getWeather, localForecastInfo, "localForecaseInfo")
        }

    }, [userLocation] )


    
    
    useEffect( () => {
        if (!isMounted) {
            return
        }

        let dailyUrl = localForecastInfo["properties"]["forecast"]
        let hourlyUrl = localForecastInfo["properties"]["forecastHourly"]

        const getForecast = async () => {

            const getForecastHourly = () => {
                const start = new Date()
                let end
                fetch(hourlyUrl)
                    .then(response => {
                        if (!response.ok) {
                            throw Error(response.statusText);
                        } else {
                            return response.json()
                        }
                    })
                    .then(json => {
                        console.log("json hourly", json)
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

                end = new Date()
                console.log("getForecastHourly takes ", end.getTime() - start.getTime())

            }

            getForecastHourly()


            if ( !weather.forecastHourly ) {
                retryCall(getForecastHourly, weather.forecastHourly, "weather.forecastHourly")
            }


           
           
            const getForecastDaily = () => {
                const start = new Date()
                let end
                fetch(dailyUrl)
                    .then(response => {
                        if (!response.ok) {
                            throw Error(response.statusText);
                        } else {
                            return response.json()
                        }
                    })
                    .then(json => {
                        console.log("json daily", json)
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

                
                end = new Date()
                console.log("getForecastDaily takes ", end.getTime() - start.getTime())

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
        const dataTypes = ["Currents", "Wind"]
        for ( let i = 0 ; i < dataTypes.length ; i++ ) {
            if ( dataTypes[i] === dataType ) {
                if ( i === dataTypes.length - 1 ) {
                    setDataType( dataTypes[0])
                } else {
                    setDataType( dataTypes[ i + 1 ])
                }
            }
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
            <h1>Predicted Currents</h1>
            <div className="space-around">
                <h2>Station</h2>
                <select value={ queryParams.station } onChange={ handleStationChange } title="Station">
                    <option value="NYH1927">Hudson River Entrance Depth: 7 feet</option>
                    <option value="NYH1928">Hudson River, Pier 92 Depth: 6 feet</option>
                    <option value="ACT3656">Grants Tomb Depth: 18 feet</option>
                    <option value="HUR0611">George Washington Bridge Depth: 14 feet</option>
                    <option value="NYH1930">Spuyten Duyvil Depth: 9 feet</option>
                    <option value="ACT3671">Riverdale</option>
                </select>
                <p>Pier 92 is closest to Pier 66</p>
            </div>
            <div className="border">
                <div className="side-by-side">
                    <div className="container">
                        <h3>Last refresh: </h3>
                        <Clock format={'ddd MMM D'} timezone={'US/Eastern'}></Clock>
                        <div>
                            <Clock format={'h:mm a'} timezone={'US/Eastern'}></Clock>
                        </div>                
                        <div>
                            <button className="btn btn-primary" onClick={ reload }>Refresh</button>
                        </div>
                    </div>
                    <div className="container">
                        <h3>Current date:</h3>
                        <div>
                            <Clock format={'ddd MMM D'} ticking={true} timezone={'US/Eastern'}></Clock>
                        </div>
                        <div>
                            <Clock className="large-bold" format={'h:mm a'} ticking={true} timezone={'US/Eastern'}></Clock>
                        </div>
                    </div>
                </div>
                
            </div>
            
            <div className="container">
                <div id="day-picker" className="side-by-side">
                    <button className="btn btn-primary" onClick={ handleIndexDec }>{"<"}</button>
                    <div>
                        <h4>{ weather.isLoading ? "" : weather.forecastDaily[Number(dailyIdx)].name }</h4>
                    </div>
                    <button className="btn btn-primary" onClick={ handleIndexInc }>{">"}</button>
                </div>
                
                <p>{ weather.isLoading ? "Loading forecast..." : detailedForecast }</p>
                
            </div>
            {/*<input id="bdate" type="date" value="2017-06-01"></input>*/}


            <div className="container">
                <div id="day-picker" className="side-by-side">
                    <button className="btn btn-primary" onClick={ handleDataToggle }>{"<"}</button>
                    <div>
                        <h4>{ dataType }</h4>
                    </div>
                    <button className="btn btn-primary" onClick={ handleDataToggle }>{">"}</button>
                </div>                
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
                    
                    <h4>After 8:00 pm data below will be for the following day</h4>
                    <table className="table">
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
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Time</th>
                                <th>Speed</th>
                                <th>Direction)</th>
                                <th>Forecast)</th>

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
            
        </div>
    )
}


