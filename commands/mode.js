module.exports.fn = function(global, mode, target) {
    var p = global.Q.defer();
    global.m.collection('users').find({
        host: global.raw.host,
        user: global.raw.user
    }).toArray(function(err, results) {
        if (err) return p.reject(err.message);
        if (!results[0][global.to]) {
            p.reject('No permissions.');
            return;
        }
        if (results[0][global.to].indexOf('mode') == -1) {
            p.reject('No permissions.');
            return;
        }
        global.run("w.send('MODE', '" + global.to + "', '" + mode + "'" + (target ? ", '" + target + "')" : ")"));
        p.resolve();
    });
    return p.promise;
};
module.exports.level = 1;