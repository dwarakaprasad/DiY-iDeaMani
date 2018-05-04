/**** ideaMani Canvas Drwaing Directives  ****/
require(['angular'],function(){
    
   angular.module('app.canvasDrawing',[])
    
    .factory('CanvasDataSet', function(){
        'user strict';
        return function (data,options){
            return new vis.DataSet(data,options);
        }
   })
    
   .directive('ideaManiProcessDiagram', ['$compile','$injector','$document', function($compile, $injector,$document) {
        document.oncontextmenu = function(e) {
          if(e.target.hasAttribute('right-click')){
              return false;
          }  
        };
        return {
           restrict: 'EA',
           transclude: false,
           scope: {
               nodesData: '=',
               edgesData: '=',
               graphOptions: '=',
               callBackService: '='
            },
            link: function (scope, element, attr){
                
                var nodesData               = scope.nodesData;
                var edgesData               = scope.edgesData;
                var graphOptions            = scope.graphOptions;
                var networkContainerWidth   = element[0].offsetHeight;
                var networkContainerHeight  = element[0].offsetWidth;
                var contextPopupMenu        = undefined;
                var ctxPopupOpen            = false;
                
                /** injecting call back service **/
                scope.callBackService    = attr.callBackService;
                var proxyService         = $injector.get(scope.callBackService);
                
                /** badway of injecting vis**/
                var vis                  = require("vis");
                
                var diagramData = {
                    nodes: nodesData,
                    edges: edgesData
                };
                
                var processDiagram = new vis.Network(element[0], diagramData, graphOptions);
                positionDigram();
                
                function positionDigram() {
                    var nodeXYCoordinates = processDiagram.getPositions();
                    console.log("nodeXYCoordinates ::",nodeXYCoordinates);
                    console.log("networkContainerWidth ::",networkContainerWidth);
                    console.log("networkContainerHeight ::",networkContainerHeight);
                    var newX = networkContainerWidth / 4;
                    var newY = networkContainerHeight / 4;
                    //for now manually position it
                    processDiagram.moveNode(1,-700,-400);
                }
                
                processDiagram.on('click', function(params){ 
                    console.log("params ::",params);
                    destroyContextMenu();
                });
            
                function destroyContextMenu(){
                    if(ctxPopupOpen){
                         var ctxPopupMenuElem = angular.element($document[0].querySelector('.popupContextMenu'));
                         ctxPopupMenuElem.remove();
                         ctxPopupOpen = false;
                    }
                }                      
                
                element.bind('contextmenu',function(e){
                    console.log("User Right is hijaked ....")
                    var pageX = e.pageX;
                    var pageY = e.pageY;
                    var offsetX = e.offsetX;
                    var offsetY = e.offsetY;
                    console.log("pageX ::",pageX);
                    console.log("pageY ::",pageY);
                    console.log("offsetX ::",offsetX);
                    console.log("offsetY ::",offsetY);
                    
                    var contextMenuLeft  = (pageX - offsetX);
                    var contextMenuTop  = (pageY - offsetY);
                    console.log("contextMenuLeft ::",contextMenuLeft);
                    console.log("contextMenuTop ::",contextMenuTop);
                    if(ctxPopupOpen){
                        destroyContextMenu();    
                    }
                    var selectedNodes = processDiagram.getSelection().nodes;
                    //there are/is selected Nodes
                    if(selectedNodes && selectedNodes.length >0){
                        angular.forEach(selectedNodes, function(value, key) {
                          console.log('Node key ' + key + ': '+ 'Node Value ' + + value);
                            //later write the logic based on selected node type also based on multiple selection
                        });
                        var newElement = $compile('<div class="popupContextMenu" style="left:'+contextMenuLeft+'px; top:'+contextMenuTop+'px; "><div class="popupHeader">DiYRules-Context Menu</div><div class="ctxContent"><ul class="dashed-list"><li>+&nbsp;&nbsp;Add Stop Process</li><li>+&nbsp;&nbsp;Add Rules</li><li>+&nbsp;&nbsp;Add Rulesheet</li><li>+&nbsp;&nbsp;Add Process</li><li></li><li>-&nbsp;&nbsp;Delete Selected</li><li>+&nbsp;&nbsp;Add Connector</li></ul></div></div>')(scope);
                          element.append(newElement);
                          ctxPopupOpen = true;    
                    }else{
                        var newElement = $compile('<div class="popupContextMenu" style="left:'+contextMenuLeft+'px; top:'+contextMenuTop+'px; "><div class="popupHeader">DiYRules-Context Menu</div><div class="ctxContent"><ul class="dashed-list"><li>+&nbsp;&nbsp;Add Stop Process</li><li>+&nbsp;&nbsp;Add Rules</li><li>+&nbsp;&nbsp;Add Rulesheet</li><li>+&nbsp;&nbsp;Add Process</li><li></li><li>-&nbsp;&nbsp;Clear Canvas</li><li>&nbsp;&nbsp;&nbsp;Refresh</li></ul></div></div>')(scope);
                        element.append(newElement);
                        ctxPopupOpen = true;
                    }
                        
                    
                    e.preventDefault();
                }); /** end of right click **/
                
            }    
        };
   
   }])
    
    
    /** diyProcessDiagram **/
   .directive('diyProcessDiagram', ['$compile','$injector','$document', function($compile, $injector,$document) {
       return { 
           restrict: 'EA',
           transclude: false,
           scope: {
               data: '=',
               options: '=',
               events: '=',
               callBackService: '='
           },
           link: function (scope, element, attr){
               
               console.log("options received::",scope.options);
               console.log("data received::",scope.data);
               
               scope.callBackService    = attr.callBackService;
               var proxyService         = $injector.get(scope.callBackService);
               //very bad way of injecting
               var vis                  = require("vis");
               var nodesData            = scope.data.nodes;
               var nodes                = new vis.DataSet(nodesData);
               console.log("nodesData :::::::::::::::::::::::::::::::",nodesData);
               console.log("nodes    ::::::::::::::::::::::::::::::::",nodes);
               
               
               var processDiagramEvents = [
                   'click',
                   'doubleclick',
                   'oncontext',
                   'hold',
                   'release',
                   'selectNode',
                   'selectEdge',
                   'deselectNode',
                   'deselectEdge',
                   'dragStart',
                   'dragging',
                   'dragEnd',
                   'hoverNode',
                   'blurNode',
                   'zoom',
                   'showPopup',
                   'hidePopup',
                   'startStabilizing',
                   'stabilizationProcess',
                   'stabilizationIterationsDone',
                   'stabilized',
                   'resize',
                   'initRedraw',
                   'beforeDrawing',
                   'afterDrawing',
                   'animationFinished'
               ];
               
               var processDiagram = null;
               scope.$watch('data', function(){
                   console.log("data changed");
                   if(scope.data === null){
                       return;
                   }
               })
               
               if(processDiagram !=null){
                   processDiagram.destroy();
               }
               
               processDiagram = new vis.Network(element[0], scope.data, scope.options);
               
               processDiagram.on('doubleClick', scope.onDoubleClick);
               processDiagram.on('hold', scope.onHoldClick);  
               processDiagram.on('release', scope.onReleaseClick);   
               processDiagram.on('click', function(params){
                   scope.onClick(params);
               });   
               
               
               
               scope.onDoubleClick = function() {
                    var doubleClickTime = new Date();
                    console.log("execute onDoubleClick function@",doubleClickTime);
                   var r = confirm("Do you want to edit  the node ?");
                   console.log("r ",r);
                   processDiagram.editNode();
               }
               scope.onHoldClick = function() {
                    var onHoldTime = new Date();
                    console.log("execute onHoldCliked function@",onHoldTime);
               }
               scope.onReleaseClick = function() {
                    var onReleaseTime = new Date();
                    console.log("execute onReleaseClick function@",onReleaseTime);
               }
               
               scope.onClick = function(params) {
                   console.log("params ::", params);
                   var nodeId = params['nodes']['0'];
                   if(nodeId){
                       console.log("clicked nodeId  ::",nodeId); 
                       console.log("nodesData getAll()::",nodes.getIds());
                       var clickedNode =  nodes.get(1);
                       clickedNode = {id: 100, label: 'Mallesh'};
                       clickedNode.color = {
                           background: '#000000'
                       }
                       scope.data.nodes.update(clickedNode);
                       
                       console.log("clickedNode ::", clickedNode);
                       
                   }
                   
                   console.log("execute onClick function@",processDiagram.getSelection());
                   var selectedEdges = processDiagram.getSelection().edges;
                   var selectedNodes = processDiagram.getSelection().nodes;
                   angular.forEach(selectedEdges, function(value, key) {
                      console.log('Edge key ' + key + ': '+ 'Edge Value ' + + value);
                    });
                   
                   angular.forEach(selectedNodes, function(value, key) {
                      console.log('Node key ' + key + ': '+ 'Node Value ' + + value);
                    });
                   
               }
               

                                 
               angular.forEach(scope.events, function (callback, event){
                   console.log("Event For Each");
                   if(processDiagramEvents.indexOf(String(event)) >=0){
                      processDiagram.on(event,callback); 
                   }
               });
               
               if(scope.events != null && scope.events.onload != null && angular.isFunction(scope.events.onload)){
                   console.log("Event Fired!!");
                   scope.events.onload(processDiagram);
               }

            
               scope.$watchCollection('options', function (options){
                   console.log("options changed ::",options);
                   if(processDiagram == null){
                       return;
                   }
                   processDiagram.setOptions(options);
               });
               
                scope.$watchCollection(function(){ return proxyService.visCanvasOptions}, function(processNodeOptions){
                        console.log("options changed ::",processNodeOptions);
                       if(processDiagram == null){
                           return;
                       }
                       processDiagram.setOptions(processNodeOptions);
                       processDiagram.addEdgeMode();
                       processDiagram.on('doubleClick', scope.onDoubleClick);
                       processDiagram.on('hold', scope.onHoldClick);  
                       processDiagram.on('release', scope.onReleaseClick);
                       processDiagram.on('click', function(params){
                           console.log("scope.onClick ::",params);
                           scope.onClick(params);
                       }); 
                });
               
                scope.$watchCollection(function(){ return proxyService.visCanvasData}, function(processNodesData){
                    if(processDiagram === null || !(processNodesData)){
                       return;
                   }
                   
                   processDiagram = new vis.Network(element[0], processNodesData, scope.options);
                   processDiagram.on('doubleClick', scope.onDoubleClick);
                   processDiagram.on('hold', scope.onHoldClick);    
                   processDiagram.on('release', scope.onReleaseClick);
                   processDiagram.on('click', function(params){
                       console.log("scope.onClick ::",params);
                       scope.onClick(params);
                    });  
                    
                });
               
               scope.$watch(function(){ return proxyService.processNodes}, function(processNodes){
                    if(processNodes === null || !(processNodes)){
                       return;
                   }
                    console.log("processNodes ::",processNodes);
                   
                   console.log("$document[0] ::",$document[0]);
                   
                   /*processDiagram = new vis.Network(element[0], processNodesData, scope.options);
                   processDiagram.on('doubleClick', scope.onDoubleClick);
                   processDiagram.on('hold', scope.onHoldClick);    
                   processDiagram.on('release', scope.onReleaseClick);
                   processDiagram.on('click', scope.onClick);  */ 
                    
                });
               
               
               
               
           }
       };
   }]);
    
});