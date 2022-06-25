
export const retryCall = (callback, state, stateStr) => {
    let count = 0
    const retry = (callback, state, stateStr) => {
        
        setTimeout(() => {
            if ( state ) {
                console.log("retry successful", stateStr, state)
                return
            } else if ( count === 3 ) {
                console.log(`We can't load your ${stateStr} right now. You can check your location permissions or refresh the page`)
                return
            } else {
                count++
                console.log("retry callback", stateStr, state)
                callback()
                retry()
            }
        }, 10000)
        retry(callback, state, stateStr)
        console.log("retry", stateStr)
    }
    
}


export const getDay = (date) => {
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

export const getMonth = (date) => {
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

export const getYear = (date) => {
    const year = date.getFullYear().toString()
    return year
}



export const getDateTime = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = (now.getMonth() + 1) < 10 ? "0" + (now.getMonth() + 1) : (now.getMonth() + 1)
    const day = now.getDate()
    const hour = now.getHours() < 10 ? "0" + now.getHours() : now.getHours()
    const min = now.getMinutes()
    const currentDate = month + '/' + day + '/' + year + '+' + hour + ':' + min
    return currentDate
}
