import './style.css'

export default function Current (props) {
    const { current } = props

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
    const timeString = getHours() + ":" + (date.getMinutes() < 10 ? date.getMinutes() + "0" : date.getMinutes()) + " " + meridian
    const type = current.Type
    const velocity = current.Velocity_Major
    let currentType
    let currentSpeed


    const getPrompt = () => {
        const getDay = () => {
            const now = new Date()
            if ( now.getDate() === date.getDate() ) {
                return "Today"
            } else if (now.getDate() === date.getDate() - 1 ) {
                return "Tomorrow"
            } else {
                return date.getDate()
            }
        }
        const day = getDay()

        const getCurrentType = () => {
            if ( velocity < -0.1 ) {
                return "ebb"
            } else if ( velocity > 0.1 ) {
                return "flood"
            } else {
                return "slack"
            }
        }

        currentType = getCurrentType()

        const getCurrentTypePromptString = () => {
            if (currentType === "slack") {
                return "slack tide"
            } else if (currentType === "flood") {
                return "flooding at "
            } else if (currentType === "ebb") {
                return "ebbing at "
            } else {
                return "no current reported"
            }
        }

        const getCurrentSpeed = () => {
            if ( velocity < 0.1 && velocity > -0.1) {
                return ""
            } else {
                return Math.abs(velocity) + " knots"
            }
        }

        currentSpeed = getCurrentSpeed()

        return `At ${timeString} it is ${currentType}${currentSpeed}`
    }
    
    const prompt = getPrompt()

    return (
        <tr className="current" >
            <td>{ timeString }</td>
            <td>{ type ? type : currentType }</td>
            <td>{ currentSpeed }</td>
        </tr>
    )
}