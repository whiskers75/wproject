module.exports.fn = function(global, mode, target) {
    var p = global.Q.defer();
    var esc = require('js-string-escape');
    if (global.user.indexOf('chanop') == -1) {
        p.reject('You must have the "chanop" permission to do that.');
        return;
    }
    global.run("w.send('MODE', '" + esc(global.to) + "', '" + esc(mode) + "'" + (target ? ", '" + esc(target) + "')" : ")"));
    p.resolve();
    return p.promise;
};
module.exports.level = 1;