(function () {
    'use strict';

    angular
        .module('Blurbiz')
        .factory('AuthService', Service);

    function Service(socket) {
        var service = {};
        service.login = login;
        service.signup = signup;
        service.confirmation = email_confirmation;

        return service;

        function login(email, password) {
        	socket.emit('authenticate', {
	            'login': 'TestUserBase@gmail.com',
	            'password': 'Test'
	        });	
        }  

        function signup() {
        	socket.emit('signup', {
		    	'password': userData,
		    	'name': 'Test Name',
		    	'company': 'Test',
		    	'email': userData,
		    	'front_path': 'http://www.blurbiz.com/confirm/'
			});
        } 

        function email_confirmation() {
        	socket.emit('confirmate_email', {
            	'email_code': '68080683-37ea-4f7f-ae64-7476312222d8',
            	'token': token
    		});
        }     
    }

})();