(function () {
    'use strict';

    angular
        .module('Blurbiz.project')
        .controller('Project.IndexController', Controller);

    function Controller($window, $scope, $rootScope, $uibModal, socket, ProjectService, FlashService, LocalStorageService) {

        var token = LocalStorageService.getToken();
        $scope.emptyImg = 'img/empty.png';

        $scope.sort_item = 'project_name';

        $scope.deleteProject = function(id) {
            socket.on('delete_project_response', function(msg) {
                console.log('received project delete response: ' + JSON.stringify(msg));
                if (msg == null) {
                        console.log('ERROR: msg is null');
                        return;
                }
                if (msg.success == true) {
                        sendProjectListMessage(token);
                }
                if (msg.err != null && msg.err != '') {
                        console.log('ERROR: ' + err);
                        return;
                }
            });
            socket.emit('delete_project', {
                    'project_id': id,
                    'token': token
            });
        }

        /******************************/

        /** 
         * video &image checker
         */

        $scope.isImage = function(path) {
            if(!path)
                return false;
            return !!path.match(/.+(\.jpg|\.jpeg|\.png|\.gif)$/);
        }

        $scope.isVideo = function(path) {
            if(!path)
                return false;
            return !!path.match(/.+(\.mp4|\.avi|\.mpeg|\.flv|\.mov)$/);
        }


        /**
         * Modal
         */

        $scope.openModal = function() {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'createProjectModal.html',
                controller: 'Project.CreateModalController'
            });

            modalInstance.result.then(function (newProjectName) {
                $scope.newProjectName = newProjectName;
                console.log(newProjectName);
            });
        };
        
        initController();

        function initController() {
            // get current user
            // ProjectService.GetAll($rootScope.user._id).then(function (projects) {
            //     $scope.projects = projects;
            // });

             sendProjectListMessage(token);

        }

        function sendProjectListMessage(token) {
            console.log('send project list message with token = ' + token);
            socket.on('project_list_response', function(msg) {
                console.log('received project list response: ' + JSON.stringify(msg));
                if (msg == null) {
                        console.log('ERROR: msg is null');
                        return;
                }
                if (msg.success == true) {
                        if (msg.projects != null) {
                                console.log('CORRECT');
                                $scope.projects = msg.projects;
                        } else {
                                console.log('ERROR: success == true, but projects field is null');
                        }
                        return;
                }
                if (msg.err != null && msg.err != '') {
                        console.log('ERROR: ' + err);
                        return;
                }
            });
            socket.emit('project_list', {
                    'token': token
            });
        }


        function saveUser() {
            UserService.Update(vm.user)
                .then(function () {
                    FlashService.Success('User updated');
                })
                .catch(function (error) {
                    FlashService.Error(error);
                });
        }

        function deleteUser() {
            UserService.Delete(vm.user._id)
                .then(function () {
                    // log user out
                    $window.location = '/login';
                })
                .catch(function (error) {
                    FlashService.Error(error);
                });
        }
    }

})();