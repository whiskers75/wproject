module.exports.fn = function(global, mode, target) {
    var p = global.Q.defer();
    var esc = require('js-string-escape');
    if (typeof global.user[global.to] != 'array') {
        p.reject('You have no permissions in this channel, and you need "chanop".');
        return;
    }
    if (global.user[global.to].indexOf('chanop') == -1) {
        p.reject('You must have the "chanop" permission to do that.');
        return;
    }
    global.run("w.send('MODE', '" + esc(global.to) + "', '" + esc(mode) + "'" + (target ? ", '" + esc(target) + "')" : ")"));
    p.resolve();
    return p.promise;
};
module.exports.level = 1;