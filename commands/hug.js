module.exports.fn = function(global, victim) {
    var p = global.Q.defer();
    var esc = global.require('js-string-escape');
    if (typeof global.slapped != 'undefined' && global.slapped > 2 && global.user.level < 10) {
        p.reject('pls2notspam');
        return;
    }
    if (typeof victim.isPerson != 'boolean') {
        p.reject('You can\'t hug a ' + typeof victim + '! (try getUser(\'person\').then(hug)');
        return;
    }
    if (!victim.isPerson) {
        p.reject('You can\'t hug inanimate objects. (try getUser(\'person\').then(hug)');
        return;
    }
    if (typeof victim.toString != 'function') {
        p.reject('wat?');
        return;
    }
    if (typeof global.slapped == 'undefined') global.slapped = 0;
    global.slapped++;
    global.run('w.action("' + global.to + '", "hugs ' + esc(String(victim.toString())) + ' <3")');
    p.resolve(victim);
    return p.promise;
};
module.exports.level = 1;