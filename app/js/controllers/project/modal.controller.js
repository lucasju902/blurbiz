(function () {
    'use strict';

    angular
        .module('Blurbiz.project')
        .controller('Project.CreateModalController', Controller);

    function Controller($scope, $uibModalInstance, $state, LocalStorageService, socket) {

        $scope.ok = function() {
            socket.emit('create_project', {
                'project_name': $scope.project_name,
                'token': LocalStorageService.getToken()
            });
            $uibModalInstance.close();
        };

        socket.on('create_project_response', function(msg) {
            console.log('create project response: ' + JSON.stringify(msg));
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
              $state.go('project.edit', {id: msg.new_project_id});
            }
        });

        $scope.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        };
        
    }

})();