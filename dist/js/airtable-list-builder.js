/******/ (() => { // webpackBootstrap
var __webpack_exports__ = {};
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
(function ($, Drupal, drupalSettings) {
  Drupal.behaviors.airtableListBuilder = {
    attach: function attach(context, settings) {
      // Get the content area
      var $contentArea = $("#airtable-list");

      // Grab the airtable variables.
      var config = $contentArea.data('config');
      var configDefault = {
        "gutter": 10,
        "equalHeight": false
      };
      config = _objectSpread(_objectSpread({}, configDefault), config);
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
          xhr.setRequestHeader('Authorization', 'Bearer 0mdOOeXqOuQdFUxwt9ngJ3KSlxh7v1z2');
        },
        dataType: "json",
        url: "https://snaplogic.stanford.edu/api/1/rest/feed-master/queue/StanfordProd/GSB/rh-airtable_proxy_cache/output?airtable_table=" + config.table + "&airtable_view=" + config.view,
        success: function success(data) {
          $contentArea.find('#airtable-list-loader').remove();
          // Load the records.
          var records = data.records;
          if (records.length) {
            var $recordWrapper = $('#airtable-list-record-wrapper');

            // Process each record.
            var _loop = function _loop() {
              var record = records[recordIndex];
              var rowClasses = '';

              // Process each field.
              for (fieldKey in record.fields) {
                // Process the filter choices if it's in the config
                if (fieldKey in config.filters) {
                  if (Array.isArray(record.fields[fieldKey])) {
                    // Process Array
                    var _iterator2 = _createForOfIteratorHelper(record.fields[fieldKey]),
                      _step2;
                    try {
                      for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
                        item = _step2.value;
                        // See if the choice already exists.
                        var existingChoice = config.filters[fieldKey].choices.filter(function (row) {
                          return row.name === item;
                        });

                        // If the choice doesn't exist then add it to the list of choices.
                        if (!existingChoice.length) {
                          config.filters[fieldKey].choices.push({
                            "key": stringToCSSClass(item),
                            "name": item
                          });
                        }

                        // Add to the list of classes for the row.
                        rowClasses += ' ' + stringToCSSClass(fieldKey) + '--' + stringToCSSClass(item);
                      }
                    } catch (err) {
                      _iterator2.e(err);
                    } finally {
                      _iterator2.f();
                    }
                  } else {
                    // See if the choice already exists.
                    var _existingChoice = config.filters[fieldKey].choices.filter(function (row) {
                      return row.name === record.fields[fieldKey];
                    });

                    // If the choice doesn't exist then add it to the list of choices.
                    if (!_existingChoice.length) {
                      config.filters[fieldKey].choices.push({
                        "key": stringToCSSClass(record.fields[fieldKey]),
                        "name": record.fields[fieldKey]
                      });
                    }

                    // Add to the list of classes for the row.
                    rowClasses += ' ' + stringToCSSClass(fieldKey) + '--' + stringToCSSClass(record.fields[fieldKey]);
                  }
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
            var defaultFilters = {};
            // Add Filters on the page.
            for (filterKey in config.filters) {
              var filter = config.filters[filterKey];

              // Build the select filter.
              if (filter.choices.length > 0) {
                var $filterGroup = $('<div>').addClass("airtable-list-filter-group").attr('data-filter-group', stringToCSSClass(filterKey));
                $filterGroup.append('<h2>').addClass('airtable-list-filter-header').text(filter.name);
                var $filterSelect = $('<select>').attr("id", "airtable-list-" + stringToCSSClass(filterKey));
                var _iterator = _createForOfIteratorHelper(filter.choices.sort(function (a, b) {
                    return a.name > b.name ? 1 : b.name > a.name ? -1 : 0;
                  })),
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
              config.filterValue = concatValues(filters);

              // set filter for Isotope
              $contentArea.isotope({
                filter: config.filterValue
              });
            });

            // Allow items to filter.
            $('.airtable-list-filter').on("click", function (e) {
              e.preventDefault();
              var filterName = $(this).data('filter-name');
              var filterKey = $(this).data('filter-key');
              $('#airtable-list-' + filterName).val(filterKey).change();

              // Jump back up to the top filters.
              var $filterWrapper = $("#airtable-list-filters");
              $('html,body').animate({
                scrollTop: $filterWrapper.offset().top
              }, 'slow');
            });

            // Load isotope
            $contentArea.isotope({
              itemSelector: ".airtable-list-record-row",
              layoutMode: "fitRows",
              fitRows: {
                gutter: config.gutter
              }
            });

            // Set height to equal height
            if (config.equalHeight) {
              equalRowHeight(config.gutter);
            }
            $contentArea.on("arrangeComplete", function (event, filteredItems) {
              // Set height to equal height
              if (config.equalHeight) {
                equalRowHeight(config.gutter);
              }
              if (!filteredItems.length) {
                $('#airtable-list-no-results').show();
              } else {
                $('#airtable-list-no-results').hide();
              }
            });
          } else {
            $('#airtable-list-no-records').show();
          }
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
    return template.replaceAll('%' + token + '%', value);
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
            var _iterator3 = _createForOfIteratorHelper(jsonData),
              _step3;
            try {
              for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
                recordVal = _step3.value;
                templateHTML += processTemplate(config, token, recordVal);
              }
            } catch (err) {
              _iterator3.e(err);
            } finally {
              _iterator3.f();
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

      // Remove any leftover tokens.
      for (var _i2 = 0, _tokens2 = tokens; _i2 < _tokens2.length; _i2++) {
        var token = _tokens2[_i2];
        template = replaceToken(template, token, '');
      }
      return template;
    } else {
      return '';
    }
  }

  // Formats a string into the given type.
  function formatString(type, format, content) {
    var newContent = '';
    switch (type) {
      case 'Array':
        var template = $('template#airtable-list-' + stringToCSSClass(format.template_id) + '-template').html();
        var count = 0;
        var _iterator4 = _createForOfIteratorHelper(content),
          _step4;
        try {
          for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
            item = _step4.value;
            count++;
            var replacedContent = replaceToken(template, 'value', item);
            replacedContent = replaceToken(replacedContent, 'class', stringToCSSClass(item));
            newContent += replacedContent;
            if (format.hasOwnProperty('separator') && count != content.length) {
              newContent += format.separator;
            }
          }
        } catch (err) {
          _iterator4.e(err);
        } finally {
          _iterator4.f();
        }
        break;
      case 'Date':
        var dateObj = new Date(Date.parse(content));
        var dateArray = [];
        if ("date" in format) {
          dateArray.push(dateObj.toLocaleDateString([], format.date));
        }
        if ("time" in format) {
          dateArray.push(dateObj.toLocaleTimeString([], format.time));
        }
        newContent = dateArray.join(' ');
        break;
    }
    return newContent;
  }

  // Sets the rows to equal heights.
  function equalRowHeight(gutter) {
    // Remove all set row classes
    $(".airtable-list-record-row").removeClass(function (index, className) {
      return (className.match(/(^|\s)airtable-list-height-row-\S+/g) || []).join(' ');
    });

    // Reset the height to auto.
    $('.airtable-list-record-row [data-row-height-id]').height("auto");
    var rowNum = 0;
    var previousTop = 0;
    var fields = {};

    // Loop through all visible records.
    $('.airtable-list-record-row:visible').each(function () {
      $this = $(this);

      // Determine the rows.
      var nextTop = $this.offset().top;
      if (nextTop !== previousTop) {
        rowNum++;
        fields[rowNum] = {};
        previousTop = nextTop;
      }

      // Loop through each field that needs to be equal in height and collect the necessary heights.
      $this.find("[data-row-height-id]").each(function () {
        $field = $(this);
        var fieldId = $field.data('row-height-id');
        var height = $field.height();
        if (!fields[rowNum].hasOwnProperty(fieldId) || fields[rowNum].hasOwnProperty(fieldId) && fields[rowNum][fieldId] < height) {
          fields[rowNum][fieldId] = height;
        }
      });
      $this.addClass('airtable-list-height-row-' + rowNum);
    });

    // Set the height of each element.
    for (rowIndex in fields) {
      var fieldHeights = fields[rowIndex];
      for (key in fieldHeights) {
        $('.airtable-list-height-row-' + rowIndex + ' [data-row-height-id="' + key + '"]').height(fieldHeights[key]);
      }
    }

    // Set the height of each row.
    var newTop = 0;
    for (var i = 1; i <= rowNum; i++) {
      $('.airtable-list-height-row-' + i).css({
        top: newTop + 'px'
      });
      newTop = $('.airtable-list-height-row-' + i).height() + gutter * 2 + newTop;
    }

    // Set the height of the entire airtable-list.
    $('#airtable-list').height(newTop);
  }
})(jQuery, Drupal, drupalSettings);
/******/ })()
;
