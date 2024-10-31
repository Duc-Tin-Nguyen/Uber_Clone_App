$(document).ready(function() {
    var currentUsername = "{{ current_user.username }}";
    $('body').data('currentUsername', currentUsername);
});

var isReverse = false;

var carImages = {
'UberX': 'static/UberX.png',
'UberXL': 'static/UberXL.png',
};

function toggleDateTimePicker() {
$('#datetimepicker').toggle();
setDefaultTime();
}

function setDefaultTime() {
var defaultPickupTime;

if (isReverse) {
    defaultPickupTime = moment().add(30, 'minutes');
} else {
    defaultPickupTime = moment().add(Math.floor(Math.random() * (5 - 2 + 1)) + 2, 'minutes');
}

$('#selected_datetime').val(defaultPickupTime.format('YYYY-MM-DD HH:mm'));
$('#car_list').addClass('hide');
}

function generateRandomPickupTime() {
return moment().add(Math.floor(Math.random() * (5 - 2 + 1)) + 2, 'minutes').format('YYYY-MM-DD HH:mm');
}

function calculateTripCost(estimatedDistance) {
estimatedDistance = parseFloat(estimatedDistance);

if (isNaN(estimatedDistance) || estimatedDistance === null) {
    console.error("Invalid input for calculateTripCost:", estimatedDistance);
    return 'N/A'; 
}

console.log("Input distance for calculateTripCost:", estimatedDistance);

var costPerKilometer = 1.5;
var totalCost = estimatedDistance * costPerKilometer;

return totalCost.toFixed(2);
}

function displayCarList(carsList, estimatedDuration, estimatedDistance) {
var cars = '';

carsList.forEach(function (car) {
    var carImage = carImages[car.name] || 'path/to/default_image.jpg';

    var arrivalTime = moment(car.pickupTime, 'YYYY-MM-DD HH:mm').add(estimatedDuration, 'minutes').format('YYYY-MM-DD HH:mm');

    var tripCost = calculateTripCost(parseFloat(estimatedDistance));

    cars += '<div class="list-group-item car-item" onclick="selectCar(\'' + car.name + '\', \'' + car.pickupTime + '\', \'' + arrivalTime + '\', ' + tripCost + ')">' +
        '<div class="car-image-container">' +
        '<img src="' + carImage + '" alt="' + car.name + '" class="car-image">' +
        '</div>' +
        '<div class="car-details">' +
        '<h4>' + car.name + '</h4>' +
        '<p class="pickup-info">Pickup Time: ' + car.pickupTime + '</p>' +
        '<p class="arrival-info">Arrival Time: ' + arrivalTime + '</p>' +
        '<p class="cost-info">Cost: $' + tripCost + '</p>' +
        '</div></div>';

    sessionStorage.setItem('trip_cost', tripCost);
});

// Display the list of cars
$('#car_list').html(cars);
$('#car_list').removeClass('hide');
$('#car_list').show();
}

function selectCar(carName, pickupTime, arrivalTime, tripCost) {
var carImage = carImages[carName] || 'path/to/default_image.jpg';

var selectedCarHtml = '<div class="list-group-item selected-car-item">' +
    '<div class="car-image-container">' +
    '<img src="' + carImage + '" alt="' + carName + '" class="car-image">' +
    '</div>' +
    '<div class="car-details">' +
    '<h4>' + carName + '</h4>' +
    '<p class="pickup-info">Pickup Time: ' + pickupTime + '</p>' +
    '<p class="arrival-info">Arrival Time: ' + (arrivalTime || 'N/A') + '</p>' +
    '<p class="cost-info">Cost: $' + tripCost + '</p>' +
    '</div>' +
    '</div>';

$('#selected_car').html(selectedCarHtml);
$('#ride_request').removeClass('hide');
$('#ride_request').show();
sessionStorage.setItem('trip_cost', tripCost);
}

