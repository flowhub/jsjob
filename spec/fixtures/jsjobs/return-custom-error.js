
window.jsJobRun = function(page, options, callback) {
    var err = new Error('custom error with properties attached');
    err.myproperty = 'myvalue';
    err.otherproperty = 'othervalue';
    return callback(err, null, null);
};
