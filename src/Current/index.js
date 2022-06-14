import './style.css'

export default function Current (props) {
    const { current } = props

    const time = current.Time
    const type = current.Type
    const velocity = current.Velocity_Major

    console.log("current", current)
    return (
        <div className="current" >
            <p>{time}: {type} at {velocity} knots</p>
        </div>
    )
}