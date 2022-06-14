import Current from '../Current'
import './style.css'
import { useEffect, useState } from 'react'

export default function Data () {
    const [ currents, setCurrents ] = useState()
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

    useEffect(() => {
        const getDateTime = () => {
            const now = new Date()
            const year = now.getFullYear()
            const month = (now.getMonth() + 1) < 10 ? "0" + (now.getMonth() + 1) : (now.getMonth() + 1)
            const day = now.getDate()
            const hour = now.getHours() < 10 ? "0" + now.getHours() : now.getHours()
            const min = now.getMinutes()
            const currentDate = month + '/' + day + '/' + year + '+' + hour + ':' + min
            return currentDate
        }
        
        const now = getDateTime()

        const getUrl = () => {
            let urlArr = ["https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?"]
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
            let data = await fetch(getUrl())
                .then(response => response.json())
                .then(json => json);
            data = data["current_predictions"]["cp"]
            setCurrents(data)
            console.log(currents)
        }

        getCurrents()
    }, [queryParams]
    )

    useEffect(() => {
        console.log(currents)
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

    const handleDateChange = ({ target }) => {
        const value = target.value
        setQueryParams( prevState => {
            return {
                ...prevState,
                date: value
            }
        })
    }

    return (
        <div className="data" >
        <h1>Today's predicted currents at the George Washington Bridge</h1>
            <select value={ queryParams.interval } onChange={ handleIntervalChange } title="Time interval">
                <option value="MAX_SLACK">Slack & Max Flodd / Ebb</option>
                <option value="30">30 Minutes</option>
                <option value="60">1 Hour</option>
            </select>
            {
                currents?.map(current => <Current current={ current } key={current.Time}/>)
            }
        </div>
    )
}


