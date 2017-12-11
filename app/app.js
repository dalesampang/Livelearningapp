(function(){

    'use strict';
    
        angular.module('livelearning',['ngRoute']) 
        .config(routeConfig);
        
            routeConfig.$inject = ["$routeProvider", "$locationProvider", "$httpProvider"];
        
            function routeConfig($routeProvider, $locationProvider, $httpProvider) {
        
                $routeProvider
                    .when("/Login", {
                        templateUrl: "views/login.html",
                        controller: "HomeController"
                    })
                    .when("/",{
                        templateUrl: "views/login"
                    })
                    .otherwise({ redirectTo: "index.html"});
        
                $locationProvider.html5Mode({
                    enabled: true,
                    requireBase: false
                    });
            }
            // RouteChange.$inject = ['$rootScope', '$location', 'AuthService', 'MandatoryFieldService','$q'];
            // function RouteChange($rootScope, $location, AuthService, MandatoryFieldService, $q) {
            //     $rootScope.$on('$routeChangeStart', function (event, next) {
                    
            //         if (!AuthService.IsAuthenticated()) {
            //             $location.path("/Login");
            //         }
            //     });
            // }
}());