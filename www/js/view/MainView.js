define(['lib/knockout', 'view/ControlBarView', 'view/LayerToolView', 'model/Factory', 'view/LayerItemFilter'],
    function (ko, ControlBarView, LayerToolView, Factory, LayerItemFilter) {

        // filter for numeric input fields
        ko.extenders.integer = function(target) {
            //create a writeable computed observable to intercept writes to our observable
            var result = ko.computed({
                read: target,  //always return the original observables value
                write: function(newValue) {
                    var current = target(),
                        newValueAsNum = isNaN(newValue) ? 0 : parseInt(newValue);

                    //only write if it changed
                    if (newValueAsNum !== current) {
                        target(newValueAsNum);
                    } else {
                        //if the rounded value is the same, but a different value was written, force a notification for the current field
                        if (newValue !== current) {
                            target.notifySubscribers(newValueAsNum);
                        }
                    }
                }
            }).extend({ notify: 'always' });

            //initialize with current value to make sure it is rounded appropriately
            result(target());

            //return the new computed observable
            return result;
        };

        function MainView(inputLayers) {
            this.inputLayers = inputLayers;
        }

        MainView.prototype.init = function () {
            var showLayerTool = ko.observable(false);
            var layerBucket = new Factory(this.inputLayers).createLayerModel();

            var controlBarView = new ControlBarView(showLayerTool);
            ko.applyBindings(controlBarView, document.getElementById('control-bar'));

            var layerToolView = new LayerToolView(layerBucket, showLayerTool);
            ko.applyBindings(layerToolView, document.getElementById('layers-tool'));

            var itemFilter = new LayerItemFilter(layerBucket);
            layerToolView.filter.subscribe(itemFilter.handle.bind(itemFilter));

            return layerBucket;
        };

        return MainView;
    }
);