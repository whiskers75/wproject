module.exports.fn = function(global) {
    var p = global.Q.defer();
    if (typeof global.slapped != 'undefined' && global.slapped > 2 && global.user.level < 10) {
        p.reject('pls2notspam');
        return p.promise;
    }
    if (typeof global.slapped == 'undefined') global.slapped = 0;
    global.slapped++;
    global.reply('^w running on ' + require('os').hostname() + ' - load average (1m): ' + require('os').loadavg()[0].toFixed(2));
    p.resolve();
    return p.promise;
};
module.exports.level = 1;