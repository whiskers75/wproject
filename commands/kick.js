module.exports.fn = function(global, target, msg) {
    var p = global.Q.defer();
    var esc = require('js-string-escape');
    if (typeof global.user[global.to] != 'object') {
        p.reject('You have no permissions in this channel, and you need "chanop".');
        return p.promise;
    }
    if (global.user[global.to].indexOf('chanop') == -1) {
        p.reject('You must have the "chanop" permission to do that.');
        return p.promise;
    }
    global.run("w.send('KICK', '" + esc(global.to) + "', '" + esc(target) + "'" + (msg ? ", '" + esc(msg) + "')" : "'pls')"));
    p.resolve();
    return p.promise;
};
module.exports.level = 1;