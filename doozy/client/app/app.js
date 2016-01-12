angular.module('app', [
  'directives.organizationCard',
  'directives.projectCard',
  'directives.navBar',
  'directives.userManager',
  'directives.taskManager',
  'directives.taskDetail',
  'app.services',
  'app.tasks',
  'app.auth',
  'ui.router',
  'app.org',
  'app.projectAndTask',
  'ngRoute',
  'ngAnimate',
  'ngFx'
])
.config(function($stateProvider, $httpProvider, $locationProvider) {

  $stateProvider
    .state('signin', {
      url: '/',
      controller: 'AuthController',
      templateUrl: '/app/auth/signin.html'
    })
    .state('signup', {
      url: "/signup" ,
      controller: 'AuthController',
      templateUrl: '/app/auth/signup.html'
    })
    .state('tasks', {
      url: '/tasks',
      controller: 'TasksController',
      templateUrl: 'app/tasks/tasks.html',
      authenticate: true,
    })
    .state('project', {
      url: '/project/:projectId',
      templateUrl: '/app/projectAndTask/projectAndTask.html',
      controller: 'ProjectAndTaskController',
      authenticate: true
    })
    .state('landing', {
      url: '/landing',
      templateUrl: '/app/tasks/landing.html',
      controller: 'TasksController',
      authenticate: true
    })
    .state('org', {
      url: '/organization',
      templateUrl: '/app/org/org.html',
      controller: 'OrgController',
      authenticate: true,
    });
  //   .when('/signin', {
  //     templateUrl: '/app/auth/signin.html',
  //     controller: 'AuthController'
  //   })
  //
  //   .when('/signup', {
  //     templateUrl: '/app/auth/signup.html',
  //     controller: 'AuthController'
  //   })
  //   .when('/tasks', {
  //     templateUrl: '/app/tasks/tasks.html',
  //     controller: 'TasksController',
  //     authenticate: true,
  //   })
  //   .otherwise({
  //     redirectTo: '/tasks'
  //   });

  $httpProvider.interceptors.push('AttachTokens');
  $locationProvider.html5Mode({
    enabled: true,
    requireBase: false
  });
})
.factory('AttachTokens', function ($window) {
  // adds web token to headers
  var attach = {
    request: function (object) {
      var jwt = $window.localStorage.getItem('auth-token');
      if (jwt) {
        object.headers['x-access-token'] = jwt;
      }
      object.headers['Allow-Control-Allow-Origin'] = '*';
      return object;
    }
  };
  return attach;
})
.run(function ($rootScope, $location, $state, Auth) {
  $rootScope.$on('$stateChangeStart',
    function(event, toState, toParams, fromState, fromParams){
      console.log('auth', Auth.isAuth());
      if(toState && toState.authenticate && !Auth.isAuth()) {
        $location.path('/');
      }
      else if(toState.name === 'signin' && Auth.isAuth()) {
        $location.path('/landing');
        $state.go('landing');
      }
  });
// .run(function ($rootScope, $location, Auth) {
//   // checks if user is logged in with any route change
//   $rootScope.$on('$routeChangeStart', function (evt, next, current) {
//     if (next.$$route && next.$$route.authenticate && !Auth.isAuth()) {
//       $location.path('/signin');
//     }
//   });
});
