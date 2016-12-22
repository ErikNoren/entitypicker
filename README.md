entitypicker
============

A jQuery plugin which utilizes UI autocomplete to allow for more advanced entity (people or users, places, things) picking and editing. It supports all the sources jQuery autocomplete supports, generates HTML input tags that are suitable for submitting through a form as well as the ability to retrieve the chosen entities as JSON objects for use in AJAX style services. Using the entitypicker methods, you can add entities programmatically in order to restore values that have previously been saved (for use on an edit screen, for instance).

Here's a [live demo+](http://htmlpreview.github.com/?https://github.com/ErikNoren/entitypicker/blob/master/entitypickerdemo.html?v=10) to check out some of the features.

*+Due to the way GitHub seems to serve CSS and JS files with mime types inconsistent with standard, IE is refusing to load the resources. This appears to work fine in Chrome though console warnings about mime type mismatch do appear.*

**Bug fix in 0.5.5**

* Removing a selection now properly raises the entityRemovedEvent. Thanks to jpock76 for spotting the swapped lines. Closed #6 "entityremoved not being raised"

**New in 0.5.2**

* Fixed bubbling of events in click handlers causing problems - now bubbling is stopped.
* Fixed a quirk with local searches not showing options if you clicked into the input field versus the parent picker field.
* Added a new jQuery Event notification `entityunresolved` which is raised when a user leaves a picker field without chosing an option, leaving just empty text behind. This is to help support custom validation of fields.

**New in 0.5.1**

* Fixed chainging in changeSource (wouldn't work correctly if called on multiple pickers at once from the same jQuery selector)
* Added new callable method `clearEntities` to clear out all entities in a picker. Also chainable for multiple pickers.
* Refactored internal entity delete code to do the delete both for individual entity deletes and the clearEntities call.
* Delete event notification is triggered on each deleted item both for individual entity deletes and clearEntities calls.

**New in 0.5.0**

* Changes to allow autocomplete options to be passed on directly to autocomplete plugin after applying our specific needs.
* Updated the HTML example to show the new syntax and demonstrate passing through the autoFocus option which we've previously never handled.

*BREAKING CHANGE: The way you define autocomplete-specific settings has changed. With this change we just pass through any setting specified directly to the autocomplete plugin during initialization. This frees entitypicker up from knowing about all / adding settings for all autocomplete options.*

**New in 0.4.4**

* Bug fix for html5 style data attribute `data-min-length` fixed to set the `minLength` property, not the old minSearchLength property.

**New in 0.4.3**

* Added a new callable function `changeSource` which will update the autocomplete's source. This is most useful for local data changes. It does not udpate any other settings like minLength, delay, etc.

ex: $("#localDataPicker").entitypicker("changeSource", [{label: 'New Option 1', value: 1},{label: 'New Option 2', value: 2},...]);

**New in 0.4.2**

* Added a new style `entityPickerUnresolved` which is added to the autocomplete input box if focus is lost before an option is selected. It's removed on focus in. This allows for styling to hint to a user that their value is invalid and won't be saved.

**New in 0.4.1**

* Fixed a bug when a picker had a maximum selection of 1. Upon deleting the chosen entity, the autocomplete box was not made visible again.

**New in 0.4.0**

* Added "option strict" to help find some scoping issues - there might have been some uncaught if I didn't run through every case.
* A few bug fixes related to scoping and instant-results with local data.
* In this version there is support for immediately searching for options on focus of the picker field if the minLength is 0.
* As a result of the above, searching will also automatically resume if a field has text and was abandoned but got focus again and the amount of text satisfies the minLength option.
* Renamed minSearchLength to minLength to be synonymous with the autocomplete control - HTML5 style attribute is now `data-min-length`.
* Added support for delay configuration option and as HTML5 style attribute `data-delay`.

*BREAKING CHANGE: Extensive scope fixes, new auto-start of search if text length is >= minLength, renaming of configuration values.*

**New in 0.3.0**

* We can now pass an entity during configuration of the entitypicker source and get it again in the entityValue function definition. This gives greater control and flexibility for generating the value that will be stored in the hidden input fields that are generated when an entity is picked. Look at the Movie picker in the example HTML page.

*BREAKING CHANGE: When calling the addEntity or addEntities methods on entitypicker the 'text' parameter has been renamed to 'label' to be consistent with the autocomplete box.*

**New in 0.2.4**
* Added support for maxEntitiesMessage and data-max-entities-message setting. This replaces the static message that was used when the maxEntities was >= 0. This can be a simple string that will always be set or a function (which takes the maxEntities count as a parameter) and, if the resulting string length is > 0 it will be set, otherwise no title is configured.

**New in 0.2.3**
* Added entityValue function to allow a picker to be configured to generate custom input value (see demo)
* Refactored the addEntity and addEntities code. entityadded events are now fired in all cases for each entity. Duplicates are now prevented in addEnities call.
* Refactored the jQuery event bindings a bit to reduce space. Source file is now 600bytes smaller.

**New in 0.2.2**
* Moved the highlight effect (webkit browsers) from dynamic style to dynamic css class for flexibility.
* Added a pre-delete style. This should reduce accidental deletes of entities when using backspace key.

I will try to get more formal documentation up soon but here's some bullet points:
* Uses jQuery UI autocomplete for suggestions and user interaction.
* Entity containers are decorated with jQuery UI classes to give consistent UI.
* Multiple pickers can exists on a page.
* Pickers can be configured with the same or different lookup behaviors.
* The `source` configuration is used directly by jQuery autocomplete. Whatever parameters it supports, entity picker supports.
* Picking an entity generates a container HTML block with a hidden input element.
* The hidden input element's `name` attribute will be set by either the entitypicker element's id or the HTML5 style data attribute `data-input-name`.
* When used in a form the inputs are submitted just like any other group of inputs that share a name attribute.
* Can add single or a group of entities through a JavaScript call. This allows items to be prepopulated on page load (for example on an edit page).
* Has 2 events which fire when an entity is added or removed (entityadded, entityremoved).
* Can take a `maxUsers` parameter during configuration to set max entities that can be picked on each matched elements.
* Can read an HTML5 style data attribute data-max-users on the entitypicker element to set max entities that can be picked.
* Prevents duplicate entity picking by checking the value of the entity being added.
* The minimum number of characters to type before searching can be set on the entitypicker element using the HTML5 style data attribute `data-min-search-length`.
* The default behavior of the autocomplete box to change the value as the user navigates options is disabled. This was confusing for complex search types. A future release could expose this as a configuration option.

The current HMTL5 style data attributes which can be set on individual entitypicker elements (to which you attach the entitypicker) are:
* data-max-entities - sets the maximum number of entities a single picker can hold (default: -1 unlimited)
* data-min-search-length - sets the number of characters to type before a search begins (default: 2)
* data-input-name - sets the name attribute on the hidden input generated by picking an entity (if this isn't present, the id of the entitypicker element is used instead)

To use the picker you need to at least specify the `source` object for the autocomplete control. This is documented on the http://www.jQueryUI.com site.
