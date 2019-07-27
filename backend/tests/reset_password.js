var io = require('socket.io-client')
var socket = io.connect('http://localhost:3040');
var baseTest = require('./base_auth_test.js');

baseTest.checkResponse('reset_password', null, socket);
socket.emit('reset_password', {
	'password': 'new_path',
	'confirm_password': 'new_path',
	'reset_code': '9930633a-6ce8-4019-83fb-f2d6e74c7d50'
});

