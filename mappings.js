const {asciiToBits, unsignedInt, signedInt, bitsToString, isNumeric} = require('./utility');
const VALID = 'VALID';

function decode(payload) {
    let bits = asciiToBits(payload);

    //get message type and check bit lengths
    let type = unsignedInt(bits.substr(0, 6));
    if (validateBitLength(type, bits) !== VALID) {
        return invalid('Invalid message bit length.');
    }

    //parse payload and convert to object
    switch (type) {
        case 1:
        case 2:
        case 3:
            return validateDynamic({
                type : type,
                mmsi : unsignedInt(bits.substr(8, 30)),
                lon  : signedInt(bits.substr(61, 28)) / 60000,
                lat  : signedInt(bits.substr(89, 27)) / 60000,
                sog  : unsignedInt(bits.substr(50, 10)) / 10,
                hdg  : unsignedInt(bits.substr(128, 9))
            });
        case 5:
            return validateStatic({});
        case 18:
            return validate({});
        case 19:
            return validate({});
        default:
            return invalid('Unknown message type.');
    }
}

function validateBitLength(type, bits) {
    return VALID;
}

function validateDynamic(obj) {
    let {lon, lat} = obj;

    //must use negation to catch null or undefined values
    if (!(lon >= -180 && lon <= 180)) {
        obj.valid = false;
    } else if (!(lat >= -90 && lat <= 90)) {
        obj.valid = false;
    } else {
        obj.valid = true;
    }

    return obj;
}

function validateStatic(obj) {
    obj.valid = true;
    return obj;
}

function invalid(reason) {
    return {valid: false, error: reason || 'Mappings: Error details not specified.'};
}

module.exports = {decode};
