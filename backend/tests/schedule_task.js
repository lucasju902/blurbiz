var io = require('socket.io-client')
var socket = io.connect('http://localhost:3040');
var baseTest = require('./base_auth_test.js');

baseTest.baseAuth(socket, function(token) {
	baseTest.checkResponse('schedule_task', token, socket);
	socket.emit('schedule_task', {
                'project_id': '1',
		'start_date': new Date(),
		'target_social_network': 'twitter',
		'title': 'title test',
		'description': 'description test',
                'token': token
        });
});

