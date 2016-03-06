
window.jsJobRun = function(page, options, callback) {
    callback(null, "callback-then-throw solution", null);

    throw new Error('callback-then-throw error');
};
