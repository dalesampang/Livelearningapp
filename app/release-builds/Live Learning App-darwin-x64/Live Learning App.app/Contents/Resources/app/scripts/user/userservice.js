(function () {
    
        'use strict';
    
        var angular = require("angular");
    
        angular.module("livelearning")
            .factory("UserService", UserService);
    
        UserService.$inject = ["$rootScope","$resource", "$q"];
    
        function UserService($rootScope, $resource, $q) {
            var resource = $resource($rootScope.WebApiUrl + "api/user/:id", null,
                {
                    search: {
                        url: $rootScope.WebApiUrl + "api/user/search/:keyword",
                        isArray: true,
                        method: "GET"
                    },
                    query: { method: 'Get', isArray: true },
                    authenticateUser: {
                        url: $rootScope.WebApiUrl + "api/user/authenticateUser/:loginName/:password",
                        method: "POST",
                        params: {
                            loginName: "@loginName",
                            password: "@password"
                        }
                    },
                    update: {
                        method: 'PUT'
                    }
                }, { stripTrailingSlashes: false });
    
            var authenticateUser = function (userName, password) {
                var deferred = $q.defer();
    
                resource.authenticateUser({ loginName: userName, password: password },
                    function (data) { deferred.resolve(data) },
                    function (error) { deferred.reject(error) }
                );
    
                return deferred.promise;
            }
    
            var getAllUsers = function () {
                var deferred = $q.defer();
    
                resource.query({},
                    function (data) { deferred.resolve(data) },
                    function (error) { deferred.reject(error) }
                );
    
                return deferred.promise;
            }
    
            var getUserById = function (userId) {
                var deferred = $q.defer();
    
                resource.get({ id: userId },
                    function (data) { deferred.resolve(data) },
                    function (error) { deferred.reject(error) }
                );
    
                return deferred.promise;
            }
    
            var addUserProfile = function (user) {
    
                var deferred = $q.defer();
    
                resource.save(user,
                    function (result) {
                        deferred.resolve(result);
                    },
                    function (response) {
                        deferred.reject(response);
                    }
                );
    
                return deferred.promise;
            }
    
            var updateUserProfile = function (data) {
    
                var deferred = $q.defer();
    
                resource.update(data,
                    function (result) {
                        deferred.resolve(result);
                    },
                    function (response) {
                        deferred.reject(response);
                    }
                );
    
                return deferred.promise;
            }
    
            var searchUser = function (keyword) {
    
                var deferred = $q.defer();
    
                resource.search({ keyword: keyword },
                    function (result) {
                        deferred.resolve(result);
                    },
                    function (response) {
                        deferred.reject(response);
                    }
                );
    
                return deferred.promise;
    
            }
    
            return {
                AuthenticateUser: authenticateUser,
                GetAllUsers: getAllUsers,
                GetUserById: getUserById,
                AddUserProfile: addUserProfile,
                UpdateUserProfile: updateUserProfile,
                SearchUser: searchUser
            }
    
        }
    
    })();