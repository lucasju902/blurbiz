module.exports = {

	//calback with 1 param - token
	baseAuth: function (socket, callback) {
		console.log('send authenticate message: user TestUserBase@gmail.com');

		socket.emit('authenticate', {
		        'login': 'TestUserBase@gmail.com',
		        'password': 'Test'
		});

		socket.on('authenticate_response', function(msg) {
			console.log('authenticate response: ' + JSON.stringify(msg));
		        if (msg == null) {
        	        	console.log('ERROR: msg is null');
                		return;
		        }
	        	if (msg.success == true && msg.token != null) {
				if (callback) {
					callback(msg.token);
				} else {
					console.log('ERROR: callback is null');
				}
	        	        return;
        		}
		        if (msg.success == true && msg.token == null) {
        	        	console.log('ERROR: token is null');
                		return;
		        }
		        if (msg.err != null && msg.err != '') {
	        	        console.log('ERROR: ' + err);
        		}
		});
	},

	checkResponse: function (methodName, token, socket, successCallback) {
		console.log('send ' + methodName + ' message with token = ' + token);
		var methodResponseName = methodName + '_response';

	        socket.on(methodResponseName, function(msg) {
                console.log('received ' + methodResponseName + ': ' + JSON.stringify(msg));
	                if (msg == null) {
                        	console.log('ERROR: msg is null');
                	        return;
        	        }
	                if (msg.success == true) {
				if (successCallback) {
					successCallback(msg);
				} else {
	                	        console.log('CORRECT');
				}
        	        }
	                if (msg.err != null && msg.err != '') {
                        	console.log('ERROR: ' + err);
                	        return;
        	        }
	        });
	}
}
