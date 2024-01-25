const apiKey = 'd77e8a80bfcc7551c3135a39d716ce92';
let forecastDays = {};

function convertKelvinToCelsius(kelvin) {
    return Math.floor(kelvin - 273.15);
}

async function getCurrentWeather(city) {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`);
    const data = await response.json();
    return data;
}

async function getHourlyWeather(city) {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}`);
    const data = await response.json();
    return data;
}

async function get5DayForecast(city) {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}`);
    const data = await response.json();
    return data;
}

function updateWeatherUI(containerId, content) {
    const container = document.getElementById(containerId);
    container.style.display = content ? 'block' : 'none';
    container.innerHTML = content;
}

function formatHour(dateTime) {
    const date = new Date(dateTime);
    return date.toLocaleString('en-US', { hour: 'numeric', hour12: true });
}

function formatDay(dateTime) {
    const date = new Date(dateTime);
    return date.toLocaleString('en-US', { day: 'numeric', month: 'numeric', year: 'numeric' });
}

async function notFound(city) {
    const notFoundContent = `<h2>Weather data for ${city} not found. Please check the city name and try again.</h2>`;
    updateWeatherUI('notFound', notFoundContent);
    updateWeatherUI('currentWeather', '');
    updateWeatherUI('hourlyWeather', '');
}

async function handleSubmit() {
    const city = document.getElementById('cityInput').value || 'Odesa';

    try {
        const currentWeatherData = await getCurrentWeather(city);

        if (currentWeatherData.cod !== '404') {
            const weatherIcon = currentWeatherData.weather[0].icon;
            const currentWeatherContent = `<h2>Current Weather in <span style = "color: darkcyan">${currentWeatherData.name}, ${currentWeatherData.sys.country}</span></h2>
                                   <div style = "display: flex; justify-content: space-between; align-items: center; padding-right: 10%; padding-left: 15%">
                                   <div>
                                   <img src="http://openweathermap.org/img/wn/${weatherIcon}.png" class="weather-icon" alt="Weather Icon" style = "width: 100px; height: 100px">
                                   <p>${currentWeatherData.weather[0].description}</p>
                                   </div>
                                   <div>
                                   <p style = "font-size: 40px;"> ${convertKelvinToCelsius(currentWeatherData.main.temp)}°C</p>
                                   <p>Real Feel: ${convertKelvinToCelsius(currentWeatherData.main.feels_like)}°C</p>
                                   </div>
                                   <p style = "font-size: 30px;">Wind Speed: ${currentWeatherData.wind.speed} m/s</p>
                                   </div>
                                   `;

            const hourlyWeatherData = await getHourlyWeather(city);
            const hourlyDataSubset = hourlyWeatherData.list.slice(0, 5);

            const hourlyWeatherContent = `<h2>Hourly Weather</h2>
                                           <table>
                                               <tr>
                                                   ${hourlyDataSubset.map(entry => `<th>${formatHour(entry.dt_txt)}</th>`).join('')}
                                               </tr>
                                               <tr>
                                                   ${hourlyDataSubset.map(entry => `<td>
                                                       <img src="http://openweathermap.org/img/wn/${entry.weather[0].icon}.png" class="weather-icon" alt="Weather Icon"><br>
                                                       ${convertKelvinToCelsius(entry.main.temp)}°C<br>
                                                       Real Feel: ${convertKelvinToCelsius(entry.main.feels_like)}°C<br>
                                                       Wind Speed: ${entry.wind.speed} m/s<br>
                                                       Description: ${entry.weather[0].description}
                                                   </td>`).join('')}
                                               </tr>
                                           </table>`;
            updateWeatherUI('currentWeather', currentWeatherContent);
            updateWeatherUI('hourlyWeather', hourlyWeatherContent);
            updateWeatherUI('notFound', '');
            
        } else {
            notFound(city);
        }
    } catch (error) {
        console.error('Error fetching weather data:', error);
        notFound(city);
    }
    showToday();
}

function showToday() {
    var currentWeather = document.getElementById("currentWeather");
    var hourlyWeather = document.getElementById("hourlyWeather");
    var FiveDay = document.getElementById("5DayForecast");
    var forecastHourly = document.getElementById("forecastHourly");
    currentWeather.style.display = "block";
    hourlyWeather.style.display = "block";
    FiveDay.style.display = "none"
    forecastHourly.style.display = "none"
}

function show5DayForecast() {
    show5DayForecastData();
    var currentWeather = document.getElementById("currentWeather");
    var hourlyWeather = document.getElementById("hourlyWeather");
    var FiveDay = document.getElementById("5DayForecast");
    var forecastHourly = document.getElementById("forecastHourly");
    currentWeather.style.display = "none";
    hourlyWeather.style.display = "none";
    FiveDay.style.display = "block"
    forecastHourly.style.display = "block"
}

async function show5DayForecastData() {
    const city = document.getElementById('cityInput').value || 'Odesa';

    try {
        const forecastData = await get5DayForecast(city);

        if (forecastData.cod !== '404') {
            forecastDays = forecastData.list.reduce((acc, entry) => {
                const dateKey = formatDay(entry.dt_txt);
                if (!acc[dateKey]) {
                    acc[dateKey] = [];
                }
                acc[dateKey].push(entry);
                return acc;
            }, {});

            const today = Object.keys(forecastDays)[0];
            const next4Days = Object.keys(forecastDays).slice(1, 5);

            const forecastContent = `<h2>5-Day Forecast for ${city} </h2>
                                      <div id="forecastDays">
                                          <div class="day-card" onclick="showHourly('${today}')">
                                              <span>Today</span>
                                              <p><img src="http://openweathermap.org/img/wn/${forecastDays[today][0].weather[0].icon}.png" class="weather-icon" alt="Weather Icon" style = "width: 50px; height: 50px;"></p>
                                              <p>${convertKelvinToCelsius(forecastDays[today][0].main.temp)}°C</p>
                                              <p>${forecastDays[today][0].weather[0].description}</p>
                                          </div>
                                          ${next4Days.map(day => `
                                              <div class="day-card" onclick="showHourly('${day}')">
                                                  <span>${day}</span>
                                                  <p><img src="http://openweathermap.org/img/wn/${forecastDays[day][0].weather[0].icon}.png" class="weather-icon" alt="Weather Icon" style = "width: 50px; height: 50px;"></p>
                                                  <p>${convertKelvinToCelsius(forecastDays[day][0].main.temp)}°C</p>
                                                  <p>${forecastDays[day][0].weather[0].description}</p>
                                              </div>`).join('')}
                                      </div>
                                      <div id="forecastHourly">
                                      </div>`;

            updateWeatherUI('5DayForecast', forecastContent);
            updateWeatherUI('notFound', '');

            showHourly(today);
        } else {
            notFound(city);
        }
    } catch (error) {
        console.error('Error fetching 5-day forecast data:', error);
        notFound(city);
    }
}

function showHourly(day) {
    const hourlyData = forecastDays[day];
    const hourlyWeatherContent = `<h2>Hourly Weather</h2>
                                     <table>
                                         <tr>
                                             ${hourlyData.map(entry => `<th>${formatHour(entry.dt_txt)}</th>`).join('')}
                                         </tr>
                                         <tr>
                                             ${hourlyData.map(entry => `<td>
                                                 <img src="http://openweathermap.org/img/wn/${entry.weather[0].icon}.png" class="weather-icon" alt="Weather Icon"><br>
                                                 ${convertKelvinToCelsius(entry.main.temp)}°C<br>
                                                 Real Feel: ${convertKelvinToCelsius(entry.main.feels_like)}°C<br>
                                                 Wind Speed: ${entry.wind.speed} m/s<br>
                                                 Description: ${entry.weather[0].description}
                                             </td>`).join('')}
                                         </tr>
                                     </table>`;

    updateWeatherUI('forecastHourly', hourlyWeatherContent);
}

window.onload = async function () {
    await handleSubmit();
};
