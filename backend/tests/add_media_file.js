var io = require('socket.io-client')
var socket = io.connect('http://localhost:3040');
var baseTest = require('./base_auth_test.js');

baseTest.baseAuth(socket, function(token) {
	baseTest.checkResponse('media_file_add', token, socket, function(msg) {
		if (msg.success) {
			console.log('SUCCESS');
		} else {
			console.log('ERROR: ' + msg.err);
		}
	});
	socket.emit('media_file_add', {
                'project_id': '1',
		'path': 'test_path',
                'token': token
        });
});

