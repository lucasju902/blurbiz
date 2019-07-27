var io = require('socket.io-client')
var socket = io.connect('http://localhost:3040');
var baseTest = require('./base_auth_test.js');

baseTest.baseAuth(socket, function(token) {
        baseTest.checkResponse('project_list', token, socket, function(msg) {
		if (msg.projects != null) {
                	console.log('CORRECT');
                } else {
                	console.log('ERROR: success == true, but projects field is null');
                }
	});
        socket.emit('project_list', {
                'token': token
        });
});