function requestRide() {
var originAddress = $('#from_places').val();
var destinationAddress = $('#to_places').val();

getCoordinatesFromAddress(originAddress, function (originCoordinates) {
    if (!originCoordinates) {
        alert('Error getting coordinates for the origin address. Please try again.');
        return;
    }

    var currentUsername = '{{ current_user.username }}';

    var selectedCarHtml = $('#selected_car').html();
    var tripCost = parseFloat(sessionStorage.getItem('trip_cost')); 

    var rideData = {
        username: currentUsername,
        selectedCarHtml: selectedCarHtml,
        status: 'requested',
        origin: originAddress,
        destination: destinationAddress,
        origin_lat: originCoordinates.latitude,
        origin_lng: originCoordinates.longitude,
        tripCost: tripCost  // 
    };

    $.ajax({
        type: 'POST',
        url: '/save_ride',
        contentType: 'application/json;charset=UTF-8',
        data: JSON.stringify(rideData),
        success: function (response) {
            if (response.status === 'success') {
                alert('Ride requested successfully!');
                window.location.href = '/chat?trip_cost=' + tripCost;
            } else {
                alert('Failed to request ride. Please try again.');
            }
        },
        error: function (error) {
            alert('Error requesting ride. Please try again.');
            console.error('Error:', error);
        }
    });
});
}


function getCoordinatesFromAddress(address, callback) {
var geocoder = new google.maps.Geocoder();

geocoder.geocode({ 'address': address }, function (results, status) {
    if (status === google.maps.GeocoderStatus.OK) {
        if (results[0]) {
            var location = results[0].geometry.location;
            callback({
                latitude: location.lat(),
                longitude: location.lng()
            });
        } else {
            console.error('No results found for the given address');
            callback(null);
        }
    } else {
        console.error('Geocoding failed due to: ' + status);
        callback(null);
    }
});
}

