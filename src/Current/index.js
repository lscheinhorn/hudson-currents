import { useEffect, useState, useRef } from 'react'
import { getDay } from "../helper"
import './style.css'

export default function Current (props) {
    const { current, weather } = props

    const getDate = () => {
        let arr = current.Time.split(/-|\s|:/)
        let date = new Date(arr[0], arr[1] -1, arr[2], arr[3], arr[4])
        return date
    }
    const date = getDate()
    const day = getDay(date, true)
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
    const timeString = getHours() + ":" + (date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes()) + " " + meridian
    const type = current.Type
    const velocity = current.Velocity_Major

    const getTimeStamp = (time) => {
        const date = new Date(time)
        const timeStamp = date.getTime()
        return timeStamp
    }
    // let currentWeather
    // let hourlyWeather 
    // let windSpeed 
    // let windDirection 
    // let shortForecast 

    // useEffect(() => {
    //     currentWeather = weather.forecastHourly.filter(({ startTime }) => {
    //         const startTimeTimeStamp = getTimeStamp(startTime)
    //         const currentTimeTimeStamp = getTimeStamp(current.Time)
    //         return Math.abs(startTimeTimeStamp - currentTimeTimeStamp) < 1500000 
    //     })
    //     hourlyWeather = currentWeather[0]
    //     windSpeed = hourlyWeather.windSpeed
    //     windDirection = hourlyWeather.windDirection
    //     shortForecast = hourlyWeather.shortForecast
    
    // }, [weather.forecastHourly, current.Time])
    




    const getCurrentType = () => {
        if ( velocity < -0.1 ) {
            return "ebb"
        } else if ( velocity > 0.1 ) {
            return "flood"
        } else {
            return "slack"
        }
    }

    let currentType = getCurrentType()


    const getCurrentSpeed = () => {
        if ( velocity < 0.1 && velocity > -0.1) {
            return ""
        } else {
            return Math.abs(velocity)

        }
    }

    let currentSpeed = getCurrentSpeed()


    // <td>{ windSpeed }</td>
    //         <td>{ windDirection }</td>
    //         <td>{ shortForecast }</td>

    return (
        <tr className="current" >
            <td>{ `${day} ${timeString}` }</td>
            <td>{ type ? type : currentType }</td>
            <td>{ currentSpeed }</td>
        </tr>
    )
}