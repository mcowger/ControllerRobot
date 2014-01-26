/**
 * Created by mcowger on 1/20/14.
 */

canvas = document.getElementById('myCanvas');
function correctCoordinates(x, y, Loffset, Toffset) {
    var coord = {};
    coord.x = x - Loffset;
    coord.y = Math.min(Math.max(0, y - Toffset), canvas.height);
    //console.log("Corrected X,Y to X,Y:" + x + "," + y + "  ->  " + coord.x + "," + coord.y + " Canvas Height: " + canvas.height);

    return coord;

}


function startDrive() {
    window.enablesend = !window.enablesend;
    if (window.enablesend) {
        $('#titletext').css('color', 'green');
    }
    else {
        $('#titletext').css('color', 'red')
    }

    console.log("Driving Enabled?:" + window.enablesend);
}

function drawCenter() {

    var context = canvas.getContext('2d');
    var centerX = canvas.width / 2;
    var centerY = canvas.height / 2;
    var radius = canvas.width * .08;
    context.beginPath();
    context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
    context.fillStyle = 'green';
    context.fill();
    context.lineWidth = 5;
    context.strokeStyle = '#003300';
    context.stroke();

}

function drawCircle(x, y) {
    var context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawCenter();


    var centerX = x;
    var centerY = y;
    var radius = canvas.width * .05;

    context.beginPath();
    context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
    context.fillStyle = 'red';
    context.fill();
    context.lineWidth = 5;
    context.strokeStyle = '#003300';
    context.stroke();
}

$(document).ready(function () {




    //Run function when browser resizes
    $(window).resize(respondCanvas);

    function respondCanvas() {
        canvas.width = canvas.parentElement.offsetWidth;
        canvas.height = canvas.parentElement.offsetHeight;

        drawCenter();
        drawCircle(canvas.width / 2, (canvas.height / 2));
        //Call a function to redraw other content (texts, images etc)
        totalX = canvas.width;
        totalY = canvas.height;
    }

    //Initial call
    respondCanvas();

});


drawCircle(canvas.width / 2, canvas.height / 2);


leftWheel = 0;
rightWheel = 0;

var previousLeft = {};
var previousRight = {};


function httpGet() {
//    L = pad(L, 3);
//    R = pad(R, 3);

    L = leftWheel;
    R = rightWheel;

    var seconds = new Date().getTime() / 1000;
    baseURL = "https://api.spark.io/v1/devices/" + window.deviceid + "/setMotors"
    var toSend = 'access_token=' + window.accesstoken + '&params=' + L.direction + L.power + ',' + R.direction + R.power;
    if (window.enablesend) {

        console.warn(seconds + " Sending:");
        console.warn(baseURL + " | POST | " + toSend);

        var xmlHttp = new XMLHttpRequest();

        xmlHttp.open("POST", baseURL, true);
        xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xmlHttp.timeout = 5000; //5 second timeout
        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {

            }
            console.log(JSON.parse(xmlHttp.responseText).error_description);
        }
        xmlHttp.send(toSend);


    }
    else {
        console.warn(seconds + " API Send Disabled, would have sent:");
        console.warn(baseURL + " | POST | " + toSend);

    }
    return 0;
}


var throttledGet = $.throttle(1000, httpGet);  //dont call more than 1x/sec
var debouncedStartDrive = $.debounce(250, startDrive);  //dont call more than 1x/sec


function badRound(value) {
    if (value > 100) value = 100;
    if (value < -100) value = -100;
    return Math.round(value / 10) * 10;
}
function calcMotorMagnitude(curVal, maxVal) {
    var midPoint = maxVal / 2;
    var totalDifference = Math.abs(midPoint - curVal);
    var revslashright = false;
    if (curVal <= midPoint) {
        revslashright = false;
    } else {
        revslashright = true;
    }

    var percent = (totalDifference / midPoint) * 100;
    if (revslashright == true) {
        percent = percent * -1;
    }
    return percent;

};

