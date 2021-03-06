var vm = require('vm');
var fs = require('fs');
var winston = require('winston');
var Q = require('q');
var util = require('util');
var extend = require('util')._extend;
var request = require('request');
var PluginContext = vm.createContext();
var MongoClient = require('mongodb').MongoClient;
var context = vm.createContext();
var code = '';
var log = new winston.Logger({
    transports: [
    new winston.transports.Console({
        colorize: true,
        label: 'sandbox'
    })],
        exitOnError: false
});

process.on('message', function(m) {
    if (m.code) {
        code = m.code;
    }
    if (m.env) {
        PluginContext.global = JSON.parse(m.env);
        MongoClient.connect(PluginContext.global.mongo_url, function(err, db) {
            if (err) {
                process.send({reply: 'Something TERRIBLE happened.'});
                process.exit(1);
            }
            PluginContext.global.m = db;
            PluginContext.global.Q = Q;
            PluginContext.global.require = require;
            PluginContext.global.run = function(code) {
                process.send({
                    run: code
                });
            };
            PluginContext.global.reply = function(msg) {
                process.send({
                    reply: msg
                });
            };
            db.collection('users').find({
                account: PluginContext.global.account
            }).toArray(function(err, results) {
                if (!results[0]) {
                    PluginContext.global.reply('Something EVIL happened.');
                    process.exit(1);
                }
                PluginContext.global.user = results[0];
                PluginContext.global.log = log;
                process.send({
                    connected: true
                });
                var console = [];
                context.Q = Q;
                context.me = extend({toString: function(){return results[0].name;}}, results[0]);
                context.enableChaining = false;
                context.me.isPerson = true;
                context.global = context;
                PluginContext.global.userContext = context;
                fs.readdirSync('./commands').forEach(function(file) {
                    try {
                        var plugin = require('./commands/' + file);
                        if (PluginContext.global.user.level >= plugin.level) {
                            context[file.split('.')[0]] = require('./commands/' + file).fn.bind(PluginContext.global, PluginContext.global);
                        }
                    } catch (e) {
                        log.error('error loading ' + file + ': ' + e);
                        process.send({
                            reply: 'Error, failed to load ' + file + '. Maintenance may be in progress.'
                        });
                    }
                });
                vm.runInContext("delete Error.captureStackTrace;", context);
                var returned;
                var shouldExit = false;
                setImmediate(function() {
                    try {
                        returned = vm.runInContext(code, context);
                        if (typeof returned == 'undefined') {
                            returned = {
                                inspect: function() {
                                    return '\x0314undefined\x0F';
                                }
                            };
                        }
                        if (typeof returned.then == 'undefined') {
                            if (util.inspect(returned, {
                                depth: 0
                            }).length >= 200) {
                                var r = request.post('http://sprunge.us', function(err, res, body) {
                                    if (res.statusCode == 414 || res.statusCode == 413) {
                                        process.send({
                                            reply: 'Your reply of ' + util.inspect(returned, {
                                                depth: 0
                                            }).length + ' characters long is too big for a pastebin. Just get out.'
                                        });
                                        process.exit(1);
                                    }
                                    if (!body || err) {
                                        process.send({
                                            reply: 'Error uploading data.'
                                        });
                                        process.exit(1);
                                    }
                                    log.info(body);
                                    process.send({
                                        reply: body
                                    });
                                    process.exit(0);
                                    });
                                var form = r.form();
                                form.append('sprunge', 'the ^w irc bot\r\nby whiskers75 http://whiskers75.co.uk/\r\nGenerated for ' + PluginContext.global.nick + ' at ' + Date() + '\r\n\r\nYour output:\r\n\r\n' + String(util.inspect(returned, {
                                    depth: 0
                            })));
                            } else {
                                var inspected = String(util.inspect(returned, {
                                    depth: 0,
                                    colors: true
                                }));
                                inspected = inspected.replace(new RegExp('\u001b\\[39m', 'g'), '\u000f');
                                inspected = inspected.replace(new RegExp('\u001b\\[36m', 'g'), '\x0311');
                                inspected = inspected.replace(new RegExp('\u001b\\[1m', 'g'), '\x02');
                                inspected = inspected.replace(new RegExp('\u001b\\[22m', 'g'), '\x02');
                                inspected = inspected.replace(new RegExp('\u001b\\[32m', 'g'), '\x0303');
                                inspected = inspected.replace(new RegExp('\u001b\\[35m', 'g'), '\x0306');
                                inspected = inspected.replace(new RegExp('\u001b\\[33m', 'g'), '\x0308');
                                inspected = inspected.replace(new RegExp('\u001b\\[90m', 'g'), '\x0314');
                                inspected = inspected.replace(new RegExp('\u001b\\[31m', 'g'), '\x0304');
                                inspected = inspected.replace(/[\r\n\v\f\x85\u2028\u2029]/g, '');

                                process.send({
                                    reply: inspected
                                });

                                shouldExit = true;
                            }
                        } else {
                            if (typeof returned == 'undefined') {
                                return;
                            }
                            returned.then(function(resp) {
                                if (resp) {
                                    if (util.inspect(resp, {
                                        depth: 0
                                    }).length >= 200) {
                                        var r = request.post('http://sprunge.us', function(err, res, body) {
                                            if (res.statusCode == 414 || res.statusCode == 413) {
                                                process.send({
                                                    reply: 'Your reply of ' + util.inspect(resp, {
                                                        depth: 0
                                                    }).length + ' characters long is too big for a pastebin. Just get out.'
                                                });
                                                process.exit(1);
                                            }
                                            if (!body || err) {
                                                process.send({
                                                    reply: 'Error uploading data.'
                                                });
                                                process.exit(1);
                                            }
                                            log.info(body);
                                            process.send({
                                                reply: body
                                            });
                                            process.exit(0);
                                            });
                                        var form = r.form();
                                        form.append('sprunge', 'the ^w irc bot\r\nby whiskers75 http://whiskers75.co.uk/\r\nGenerated for ' + PluginContext.global.nick + ' at ' + Date() + '\r\n\r\nYour output:\r\n\r\n' + String(util.inspect(resp, {
                                            depth: 0
                                    })));
                                    } else {
                                        var inspected = String(util.inspect(resp, {
                                            depth: 0,
                                            colors: true
                                        }));
                                        inspected = inspected.replace(new RegExp('\u001b\\[39m', 'g'), '\u000f');
                                        inspected = inspected.replace(new RegExp('\u001b\\[36m', 'g'), '\x0311');
                                        inspected = inspected.replace(new RegExp('\u001b\\[1m', 'g'), '\x02');
                                        inspected = inspected.replace(new RegExp('\u001b\\[22m', 'g'), '\x02');
                                        inspected = inspected.replace(new RegExp('\u001b\\[32m', 'g'), '\x0303');
                                        inspected = inspected.replace(new RegExp('\u001b\\[35m', 'g'), '\x0306');
                                        inspected = inspected.replace(new RegExp('\u001b\\[33m', 'g'), '\x0308');
                                        inspected = inspected.replace(new RegExp('\u001b\\[90m', 'g'), '\x0314');
                                        inspected = inspected.replace(new RegExp('\u001b\\[31m', 'g'), '\x0304');
                                        inspected = inspected.replace(/[\r\n\v\f\x85\u2028\u2029]/g, '');

                                        process.send({
                                            reply: '.then(): ' + inspected
                                        });
                                    }
                                }
                                process.exit(0);
                            }, function(e) {
                                if (e.toString().length > 200) {
                                    return process.send({
                                        reply: 'Seriously? ಠ_ಠ (error length exceeds 200)'
                                    });
                                }
                                process.send({
                                    reply: 'Rejected: ' + e
                                });
                                process.exit(1);
                            });
                        }
                        if (shouldExit) process.exit(0);
                    } catch (e) {
                        if (util.inspect(e, {
                            depth: 0
                        }).length >= 200) {
                            return process.send({
                                reply: 'Seriously? ಠ_ಠ (error length exceeds 200)'
                            });
                        } else {
                            var inspected = String(util.inspect(e, {
                                depth: 0,
                                colors: true
                            }));
                            inspected = inspected.replace(new RegExp('\u001b\\[39m', 'g'), '\u000f');
                            inspected = inspected.replace(new RegExp('\u001b\\[36m', 'g'), '\x0311');
                            inspected = inspected.replace(new RegExp('\u001b\\[1m', 'g'), '\x02');
                            inspected = inspected.replace(new RegExp('\u001b\\[22m', 'g'), '\x02');
                            inspected = inspected.replace(new RegExp('\u001b\\[32m', 'g'), '\x0303');
                            inspected = inspected.replace(new RegExp('\u001b\\[35m', 'g'), '\x0306');
                            inspected = inspected.replace(new RegExp('\u001b\\[33m', 'g'), '\x0308');
                            inspected = inspected.replace(new RegExp('\u001b\\[90m', 'g'), '\x0314');
                            inspected = inspected.replace(new RegExp('\u001b\\[31m', 'g'), '\x0304');
                            inspected = inspected.replace(/[\r\n\v\f\x85\u2028\u2029]/g, '');
                            process.send({
                                reply: 'Uncaught \x0304' + inspected
                            });
                            process.exit(1);
                        }
                    }
                });
            });
        });
    }
});
