module.exports.fn = function(global, victim) {
    var p = global.Q.defer();
    if (typeof global.slapped != 'undefined' && global.slapped > 2 && global.user.level < 10) {
        p.reject('pls2notspam');
        return p.promise;
    }
    if (typeof global.slapped == 'undefined') global.slapped = 0;
    global.slapped++;
    global.run('w.action("' + global.to + '", "meows at ' + global.user.name + '!")');
    return p.promise;
};
module.exports.level = 1;