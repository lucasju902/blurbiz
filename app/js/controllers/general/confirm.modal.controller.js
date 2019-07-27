(function () {
    'use strict';

    angular
        .module('Blurbiz')
        .controller('ConfirmModalController', Controller);

    function Controller($scope, $uibModalInstance, content) {

        $scope.content = content;

        $scope.ok = function() {
            $uibModalInstance.close('ok');
        };

        $scope.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        };
        
    }

})();