var io = require('socket.io-client')
var socket = io.connect('http://localhost:3040');

var userData = 'TestUserBasePassword@gmail.com';

console.log('send forgot password message: user ' + userData);

socket.emit('forgot_password', {
        'email': userData,
	'front_path': 'http://www.blurbiz.com/forgot_password/'
});

socket.on('forgot_password_response', function(msg) {
	console.log('forgot_password_response: ' + JSON.stringify(msg));
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
