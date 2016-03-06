
window.jsJobRun = function(page, options, callback) {
    setTimeout(function() {
        callback(null, "throw-then-callback solution", null);
    }, 0);

    throw new Error('throw-then-callback error');
};
