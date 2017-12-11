(function () {
    
        'use strict';
    
        var angular = require("angular");
    
        angular.module("livelearning")
            .factory("AuthService", AuthService);
    
        AuthService.$inject = ["$rootScope", "UserService","$q"];
    
        function AuthService($rootScope, UserService, $q) {
    
            var authenticateUser = function (userName, password) {
                var deferred = $q.defer();
                localStorage.removeItem("authentication");
                UserService.AuthenticateUser(userName, password)
                    .then(function (data) {
                          var currentUser = {
                            isAuthenticated: true,
                            userId: data.UserId,
                            userGroupId: data.UserGroupId
                        };
                          localStorage.setItem("authentication", JSON.stringify(currentUser));
    
                        deferred.resolve(true);
                    }, function (error) {
                        return deferred.reject(error);
                    });
                return deferred.promise;
            };
    
            var logout = function () {
    
            };
    
    
            var isAuthenticated = function () {
                var result = JSON.parse(localStorage.getItem("authentication"));
                if (result) {
                    $rootScope.currentUser = result;
                }
                return result !== null;
            };
    
            return {
                AuthenticateUser: authenticateUser,
                IsAuthenticated: isAuthenticated,
                LogOut: logout
            }
        }
    
    })();