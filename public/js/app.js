var App = angular.module('motorControl', ['ui.knob']);

App.factory('Socket', function($rootScope) {
  var uri = 'ws://10.0.0.23:8080/';

  $rootScope.connectionStatus = 'disconnected';

  var socket = {
    status: 'disconnected',
    session: null,
    connected: function(session) {
      $rootScope.$apply(function() {
        this.session = session;
        this.status = 'connected';
      }.bind(this));
    },
    disconnected: function() {
      $rootScope.$apply(function() {
        this.status = 'disconnected';

      }.bind(this));
    },
    onMotorEvent: function(topic, data) {}
  };

  ab.connect(uri, function(session) {
    console.log("Connected to WAMP server.");

    socket.connected(session);
    session.subscribe('ws://10.0.0.23:8080#motors', socket.onMotorEvent);
  }, function(code, reason, details) {
    console.log("Disconnected from WAMP server.");
    socket.disconnected();
  });

  return socket;
});

function arrayObjectIndexOf(myArray, searchTerm, property) {
      for(var i = 0, len = myArray.length; i < len; i++) {
                if (myArray[i][property] === searchTerm) return i;
    }
    return -1;
}

App.controller('MotorCtrl', function($scope, $rootScope, Socket) {
  $scope.socket = Socket;
  $scope.motors = [];

  $scope.socket.onMotorEvent = function(topic, motors) {
    console.log(motors);

    $scope.$apply(function() {
      if (angular.isArray(motors)) {
        angular.forEach(motors, function(motor) {
          $scope.updateMotor(motor);
        });
      } else {
        $scope.updateMotor(motors);
      }
    });
  };

  $scope.updateMotor = function(motor) {
    index = arrayObjectIndexOf($scope.motors, motor.Id, 'Id');

    if (index > -1) {
      $scope.motors[index].Power = motor.Power;
    } else {
      $scope.motors.push(motor);
    }

  };
});
