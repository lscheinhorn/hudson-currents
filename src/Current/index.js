import { useEffect, useState, useRef } from 'react'
import './style.css'

export default function Current (props) {
    const { current, weather } = props
    const [ hourlyWeather, setHourlyWeather ] = useState()
    const [ windSpeed, setWindSpeed ] = useState("NA")
    const [ windDirection, setWindDirection ] = useState("NA")
    const [ shortForecast, setShortForecast ] = useState()

    const [ hour, setHour ] = useState()
    const [ isMounted, setIsMounted ] = useState(false)
    const [ currentData, setCurrentData ] = useState({velocity: ''})

    useEffect(() => {
        if(!isMounted) {
            return
        }

        const getDate = () => {
            let arr = current.Time.split(/-|\s|:/)
            let date = new Date(arr[0], arr[1] -1, arr[2], arr[3], arr[4])
            return date
        }
        const date = getDate()
        let meridian
        const getHours = () => {
            let hours = date.getHours()
            if ( hours < 13 ) {
                meridian = hours !== 12 ? "am" : "pm"
                if ( hours < 1 ) {
                    hours = 12
                }
                return hours
            } else {
                hours -= 12
                meridian = "pm"
                return hours
            }
        }

        setCurrentData({
            timeString: getHours() + ":" + (date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes()) + " " + meridian,
            type: current.Type,
            velocity: current.Velocity_Major
        })

    }, [current])

    useEffect(() => {
        if(!isMounted) {
            return
        }

        const getCurrentType = () => {
            if ( currentData.velocity < -0.1 ) {
                return "ebb"
            } else if ( currentData.velocity > 0.1 ) {
                return "flood"
            } else {
                return "slack"
            }
        }

        const getCurrentSpeed = () => {
            if ( currentData.velocity < 0.1 && currentData.velocity > -0.1) {
                return ""
            } else {
                return Math.abs(currentData.velocity)
            }
        }

        // const getPrompt = () => {
        //     // const getDay = () => {
        //     //     const now = new Date()
        //     //     if ( now.getDate() === date.getDate() ) {
        //     //         return "Today"
        //     //     } else if (now.getDate() === date.getDate() - 1 ) {
        //     //         return "Tomorrow"
        //     //     } else {
        //     //         return date.getDate()
        //     //     }
        //     // }
        //     // const day = getDay()

            

        //     // const getCurrentTypePromptString = () => {
        //     //     if (currentData.currentType === "slack") {
        //     //         return "slack tide"
        //     //     } else if (currentData.currentType === "flood") {
        //     //         return "flooding at "
        //     //     } else if (currentData.currentType === "ebb") {
        //     //         return "ebbing at "
        //     //     } else {
        //     //         return "no current reported"
        //     //     }
        //     // }

        //     return `At ${currentData.timeString} it is ${currentData.currentType}${currentData.currentSpeed} knots`
        // }
        setCurrentData(prev => {
               return {
                ...prev,
                currentType: getCurrentType(),
                currentSpeed: getCurrentSpeed(),
                // prompt: getPrompt() 
               } 

            }
        )

        console.log("currentData", currentData)
    }, [ currentData.velocity ])

    useEffect(() => {
        if(!isMounted) {            
            return
        }

        const getTimeStamp = (time) => {
            const date = new Date(time)
            const timeStamp = date.getTime()
            return timeStamp
        }
        if ( weather.forecastHourly && current.Time ) {
            const currentWeather = weather.forecastHourly.filter(({ startTime }) => {
                const startTimeTimeStamp = getTimeStamp(startTime)
                const currentTimeTimeStamp = getTimeStamp(current.Time)
                return Math.abs(startTimeTimeStamp - currentTimeTimeStamp) < 1500000 
            })

            setHourlyWeather(currentWeather[0])

        }
       
        
        // if ( hourlyWeather ) {
        //     console.log("hourlyWeather", hourlyWeather)

        // }
        // console.log("weather.forecastHourly current.Time useEffect", hourlyWeather)

    }, [weather.forecastHourly, current.Time])

    useEffect(() => {
        if (!isMounted) {
            return
        }

        if( hourlyWeather) {
            setWindSpeed(hourlyWeather.windSpeed)
            setWindDirection(hourlyWeather.windDirection)
            setHour(hourlyWeather.startTime)
            setShortForecast(hourlyWeather.shortForecast)

        } else {
            setWindSpeed()
            setWindDirection()
            setHour()
            setShortForecast()
            setHour()
        }
        console.log("windSpeed", windSpeed, "hourlyWeather", hourlyWeather)
        
    }, [hourlyWeather])


    useEffect(() => {
        setIsMounted(true)
    }, [])

    return (
        <tr className="current" >
            <td>{ currentData.timeString ? currentData.timeString : "..." }</td>
            <td>{ currentData.type ? currentData.type : currentData.currentType }</td>
            <td>{ currentData.currentSpeed }</td>
            <td>{ windSpeed }</td>
            <td>{ windDirection }</td>
            {/*<td>{ shortForecast }</td>*/}

        </tr>
    )
}