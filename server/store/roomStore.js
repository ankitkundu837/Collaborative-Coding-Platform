const rooms = new Map();

// userId -> timeout
const disconnectTimers = new Map();

module.exports = {

    rooms,

    disconnectTimers

};