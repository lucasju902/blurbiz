var io = require('socket.io-client')
var socket = io.connect('http://localhost:3040');
var baseTest = require('./base_auth_test.js');

baseTest.baseAuth(socket, function(token) {
	baseTest.checkResponse('update_project', token, socket);
	socket.emit('update_project', {
                'project_id': '3',
                'fields' : [
                        {
                                'name': 'project_name',
                                'value': 'project_name_test_1'
                        }
                ],
                'token': token
        });
});

