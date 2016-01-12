angular.module('app.projectAndTask', [])

.controller('ProjectAndTaskController', function($scope, $state, $stateParams, Organization, Tasks, Users, Project, Auth) {

  $scope.user = {};
  $scope.data = {};

  Users.getLoggedInUser()
    .then(function(user) {
      $scope.user = user;
    });

  var initialize = function() {
    $scope.getProjectInfo()
      .then($scope.getOrganizationUsers)
      .then($scope.getProjectUsers)
      .then($scope.getTaskUsers)
    $scope.data.task = {};
  };

  // Current Project Id is passed on through $stateParams
  $scope.getProjectInfo = function() {
    return Project.getProjectById($stateParams.projectId)
      .then(function(project) {
        $scope.data.project = project;
        $scope.data.tasks = project.tasks;
      });
  };

  // get all of the User objects from the database and save them
  // these users populate the 'Assignee' dropdown menue of the task form
  $scope.getProjectUsers = function() {
    return Project.getUserByProjectId($scope.data.project._id)
      .then(function(users) {
        $scope.data.projectUsers = users;
      })
      .catch(function(err) {
        console.log(err);
      });
  };

  $scope.addUserToProject = function(userId) {
    if (userId) {
      Users.addProjectToUser({
        userId: userId,
        projectId: $scope.data.project._id
      }).then(initialize);
    }
  };

  $scope.removeUserFromProject = function(userId) {
    if (userId) {
      Users.removeProjectToUser({
          projectId: $scope.data.project._id,
          userId: userId
        })
        .then(initialize);
    }
  };

  $scope.getOrganizationUsers = function() {
    return Organization.getUserByOrganizationId($scope.data.project.org_id)
      .then(function(users) {
        $scope.data.orgUsers = users;
      });
  };

  $scope.getTaskUsers = function() {
    $scope.data.tasks = $scope.data.tasks.map(function(task) {
      task.users = [];
      $scope.data.projectUsers.forEach(function(user) {
        user.task_list.forEach(function(userTask) {
          if (task._id === userTask._id) {
            task.users.push(user);
          }
        });
      });
      return task;
    });
  };

  $scope.submitTask = function(data) {
    console.log('Submit');
    if (data._id) {
      if (data.userId) {
        $scope.assignUserToTask(data.userId, data._id);
      }
      $scope.updateTask(data)
        .then(initialize);
    } else {
      $scope.createNewTask(data)
        .then(initialize);
    }
  }

  $scope.createNewTask = function(data) {
    data.projectId = $scope.data.project._id;
    return Tasks.createTaskByProject(data)
      .then(function(task) {
        if (data.userId) {
          $scope.assignUserToTask(data.userId, task._id);
        }
      });
  };

  $scope.assignUserToTask = function(userId, taskId) {
    return Users.addTaskToUser({
      userId: userId,
      taskId: taskId
    })
  };

  // delete a task from the database
  $scope.updateTask = function(task) {
    console.log('Update');
    return Tasks.updateTaskById(task)
      .catch(function(err) {
        console.log(err);
      });
  };

  $scope.removeTask = function(task){
    Tasks.removeTask(task)
      .then(initialize);
  };


  // load task details into the task form
  // this function is called anytime that you click on a individual task
  $scope.loadTaskDetails = function(task) {
    // load the task details into the form
    $scope.data.task = task;
  };

  // reset the task form
  // this function is called anytime the task form is submitted or closed
  $scope.resetTaskDetails = function() {
    $scope.data.task = {};
  };


  // if a task is not completed and does not have any users, it belongs in the Staging area
  //&& !Tasks.isTaskAssigned({id: task._id});
  $scope.stagingFilter = function(task) {
    return !task.isCompleted && task.users.length === 0;
  };

  // if a task is not completed but has been assigned to a user, it belongs in the Assigned area
  $scope.assignedFilter = function(task) {
    return !task.isCompleted && task.users.length > 0;
  };

  // if a task has been completed, it belongs in the Completed area
  $scope.completedFilter = function(task) {
    return task.isCompleted ? true : false;
  };

  initialize();
});