function adjustWheel(cur, toAdd) {
    //console.log("Left/Right wheel adjustment request: " + toAdd);
    //Maximum 50% reduction in power
    adjustment = toAdd / 2;
    //console.log("Left/Right wheel adjustment: " + adjustment);
    newTarget = cur + adjustment;
    //console.log("newTarget = " + newTarget);
    if (newTarget > 100) newTarget = 100;
    if (newTarget < -100) newTarget = -100;
    return newTarget;
}


function handleMove(e) {
    e.preventDefault();


    //First lets check if this was a double tap
    if (e.touches.length > 1) {

        debouncedStartDrive();
    }

    coords = correctCoordinates(e.touches[0].pageX, e.touches[0].pageY, 0, 85);
    var curX = coords.x;
    var curY = coords.y;


    //Redraw the circle every time the mouse moves
    drawCircle(curX, curY);


    var percentForward = calcMotorMagnitude(curY, totalY);
    var midPoint = totalX / 2;

    var turn = "none";
    if (curX < midPoint) {
        //We must be left of center, so we are wanting a left turn
        turn = "left";
    }
    else if (curX > midPoint) {
        //We must be right of center, so we are wanting a right turn
        turn = "right";
    }

    var forward = true;
    if (percentForward < 0) {
        forward = false;
    }


    leftWheel = {
        name: 'L',
        direction: '+',
        power: 0
    };

    rightWheel = {
        name: 'R',
        direction: '+',
        power: 0
    };
    leftWheel.power = percentForward;
    rightWheel.power = percentForward;

    var travelPercent = Math.round(Math.min(Math.abs(percentForward), 100));
    var turnPercent = Math.round(Math.min(Math.abs((midPoint - curX) / midPoint) * 100, 100));

    if (forward) {
        leftWheel.direction = '+';
        rightWheel.direction = '+';
        if (turn == "left") {

            //in order to turn left while going forward we need to reduce the speed of the left wheel.
            var LadjustmentVal = Math.round(turnPercent * .5);
            //dont adjust by more than 50% of the requested turn rate
            leftWheel.power = Math.max(10, travelPercent - LadjustmentVal);
            //do the adjustment, but make sure it doesn't go below zero.


        }
        if (turn == "right") {

            //in order to turn right while going forward we need to reduce the speed of the right wheel.
            var RadjustmentVal = Math.round(turnPercent * .5);
            //dont adjust by more than 50% of the requested turn rate
            rightWheel.power = Math.max(10, travelPercent - RadjustmentVal);
            //do the adjustment, but make sure it doesn't go below zero.


        }

    }
    else {
        leftWheel.direction = '-';
        rightWheel.direction = '-';
        if (turn == "left") {
            //in order to turn left while going back we need to reduce the speed of the left wheel.
            var LadjustmentVal = Math.round(turnPercent * .5);
            //dont adjust by more than 50% of the requested turn rate
            leftWheel.power = Math.max(10, travelPercent - LadjustmentVal);
            //do the adjustment, but make sure it doesn't go below zero.
        }
        if (turn == "right") {
            //in order to turn right while going forward we need to reduce the speed of the right wheel.
            var RadjustmentVal = Math.round(turnPercent * .5);
            //dont adjust by more than 50% of the requested turn rate
            rightWheel.power = Math.max(10, travelPercent - RadjustmentVal);
            //do the adjustment, but make sure it doesn't go below zero.
        }
    }


    leftWheel.power = Math.abs(badRound(leftWheel.power));
    rightWheel.power = Math.abs(badRound(rightWheel.power));


    //console.log(JSON.stringify(leftWheel) + "," + JSON.stringify(rightWheel));

    if (previousLeft != leftWheel || previousRight != rightWheel) {
        previousLeft = leftWheel;
        previousRight = rightWheel;
        $('#lValue').text(leftWheel.direction + leftWheel.power);
        $('#rValue').text(rightWheel.direction + rightWheel.power);
        //console.log("L: " + leftWheel + " R: " + rightWheel);
        throttledGet();
    }


}


document.addEventListener('touchmove', function (e) {
    handleMove(e)
});

