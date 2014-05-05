module.exports.fn = function(global, chan) {
    var p = global.Q.defer();
    global.m.collection('users').find({
        host: global.raw.host,
        user: global.raw.user
    }).toArray(function(err, results) {
        global.run('w.part("' + chan + '");');
        p.resolve();
    });
    return p.promise;
};
module.exports.level = 9000;