var io = require('socket.io-client')
var socket = io.connect('http://localhost:3040');
var baseTest = require('./base_auth_test.js');

baseTest.baseAuth(socket, function(token) {
        baseTest.checkResponse('confirmate_email', token, socket);
        socket.emit('confirmate_email', {
                'email_code': '68080683-37ea-4f7f-ae64-7476312222d8',
                'token': token
        });
});

