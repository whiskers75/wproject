module.exports.fn = function(global) {
    var p = global.Q.defer();
    global.reply('^w running on ' + require('os').hostname() + ' - load average (1m): ' + require('os').loadavg()[0].toFixed(2));
    p.resolve();
    return p.promise;
};
module.exports.level = 1;