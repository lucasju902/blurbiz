var io = require('socket.io-client')
var socket = io.connect('http://localhost:3040');
var baseTest = require('./base_auth_test.js');

function randomIntInc (low, high) {
    return Math.floor(Math.random() * (high - low + 1) + low);
}


var nowDate = new Date();
var projectData = 'test_project_' + nowDate.getTime() + '_' + randomIntInc(100, 10000);

baseTest.baseAuth(socket, function(token) {
	baseTest.checkResponse('create_project', token, socket, function(msg) {
		if (msg.new_project_id != null) {
                	console.log('CORRECT');
                } else {
                	console.log('ERROR: success == true, but new_project_id is null');
                }
	});

        socket.emit('create_project', {
                'project_name': projectData,
                'token': token
        });	
});

