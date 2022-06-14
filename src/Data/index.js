import Current from '../Current'
import './style.css'
import { useEffect, useState } from 'react'

export default function Data () {
    const [ currents, setCurrents ] = useState()

    useEffect(() => {
        const getDateTime = () => {
            const now = new Date()
            const year = now.getFullYear()
            const month = (now.getMonth() + 1) < 10 ? "0" + (now.getMonth() + 1) : (now.getMonth() + 1)
            const day = now.getDate()
            const hour = now.getHours()
            const min = now.getMinutes()
            const date = month + '/' + day + '/' + year + '+' + hour + ':' + min
            return date
        }
        
        const now = getDateTime()

        const queryParams = {
            begin_date: now,
            range: "24",
            station: "HUR0611",
            product: "currents_predictions",
            units: "english",
            time_zone: "lst_ldt",
            application: "luke_scheinhorn",
            format: "json",
            interval: "MAX_SLACK"
        }
    
        const getUrl = () => {
            let urlArr = ["https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?"]
            for ( const param in queryParams ) {
                urlArr.push(param)
                urlArr.push("=")
                urlArr.push(queryParams[param])
                urlArr.push("&")
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
    }, []
    )

    useEffect(() => {
        console.log(currents)
    },  [currents])

    return (
        <div className="data" >
        <h1>Predicted currents at the George Washington Bridge for the following 24 hours</h1>
            {
                currents?.map(current => <Current current={ current } key={current.Time}/>)
            }
        </div>
    )
}


