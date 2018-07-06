let mappings = require('./mappings');
const {isNumeric} = require('./utility');
const VALID = 'VALID';

/*
* AUTHOR: RYAN SCULLY (WAYOFTHEFUTURE)
* AIS DECODER AND FILTER LIBRARY
*
* THIS IS THE OFFICIAL LIBRARY USED TO DECODE MESSAGES FOR MRTIS.COM
* */


function parseOnePart(message) {
    //check for valid message string
    let messageResult = checkMessage(message);
    if (messageResult !== VALID) {
        return error(messageResult);
    }
    message = message.trim();

    //check for valid message parts
    let parts = getParts(message);
    let partsResult = checkParts(parts);
    if (partsResult !== VALID) {
        return error(partsResult);
    }
    parts.count = +count;
    parts.id = +id;

    //misc checks
    if (count > 1) {
        return error('Message contains two parts, use parseTwoPart instead.');
    }

    //convert payload to object
    return mappings.decode(parts.payload);
}

function parseTwoPart(message) {

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
    } else if (!validateChecksum(message)) {
        return 'Message failed checksum.';
    }
    
    return VALID;
}

function checkParts(parts) {
    //AIVDM = standard message, AIVDO = own ship message
    if (parts.prefix !== '!AIVDM' && parts.prefix !== '!AIVDO') {
        return 'Message contains invalid prefix.';
    } else if (!isNumeric(parts.count) || !isNumeric(parts.id)) {
        return 'Message contains invalid part formats.';
    }

    if (parts.payload.length === 0) {
        return 'Message payload is empty.';
    } else {
        //check for invalid characters
        for (let code, i = 0; i < parts.payload.length; i++) {
            code = parts.payload[i].charCodeAt(0);
            if (!((code >= 48 && code <= 87) || (code >= 96 && code <= 119))) {
                return 'Message payload contains invalid characters.';
            }
        }
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

            for (let i = 0; i < body.length; i++) {
                sum ^= body.charCodeAt(i);  //xor based checksum
            }

            return (checksum === sum.toString(16).toUpperCase());
        }
    }
    return false;
}

function error(reason) {
    return {valid: false, error: reason || 'Error details not specified.'};
}

module.exports = {parseOnePart, parseTwoPart};
