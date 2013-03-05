/*
Entity Picker v 0.2.3
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
	var dataKey = "entitypicker";
	var entityAddedEvent = $.Event("entityadded");
	var entityRemovedEvent = $.Event("entityremoved");
	
	var defaults = {
		maxEntities: -1, //unlimited selection
		minSearchLength: 2, //start search after 2 characters
		source: function( request, response ) {
			response([{label: 'Source Not Configured', value: -1}]);
		},
		entityValue: function(entity) {
			return entity.value + ";" + entity.text;
		}
	};
	
	function resolveOptions(jQelem, options) {
		var allOptions = $.extend({}, defaults, options);
		
		//check for supported html5 data members and override global options
		if (jQelem.data("max-entities")) {
			allOptions.maxEntities = jQelem.data("max-entities");
		}
		
		if (jQelem.data("min-search-length")) {
			allOptions.minSearchLength = jQelem.data("min-search-length");
		}
		
		if (jQelem.data("input-name")) {
			allOptions.inputName = jQelem.data("input-name");
		} else {
			allOptions.inputName = jQelem.attr('id');
		}
		
		return allOptions;
	}
	
	function getEntityHtml(entity, configuration) {
		var resolvedValue = configuration.entityValue.apply(this, entity);
		return "<div class='entityContainer'><div class='entityEntry ui-widget ui-widget-content ui-state-default'><div class='innerWrapper'><span data-entity-id='"
				+ entity.value + "' class='entityDisplay'>" + entity.text +
				"</span><span class='ui-icon ui-icon-close deleteEntity'></span></div></div><input name='"
				+ configuration.inputName + "' type='hidden' value='" + resolvedValue + "'/></div>"
	}
	
	function internalAddEntities(entities) {
		$this = this;
		data = $this.data(dataKey);
		
		if ( ! data /*not initialized*/ ) {
			alert("You must first configure the picker before adding entries.");
		} else {
			userContainer = $this.find(".entityPickerParent div:first");
		
			$.each(entities, function(idx, item) {
				var existingUser = $this.find(".entityEntry span[data-entity-id='" + item.value + "']");
				if (existingUser.length > 0) {
					existingUser.effect("highlight", {}, 1000);
					return;
				}
		
				newEntity = $(getEntityHtml(item, data));
				userContainer.append(newEntity);
				entityAddedEvent.value = entityValue.apply($this, item);
				entityAddedEvent.text = item.text;
				entityAddedEvent.inputName = data.inputName;
				$this.trigger(entityAddedEvent);
			});
		
			if (data.maxEntities >= 0) {
				if ($this.find(".entityContainer").length >= data.maxEntities) {
					$this.addClass("entityPickerDisabled");
					$this.find("input.entityPickerInput").hide();
				}
			}
		}
	}
	
	var methods = {
	
		addEntity: function(entity) {
			return this.each(function() {
				internalAddEntities.apply($(this), $.makeArray(entity));
			});
		},
		
		addEntities: function(entities) {
			return this.each(function() {
				internalAddEntities.apply($(this), entities);
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
		
		init: function(options) {
			return this.each(function() {
				$this = $(this);
				data = $this.data(dataKey);
				
				if ( ! data ) {
					configured = resolveOptions($this, options);
					$this.data(dataKey, configured);
					
					//Set up the main HTML container:
					$this.html("<div class='entityPickerParent'><div></div><input type='text' class='entityPickerInput ui-widget'/><div class='entityClear'></div></div>");
					
					if (configured.maxEntities >= 0) {
						$this.attr("title", "This field is limited to " + configured.maxEntities + " selection" + (configured.maxEntities != 1 ? "s." : "."));
					
						if ($this.find(".entityContainer").length >= configured.maxEntities) {
							$this.addClass("entityPickerDisabled");
							$this.find("input.entityPickerInput").hide();
						}
					}
					
					$this
					.on("click", "span.deleteEntity", function () {
						var ctl = $(this).closest(".entityContainer");
						entityContainer = ctl.find("input");
						entityRemovedEvent.value = entityContainer.val();
						entityRemovedEvent.inputName = entityContainer.attr("name");
						$this.trigger(entityRemovedEvent);
						ctl.remove();
						
						var maxEntities = configured.maxEntities;
						var currentEntityCount = $this.find(".entityContainer").length;
						if (maxEntities < 0 || maxEntities > currentEntityCount) {
							$this.removeClass("entityPickerDisabled");
							$this.find("input.entityPickerInput").show().focus();
						}
					})
					.on("click", ":not(span.deleteEntity)", function (event) {
						var that = $(this).find("input.entityPickerInput");
						that.focus().val(that.val());
						event.stopPropagation();
					});
					
					pickerInput = $this.find("input.entityPickerInput")
					.on("focusout", function(event) {
						$(this).parent().removeClass("entityContainerFocused");
						event.stopPropagation();
					})
					.on("focusin", function(event) {
						$(this).parent().addClass("entityContainerFocused");
						event.stopPropagation();
					})
					.on("keydown", function(event) {
						$this = $(this);
						entityContainer = $this.parent().find(".entityContainer:last");
						entityEntry = entityContainer.find(".entityEntry");
						markedForDelete = entityEntry.hasClass("entityDelete");
						
						if ((event.keyCode == $.ui.keyCode.BACKSPACE) ||
							(event.keyCode == $.ui.keyCode.DELETE && markedForDelete)) {
							if ($this.val().length < 1 && entityContainer.length > 0) {
								if (markedForDelete) {
									entityInput = entityContainer.find("input");
									entityRemovedEvent.value = entityInput.val();
									entityRemovedEvent.inputName = entityInput.attr("name");
									$this.trigger(entityRemovedEvent);
									entityContainer.remove();
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
					.autocomplete({
						source: configured.source,
						minLength: configured.minSearchLength,
						select: function( event, ui ) {
							if ( ui.item ) {
								pickerContainer = $this.parent(".entityPickerParent").parent("div");
								var itemLabel = ui.item.label;
								var itemValue = ui.item.value;
								this.value = "";
								this.focus();
								methods.addEntity.call(pickerContainer, {value: itemValue, text: itemLabel});
								return false;
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
					});
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
