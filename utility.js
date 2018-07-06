
//convert payload characters to 6-bit data
function asciiToBits(payload) {
    let bitsArray = [];

    for (let code, i = 0; i < payload.length; i++) {
        code = payload[i].charCodeAt(0) - 48;
        if (code > 40) code -= 8;
        bitsArray.push(code.toString(2).padStart(6, '0'));
    }

    return bitsArray.join();
}

//unsigned integer
function unsignedInt(bits) {
    return parseInt(bits, 2);
}

//signed integer - when negative uses big endian twos complement
function signedInt(bits) {
    let negative = (bits[0] === '1');
    if (negative) {
        let inverse = '';
        for (let i = 0; i < bits.length; i++) {
            inverse += (bits[i] === '0' ? '1' : '0');
        }
        return (parseInt(inverse, 2) + 1) * -1;        //twos compliment negative
    } else {
        return parseInt(bits, 2);
    }
}

//convert bits to readable string using custom AIS 6-bit ASCII table
function bitsToString(bits) {
    let letters = [];

    for (let code, i = 0; i < bits.length; i+=6) {
        code = parseInt(bits.substr(i, 6), 2);
        if (code < 32) code += 64;
        letters.push(String.fromCharCode(code));
    }

    return letters.join().replace(/@/g, ' ').trim();
}

//check if string has numeric value ('5' -> true)
function isNumeric(val) {
    return !isNaN(parseFloat(val)) && isFinite(val);
}



module.exports = {asciiToBits, unsignedInt, signedInt, bitsToString, isNumeric};
