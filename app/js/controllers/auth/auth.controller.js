/**
 * Master Controller
 */

angular.module('Blurbiz')
  .controller('AuthController', ['$scope', '$state', '$cookies', 'LocalStorageService', 'socket', AuthController]);

function AuthController($scope, $state, $cookies, LocalStorageService, socket) {

  $scope.message = {};

  initController();

  function initController() {
    LocalStorageService.delete('jwtToken');
    LocalStorageService.delete('is_confirmed');
  }

  $scope.login = function () {
    socket.emit('authenticate', {
      'login': $scope.email,
      'password': $scope.password
    });
  };

  socket.on('authenticate_response', function (msg) {
    //debugger;
    console.log('authenticate response: ' + JSON.stringify(msg));
    if (msg.success == false) {
      $scope.message = {
        error: msg.msg,
        success: false
      };
      return;
    }
    if (msg == null) {
      console.log('ERROR: msg is null');
      return;
    }
    if (msg.success == true && msg.token != null) {
      console.log('CORRECT');
      LocalStorageService.saveToken(msg.token);
      LocalStorageService.put('is_confirmed', msg.is_confirmed);
      $state.go('project.index');
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
  $scope.signup = function () {
    socket.emit('signup', {
      'password': $scope.password,
      'name': $scope.name,
      'company': $scope.company,
      'email': $scope.email,
      'front_path': 'http://localhost:4000/#/confirm/'
    });
  };

  socket.on('signup_response', function (msg) {
    //debugger;
    console.log('singup response: ' + JSON.stringify(msg));
    if (msg == null) {
      console.log('ERROR: msg is null');
      return;
    }

    if (msg.success == false) {
      console.log('ERROR: expected answer - { success: true }, err: ' + msg.msg);
      $scope.message = {
        error: msg.msg,
        success: false
      };
    } else {
      console.log('CORRECT');

      socket.emit('authenticate', {
        'login': $scope.email,
        'password': $scope.password
      });
    }
  });

}