import Current from '../Current'
import './style.css'
import { useEffect, useState, useRef } from 'react'
import Clock from 'react-live-clock'

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

    const [queryParams, setQueryParams] = useState({
        begin_date: null,
        end_date: null,
        range: null,
        date: "today",
        station: "HUR0611",
        product: "currents_predictions",
        units: "english",
        time_zone: "lst_ldt",
        application: "luke_scheinhorn",
        format: "json",
        interval: "MAX_SLACK"
    })


        const getDay = (date) => {
            let day
            switch ( date.getDay() ) {
                case 0:
                    day = "Sunday"
                    break
                case 1:
                    day = "Monday"
                    break
                case 2:
                    day = "Tuesday"
                    break
                case 3:
                    day = "Wednesday"
                    break
                case 4:
                    day = "Thursday"
                    break
                case 5:
                    day = "Friday"
                    break
                case 6:
                    day = "Saturday"
                    break
                default:
                    day = ""
            }
            return day
        }
    
        const getMonth = (date) => {
            let month
            switch ( date.getMonth() ) {
                case 0:
                    month = "January"
                    break
                case 1:
                    month = "Febuary"
                    break
                case 2:
                    month = "March"
                    break
                case 3:
                    month = "April"
                    break
                case 4:
                    month = "May"
                    break
                case 5:
                    month = "June"
                    break
                case 6:
                    month = "July"
                    break
                case 7:
                    month = "August"
                    break
                case 8:
                    month = "September"
                    break
                case 9:
                    month = "October"
                    break
                case 10:
                    month = "November"
                    break
                case 11:
                    month = "December"
                    break
                default:
                    month = ""
            }
            return month
        }
    
        // const getYear = (date) => {
        //     const year = date.getFullYear().toString()
        //     return year
        // }
    
        

        // const getDateTime = () => {
        //     const now = new Date()
        //     const year = now.getFullYear()
        //     const month = (now.getMonth() + 1) < 10 ? "0" + (now.getMonth() + 1) : (now.getMonth() + 1)
        //     const day = now.getDate()
        //     const hour = now.getHours() < 10 ? "0" + now.getHours() : now.getHours()
        //     const min = now.getMinutes()
        //     const currentDate = month + '/' + day + '/' + year + '+' + hour + ':' + min
        //     return currentDate
        // }
        
        // const nowString = getDateTime()


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


        const getLocation = () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(setPosition, showError)
            } else {
                alert("Geolocation is not supported by this browser.")
            }
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
        console.log(userLocation)
        const getWeather = async () => {
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
                })
        }
        getWeather()
    }, [userLocation] )


    const [ localForecastInfo, setLocalForecastInfo ] = useState()
    
    
    useEffect( () => {
        if (!isMounted) {
            return
        }

        let dailyUrl = localForecastInfo["properties"]["forecast"]
        let hourlyUrl = localForecastInfo["properties"]["forecastHourly"]

        const getForecast = async () => {

            let forecastHourly = await fetch(hourlyUrl)
                .then(response => {
                    if (!response.ok) {
                        throw Error(response.statusText);
                    } else {
                        return response.json()
                    }
                })
                .then(json => {
                    console.log("json hourly", json)
                    return json
                });
                forecastHourly = forecastHourly["properties"]["periods"]
            let forecastDaily = await fetch(dailyUrl)
                .then(response => {
                    if (!response.ok) {
                        throw Error(response.statusText);
                    } else {
                        return response.json()
                    }
                })
                .then(json => {
                    console.log("json daily", json)
                    return json
                });
            forecastDaily = forecastDaily.properties.periods
            setWeather({
                isLoading: false,
                forecastDaily,
                forecastHourly
            })
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

    useEffect(() => {
        if(weather.isLoading) {
            return
        }
        // const getDetailedForecast = () => {
        //     const filtered = weather.forecastDaily.filter(element => element.name === getDay(dataDate))
        //     console.log('filtered', filtered)
        //     return filtered[0].detailedForecast
        // }
        setDetailedForecast(weather.forecastDaily[Number(dailyIdx)].detailedForecast)
        // console.log('weatherObj', weather)
        console.log('forecastDaily', detailedForecast)

    }, [weather.forecastDaily, dailyIdx])

    useEffect(() => {
        setIsMounted(true)
    }, [])

    return (
        <div className="data" >
            <h1>Predicted Currents</h1>
            <h2>Station: George Washington Bridge</h2>
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
            <div className="space-around">
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
                        <th>Wind</th>
                        <th>Direction</th>
                        {/*<th>Forecast</th>*/}

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
        </div>
    )
}


