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
        // Set the default array of choices if choices are not provided for us.
        if (!("choices" in config.filters[filterKey])) {
          config.filters[filterKey].choices = [];
        }
      }

      // Load the airtable data
      $.ajax({
        type: "GET",
        beforeSend: function beforeSend(xhr) {
          xhr.setRequestHeader('Authorization', 'Bearer ' + settings.gsbResearchHubSubtheme.snaplogicToken);
        },
        dataType: "json",
        url: settings.gsbResearchHubSubtheme.snaplogicURL + "/GSB/rh-airtable_proxy_cache/output?airtable_table=" + config.table + "&airtable_view=" + config.view,
        success: function success(data) {
          $contentArea.find('#airtable-list-loader').remove();
          // Load the records.
          var records = data.records;
          if (records.length) {
            for (recordIndex in records) {
              for (fieldName in records[recordIndex].fields) {
                if (fieldName.endsWith('_json') && records[recordIndex].fields[fieldName]) {
                  records[recordIndex].fields[stringToCSSClass(fieldName)] = JSON.parse(records[recordIndex].fields[fieldName]);
                } else {
                  records[recordIndex].fields[stringToCSSClass(fieldName)] = records[recordIndex].fields[fieldName];
                }
              }
            }
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
              var recordTemplate = processTemplate(config, 'records', record.fields, record.fields);

              // Add rowClasses and add the record to the page.
              recordTemplate = recordTemplate.replace('[rowClasses]', rowClasses);
              $recordWrapper.append($(recordTemplate));
            };
            for (recordIndex in records) {
              _loop();
            }

            // Pull the url parameters to use later.
            var queryString = window.location.search;
            var urlParams = new URLSearchParams(queryString);
            var filters = {};
            // Add Filters on the page.
            for (filterKey in config.filters) {
              var _filter = config.filters[filterKey];
              // Build the select filter.
              if (_filter.choices.length > 0) {
                switch (_filter.templateID) {
                  case "filter-select":
                    var $filterSelect = $('select#airtable-list-' + filterKey);
                    // Build the options list.
                    var _iterator = _createForOfIteratorHelper(_filter.choices.sort(function (a, b) {
                        return a.name > b.name ? 1 : b.name > a.name ? -1 : 0;
                      })),
                      _step;
                    try {
                      for (_iterator.s(); !(_step = _iterator.n()).done;) {
                        choice = _step.value;
                        var $filterOption = $("<option>");
                        $filterOption.val(choice.key).text(choice.name);

                        // Set the default selection.
                        if ("selected" in choice && choice.selected) {
                          $filterOption.attr("selected", "selected");
                        }
                        $filterSelect.append($filterOption);
                      }

                      // Set the default value of the select item based on a given url parameter.
                    } catch (err) {
                      _iterator.e(err);
                    } finally {
                      _iterator.f();
                    }
                    var paramValue = urlParams.get(filterKey);
                    if (paramValue !== null) {
                      // If it's a multiselect filter then convert parameter to an array
                      if ("multiple" in _filter && _filter.multiple) {
                        paramValue = paramValue.split("|");
                      }
                      $filterSelect.val(paramValue);
                    }
                    $filterSelect.on('change', function (event) {
                      // Reload isotope.
                      $contentArea.isotope();
                    });

                    // Add default options in chosenOptions.
                    var chosenOptions = {
                      "width": "100%",
                      "placeholder_text_single": "All",
                      "placeholder_text_multiple": "All",
                      "hide_results_on_select": false,
                      "display_selected_options": false
                    };
                    if ("chosenOptions" in _filter) {
                      chosenOptions = _objectSpread(_objectSpread({}, chosenOptions), _filter.chosenOptions);
                    }
                    $filterSelect.chosen(chosenOptions);
                    break;
                }
              }
            }

            // Show the filters.
            $('div#airtable-list-filters').show();
            if ('search' in config && config.search) {
              // If there is a predefined parameter set the default value of search
              if (urlParams.get('search') !== null) {
                $('#airtable-search').val(urlParams.get('search'));
              }
              // use value of search field to filter
              $('#airtable-search').keyup(debounce(function () {
                $('.fas').hide();
                $contentArea.isotope();
              }, 500));
              $('#airtable-search').keyup(function () {
                $('.fas').show();
              });
            }

            // Allow items to filter.
            $('.airtable-list-filter').on("click", function (e) {
              e.preventDefault();
              var filterName = $(this).data('filter-name');
              var filterKey = $(this).data('filter-key');
              $('#airtable-list-' + filterName).val(filterKey).change().trigger("chosen:updated");

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
              },
              filter: function filter() {
                var $this = $(this);
                var urlParamaters = new URLSearchParams();
                // If using search box filter by the text.
                var searchMatch = true;
                if ('search' in config && config.search) {
                  var $airtableSearch = $('#airtable-search');
                  if ($airtableSearch.val() !== '') {
                    urlParamaters.set('search', $airtableSearch.val());
                    var qsRegex = new RegExp($airtableSearch.val(), 'gi');
                    searchMatch = qsRegex ? $this.find('.alb-searchable').text().match(qsRegex) : true;
                  }
                }

                // Handle Filters.
                var filterMatch = true;
                if ('filters' in config) {
                  var filters = [];
                  for (filterKey in config.filters) {
                    var $filter = $('#airtable-list-' + filterKey);

                    // get group key
                    var $filterGroup = $filter.parents('.airtable-list-filter-group');
                    var filterGroup = $filterGroup.attr('data-filter-group');

                    // Set the url parameters.
                    var currentFilterValue = $filter.val();
                    filters[filterGroup] = [];
                    if (currentFilterValue !== '*' && currentFilterValue !== '' && currentFilterValue.length !== 0) {
                      // Set parameters and filter if it's multiple values.
                      if (Array.isArray(currentFilterValue)) {
                        urlParamaters.set(filterGroup, currentFilterValue.join('|'));
                        currentFilterValue = currentFilterValue.map(function (x) {
                          return '.' + filterGroup + '--' + x;
                        });
                      } else {
                        urlParamaters.set(filterGroup, currentFilterValue);
                        currentFilterValue = ['.' + filterGroup + '--' + currentFilterValue];
                      }
                      filters[filterGroup] = currentFilterValue;
                    }
                  }
                }

                // Set the browser url.
                window.history.replaceState(null, null, '?' + urlParamaters.toString());

                // combine filters
                var filterValue = buildFilters(filters);
                filterMatch = filterValue ? $this.is(filterValue) : true;
                return searchMatch && filterMatch;
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

  // Build the filters into a jquery search string
  function buildFilters(chosenFilters) {
    var combo = [];
    for (var prop in chosenFilters) {
      var group = chosenFilters[prop];
      if (!group.length) {
        // no filters in group, carry on
        continue;
      }
      // add first group
      if (!combo.length) {
        combo = group.slice(0);
        continue;
      }
      // add additional groups
      var nextCombo = [];
      // split group into combo: [ A, B ] & [ 1, 2 ] => [ A1, A2, B1, B2 ]
      for (var i = 0; i < combo.length; i++) {
        for (var j = 0; j < group.length; j++) {
          var item = combo[i] + group[j];
          nextCombo.push(item);
        }
      }
      combo = nextCombo;
    }
    var comboFilter = combo.join(', ');
    return comboFilter;
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
  function processTemplate(config, templateKey, data, allData) {
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
        var filterOptions = token.split('|');
        var baseToken = filterOptions.shift();

        // If the token exists in the data then process it.
        if (baseToken in data || baseToken in allData) {
          var content = data[baseToken];

          // Process any filtering options.
          var _iterator3 = _createForOfIteratorHelper(filterOptions),
            _step3;
          try {
            for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
              filter = _step3.value;
              switch (filter) {
                case "cssClass":
                  content = stringToCSSClass(content);
                  break;
                case "parent":
                  content = allData[baseToken];
                  break;
              }
            }

            // If it's an array then process that array with its template.
          } catch (err) {
            _iterator3.e(err);
          } finally {
            _iterator3.f();
          }
          if (token.endsWith('-json')) {
            var templateHTML = '';
            var _iterator4 = _createForOfIteratorHelper(content),
              _step4;
            try {
              for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
                recordVal = _step4.value;
                templateHTML += processTemplate(config, token, recordVal, allData);
              }
            } catch (err) {
              _iterator4.e(err);
            } finally {
              _iterator4.f();
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
        var template = $('template#airtable-list-' + stringToCSSClass(format.templateID) + '-template').html();
        var count = 0;
        var _iterator5 = _createForOfIteratorHelper(content),
          _step5;
        try {
          for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
            item = _step5.value;
            count++;
            var replacedContent = replaceToken(template, 'value', item);
            replacedContent = replaceToken(replacedContent, 'class', stringToCSSClass(item));
            newContent += replacedContent;
            if (format.hasOwnProperty('separator') && count != content.length) {
              newContent += format.separator;
            }
          }
        } catch (err) {
          _iterator5.e(err);
        } finally {
          _iterator5.f();
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

  // debounce so filtering doesn't happen every millisecond
  function debounce(fn, threshold) {
    var timeout;
    threshold = threshold || 100;
    return function debounced() {
      clearTimeout(timeout);
      var args = arguments;
      var _this = this;
      function delayed() {
        fn.apply(_this, args);
      }
      timeout = setTimeout(delayed, threshold);
    };
  }
})(jQuery, Drupal, drupalSettings);
/******/ })()
;