if (typeof console != "undefined")
    if (typeof console.log != 'undefined')
        console.olog = console.log;
    else
        console.olog = function () {
        };

console.log = function (message) {
    console.olog(message);
    $('#debugDiv').html(message);
};
console.error = console.debug = console.info = console.log