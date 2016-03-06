
window.jsJobRun = function(page, options, callback) {
    setTimeout(function() {
        throw new Error('thrown in a setTimeout');
    }, 0);
};
