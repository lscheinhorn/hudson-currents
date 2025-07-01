import { getDay } from "../helper";
import "./style.css";

export default function Current(props) {
  const { current, weather } = props;

  // Parse the current.Time string into a Date object.
  // Adjust the parsing logic if your date format is nonstandard.
  const date = new Date(current.Time);

  // Helper function to format the time string.
  const formatTime = (date) => {
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const meridian = hours >= 12 ? "pm" : "am";
    if (hours > 12) {
      hours -= 12;
    } else if (hours === 0) {
      hours = 12;
    }
    return `${hours}:${minutes} ${meridian}`;
  };

  const timeString = formatTime(date);
  const day = getDay(date, true);

  // Convert velocity to a number.
  const velocity = Number(current.Velocity_Major);

  const getCurrentType = () => {
    if (velocity < -0.1) {
      return "ebb";
    } else if (velocity > 0.1) {
      return "flood";
    } else {
      return "slack";
    }
  };

  // Use the provided Type if available, otherwise compute it.
  const currentType = current.Type || getCurrentType();
  const currentSpeed = Math.abs(velocity) > 0.1 ? Math.abs(velocity) : "";

  return (
    <tr className="current">
      <td>{`${day} ${timeString}`}</td>
      <td>{currentType}</td>
      <td>{currentSpeed}</td>
    </tr>
  );
}