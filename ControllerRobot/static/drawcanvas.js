/**
 * Created by mcowger on 1/20/14.
 */

function resizeCanvas() {
    var canvas = document.getElementById('myCanvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas, false);
resizeCanvas();

function drawCenter() {

    $('#myCanvas').clearCanvas();
    //Draw the center circle
    $('#myCanvas').drawArc({
        strokeStyle: '#000',
        strokeWidth: 5,
        fillStyle: 'green',
        x: $('#myCanvas').width() / 2, y: $('#myCanvas').height() / 2,
        radius: $('#myCanvas').height() * .08
    });
}


function drawCircle(x, y) {
    drawCenter();

    $('#myCanvas').drawArc(
        {
            strokeStyle: '#000',
            strokeWidth: 5,
            fillStyle: 'red',
            x: x, y: y,
            radius: $('#myCanvas').height() * .04,
        }
    );
}


drawCircle($('#myCanvas').width() / 2, $('#myCanvas').height() / 2);

var totalX = document.documentElement.clientWidth;
var totalY = document.documentElement.clientHeight;

var previousLeft = -1000;
var previousRight = -1000;

targetURL = "http://192.168.0.99:5000/drive"


function httpGet(X, Y) {

    var xmlHttp = null;
    xmlHttp = new XMLHttpRequest();
    var thejson = {"X": X, "Y": Y};
    xmlHttp.open("POST", targetURL, false);
    xmlHttp.setRequestHeader("Content-type", "application/json");
    xmlHttp.send(JSON.stringify(thejson));
    return 0;
}


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
    var curY = e.touches[0].screenY;


    //Redraw the circle every time the mouse moves
    drawCircle(curX, curY);


    percentForward = calcMotorMagnitude(curY, totalY);

    var leftWheel = percentForward
    var rightWheel = percentForward

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

        console.log("L: " + leftWheel + " R: " + rightWheel);
        //httpGet(leftWheel, rightWheel);

        //update the HTML to see the current values
        $('#lValue').text(leftWheel);
        $('#rValue').text(rightWheel);

    }


}


document.addEventListener('touchmove', function (e) {
    handleMove(e)
});

