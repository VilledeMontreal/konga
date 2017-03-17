/**
 * This file contains all necessary Angular controller definitions for 'frontend.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function() {
  'use strict';

  angular.module('frontend.upstreams')
    .controller('EditUpstreamTargetsController', [
      '$scope', '$rootScope','$stateParams',
        '$log', '$state','Upstream','MessageService','$uibModal','DataModel','ListConfig',
      function controller($scope,$rootScope,$stateParams,
                          $log, $state,Upstream, MessageService, $uibModal, DataModel, ListConfig ) {


          var Target = new DataModel('api/upstreams/' + $stateParams.id + '/targets')
          Target.setScope($scope, false, 'items', 'itemCount');

          // Add default list configuration variable to current scope
          $scope = angular.extend($scope, angular.copy(ListConfig.getConfig()));

          // Set initial data
          $scope.loading = false
          $scope.items = []
          $scope.totalItems = 0

          // Initialize used title items
          $scope.titleItems = ListConfig.getTitleItems('target');


          $scope.sort = {
              column: 'created_at',
              direction: true
          };

          // Initialize filters
          $scope.filters = {
              searchWord: '',
              columns: $scope.titleItems
          };

          $scope.changeSort = function changeSort(item) {
              var sort = $scope.sort;

              if (sort.column === item.column) {
                  sort.direction = !sort.direction;
              } else {
                  sort.column = item.column;
                  sort.direction = true;
              }
          };

          $scope.globalCheck = {
              isAllChecked : false
          };

          $scope.$watch('globalCheck.isAllChecked', function watcher(valueNew, valueOld) {
              if (valueNew !== valueOld) {
                  checkItems(valueNew)
              }
          });

          function checkItems(checked) {
              $scope.items.forEach(function(item){
                  item.checked = checked
              })
          }

          $scope.onAddTarget = function() {
              $uibModal.open({
                  animation: true,
                  ariaLabelledBy: 'modal-title',
                  ariaDescribedBy: 'modal-body',
                  templateUrl: 'js/app/upstreams/add-target-modal.html',
                  controller: [
                      '$scope','$rootScope','$log','$uibModalInstance','DataModel','_upstream',
                      function($scope,$rootScope,$log,$uibModalInstance,DataModel,_upstream) {

                          var targetModel = new DataModel('api/upstreams/' + _upstream.id + '/targets')

                          $scope.upstream = _upstream

                          $scope.item = {
                              target : '',
                              weight : 100
                          }

                          $scope.close = function() {
                              $uibModalInstance.dismiss()
                          }

                          $scope.submit = function() {
                              targetModel.create($scope.item)
                                  .then(function(resp){
                                      $log.debug("Create target =>",resp)
                                      $rootScope.$broadcast('upstream.target.created',resp)
                                      $uibModalInstance.dismiss()
                                  },function(err){
                                      $log.error("Create target error =>",err)
                                      $scope.errors = {}
                                      if(err.data && err.data.body){
                                          for(var key in err.data.body){
                                              $scope.errors[key] = err.data.body[key]
                                          }
                                      }
                                  })
                          }
                      }
                  ],
                  controllerAs: '$ctrl',
                  resolve : {
                      _upstream : function(){
                          return $scope.upstream
                      }
                  }
                  //size: 'lg',
              });
          }


          function _fetchData(){
              var config = ListConfig.getConfig();

              var parameters = {
                  size: config.itemsFetchSize
              };

              Target.load(_.merge({}, parameters)).then(function(response){
                  $scope.items = response.data
              });
          }


          _fetchData()

      }
    ])
  ;
}());
