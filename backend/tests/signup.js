var io = require('socket.io-client')
var socket = io.connect('http://localhost:3040');

function randomIntInc (low, high) {
    return Math.floor(Math.random() * (high - low + 1) + low);
}


var nowDate = new Date();
var userData = 'TestUser' + nowDate.getTime() + '_' + randomIntInc(100, 10000) + '@gmail.com';

console.log('send signup message: create user ' + userData);

socket.emit('signup', {
        'password': userData,
        'name': 'Test Name',
        'company': 'Test',
        'email': userData,
	'front_path': 'http://www.blurbiz.com/confirm/'
});

socket.on('signup_response', function(msg) {
	console.log('singup response: ' + JSON.stringify(msg));
	if (msg == null) {
                console.log('ERROR: msg is null');
                return;
        }

	if (msg.success == false) {
		console.log('ERROR: expected answer - { success: true }, err: ' + msg.msg);
	} else {
		console.log('CORRECT');
	}
});
