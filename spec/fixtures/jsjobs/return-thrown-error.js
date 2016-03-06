
function mythrowingfunction() {
   throw new Error('this error was thrown');
}

window.jsJobRun = function(page, options, callback) {

    try {
        mythrowingfunction();
    } catch (e) {
        console.log('thrown error', JSON.stringify(e));
        return callback(e, null, null);
    }
};
