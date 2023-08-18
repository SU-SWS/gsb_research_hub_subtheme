/******/ (() => { // webpackBootstrap
var __webpack_exports__ = {};
function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
(function ($, Drupal, drupalSettings) {
  Drupal.behaviors.airtableListBuilder = {
    attach: function attach(context, settings) {
      // Get the content area
      var $contentArea = $("#airtable-list");

      // Grab the airtable variables.
      var config = $contentArea.data('config');
      for (filterKey in config.filters) {
        config.filters[filterKey].choices = [{
          "key": "*",
          "name": "All"
        }];
      }

      // Load the airtable data
      $.ajax({
        type: "GET",
        beforeSend: function beforeSend(xhr) {
          xhr.setRequestHeader('Authorization', 'Bearer patuFfv8kBc0t6KQc.78ae3fb790ef223788cddf2df30144cfcc5bd9c76c64afa8daa5236207e6cbd6');
        },
        dataType: "json",
        url: "https://api.airtable.com/v0/appM3dMpeuaatPlNO/" + config.table + "?view=" + config.view,
        success: function success(data) {
          // Load the records.
          var records = data.records;
          var $recordWrapper = $('#airtable-list-record-wrapper');

          // Process each record.
          var _loop = function _loop() {
            var record = records[recordIndex];
            var rowClasses = '';

            // Process each field.
            for (fieldKey in record.fields) {
              // Process the filter choices if it's in the config
              if (fieldKey in config.filters) {
                // See if the choice already exists.
                var existingChoice = config.filters[fieldKey].choices.filter(function (row) {
                  return row.name === record.fields[fieldKey];
                });

                // If the choice doesn't exist then add it to the list of choices.
                if (!existingChoice.length) {
                  config.filters[fieldKey].choices.push({
                    "key": stringToCSSClass(record.fields[fieldKey]),
                    "name": record.fields[fieldKey]
                  });
                }

                // Add to the list of classes for the row.
                rowClasses += ' ' + stringToCSSClass(fieldKey) + '--' + stringToCSSClass(record.fields[fieldKey]);
              }
            }

            // Build the record html.
            var recordTemplate = processTemplate(config, 'records', record.fields);

            // Add rowClasses and add the record to the page.
            recordTemplate = recordTemplate.replace('[rowClasses]', rowClasses);
            $recordWrapper.append($(recordTemplate));
          };
          for (recordIndex in records) {
            _loop();
          }

          // Add Filters on the page.
          for (filterKey in config.filters) {
            var filter = config.filters[filterKey];

            // Build the select filter.
            if (filter.choices.length > 0) {
              var $filterGroup = $('<div>').addClass("airtable-list-filter-group").attr('data-filter-group', stringToCSSClass(filterKey));
              $filterGroup.append('<h2>').addClass('airtable-list-filter-header').text(filter.name);
              var $filterSelect = $('<select>').attr("id", "airtable-list-" + stringToCSSClass(filterKey));
              var _iterator = _createForOfIteratorHelper(filter.choices),
                _step;
              try {
                for (_iterator.s(); !(_step = _iterator.n()).done;) {
                  choice = _step.value;
                  var $filterOption = $("<option>");
                  $filterOption.val(choice.key).text(choice.name);
                  $filterSelect.append($filterOption);
                }

                // Add the filter to the page.
              } catch (err) {
                _iterator.e(err);
              } finally {
                _iterator.f();
              }
              $filterGroup.append($filterSelect);
              $('div#airtable-list-filters').append($filterGroup);
            }
          }

          // Handle the changing of the filters.
          // store filter for each group
          var filters = {};
          $('#airtable-list-filters select').on('change', function (event) {
            var $filter = $(event.currentTarget);
            // get group key
            var $filterGroup = $filter.parents('.airtable-list-filter-group');
            var filterGroup = $filterGroup.attr('data-filter-group');

            // set filter for group
            filters[filterGroup] = $filter.val() == '*' ? '' : '.' + filterGroup + '--' + $filter.val();
            // combine filters
            var filterValue = concatValues(filters);

            // set filter for Isotope
            $contentArea.isotope({
              filter: filterValue
            });
          });

          // Load isotope
          $contentArea.isotope({
            itemSelector: ".airtable-list-record-row",
            layoutMode: "fitRows",
            fitRows: {
              gutter: 10
            }
          });
        }
      });
    }
  };

  // flatten object by concatting values
  function concatValues(obj) {
    var value = '';
    for (var prop in obj) {
      value += obj[prop];
    }
    return value;
  }

  // Convert a string into a class friendly string.
  function stringToCSSClass(inputString) {
    // Remove special characters and spaces, then split the string into words
    var words = inputString.replace(/[^a-zA-Z0-9]/g, ' ').split(/\s+/);

    // Join the words with hyphens, then convert to lowercase
    var classFriendlyString = words.join('-').toLowerCase();
    return classFriendlyString;
  }

  // Replace the token in the template
  function replaceToken(template, token, value) {
    return template.replace('%' + token + '%', value);
  }

  // Apply the data to the template.
  function processTemplate(config, templateKey, data) {
    var template = $('template#airtable-list-' + stringToCSSClass(templateKey) + '-template').html();
    if (template) {
      // Pull all of the tokens from the template.
      var tokens = [];
      template.replace(/\%(.*?)%/g, function (a, b) {
        tokens.push(b);
      });

      // Process each token.
      for (var _i = 0, _tokens = tokens; _i < _tokens.length; _i++) {
        var token = _tokens[_i];
        // If the token exists in the data then process it.
        if (token in data) {
          var content = data[token];
          // If it's an array then process that array with its template.
          if (token.endsWith('_json')) {
            var jsonData = JSON.parse(content);
            var templateHTML = '';
            var _iterator2 = _createForOfIteratorHelper(jsonData),
              _step2;
            try {
              for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
                recordVal = _step2.value;
                templateHTML += processTemplate(config, token, recordVal);
              }
            } catch (err) {
              _iterator2.e(err);
            } finally {
              _iterator2.f();
            }
            template = replaceToken(template, token, templateHTML);
          } else {
            // If there is any field that needs formatting format it.
            if ("format" in config && token in config.format) {
              content = formatString(config.format[token].type, config.format[token].options, content);
            }
            var fieldTemplate = $('template#airtable-list-' + stringToCSSClass(token) + '-template').html();
            if (fieldTemplate) {
              content = replaceToken(fieldTemplate, token, content);
            }
            template = replaceToken(template, token, content);
          }
        }
        // Otherwise remove the row.
        else {
          var $template = $(template);
          $template.find("[data-field-key='" + token + "']").remove();
          template = $template.prop('outerHTML');
        }
      }
      return template;
    } else {
      return '';
    }
  }

  // Formats a string into the given type.
  function formatString(type, format, content) {
    switch (type) {
      case 'Date':
        var dateObj = new Date(Date.parse(content));
        var dateArray = [];
        if ("date" in format) {
          dateArray.push(dateObj.toLocaleDateString([], format.date));
        }
        if ("time" in format) {
          dateArray.push(dateObj.toLocaleTimeString([], format.time));
        }
        content = dateArray.join(' ');
        break;
    }
    return content;
  }
})(jQuery, Drupal, drupalSettings);
/******/ })()
;