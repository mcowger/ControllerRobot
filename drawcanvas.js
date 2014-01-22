/**
 * Created by mcowger on 1/20/14.
 */


function drawCenter() {

    $('#myCanvas').clearCanvas();
    //Draw the center circle
    $('#myCanvas').drawArc({
        strokeStyle: '#000',
        strokeWidth: 5,
        fillStyle: 'green',
        x: $('#myCanvas').width() / 2, y: $('#myCanvas').height() / 2,
        radius: $('#myCanvas').height() * .04
    });
}

function resizeCanvas() {
    var canvas = document.getElementById('myCanvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - $('#header').height();
    drawCenter();
    drawCircle($('#myCanvas').width() / 2, $('#myCanvas').height() / 2);
}
window.addEventListener('resize', resizeCanvas, false);
resizeCanvas();


function drawCircle(x, y) {
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

var totalX = $('#myCanvas').width();
var totalY = $('#myCanvas').height();

leftWheel = 0;
rightWheel = 0;

var previousLeft = -1000;
var previousRight = -1000;


function httpGet() {
//    L = pad(L, 3);
//    R = pad(R, 3);

    L = leftWheel;
    R = rightWheel;

    var seconds = new Date().getTime() / 1000;
    baseURL = "https://api.spark.io/v1/devices/" + window.deviceid + "/setMotors"
    var toSend = 'access_token=' + window.accesstoken + '&params=' + L + ',' + R
    if (window.enablesend) {

        console.log(seconds + " Sending:");
        console.log(baseURL + " | POST | " + toSend);

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
        console.log(seconds + " API Send Disabled, would have sent:");
        console.log(baseURL + " | POST | " + toSend);

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
    var curX = e.touches[0].screenX;
    var curY = e.touches[0].screenY - $('#header').height();


    //Redraw the circle every time the mouse moves
    drawCircle(curX, curY);


    percentForward = calcMotorMagnitude(curY, totalY);

    leftWheel = percentForward
    rightWheel = percentForward

    adjustment = calcMotorMagnitude(curX, totalX);

    if (percentForward > 0) {
        if (adjustment > 0) {
            //postive value means left turn
            leftWheel = adjustWheel(leftWheel, -adjustment);
        }
        else {
            //must be making a right turn
            rightWheel = adjustWheel(rightWheel, adjustment);
        }
    }

    if (percentForward < 0) {
        if (adjustment > 0) {
            //postive value means left turn
            leftWheel = adjustWheel(leftWheel, adjustment);
        }
        else {
            //must be making a right turn
            rightWheel = adjustWheel(rightWheel, -adjustment);
        }
    }


    leftWheel = badRound(leftWheel);
    rightWheel = badRound(rightWheel);

//    console.log("Final wheel power values:")
//    console.log("Left:" + leftWheel)
//    console.log("Right:" + rightWheel)


    if (previousLeft != leftWheel || previousRight != rightWheel) {
        previousLeft = leftWheel;
        previousRight = rightWheel;

        //console.log("L: " + leftWheel + " R: " + rightWheel);
        throttledGet();

        //update the HTML to see the current values
        $('#lValue').text(leftWheel);
        $('#rValue').text(rightWheel);

    }


}


document.addEventListener('touchmove', function (e) {
    handleMove(e)
});

