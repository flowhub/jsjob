
window.jsJobRun = function(data, options, callback) {
    var delay = data.delay || 1000;
    setTimeout(function() {
        return callback(null, data, null);
    }, delay);
};
