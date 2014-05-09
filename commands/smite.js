module.exports.fn = function(global, victim) {
    var p = global.Q.defer();
    var esc = global.require('js-string-escape');
    global.m.collection('users').find({
        host: global.raw.host,
        user: global.raw.user
    }).toArray(function(err, results) {
        global.run('w.action("' + global.to + '", "smites ' + esc(String(victim)).replace(/[\r\n\v\f\x85\u2028\u2029]/g, '') + ' with his +5,+5 quarterstaff of chaos!")');
        p.resolve();
    });
    return p.promise;
};
module.exports.level = 9001;