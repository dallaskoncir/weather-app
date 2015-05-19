// Create empty object to start application
var app = {};

// Get current location
app.getLocation = function() {
  if ("geolocation" in navigator) {
    // geolocation is available
    navigator.geolocation.getCurrentPosition(function(position) {
      app.latLng = position.coords.latitude + ',' + position.coords.longitude;
      // console.log(app.latLng);
      $.ajax({
        url: 'http://maps.googleapis.com/maps/api/geocode/json',
        type: 'GET',
        dataType: 'json',
        data: {
          latlng: app.latLng 
        },
        success: function(location) {
          app.getWeatherInfo(location.results[5]);
          app.showLocation(location.results[5]);
        }
      });
    });
  } else {
     console.log('geolocation IS NOT available');
  }
};

// Get images from Flickr
app.getImages = function(condition) {
  // console.log(condition);
  if (condition === "Chance of a Thunderstorm") {
    condition = "Thunderstorm";
  }
  var latLong = app.latLng.split(',');
  $.ajax({
    url: 'https://api.flickr.com/services/rest/',
    type: 'GET',
    dataType: 'jsonp',
    data: {
      method: 'flickr.photos.search',
      lat: latLong[0],
      lon: latLong[1],
      radius: 32,
      tags: condition,
      api_key: '1c49eada5aabb7ffd962945bf55ce2aa',
      format: 'json'
    },
    success: function(photos) {
      // console.log(photos);
    }
  });
};

function jsonFlickrApi(data) {
  app.showImages(data.photos.photo);
};

// Show images from Flickr
app.showImages = function(img) {
  // console.log(img);
  var randNumber = Math.floor(Math.random() * img.length);
  var imgId = img[randNumber].id;
  var imgFarm = img[randNumber].farm;
  var serverId = img[randNumber].server;
  var imgSecret = img[randNumber].secret;
  var imgAlt =img[randNumber].title;
  var imgUrl = 'https://farm' + imgFarm + '.staticflickr.com/' + serverId + '/' + imgId + '_' + imgSecret + '_b.jpg';
  $('.image img').attr({
    src: imgUrl,
    alt: imgAlt
  });
  var containerHeight = $('.image').height();
  $('.image img').css('height', containerHeight);
};

// Show Location in header
app.showLocation = function(loc) {
  $('.main h1').text(loc.address_components[0].long_name + ', ' + loc.address_components[2].long_name);
  $('title').text(loc.address_components[0].long_name + ', ' + loc.address_components[2].long_name + ' | ' + 'Forecastr');
};

// Show Time
app.showTime = function() {
  var today = new Date();
  var h = today.getHours();
  var m = today.getMinutes();
  var s = today.getSeconds();
  m = app.checkTime(m);
  s = app.checkTime(s);
  h = app.checkHours(h);
  var liveTime = h + ":" + m + ":" + s;
  $('.time p').html(liveTime); 
  var t = setTimeout(function(){ app.showTime() }, 500);
};

// Add leading zeros for single digit numbers
app.checkTime = function(i) {
  // add zero in front of numbers < 10
  if (i < 10) {
    i = "0" + i
  }
  return i;
};

// Convert to a 12 hour clock
app.checkHours = function(x) {
  if (x > 12) {
    x = "0" + x - 12;
  }
  return x;
};

// Get weather information from Weather Underground
app.getWeatherInfo = function(city) {
  var cityState = city.address_components[2].long_name + '/' + city.address_components[0].long_name;
  // var cityState = 'Ontario/Toronto';

  $.ajax({
    url: 'http://api.wunderground.com/api/3e75e57900676776/forecast10day/q/' + cityState +'.json',
    type: 'GET',
    dataType: 'jsonp',
    success: function(data) {
      app.showWeather(data.forecast.simpleforecast.forecastday);
    }
  });
};

// Show weather info
app.showWeather = function(weather) {
  var condition = '';
  $.each(weather, function(i, day) {
    condition = day.conditions;
    var $temp = $('<h2>').addClass('temp').html(day.high.celsius + '&deg;');
    var $day = $('<h3>').text(day.date.weekday);
    var $cond = $('<h4>').text(day.conditions);
    var $svg;
    if (day.conditions === "Mostly Cloudy" || day.conditions === "Partly Cloudy") {
      $svg = $('.climacon_cloudSunFill').html();
    }
    if (day.conditions === "Sunny" || day.conditions === "Clear") {
      $svg = $('.climacon_sunFill').html();
    }
    if (day.conditions === "Overcast") {
      $svg = $('.climacon_cloudFill').html();
    }
    if (day.conditions === "Chance of Rain" || day.conditions === "Rain") {
      $svg = $('.climacon_cloudDrizzleFillAlt').html();
    }
    if (day.conditions === "Chance of a Thunderstorm") {
      $svg = $('.climacon_cloudLightning').html();
    }
    var $icon = $('<div>').addClass('icon').html('<svg version="1.1" viewBox="15 15 70 70">' + $svg + '</svg>');
    var $weatherItem = $('<article>').addClass('weatherItem').append($day, $icon, $temp, $cond);

    $weatherItem.data('condition', day.conditions);

    $('.weather').append($weatherItem);
    return i < 6;
  });
  app.getImages(condition);
};

app.weatherConditions = function() {
  $('.weather').on('click', '.weatherItem', function() {
    app.getImages($(this).data('condition'));
  });
};

app.stopBounce = function() {
  setInterval(function(){ $('.infinite').removeClass('infinite') }, 8000);
};

// Initialize the app
app.init = function() {
  // init clock
  app.showTime();
  // init locate
  app.getLocation();
  // init images
  app.weatherConditions();
  // stop bouncing
  app.stopBounce();
};

// Make the magic happen
$(function() {
  app.init();
});