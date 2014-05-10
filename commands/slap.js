module.exports.fn = function(global, victim) {
    var p = global.Q.defer();
    var esc = global.require('js-string-escape');
    global.m.collection('users').find({
        host: global.raw.host,
        user: global.raw.user
    }).toArray(function(err, results) {
        if (typeof global.slapped != 'undefined' && global.slapped > 2 && global.user.level < 10) {
            p.reject('pls2notspam');
            return p.promise;
        }
        if (typeof victim.isPerson != 'boolean') {
            p.reject('You can\'t slap a ' + typeof victim + '! (try getUser(\'person\').then(slap)');
            return p.promise;
        }
        if (!victim.isPerson) {
            p.reject('You can\'t slap inanimate objects. (try getUser(\'person\').then(slap)');
            return p.promise;
        }
        if (typeof victim.toString != 'function') {
            p.reject('wat?');
            return p.promise;
        }
        if (typeof global.slapped == 'undefined') global.slapped = 0;
        global.slapped++;
        global.run('w.action("' + global.to + '", "slaps ' + esc(String(victim.toString())) + ' around a bit with a large trout!")');
        if (global.userContext.enableChaining) {
            p.resolve(victim);
        }
        else {
            p.resolve();
        }
    });
    return p.promise;
};
module.exports.level = 1;