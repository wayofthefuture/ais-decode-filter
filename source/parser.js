let types = require('./types');
const {isNumeric} = require('./utility');
const VALID = 'VALID';


function parseOnePart(message) {
    //check for valid message string
    let messageResult = checkMessage(message);
    if (messageResult !== VALID) {
        return error(messageResult);
    }

    //check for valid message parts
    let parts = getParts(message.trim());
    let partsResult = checkParts(parts);
    if (partsResult !== VALID) {
        return error(partsResult);
    }

    //misc checks
    if (parts.count !== '1') {
        return error('Message contains two parts, use parseTwoPart instead.');
    }

    //convert payload to object
    return types.decode(parts.payload);
}

function parseTwoPart(message1, message2) {
    //check for valid message string
    let messageResult1 = checkMessage(message1);
    let messageResult2 = checkMessage(message2);
    if (messageResult1 !== VALID || messageResult2 !== VALID) {
        return error(messageResult1 !== VALID ? messageResult1 : messageResult2);
    }

    //check for valid message parts
    let parts1 = getParts(message1.trim());
    let parts2 = getParts(message2.trim());
    let partsResult1 = checkParts(parts1);
    let partsResult2 = checkParts(parts2);
    if (partsResult1 !== VALID || partsResult2 !== VALID) {
        return error(partsResult1 !== VALID ? partsResult1 : partsResult2);
    }

    //misc checks
    if (parts1.count !== '2' || parts2.count !== '2') {
        return error('Messages are not two part types.');
    } else if (parts1.id !== '1' || parts2.id !== '2') {
        return error('Message are not in correct order.');
    }

    //convert payload to object
    return types.decode(parts1.payload + parts2.payload);
}

//Split message into parts object. (!AIVDM,1,1,,B,B69>7mh0?J<:>05B0`0e;wq2PHI8,0*3D)
function getParts(message) {
    let    [prefix, count, id, sequence, channel, payload, suffix] = message.split(',');
    return {prefix, count, id, sequence, channel, payload, suffix};
}

//=============================================================================================
// MESSAGE CHECKING
//=============================================================================================

function checkMessage(message) {
    if (typeof message !== 'string') {
        return 'Message invalid format';
    }
    message = message.trim();

    if (message.length === 0) {
        return 'Message is empty or consists of spaces.';
    }
    if (!validateChecksum(message)) {
        return 'Message failed checksum.';
    }
    
    return VALID;
}

function checkParts(parts) {
    //AIVDM = standard message, AIVDO = own ship message
    if (parts.prefix !== '!AIVDM' && parts.prefix !== '!AIVDO') {
        return 'Message contains invalid prefix.';
    }
    if (!isNumeric(parts.count) || !isNumeric(parts.id)) {
        return 'Message contains invalid part formats.';
    }
    if (parts.payload.length === 0) {
        return 'Message payload is empty.';
    }

    return VALID;
}

//=============================================================================================
// VALIDATION
//=============================================================================================

function validateChecksum(message) {
    if (typeof message === 'string') {
        let loc1 = message.indexOf('!');
        let loc2 = message.indexOf('*');

        if (loc1 === 0 && loc2 > 0) {
            let body = message.substring(1, loc2);
            let checksum = message.substring(loc2 + 1);
            let sum = 0;

            for (let code = 0, i = 0; i < body.length; i++) {
                code = body.charCodeAt(i);

                //check for bad characters in payload, since checksum has only
                //256 combinations, this is very effect in reducing junk AIS data.
                if (!((code >= 48 && code <= 87) || (code >= 96 && code <= 119))) {
                    return false;
                }

                //xor based checksum
                sum ^= code;
            }
            let hex = sum.toString(16).toUpperCase();
            if (hex.length === 1) hex = '0' + hex;      //single digit hex needs preceding 0. 'F' -> '0F'

            return (checksum === hex);
        }
    }
    return false;
}

function error(reason) {
    return {valid: false, error: reason || 'Error details not specified.'};
}

module.exports = {parseOnePart, parseTwoPart};
