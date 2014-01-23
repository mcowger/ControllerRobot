/**
 * Created by mcowger on 1/20/14.
 */


function drawCenter() {

    $('#myCanvas').drawArc({
        strokeStyle: '#000',
        strokeWidth: 5,
        fillStyle: 'green',
        x: $('#myCanvas').width() / 2, y: $('#myCanvas').height() / 2,
        radius: $('#myCanvas').height() * .04
    });
}


$(document).ready(function () {
    //Get the canvas & context
    var c = $('#myCanvas');
    var ct = c.get(0).getContext('2d');
    var container = $(c).parent();

    //Run function when browser resizes
    $(window).resize(respondCanvas);

    function respondCanvas() {
        c.attr('width', $(container).width()); //max width
        c.attr('height', $(container).height()); //max except for header
        drawCenter();
        drawCircle($('#myCanvas').width() / 2, $('#myCanvas').height() / 2);
        //Call a function to redraw other content (texts, images etc)
        totalX = $('#myCanvas').width();
        totalY = $('#myCanvas').height();
    }

    //Initial call
    respondCanvas();

});


function drawCircle(x, y) {
    $('#myCanvas').clearCanvas();
    drawCenter();
    $('#myCanvas').drawArc(
        {
            strokeStyle: '#000',
            strokeWidth: 5,
            fillStyle: 'red',
            x: x, y: y,
            radius: $('#myCanvas').height() * .02,
        }
    );
}


drawCircle($('#myCanvas').width() / 2, $('#myCanvas').height() / 2);


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
                console.log(xmlHttp.responseText);
            }
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


    var curX = e.touches[0].clientX;
    var curY = e.touches[0].clientY;


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

