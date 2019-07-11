'use strict';

angular.module('emission.survey.enketo.launch', [
  'emission.services',
  'emission.enketo-survey.service',
  'emission.plugin.logger',
])
.controller('EnketoSurveyCtrl', function($scope, $state, $stateParams, $rootScope,
  $ionicPopup, EnketoSurvey
) {
  if (!$rootScope.previousState){
    $ionicPopup.alert("No previousState defined, going back to diary")
    $state.go("root.main.diary")
  } else if (!angular.isDefined($stateParams.form_location)) {
    $ionicPopup.alert("No form location defined, going back to diary")
    .then(function() {
      $state.go("root.main.diary")
    });
  } else {
    EnketoSurvey.init({
      form_location: $stateParams.form_location,
      opts: $stateParams.opts,
      trip: $rootScope.confirmSurveyTrip,
    })
    .then(function(){
      $('.form-header').after(EnketoSurvey.getState().loaded_form);
      return;
    })
    .then(EnketoSurvey.displayForm)
    .then(function(loadErrors){
      if (loadErrors.length > 0) {
        $ionicPopup.alert({template: "loadErrors: " + loadErrors.join(",")});
      }
    });
  }

  $scope.validateForm = function() {
    EnketoSurvey.validateForm()
    .then(function(valid){
      if (!valid) {
        $ionicPopup.alert({template: 'Form contains errors. Please see fields marked in red.'});
      } else {
        const data = valid;
        const answer = EnketoSurvey.populateLabels(
          EnketoSurvey.makeAnswerFromAnswerData(data)
        );
        $rootScope.confirmSurveyTrip.userSurveyAnswer = answer;
        $state.go($rootScope.previousState, $rootScope.previousStateParams);
      }
    });
  }
});
