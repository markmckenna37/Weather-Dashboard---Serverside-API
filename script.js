//function to allow script storage in HTML head
$(document).ready(function () {
    //setting global variables, an empty cities array, today's hour, and a wrapper div for my weather text
    var cities = []
    var today = moment().format('l');
    
    //function for getting the current time weather
    function getWeather() {
        //variable that gets a city name from the click value of a rendered button
            var city = $(this).attr("data-name") ||  cities[cities.length - 1]
            $(".currentWeather").empty()
            var wrapperDiv = $("<div class='wrapper'>")
        //query URL for current weather
        var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=eb996df505ee640221603df760c80d82&units=imperial"
        //ajax function
        $.ajax({
            url: queryURL,
            method: "GET"
        }).then(function (response) {
            //making text and img variables for weather data and icons
            var weatherHead = $("<h2>").text(city + " (" + today + ")")
            var currentIcon = response.weather[0].icon
            var icon = $(`<img src="https://openweathermap.org/img/wn/${currentIcon}@2x.png">`)
            var temp = $("<p>").text("Temperature: " + response.main.temp + "°F")
            var humid = $("<p>").text("Humidity: " + response.main.humidity + "%")
            var windSpeed = $("<p>").text("Wind Speed: " + response.wind.speed + " MPH")
            // appending all of my weather variables to the wrapperDiv
            wrapperDiv.append(weatherHead, icon, temp, humid, windSpeed)
            // calling my function to get UV index with the response parameter
            getUVI(response, wrapperDiv);

        })
    }
        //function for getting UV index with a different querey URL
    function getUVI(response, wrapperDiv) {
        //setting variables for lat and lon
        var lat = response.coord.lat
        var lon = response.coord.lon
        var UVURL = `https://api.openweathermap.org/data/2.5/uvi?appid=eb996df505ee640221603df760c80d82&lat=${lat}&lon=${lon}`
        //calling ajax function for UV index
        $.ajax({
            url: UVURL,
            method: "GET"
        }).then(function (UV) {
            var UVI = UV.value;
            var UVColor;
            // getting the appropriate UVI color with if/else statements
            if (UVI <= 5) {
                UVColor = "badge badge-pill badge-primary"
            }
            else if ((UVI > 5) && (UVI < 8)) {
                UVColor = "badge badge-pill badge-success"
            }
            else if ((UVI > 7) && (UVI < 9)) {
                UVColor = "badge badge-pill badge-warning"
            } 
            else {
                UVColor = "badge badge-pill badge-danger"
            }
            // making an element for UVI color
            var UVElement = $("<p> UV Index: <span class='" + UVColor + "'>" + UVI + "</span></p>")
            console.log(UVElement)
            // appending UV Element to wrapper wrapperDiv, appending the wrapper div to current weather
            wrapperDiv.append(UVElement)
            $(".currentWeather").append(wrapperDiv)
            //calling function to get forecast with response as a parameter
            getForecastWeather(response);
            console.log(wrapperDiv)

        })
    }

    function getForecastWeather(response) {
        // emptying forecast section
        $(".forecastWeather").empty();
        var lat = response.coord.lat
        var lon = response.coord.lon
        //getting new queryurl for a 7 day forecast
        var fUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&
                                    exclude=current,minutely,hourly&appid=eb996df505ee640221603df760c80d82&units=imperial`
        $.ajax({
            url: fUrl,
            method: "GET"
        }).then(function (forecast) {
            // a for loop to create 5 elements for the 5 next days of weather forecast
            for (var i = 0; i < 5; i++) {
                //getting forecast icons
                var currentIcon = forecast.daily[i + 1].weather[0].icon
                var icon = $(`<img src="https://openweathermap.org/img/wn/${currentIcon}.png" class="weatherIcon">`)
                //making a variable for forecast card and all of the accompanying text
                var fCard = $("<div class='card text-white bg-primary col-6 col-sm-6 col-md-4 col-lg-3'>")
                var fDate = $("<h4>").text(moment().add(i + 1, 'days').format('l'))
                var fTemp = $("<p>").text("Temperature: " + forecast.daily[i + 1].temp.day + "°F")
                var fHumid = $("<p>").text("Humidity: " + forecast.daily[i + 1].humidity + "%")
                //appending text to card, and the card to the forecast weather element
                fCard.append(fDate, icon, fTemp, fHumid)
                $(".forecastWeather").append(fCard);
            }
        })
    }
    //function to render buttons 
    function renderButtons() {
        //emptying buttons and erasing text from search bar
        $(".cityList").empty();
        $(".cityInput").val("")
        //for loop to render buttons for all of the cities in our cities array
        for (var i = 0; i < cities.length; i++) {
            var a = $("<button>");
            a.addClass("btn btn-sm btn-block cityBtn cityBtn" + i + "");
            a.attr("data-name", cities[i]);
            a.text(cities[i]);
            $(".cityList").append(a);
        }
    }

    //function for storing a new city in local storage. made an if statement to prevent a blank search
function storeCity() {
    var newCity = $(".cityInput").val()
    //pushing new city to our array, setting to local storage, and calling the get weather and render buttons functions
    newCityProper = newCity.charAt(0).toUpperCase() + newCity.slice(1)
    cities.push(newCityProper)
    localStorage.setItem("CityList", JSON.stringify(cities))
    getWeather(newCityProper);
    renderButtons();
}

//setting our cities array to our local storage key
cities = JSON.parse(localStorage.getItem("CityList")) || [];






//calling functions with click events

$(document).on("click",".cityBtn", getWeather);
$(document).on("click","#searchBtn", storeCity);

$(document).on('keypress',function(e) {
    if(e.which == 13) {
        storeCity()
    }
});
renderButtons();


});