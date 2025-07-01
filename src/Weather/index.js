import { getDay } from "../helper";
import "./style.css";

export default function Weather(props) {
  const { weather } = props;

  // Create a Date object from the forecast period's startTime.
  const date = new Date(weather.startTime);

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

  // Updated conversion function using parseFloat to handle strings like "10 mph".
  const mphToKnots = (speed) => {
    if (!speed) return "N/A";
    // Use parseFloat to extract the numeric part of the wind speed.
    const num = parseFloat(speed);
    if (isNaN(num)) return "N/A";
    return Math.round(num / 1.151);
  };

  return (
    <tr className="current">
      <td>{`${day} ${timeString}`}</td>
      <td>{mphToKnots(weather.windSpeed)}</td>
      <td>{weather.windDirection}</td>
      <td>{weather.shortForecast}</td>
      <td>{`${weather.temperature}°${weather.temperatureUnit}`}</td>
      <td>
        {weather.probabilityOfPrecipitation
          ? `${weather.probabilityOfPrecipitation.value}%`
          : "N/A"}
      </td>
    </tr>
  );
}