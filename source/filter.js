
let mmsis = {};

//throw away first occurrence of every mmsi to remove trash
function isValid(mmsi) {
    if (!mmsis[mmsi]) {
        mmsis[mmsi] = true;
        return false;
    } else {
        return true;
    }
}

function reset() {
    mmsis = {};
}

//reset filter once per day
setInterval(function() { reset() }, 24 * 3600 * 1000);
