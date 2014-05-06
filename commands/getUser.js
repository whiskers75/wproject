module.exports.fn = function(global, person) {
    var p = global.Q.defer();
    global.m.collection('users').find({
        name: person
    }).toArray(function(err, results) {
        if (results.length === 0) {
            p.reject('no person found');
            return;
        }
        results[0].isPerson = true;
        results[0].toString = function(){return results[0].name};
        results[0].inspect = function(){return '[' + results[0].name + ' (' + results[0].user + '@' + results[0].host + ')]'};
        p.resolve(results[0]);
    });
    return p.promise;
};
module.exports.level = 1;