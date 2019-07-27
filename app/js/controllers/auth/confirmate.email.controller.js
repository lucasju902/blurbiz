/**
 * Master Controller
 */

angular.module('Blurbiz')
  .controller('ConfirmateEmailController', ['$scope', '$cookies', 'LocalStorageService', '$stateParams', '$timeout', '$state', 'socket', ConfirmateEmailController]);

function ConfirmateEmailController($scope, $cookies, LocalStorageService, $stateParams, $timeout, $state, socket) {
  var token = LocalStorageService.getToken();
  var email_code = $stateParams.email_code;

  console.log(token);
  console.log(email_code);

  $scope.message = {};
  $scope.confirmate_email = function () {
    socket.emit('confirmate_email', {
      'email_code': email_code,
      'token': token
    });
  };

  $scope.confirmate_email();

  socket.on('confirmate_email_response', function (msg) {
    //debugger;
    console.log('confirmate_email_response: ' + JSON.stringify(msg));
    if (msg == null) {
      console.log('ERROR: msg is null');
      return;
    }

    if (msg.success == false) {
      $scope.message = {
        error: msg.msg,
        success: false
      };
      console.log('ERROR: expected answer - { success: true }, err: ' + msg.msg);

    } else {
      LocalStorageService.put('is_confirmed', true);
      $scope.message = {
        error: false,
        success: 'Verification success!'
      };

      $timeout(function(){
        $state.go('project.index');
      }, 4000);

      console.log('CORRECT');
    }
  });
} // <-- ConfirmateEmailController