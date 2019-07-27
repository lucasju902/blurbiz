angular
	.module("Blurbiz")
	.provider("DropBoxSettings", function() {
		// default setting
	    this.box_linkType = 'shared', 
	    this.box_multiselect = 'true', 
	    this.box_clientId = null, 
	    this.linkType = 'preview', 
	    this.multiselect = false, 
	    this.extensions = ['.png','.jpg','.gif'], 

	    this.$get = function() {
	        return {
	            linkType: this.linkType,
	            multiselect: this.multiselect,
	            extensions: this.extensions,
	            box_linkType: this.box_linkType,
	            box_multiselect: this.box_multiselect,
	            box_clientId: this.box_clientId

	        }
	    },
	    this.configure = function(e) {
	        for (key in e) this[key] = e[key]
	    }

	});