// Document ready function
$(function () {
var currentDateTime = moment();
var minPickupTime = currentDateTime.clone().add(5, 'minutes');

var origin, destination, map;
google.maps.event.addDomListener(window, 'load', function () {
    setDestination();
    initMap();
    initTimePicker();
});

function initMap() {
    var myLatLng = { lat: 52.520008, lng: 13.404954 };
    map = new google.maps.Map(document.getElementById('map'), { zoom: 16, center: myLatLng });
}

function initTimePicker() {
    $('#selected_datetime').datetimepicker({
        format: 'YYYY-MM-DD HH:mm',
        defaultDate: moment().add(30, 'minutes'),
        minDate: moment().add(30, 'minutes')
    });
}

function setDestination() {
    var from_places = new google.maps.places.Autocomplete(document.getElementById('from_places'));
    var to_places = new google.maps.places.Autocomplete(document.getElementById('to_places'));

    function setAddress(input, output, latOutput, lngOutput) {
        google.maps.event.addListener(input, 'place_changed', function () {
            var place = input.getPlace();
            var address = place.formatted_address;
            var lat = place.geometry.location.lat();
            var lng = place.geometry.location.lng();

            $(output).val(address);
            $(latOutput).val(lat);
            $(lngOutput).val(lng);
        });
    }

    setAddress(from_places, '#origin');
    setAddress(to_places, '#destination');
}

function displayRoute(travel_mode, origin, destination, directionsService, directionsDisplay) {
    directionsService.route({
        origin: origin, destination: destination, travelMode: travel_mode, avoidTolls: true
    }, function (response, status) {
        if (status === 'OK') {
            directionsDisplay.setMap(map);
            directionsDisplay.setDirections(response);
        } else {
            directionsDisplay.setMap(null);
            directionsDisplay.setDirections(null);
            alert('Directions request failed due to ' + status);
        }
    });
}

function calculateDistance(travel_mode, origin, destination) {
    var service = new google.maps.DistanceMatrixService();
    service.getDistanceMatrix({
        origins: [origin],
        destinations: [destination],
        travelMode: travel_mode,
        unitSystem: google.maps.UnitSystem.METRIC,
        avoidHighways: false,
        avoidTolls: false
    }, function (response, status) {
        save_results(response, status);
    });
}

function save_results(response, status) {
    console.log("API Response Status:", status);
    console.log("API Response:", response);

    if (status !== google.maps.DistanceMatrixStatus.OK) {
        $('#result').html("Error: " + status);
    } else {
        try {
            var pickupTimeInput = $('#selected_datetime');
            var pickupTime;

            // Check if pickup time is provided and valid
            if (pickupTimeInput.val()) {
                pickupTime = moment(pickupTimeInput.val(), 'YYYY-MM-DD HH:mm');

                if (isReverse && pickupTime.isBefore(moment().add(30, 'minutes'))) {
                    alert('Please choose a pickup time at least 30 minutes from the current time.');
                    return;
                }
            } else {
                setPickupNow();
                return;
            }

            var carsList = [
                { name: 'UberX', pickupTime: pickupTime.format('YYYY-MM-DD HH:mm') },
                { name: 'UberXL', pickupTime: pickupTime.format('YYYY-MM-DD HH:mm') },
            ];

            var distance = response.rows[0].elements[0].distance.text;
            var durationInSeconds = response.rows[0].elements[0].duration.value;
            var durationInMinutes = Math.ceil(durationInSeconds / 60);

            console.log('Distance:', distance);
            console.log('Duration in minutes:', durationInMinutes);

            var tripCost = calculateTripCost(parseFloat(distance));

            displayCarList(carsList, durationInMinutes, parseFloat(distance));
        } catch (error) {
            console.error("Error processing API response:", error);
            $('#result').html("Error processing API response: " + error.message);
        }
    }
}


$('#distance_form').submit(function (e) {
    e.preventDefault();
    var origin = $('#origin').val();
    var destination = $('#destination').val();
    var travel_mode = $('#travel_mode').val();
    var pickupTimeInput = $('#selected_datetime');
    var pickupTime;

    if (pickupTimeInput.val()) {
        pickupTime = moment(pickupTimeInput.val(), 'YYYY-MM-DD HH:mm');

        if (isReverse && pickupTime.isBefore(moment().add(30, 'minutes'))) {
            alert('Please choose a pickup time at least 30 minutes from the current time.');
            return;
        }
    } else {
        setPickupNow();
        return;
    }

    var directionsDisplay = new google.maps.DirectionsRenderer({ 'draggable': false });
    var directionsService = new google.maps.DirectionsService();
    displayRoute(travel_mode, origin, destination, directionsService, directionsDisplay);
    calculateDistance(travel_mode, origin, destination);
});

function setCurrentPosition(pos) {
    var geocoder = new google.maps.Geocoder();
    var latlng = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);

    geocoder.geocode({ 'latLng': latlng }, function (results, status) {
        if (status === google.maps.GeocoderStatus.OK) {
            if (results[0]) {
                var formattedAddress = results[0].formatted_address;
                var originLat = results[0].geometry.location.lat();
                var originLng = results[0].geometry.location.lng();

                var rideData = {
                    username: '{{ current_user.username }}',
                    selectedCarHtml: '',
                    status: 'requested',
                    origin: formattedAddress,
                    destination: '',
                    origin_lat: originLat,
                    origin_lng: originLng
                };

                $.ajax({
                    type: 'POST',
                    url: '/save_ride',
                    contentType: 'application/json;charset=UTF-8',
                    data: JSON.stringify(rideData),
                    success: function (response) {
                        if (response.status === 'success') {
                            alert('Ride requested successfully!');
                        } else {
                            alert('Failed to request ride. Please try again.');
                        }
                    },
                    error: function (error) {
                        alert('Error requesting ride. Please try again.');
                        console.error('Error:', error);
                    }
                });
            }
        } else {
            alert('Geocoder failed due to: ' + status);
        }
    });
}
});