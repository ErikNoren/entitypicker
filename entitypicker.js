/*
Entity Picker v 0.5.5
Copyright (C) 2013 Erik Noren

Permission is hereby granted, free of charge, to any person obtaining a copy of this software
and associated documentation files (the "Software"), to deal in the Software without restriction,
including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING
BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

;(function ( $, undefined ) {
	"use strict";
	
	var dataKey = "entitypicker";
	var entityAddedEvent = $.Event("entityadded");
	var entityRemovedEvent = $.Event("entityremoved");
	
	var defaults = {
		_autocomplete: {
			minLength: 2, //start search after 2 characters
			delay: 500, //time to wait until search starts (ms)
			source: function( request, response ) {
				response([{label: 'Source Not Configured', value: -1}]);
			}
		},
		maxEntities: -1, //unlimited selection
		maxEntitiesMessage: function(maxEntityCount) { 
			return maxEntityCount >= 0 ? "This field is limited to " + maxEntityCount + " selection" + (maxEntityCount != 1 ? "s." : ".") : "";
		},
		entityValue: function(entity) {
			return entity.value + ";" + entity.label;
		}
	};
	
	var requiredAutocompleteOptions = {
		select: function( event, ui ) {
			if ( ui.item ) {
				var pickerContainer = $(this).parent(".entityPickerParent").parent();
				var testItem = ui.item;
				this.value = "";
				this.focus();
				methods.addEntity.call(pickerContainer, testItem);
				return false; //stop autocomplete from polluting picker input
			}
		},
		focus: function( event, ui ) {
			//prevent the autocomplete's input from changing as the user
			//navigates the available options. This seems like a better
			//user experience when data isn't a simple list.
			this.selectedItem = null;
			return false;
		},
		open: function() {
			$( this ).removeClass( "ui-corner-all" ).addClass( "ui-corner-top" );
		},
		close: function() {
			$( this ).removeClass( "ui-corner-top" ).addClass( "ui-corner-all" );
		}
	};
	
	function resolveOptions(jQelem, options) {
		var allOptions = $.extend({}, defaults, options);
		
		//check for supported html5 data members and override global options
		if (typeof jQelem.data("max-entities") !== 'undefined') {
			allOptions.maxEntities = jQelem.data("max-entities");
		}
		
		if (typeof jQelem.data("max-entities-message") !== 'undefined') {
			allOptions.maxEntitiesMessage = jQelem.data("max-entities-message");
		}
		
		if (typeof jQelem.data("min-length") !== 'undefined') {
			allOptions._autocomplete.minLength = jQelem.data("min-length");
		}
		
		if (typeof jQelem.data("delay") !== 'undefined') {
			allOptions._autocomplete.delay = jQelem.data("delay");
		}
		
		if (typeof jQelem.data("input-name") !== 'undefined') {
			allOptions.inputName = jQelem.data("input-name");
		} else {
			allOptions.inputName = jQelem.attr('id');
		}
		
		return allOptions;
	}
	
	function getEntityHtml(entity, configuration) {
		var resolvedValue = configuration.entityValue.call(this, entity);
		return "<div class='entityContainer'><div class='entityEntry ui-widget ui-widget-content ui-state-default'><div class='innerWrapper'><span data-entity-id='"
				+ entity.value + "' class='entityDisplay'>" + entity.label +
				"</span><span class='ui-icon ui-icon-close deleteEntity'></span></div></div><input name='"
				+ configuration.inputName + "' type='hidden' value='" + resolvedValue + "'/></div>"
	}
	
	function internalAddEntities(entities) {
		var $this = this;
		var data = $this.data(dataKey);
		
		if ( ! data /*not initialized*/ ) {
			alert("You must first configure the picker before adding entries.");
		} else {
			var userContainer = $this.find(".entityPickerParent div:first");
		
			$.each(entities, function(idx, item) {
				var existingUser = $this.find(".entityEntry span[data-entity-id='" + item.value + "']");
				if (existingUser.length > 0) {
					existingUser.effect("highlight", {}, 1000);
					return;
				}
		
				var newEntity = $(getEntityHtml(item, data));
				userContainer.append(newEntity);
				entityAddedEvent.value = data.entityValue.call($this, item);
				entityAddedEvent.text = item.label;
				entityAddedEvent.inputName = data.inputName;
				$this.trigger(entityAddedEvent);
			});
		
			if (data.maxEntities >= 0) {
				if ($this.find(".entityContainer").length >= data.maxEntities) {
					$this.addClass("entityPickerDisabled");
					$this.find("input.entityPickerInput").autocomplete("option", "disabled", true).hide();
				}
			}
		}
	}
	
	function internalDeleteEntity(entityContainer) {
		var $this = $(this);
		var parentContainer = $this.closest(".entityPickerParent").parent();
		var data = parentContainer.data(dataKey);
		
		deleteEntity.call($this, entityContainer);
		
		var maxEntities = data.maxEntities;
		var currentEntityCount = entityContainer.length;
		if (maxEntities < 0 || maxEntities >= currentEntityCount) {
			parentContainer.removeClass("entityPickerDisabled");
			var autocomplete = parentContainer.find("input.entityPickerInput");
			autocomplete.show().autocomplete("option", "disabled", false);
			autocomplete.focus().val(autocomplete.val());
		}
	}
	
	function internalDeleteEntities(data) {
		var $this = this; //called with jquery context
		$this.find("div.entityContainer").each(function(idx, elem) {
			deleteEntity.call($this, $(elem));
		});
		
		var maxEntities = data.maxEntities;
		if (maxEntities != 0) {
			$this.removeClass("entityPickerDisabled");
			$this.find("input.entityPickerInput").show().autocomplete("option", "disabled", false);
		}
	}
	
	function deleteEntity(entityContainer) {
		var $input = entityContainer.find("input");
		
		entityRemovedEvent.value = $input.val();
		entityRemovedEvent.inputName = $input.attr("name");
		
		this.trigger(entityRemovedEvent);
		entityContainer.remove();
	}
	
	var methods = {
	
		addEntity: function(entity) {
			return this.each(function() {
				internalAddEntities.call($(this), [].concat(entity));
			});
		},
		
		addEntities: function(entities) {
			return this.each(function() {
				internalAddEntities.call($(this), entities);
			});
		},
		
		getEntities: function(entities) {
			if (typeof entities === 'undefined') {
				entities = new Array();
			}
			
			$(this).find(".entityContainer input").each(function() {
				entities.push({ value: this.value, name: this.name });
			});
			
			return entities;
		},
		
		changeSource: function(source) {
			return this.each(function() {
				var $this = $(this);
				var data = $this.data(dataKey);
				
				if ( ! data /*not initialized*/ ) {
					alert("You must first configure the picker before refreshing the autocomplete source.");
				} else {
					$this.find("input.entityPickerInput").autocomplete("option", "source", source);
				}
			});
		},
		
		clearEntities: function() {
			return this.each(function() {
				var $this = $(this);
				var data = $this.data(dataKey);
				
				if ( ! data /*not initialized*/ ) {
					alert("You must first configure the picker before calling methods.");
				} else {
					$this.find(".entityContainer").each(function(idx, elem) {
						internalDeleteEntities.call($this, data);
					});
				}
			});
		},
		
		init: function(options) {
			return this.each(function() {
				var $this = $(this);
				var data = $this.data(dataKey);
				
				if ( ! data ) {
					var configured = resolveOptions($this, options);
					$this.data(dataKey, configured);
					
					//Set up the main HTML container:
					$this.html("<div class='entityPickerParent'><div></div><input type='text' class='entityPickerInput ui-widget'/><div class='entityClear'></div></div>");
					
					if (typeof configured.maxEntitiesMessage === "string" && configured.maxEntitiesMessage.length > 0) {
						$this.attr("title", configured.maxEntitiesMessage);
					} else if (typeof configured.maxEntitiesMessage === "function") {
						var message = configured.maxEntitiesMessage.call(this, configured.maxEntities);
						if (typeof message === 'string' && message.length > 0) {
							$this.attr("title", message);
						}
					}
					
					if (configured.maxEntities >= 0) {
						if ($this.find(".entityContainer").length >= configured.maxEntities) {
							$this.addClass("entityPickerDisabled");
							$this.find("input.entityPickerInput").hide();
						}
					}
					
					//join autocomplete properties with our necessary presets
					var autocompleteProperties = $.extend({}, configured._autocomplete, configured.autocomplete, requiredAutocompleteOptions);
					
					$this
					.on("click", "span.deleteEntity", function (event) {
						var $this = $(this);
						var ctl = $this.closest(".entityContainer");
						internalDeleteEntity.call($this, ctl);
						event.stopPropagation();
					})
					.on("click", ":not(span.deleteEntity)", function (event) {
						var $this = $(this);
						var inputIsChild = $this.find("input.entityPickerInput");
						
						if (inputIsChild.length > 0) {
							inputIsChild.focus().val(inputIsChild.val());
						} else {
							var value = $(this).val();
							if (value.length >= autocompleteProperties.minLength && !($this.autocomplete("option", "disabled"))) {
								$this.autocomplete("search", value);
							}
						}
						
						event.stopPropagation();
					});
					
					var pickerInput = $this.find("input.entityPickerInput")
					.on("focusout", function(event) {
						var $this = $(this);
						$this.parent().removeClass("entityContainerFocused");
						if ($this.val().length > 0) {
							$this.addClass("entityPickerUnresolved");
							$this.trigger("entityunresolved");
						}
					})
					.on("focusin", function(event) {
						var $this = $(this);
						$this.parent().addClass("entityContainerFocused");
						$this.removeClass("entityPickerUnresolved");
						var value = $this.val();
						if (value.length >= autocompleteProperties.minLength && !($this.autocomplete("option", "disabled"))) {
							$this.autocomplete("search", value);
						}
					})
					.on("keydown", function(event) {
						var $this = $(this);
						var entityContainer = $this.parent().find(".entityContainer:last");
						var entityEntry = entityContainer.find(".entityEntry");
						var markedForDelete = entityEntry.hasClass("entityDelete");
						
						if ((event.keyCode == $.ui.keyCode.BACKSPACE) ||
							(event.keyCode == $.ui.keyCode.DELETE && markedForDelete)) {
							if ($this.val().length < 1 && entityContainer.length > 0) {
								if (markedForDelete) {
									internalDeleteEntity.call($this, entityContainer);
								} else {
									entityEntry.addClass("entityDelete");
								}
							}
						} else {
							if (markedForDelete) {
								entityEntry.removeClass("entityDelete");
							}
						}
					})
					.autocomplete(autocompleteProperties);
				}
			});
		}
	};
	
	$.fn.entitypicker = function(method) {	
		if (typeof $.fn.autocomplete === 'undefined') {
			alert("This component requires jQuery autocomplete.");
			return this;
		}
		
		if (typeof $.fn.effect === 'undefined') {
			alert("This component requries jQuery UI effect.");
			return this;
		}
		
		if ( methods[method] ) {
			return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof method === 'object' || ! method ) {
			return methods.init.apply( this, arguments );
		}
	};
})( jQuery );
