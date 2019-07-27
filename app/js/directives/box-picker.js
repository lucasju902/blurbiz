angular
    .module("Blurbiz")
    .directive("boxPicker", ["DropBoxSettings", function(DropBoxSettings) {
        return {
            restrict: "A",
            scope: {
                boxPickerFiles: "="
            },
            link: function(scope, element, attrs) {
                function instanciate() {
                    var success = false;
                    var boxSelect = new BoxSelect(boxoptions);
                    boxSelect.launchPopup();
                    boxSelect.success(function(files) {
                        if(!success){
                            boxSelect.closePopup();
                            scope.$apply(function() {
                                for (var i = 0; i < files.length; i++){
                                    scope.boxPickerFiles.push(files[i]);
                                }
                            });
                            //boxSelect.unregister(boxSelect.SUCCESS_EVENT_TYPE, successCallbackFunction);
                            success = true
                        }
                    });
                    boxSelect.cancel(function() {
                        console.log("The user clicked cancel or closed the popup");
                        boxSelect.closePopup();
                    });
                }

                function successCallbackFunction(){
                    boxSelect.closePopup();
                }

                var boxoptions = {
                    clientId: DropBoxSettings.box_clientId,
                    linkType: DropBoxSettings.box_linkType,
                    multiselect: DropBoxSettings.box_multiselect
                };
                element.bind("click", function() {
                    instanciate()
                })
            }
        }
    }]);