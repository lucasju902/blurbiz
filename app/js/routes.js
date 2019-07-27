(function () {
    'use strict';

    /**
     * Route configuration for the Blurbiz module.
     */
    angular.module('Blurbiz').config(['$stateProvider', '$urlRouterProvider',
        function($stateProvider, $urlRouterProvider) {

            // For unmatched routes
            $urlRouterProvider.otherwise('/login');

            // Application routes
            $stateProvider
                .state('login', {
                    url: '/login',
                    templateUrl: 'templates/login.html',
                    controller: 'AuthController'
                })
                .state('register', {
                    url: '/signup', 
                    templateUrl: 'templates/signup.html',
                    controller: 'AuthController'
                })
                .state('wait-confirm', {
                    url: '/wait-confirm',
                    templateUrl: 'templates/wait-confirm.html',
                    controller: 'WaitConfirmateEmailController'
                })
                .state('confirm', {
                    url: '/confirm/{email_code}',
                    templateUrl: 'templates/confirm.html',
                    controller: 'ConfirmateEmailController'
                })
                .state('index', {
                    url: '',
                    abstract: true,
                    templateUrl: 'templates/index.html',
                    controller: 'IndexController'
                })
                .state('project', {
                    url: '/project',
                    parent: 'index',
                    abstract: true,
                    template: '<div ui-view></div>'
                })
                .state('project.index', {
                    url: '/all',
                    templateUrl: 'templates/project/all.html',
                    controller: 'Project.IndexController', 
                    data: {
                        title: 'All Projects'
                    }
                })
                .state('project.edit',  {
                    url: '/:id?access_token',
                    templateUrl: 'templates/project/edit.html',
                    controller: 'Project.EditController',
                    data: {
                        title: ''
                    }
                })
                .state('tables', {
                    url: '/tables',
                    parent: 'index',
                    templateUrl: 'templates/tables.html',
                    data: {
                        title: 'Schedule'
                    }
                })
                .state('instagram_token', {
                    url: '/access_token={token:.+}',
                    templateUrl: 'templates/index.html',
                    controller: function($scope, $stateParams) {
                        var project_id = sessionStorage.getItem("project_id");
                        localStorage.setItem("instagram_token", $stateParams.token);
                        location.reload();
                        window.close();
                        // window.location.href = "/#/project/"+project_id+"?access_token="+$stateParams.token;

                    }
                })
        }
    ])
    .config(['DropBoxSettingsProvider', function(DropBoxSettingsProvider) {
        DropBoxSettingsProvider.configure({
            multiselect: true,
            // box_clientId: 'ol9shnikyhmp0eag26fp6tdq02l3bgqv',
            box_clientId: 'vkf7vdl1p0156bdr8qskkag869exln71',
            extensions: [ '.gif','.png','.jpg', 'jpeg'],//dropbox file 
            box_linkType: 'direct'
        });
    }])
    .config(['lkGoogleSettingsProvider', function(lkGoogleSettingsProvider) {
        lkGoogleSettingsProvider.configure({
            apiKey   : 'AIzaSyAqBcpJG3DFVEfgHGdSHlCj_zW-GbMTByk',
            clientId : '944689281546-s3o8lk1e093a3mjetpfgj9hic7r5saae.apps.googleusercontent.com',
            scopes   : ['https://www.googleapis.com/auth/drive'],
        });
    }])
    .run(['$rootScope', '$state', 'LocalStorageService', function($rootScope, $state, LocalStorageService) {
          $rootScope.$on('$stateChangeStart',
            function(event, toState, toParams, fromState, fromParams, options){

                // redirect to login page if user not loggedin
                var token = LocalStorageService.getToken();
                var publicPages = ['login', 'register'];
                var restrictedPage = publicPages.indexOf(toState.name) === -1;

                if (restrictedPage && (token === undefined || token === null)){
                    event.preventDefault();
                    $state.go('login')
                }

                // redirect to wait confirm if email not confirmed
                //todo exclude other routes if needed
                var exclude_routes = [
                  'login',
                  'register',
                  'confirm',
                  'wait-confirm'
                ];
                var userEmailisConfirmed = LocalStorageService.get('is_confirmed');
                userEmailisConfirmed = (userEmailisConfirmed !== undefined && userEmailisConfirmed !== null) ? JSON.parse(userEmailisConfirmed) : false;
                if (exclude_routes.indexOf(toState.name) === -1 && userEmailisConfirmed === false){
                    event.preventDefault();
                    $state.go('wait-confirm')
                }
          });
      }
      ]);
    // .run(['$http', '$rootScope', '$window', '$cookieStore', 'UserService', function($http, $rootScope, $window, $cookieStore, UserService) {
    //     // add JWT token as default auth header
    //     $http.defaults.headers.common['Authorization'] = 'Bearer ' + $window.jwtToken;

    //     // update active tab on state change
    //     $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
    //         $rootScope.pageTitle = toState.data.pageTitle;
    //     });

    //     /**
    //      * Sidebar Toggle & Cookie Control
    //      */
    //     var mobileView = 992;

    //     UserService.GetCurrent().then(function(user) {
    //         $rootScope.user = user;
    //     });

    //     $rootScope.getWidth = function() {
    //         return window.innerWidth;
    //     };

    //     $rootScope.$watch($rootScope.getWidth, function(newValue, oldValue) {
    //         if (newValue >= mobileView) {
    //             if (angular.isDefined($cookieStore.get('toggle'))) {
    //                 $rootScope.toggle = ! $cookieStore.get('toggle') ? false : true;
    //             } else {
    //                 $rootScope.toggle = true;
    //             }
    //         } else {
    //             $rootScope.toggle = false;
    //         }

    //     });

    //     $rootScope.toggleSidebar = function() {
    //         $rootScope.toggle = !$rootScope.toggle;
    //         $cookieStore.put('toggle', $rootScope.toggle);
    //     };

    //     window.onresize = function() {
    //         $rootScope.$apply();
    //     };
    // }]);    

    // manually bootstrap angular after the JWT token is retrieved from the server
    // $(function () {
    //     // get JWT token from server
    //     $.get('/app/token', function (token) {
    //         window.jwtToken = token;

    //         angular.bootstrap(document, ['Blurbiz']);
    //     });
    // });
})();