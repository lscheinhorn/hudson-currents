import Current from '../Current'
import Weather from '../Weather'

import './style.css'
import { useEffect, useState, useRef } from 'react'
import Clock from 'react-live-clock'
import { retryCall, getDay, getMonth, getYear, getTimeStr, getDateTime, getNowStr } from "../helper"

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
        station: "NYH1928",
        stationStr: "Hudson River, Pier 92",
        product: "currents_predictions",
        units: "english",
        time_zone: "lst_ldt",
        application: "luke_scheinhorn",
        format: "json",
        interval: "MAX_SLACK",
        latitude: "40.7707",
        longitude: "-74.0028"
    })

    const now = new Date()
    const [ refreshTime, setRefreshTime ] = useState({
        time: getNowStr(now),
        day: getDay(now, "short"),
        month: getMonth(now),
        year: getYear(now),
        date: now.getDate(),
        string: getDay(now, "short") + " " + getMonth(now) + " " + now.getDate() + ", " + getYear(now) + " " + getNowStr(now)
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
        if ( value === "n03020") {
            stationStr = " The Narrows Depth: 11 feet"
            latitude = "40.6064"
            longitude = "-74.0380"
        } else if ( value === "NYH1920") {
            stationStr = "Brooklyn Bridge Depth: 8 feet"
            latitude = "40.7060"
            longitude = "-73.9977"
        } else if ( value === "ACT3621") {
            stationStr = "Bay Ridge, west of, Depth: 22 feet"
            latitude = "40.6257"
            longitude = "-74.0540"
        } else 
        if ( value === "NYH1917") {
            stationStr = "Gowanus Bay Entrance Depth: 15 feet"
            latitude = "40.6625"
            longitude = "-74.0181"
        } else if ( value === "NYH1918") {
            stationStr = "Red Hook Channel Depth: 3 feet"
            latitude = "40.6723"
            longitude = "-74.0239"
        } else if ( value === "NYH1915") {
            stationStr = "Robbins Reef Light, 0.6 nm E of, Depth: 11 feet"
            latitude = "40.6552"
            longitude = "-74.0507"
        } else if ( value === "NYH1914") {
            stationStr = "Constable Hook Approach Depth: 9 feet"
            latitude = "40.6507"
            longitude = "-74.0606"
        } else if ( value === "n05010") {
            stationStr = "Gowanus Flats LBB 32, Depth: 11 feet"
            latitude = "40.6721"
            longitude = "-74.0399"
        } else if ( value === "ACT3646") {
            stationStr = "Statue of Liberty, east of"
            latitude = "40.6900"
            longitude = "-74.0300"
        } else if ( value === "NYH1919") {
            stationStr = "Dimond Reef Depth: 11 feet"
            latitude = "40.6979"
            longitude = "-74.0213"
        } else if ( value === "NYH1927") {
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
                        console.log("There was an error fetching weather", response.statusText)
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
                            alert("The server is unable to provide hourly weather data right now. Please try again later.")
                            console.log("There was a problem fetching your hourly forcast. Error message...", response.status)
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
            if( queryParams.interval !== "MAX_SLACK") {
                setDailyIndex(0)
                return {
                ...prev,
                begin_date: null,
                end_date: null,
                date: "today"
                }
            } else {
                return {
                    ...prev,
                    begin_date: beginDate,
                    date: null
                }
            }
            
        })

    }, [weather.forecastDaily, dailyIdx, queryParams.interval, weather.isLoading ])

    useEffect(() => {
        if(isMounted) {
            console.log("detailedForecast", detailedForecast)
        }
    }, [detailedForecast])

    useEffect(() => {
        setIsMounted(true)
    }, [])

    const isEarlier = (date) => {
        const now = new Date()
        const dataObj = new Date(date)
        const nowTimeStamp = now.getTime()
        const dataTimeStamp = dataObj.getTime()
        const nowDate = now.getDate()
        const dataDate = dataObj.getDate()
        return nowTimeStamp > dataTimeStamp
    }

    const [ tides, setTides ] = useState({
        prevTide: {
            time: null,
            tide: "Loading"
        },
        nextTide: {
            time: null,
            tide: "Loading"
        }
    })

    useEffect(() => {
        if ( !currents ) {
            return
        }
        const now = new Date()
        const nowTime = now.getTime()
        const today = now.getDate()
        const currentTime = new Date(currents[0].Time)
        const currentDay = currentTime.getDate()
        if(!isMounted || queryParams.date !== ("today" || null) || currentDay !== today ) {
            !isMounted ? console.log("isMounted") : queryParams.date !== ("today" || null) ? console.log(`date not today date = ${queryParams.date}`) : currentDay !== today  ? console.log("day not today") : console.log("None of the above")
            return
        }
        const nullObj = {
            Tide: null,
            Time: null
        }

        const getPrevTide = () => {
           
            for ( let i = 0; i < currents.length ; i++ ) {
                const time = new Date(currents[i].Time)
                const timeStamp = time.getTime()
                if ( timeStamp > nowTime ) {
                    if ( i === 0 ) {
                        if ( currents[ i ] === "slack" ) {
                            return  nullObj
                        }
                    }
                    if ( currents[ i - 1 ].Type === "slack" ) {
                        if ( !currents[ i - 2 ]) {
                            return nullObj
                        }
                        return currents[ i - 2 ]
                    }
                    return currents[ i - 1 ]
                } 
            }
            if ( currents[currents.length - 1].Type === "slack" ) {
                return currents[currents.length - 2]
            }
            return currents[currents.length - 1]
        }
    
        const getNextTide = () => {
            const now = new Date()
            const nowTime = now.getTime()
            for ( let i = 0; i < currents.length ; i++ ) {
                const time = new Date(currents[i].Time)
                const timeStamp = time.getTime()
                if ( timeStamp > nowTime ) {
                    if ( currents[ i ].Type === "slack" ) {
                        if ( currents[ i + 1 ] === undefined ) {
                            return nullObj
                        }
                        return currents[ i + 1 ]
                    }
                    return currents[ i ]
                } 
            }
            if ( currents[currents.length - 1].Type === "slack" ) {
                return nullObj
            }
            return currents[currents.length - 1]
        }

        setTides({
            prevTide: {
                time: getPrevTide().Time === null ? null : getTimeStr(getPrevTide().Time),
                tide: getPrevTide().Time === null ? null : (getPrevTide().Type === "flood" ? "HIGH" : "LOW")
            },
            nextTide: {
                time: getNextTide().Time === null ? null : getTimeStr(getNextTide().Time),
                tide: getNextTide().Time === null ? null : (getNextTide().Type === "flood" ? "HIGH" : "LOW")
            }
        })

    }, [currents, queryParams.date]  )
    
    return (
        <div className="data" >
            
            { dataType === "Currents" ? 
                <h1>Hudson River Currents</h1> : 
                <h1>Hudson River Wind</h1>
            }
            
            <div className="space-around">
                <h2>Station</h2>
                <select value={ queryParams.station } onChange={ handleStationChange } title="Station">
                    <option value="n03020">The Narrows</option>
                    <option value="NYH1920">Brooklyn Bridge</option>
                    <option value="ACT3621">Bay Ridge, west of</option>
                    <option value="NYH1917">Gowanus Bay Entrance</option>
                    <option value="NYH1918">Red Hook Channel Depth: 3 feet</option>
                    <option value="NYH1915">Robbins Reef Light</option>
                    <option value="NYH1914">Constable Hook Approach</option>
                    <option value="n05010">Gowanus Flats LBB 32</option>
                    <option value="ACT3646">Statue of Liberty, east of</option>
                    <option value="NYH1919">Dimond Reef</option>
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
            <a className="btn btn-primary" href={`http://www.google.com/maps/place/${queryParams.latitude},${queryParams.longitude}/@${queryParams.latitude},${queryParams.longitude},13z`} target="_blank" rel="noreferrer" >VIEW STATION LOCATION</a>

            

            {
                tides.prevTide.time || tides.nextTide.time ? (
                    <div className="container" >
                        <div className="space-around">
                            <p>{refreshTime.string}</p>
                            <div className="border">
                                <h2 id="forecast" >Tides</h2>
                                <div className="space-around">
                                    <p>{tides.prevTide.tide === null ? "The last tide was yesterday." :`Previous: ${tides.prevTide.tide} - ${tides.prevTide.time}`}</p>
                                    <p>{ tides.nextTide.tide === null ? "The next tide is tomorrow." : `Next: ${tides.nextTide.tide} - ${tides.nextTide.time}`}</p>
                                </div>
                            </div>
                        </div>
                    </div>   
                ) : null
            }

            
                    
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
                                    {queryParams.interval === "MAX_SLACK" ? <button aria-label="Back 12 hours" className="btn btn-primary" onClick={ handleIndexDec }>{"<"}</button> : null }
                                    
                                    <div className="center">
                                        <h4>{ weather.isLoading ? "" : weather.forecastDaily[Number(dailyIdx)].name }</h4>
                                    </div>
                                    {queryParams.interval === "MAX_SLACK" ? <button aria-label="Forward 12 hours" className="btn btn-primary" onClick={ handleIndexInc }>{">"}</button> : null }

                                    
                                </div>
                                
                                <p>{ weather.isLoading ? "Loading forecast..." : detailedForecast }</p>
                            </div>
                        </div>
                        <div className="container">
                            <div id="day-picker" className="side-by-side">
                                <button className="btn btn-primary" onClick={ handleDataToggle }>Get { dataTypeInactive }</button>
                                <button className="btn btn-primary" onClick={ reload }>{"Refresh"}</button>
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
                                currents?.map((current, index, array, length = array.length) => {
                                    const currentPrev = array[index-1]
                                    const currentNext = array[index+1]
                                    console.log("length", length, array)
                                    if (index > length-2 ? false : (isEarlier(currentNext.Time) ? currentNext.Type !== "slack" : false) ) {
                                        console.log("index", index)
                                        return null
                                   } 
                                   console.log("return current", current)
                                    return (
                                        <Current 
                                            current={ current } 
                                            weather={ weather }
                                            key={ index }
                                        />
                                    )
                                })
                            }
                        </tbody>
                    </table>
                </div> :

                
                
                <div>
                    <div className="container" >
                        <div className="space-around">
                            <div className="border">

                                <h2 id="forecast" >Forecast</h2>
                                <div id="day-picker" className="side-by-side">
                                    <button aria-label="Back 12 hours" className="btn btn-primary" onClick={ handleIndexDec }>{"<"}</button>
                                    <div>
                                        <h4>{ weather.isLoading ? "" : weather.forecastDaily[Number(dailyIdx)].name }</h4>
                                    </div>
                                    <button aria-label="Forward 12 hours" className="btn btn-primary" onClick={ handleIndexInc }>{">"}</button>
                                </div>
                                
                                <p>{ weather.isLoading ? "Loading forecast..." : detailedForecast }</p>
                            </div>
                        </div>
                        <div className="container">
                            <div id="day-picker" className="side-by-side">
                                <button className="btn btn-primary" onClick={ handleDataToggle }>Get { dataTypeInactive }</button>
                                <button className="btn btn-primary" onClick={ reload }>{"Refresh"}</button>
                            </div>                
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
                                {
                                    weather.forecastHourly?.map((weather, key) => <Weather 
                                                                        weather={ weather }
                                                                        key={ key }
                                                                    />)
                                }
                            </tbody>
                        </table>
                    </div>
                </div>
            }
            <p>Data is fetched from NOAA Tides and Currents API</p>
            <p>Created by: Luke Scheinhorn</p>
        </div>
    )
}


