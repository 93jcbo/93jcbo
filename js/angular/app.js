(function(){
	var app = angular.module('portfolio',['ui.router', 'ngTouch', 'ngAnimate', 'angularytics','ui.bootstrap','bootstrapLightbox', 'ngSanitize']);

    app.config(function($stateProvider, $locationProvider, $urlRouterProvider, $uiViewScrollProvider, $urlMatcherFactoryProvider, AngularyticsProvider, LightboxProvider){
        $urlRouterProvider.otherwise("/jacob-amador");
        $urlRouterProvider.rule(function ($injector, $location) {
            var path = $location.url();

            // check to see if the path already has a slash where it should be
            if (path[path.length - 1] === '/' || path.indexOf('/#') > -1) {
                return;
            }

            if (path.indexOf('#') > -1) {
                return path.replace('#', '/#');
            }

            return path + '/';
        });


        $stateProvider
            .state('about', {
                url:"/jacob-amador/",
                templateUrl:"partials/about.html",
                data: {
                    pageTitle:'About and Contact - '
                }
            })
            .state('webwork', {
                url:"/hci-design-portfolio/",
                templateUrl:"partials/webwork.html",
                controller: 'WebsiteListCtrl',
                data: {
                    pageTitle:'HCI Design Portfolio - '
                }
            })
            .state('webwork.website', {
                url:":siteID/",
                templateUrl:"partials/website.html",
                controller: 'WebsiteDetailCtrl'
            })
            .state('ar', {
                url:"/augmented-reality/",
                templateUrl:"partials/ar.html",
                data:{
                    pageTitle:'Augmented Reality - '
                }
            });

        $locationProvider.html5Mode(true);
        $uiViewScrollProvider.useAnchorScroll();
        $urlMatcherFactoryProvider.strictMode(false);
        AngularyticsProvider.setEventHandlers(['Console', 'GoogleUniversal']);
        LightboxProvider.templateUrl = 'partials/modal-lightbox.html';
        LightboxProvider.calculateImageDimensionLimits = function (dimensions) {
            return {
                'maxWidth': dimensions.windowWidth >= 768 ? // default
                dimensions.windowWidth - 92 :
                dimensions.windowWidth - 52,
                'maxHeight': 1600                           // custom
            };
        };
        LightboxProvider.calculateModalDimensions = function (dimensions) {
            var width = Math.max(350, dimensions.imageDisplayWidth + 32);
            if (width >= dimensions.windowWidth - 20 || dimensions.windowWidth < 768) {
                width = 'auto';
            }
            return {
                'width': width,                             // default
                'height': 'auto'                            // custom
            };
        };
    });

    app.run([ '$rootScope', '$state', '$stateParams', 'Angularytics',function ($rootScope, $state, $stateParams, Angularytics) {
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;
        Angularytics.init();
    }]);

    app.factory('$websites', function($http){
        function getData(callback){
            $http({
                method: 'GET',
                url: 'js/angular/data/webwork.json',
                cache: true
            }).success(callback);
        }
        return {
            list: getData,
            find: function(siteID, callback){
                getData(function(data) {
                    var website = data.filter(function(entry){
                        return entry.url === siteID;
                    })[0];
                    callback(website);
                });
            }
        };
    });

    //app.factory('$badges',function($http){
    //    function getData(callback){
    //        $http({
    //            method: 'GET',
    //            url: 'js/angular/data/badges.json',
    //            cache: true
    //        }).success(callback);
    //    }
    //    return getData(function(data){
    //        return data.badges;
    //    });
    //});

    app.controller('WebsiteListCtrl', function ($scope, $websites, $state){
        $websites.list(function(websites) {
            $scope.websites = websites;
        });
        if ($state.is("webwork")){
            $scope.hideDiv = true;
        }
        else {
            $scope.hideDiv = false;
        }
        $scope.hideIntro=function(){
            $scope.hideDiv = false;
        }
    });

    app.controller('WebsiteDetailCtrl', function ($scope, $stateParams, $websites, $state){
        $websites.find($stateParams.siteID, function(website) {
            $scope.website = website;
            if(!$scope.website){
                $state.go('webwork');
            }
            // Set page Title
            $state.current.data = {
                pageTitle : website.name.replace('&nbsp;', ' ') + ' - '
            };
        });
        $scope.$on('ngRepeatFinished', function (ngRepeatFinishedEvent) {
            pSwipe();
        });
    });

    app.controller('StateChangeCtrl', function ($scope, $rootScope, $state, $window, $interval){
        $scope.isWebsite = 0;

        $rootScope.$on('$viewContentLoaded',
            function(event){
                if($state.includes('website')||$state.includes('webwork')){
                    $scope.isWebsite = 1;
                }
            }
        );
        $rootScope.$on('$stateChangeStart',
            function(event, toState, toParams, fromState, fromParams){
                $scope.isWebsite = 0;
                $window.scrollTo(0,0);
            }
        )
    });

    app.controller('BadgesCtrl', function ($scope, $http, Lightbox){
        $scope.badges = [];
        $http({
            method: 'GET',
            url: 'js/angular/data/badges.json',
            cache: true
        }).then(function(response) {
            for (var b = 0; b < response.data.badges.length; b++) {
                $scope.badges.push(response.data.badges[b].assertion.badge);
            }
        });

        $scope.openLBModal = function(index){
            Lightbox.openModal($scope.badges, index)
        };

        $scope.showB = [];
        for (var b = 0; b < $scope.badges.length ;b++){
            $scope.showB.push(true)
        }

        $scope.toggleBadge = function(index){
            for (var i=0; i<$scope.showB.length ;i++){
                if (i !== index){
                    $scope.showB[i] = false;
                }
            }
            return $scope.showB[index] = !$scope.showB[index];
        };
    });

    app.controller('InstagramCtrl' ,function($scope, $http){
       /*$http({
           method:'GET',
           url:'https://api.instagram.json.com/v1/tags/93jcbo_com/media/recent?access_token=320903506.4e8cfd7.8325b0cc9b294e1996cfd2aff95f0eb9',
           cache:true
       }).then(function(){
           console.log(data);
       })*/
        $scope.images = [];
        $http({
            method:'GET',
            url: 'js/angular/data/instagram.json',
            cache: true
        }).then(function(response){
            $scope.images = response.data.data;
        });
        //var rows = 3;
        //var perRow = 3;
        $scope.displayLimit = function(){
            return 12;
            //return rows * perRow;
        };
        $scope.moreAvailable = function(){
            return rows < ($scope.images.length/perRow);
        };
        $scope.showMore = function(){
            rows += 2;
        };
        $scope.$on('ngRepeatFinished', function (ngRepeatFinishedEvent) {
            pSwipe();
        });
    });

    app.directive('websiteList', function(){
        return {
            restrict: 'AE',
            templateUrl:'partials/weblistDirective.html',
            controller:'WebsiteListCtrl'
        }
    });

    app.filter('removeCompleted', function(){
        return function(input){
            return input.split('Completed ').pop();
        }
    });

    app.filter('strip93jcbo', function(){
        return function(input){
            return input.split(' #93jcbo_com').shift();
        }
    });

    app.filter('trustHTML', function($sce){
        return function(input){
            return $sce.trustAsHtml(input);
        }
    });

    app.directive('onFinish', function ($timeout) {
        return {
            restrict: 'A',
            link: function (scope, element, attr) {
                if (scope.$last === true) {
                    $timeout(function () {
                        scope.$emit('ngRepeatFinished');
                    });
                }
            }
        }
    });
})();
