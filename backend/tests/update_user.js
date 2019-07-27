var io = require('socket.io-client')
var socket = io.connect('http://localhost:3040');
var baseTest = require('./base_auth_test.js');

baseTest.baseAuth(socket, function(token) {
	baseTest.checkResponse('update_user', token, socket);
        socket.emit('update_user', {
                'user_id': '18',
                'fields' : [
                        {
                                'name': 'is_confirmed',
                                'value': true
                        }
                ],
                'token': token
        });
});

