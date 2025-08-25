(function ($, Drupal, drupalSettings) {
  Drupal.behaviors.airtableListBuilder = {
    attach: function (context, settings) {

      // Need to shim the trim function for jQuery 4. Chosen needs it.
      if (typeof jQuery.trim === 'undefined') { jQuery.trim = function(text) { return text == null ? '' : String.prototype.trim.call(text); }; }

      // Get the content area
      var $contentArea = $("#airtable-list");

      // Load settings configured in textarea
      var textAreaConfig = ("gsbResearchHubSubtheme" in drupalSettings) ? drupalSettings.gsbResearchHubSubtheme : {};

      // Grab the airtable variables.
      let templateConfig = $contentArea.data('config');

      var configDefault = {
        "gutter": 10,
        "equalHeight": false
      }
      config = {
        ...configDefault,
        ...templateConfig,
        ...textAreaConfig
      }

      for (filterKey in config.filters) {
        // Set the default array of choices if choices are not provided for us.
        if (!("choices" in config.filters[filterKey])) {
          config.filters[filterKey].choices = [];
        }
      }

      // Load the airtable data
      $.ajax({
        type: "GET",
        dataType: "json",
        url: "https://gsbrh-airtable-cache.s3.us-west-2.amazonaws.com/airtable-proxy-cache-" + config.table + "-" + config.view + ".json",
        success: function(data) {
          $contentArea.find('#airtable-list-loader').remove();
          // Load the records.
          let records = data.data.records;
          if (records.length) {
            for (recordIndex in records) {
              for (fieldName in records[recordIndex].fields) {
                if (fieldName.endsWith('_json') && records[recordIndex].fields[fieldName]) {
                  records[recordIndex].fields[stringToCSSClass(fieldName)] = JSON.parse(records[recordIndex].fields[fieldName]);
                }
                else {
                  records[recordIndex].fields[stringToCSSClass(fieldName)] = records[recordIndex].fields[fieldName];
                }
              }
            }

            let $recordWrapper = $('#airtable-list-record-wrapper');

            // Process each record.
            for (recordIndex in records) {
              let record = records[recordIndex];
              let rowClasses = '';

              // Process each field.
              for (fieldKey in record.fields) {
                // Process the filter choices if it's in the config
                if (fieldKey in config.filters) {
                  if (Array.isArray(record.fields[fieldKey])) {
                    // Process Array
                    for (item of record.fields[fieldKey]) {
                      // See if the choice already exists.
                      let existingChoice = config.filters[fieldKey].choices.filter(row => (row.name === item));

                      // If the choice doesn't exist then add it to the list of choices.
                      if (!existingChoice.length) {
                        config.filters[fieldKey].choices.push(
                          {
                            "key": stringToCSSClass(item),
                            "name": item
                          }
                        );
                      }

                      // Add to the list of classes for the row.
                      rowClasses += ' ' + stringToCSSClass(fieldKey) + '--' + stringToCSSClass(item);
                    }
                  }
                  else {
                    // See if the choice already exists.
                    let existingChoice = config.filters[fieldKey].choices.filter(row => (row.name === record.fields[fieldKey]));

                    // If the choice doesn't exist then add it to the list of choices.
                    if (!existingChoice.length) {
                      config.filters[fieldKey].choices.push(
                        {
                          "key": stringToCSSClass(record.fields[fieldKey]),
                          "name": record.fields[fieldKey]
                        }
                      );
                    }

                    // Add to the list of classes for the row.
                    rowClasses += ' ' + stringToCSSClass(fieldKey) + '--' + stringToCSSClass(record.fields[fieldKey]);
                  }
                }
              }

              // Build the record html.
              let recordTemplate = processTemplate(config, 'records', record.fields, record.fields);

              // Add rowClasses and add the record to the page.
              recordTemplate = recordTemplate.replace('[rowClasses]', rowClasses);
              $recordWrapper.append($(recordTemplate));
            }

            // Pull the url parameters to use later.
            var queryString = window.location.search;
            var urlParams = new URLSearchParams(queryString);

            var filters = {};
            // Add Filters on the page.
            for (filterKey in config.filters) {
              let filter = config.filters[filterKey];
              // Build the select filter.
              if (filter.choices.length > 0) {
                switch(filter.templateID) {
                  case "filter-select":
                    let $filterSelect = $('select#airtable-list-' + filterKey);
                    // Build the options list.
                    for (choice of filter.choices.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0))) {
                        let $filterOption = $("<option>");
                        $filterOption.val(choice.key).text(choice.name);

                        // Set the default selection.
                        if ("selected" in choice && choice.selected) {
                          $filterOption.attr("selected", "selected");
                        }
                        $filterSelect.append($filterOption);
                    }

                    // Set the default value of the select item based on a given url parameter.
                    var paramValue = urlParams.get(filterKey);
                    if (paramValue !== null) {
                      // If it's a multiselect filter then convert parameter to an array
                      if ("multiple" in filter && filter.multiple) {
                        paramValue = paramValue.split("|");
                      }

                      $filterSelect.val(paramValue);
                    }

                    $filterSelect.on( 'change', function( event ) {
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
                    if ("chosenOptions" in filter) {
                      chosenOptions = {
                        ...chosenOptions,
                        ...filter.chosenOptions
                      }
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
              $('#airtable-search').keyup( debounce( function() {
                $('.fas').hide();
                $contentArea.isotope();
              }, 500));

              $('#airtable-search').keyup(function() {
                $('.fas').show();
              });
            }

            // Allow items to filter.
            $('.airtable-list-filter').on("click", function(e) {
              e.preventDefault();
              var filterName = $(this).data('filter-name');
              var filterKey = $(this).data('filter-key');
              $('#airtable-list-' + filterName).val(filterKey).change().trigger("chosen:updated");

              // Jump back up to the top filters.
              var $filterWrapper = $("#airtable-list-filters");
              $('html,body').animate({scrollTop: $filterWrapper.offset().top},'slow');
            });

            // Load isotope
            $contentArea.isotope({
              itemSelector: ".airtable-list-record-row",
              layoutMode: "fitRows",
              fitRows: {
                gutter: config.gutter
              },
              filter: function() {
                var $this = $(this);

                var urlParamaters = new URLSearchParams();
                // If using search box filter by the text.
                var searchMatch = true;
                if ('search' in config && config.search) {
                  var $airtableSearch = $('#airtable-search');
                  if ($airtableSearch.val() !== '') {
                    urlParamaters.set('search', $airtableSearch.val());
                    var qsRegex = new RegExp( $airtableSearch.val(), 'gi' );
                    searchMatch = qsRegex ? $this.find('.alb-searchable').text().match( qsRegex ) : true;
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
                        currentFilterValue = currentFilterValue.map((x) => '.' + filterGroup + '--' + x);
                      }
                      else {
                        urlParamaters.set(filterGroup, currentFilterValue);
                        currentFilterValue = ['.' + filterGroup + '--' + currentFilterValue];
                      }

                      filters[filterGroup] = currentFilterValue;
                    }
                  }
                }

                // Set the browser url.
                let params = urlParamaters.toString();
                // If there are no parameters set then reset the url to no parameters.
                // Otherwise set it to the given filters.
                if (params === '') {
                  window.history.replaceState(null, null, window.location.pathname);
                }
                else {
                  window.history.replaceState(null, null,'?' + params);
                }

                // combine filters
                let filterValue = buildFilters(filters);
                filterMatch = filterValue ? $this.is(filterValue) : true;

                return searchMatch && filterMatch;
              }
            });

            // Set height to equal height
            if (config.equalHeight) {
              equalRowHeight(config.gutter);
            }

            $contentArea.on("arrangeComplete", function(event, filteredItems) {
              // Set height to equal height
              if (config.equalHeight) {
                equalRowHeight(config.gutter);
              }

              if (!filteredItems.length) {
                $('#airtable-list-no-results').show();
              }
              else {
                $('#airtable-list-no-results').hide();
              }
            });
          }
          else {
            $('#airtable-list-no-records').show();
          }
        }
      });
    }
  }

  // Build the filters into a jquery search string
  function buildFilters(chosenFilters) {
    var combo = [];
    for ( var prop in chosenFilters ) {
      var group = chosenFilters[ prop ];
      if ( !group.length ) {
        // no filters in group, carry on
        continue;
      }
      // add first group
      if ( !combo.length ) {
        combo = group.slice(0);
        continue;
      }
      // add additional groups
      var nextCombo = [];
      // split group into combo: [ A, B ] & [ 1, 2 ] => [ A1, A2, B1, B2 ]
      for ( var i=0; i < combo.length; i++ ) {
        for ( var j=0; j < group.length; j++ ) {
          var item = combo[i] + group[j];
          nextCombo.push( item );
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
    const words = inputString.replace(/[^a-zA-Z0-9]/g, ' ').split(/\s+/);

    // Join the words with hyphens, then convert to lowercase
    const classFriendlyString = words.join('-').toLowerCase();

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
      template.replace(/\%(.*?)%/g, function(a, b) {
        tokens.push(b);
      });

      // Process each token.
      for (var token of tokens) {
        var filterOptions = token.split('|');
        var baseToken = filterOptions.shift();

        // If the token exists in the data then process it.
        if (baseToken in data || baseToken in allData) {
          var content = data[baseToken];

          // Process any filtering options.
          for (filter of filterOptions) {
            switch(filter) {
              case "cssClass":
                content = stringToCSSClass(content);
                break;

              case "parent":
                content = allData[baseToken];
                break;
            }
          }

          // If it's an array then process that array with its template.
          if (token.endsWith('-json')) {
            var templateHTML = '';
            for (recordVal of content) {
              templateHTML += processTemplate(config, token, recordVal, allData);
            }
            template = replaceToken(template, token, templateHTML);
          }
          else {
            // If there is any field that needs formatting format it.
            if ("format" in config && token in config.format) {

              // Pull in any additional config passed in from the text area.
              var additionalConfig = [];
              if ("arrayFormatConfig" in config && token in config.arrayFormatConfig) {
                additionalConfig = config.arrayFormatConfig[token];
              }
              content = formatString(config.format[token].type, config.format[token].options, content, additionalConfig);
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
      for (var token of tokens) {
        template = replaceToken(template, token, '');
      }

      return template;
    }
    else {
      return '';
    }
  }

  // Formats a string into the given type.
  function formatString(type, format, content, additionalConfig) {
    var newContent = '';
    switch(type) {
      case 'Array':
        var template = $('template#airtable-list-' + stringToCSSClass(format.templateID) + '-template').html();
        var count = 0;
        for (item of content) {
          count++;
          var replacedContent = replaceToken(template, 'value', item);
          var classes = stringToCSSClass(item);
          if ("classMap" in additionalConfig && item in additionalConfig.classMap) {
            classes += " " + additionalConfig.classMap[item];
          }
          replacedContent = replaceToken(replacedContent, 'class', classes);

          // Replace the variable key with the key version of the option value.
          var key = stringToCSSClass(item);
          replacedContent = replaceToken(replacedContent, 'key', key);

          newContent += replacedContent;
          if (format.hasOwnProperty('separator') && count != content.length) {
            newContent += format.separator;
          }
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
    $(".airtable-list-record-row").removeClass (function (index, className) {
      return (className.match (/(^|\s)airtable-list-height-row-\S+/g) || []).join(' ');
    });

    // Reset the height to auto.
    $('.airtable-list-record-row [data-row-height-id]').height("auto");
    var rowNum = 0;
    var previousTop = 0;
    var fields = {};

    // Loop through all visible records.
    $('.airtable-list-record-row:visible').each(function() {
      $this = $(this);

      // Determine the rows.
      var nextTop = $this.offset().top;
      if (nextTop !== previousTop) {
        rowNum++;
        fields[rowNum] = {};
        previousTop = nextTop;
      }

      // Loop through each field that needs to be equal in height and collect the necessary heights.
      $this.find("[data-row-height-id]").each(function() {
        $field = $(this);
        var fieldId = $field.data('row-height-id');
        var height = $field.height();

        if (!fields[rowNum].hasOwnProperty(fieldId) || (fields[rowNum].hasOwnProperty(fieldId) && fields[rowNum][fieldId] < height)) {
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
    for (var i=1; i <= rowNum; i++) {
      $('.airtable-list-height-row-' + i).css({top: newTop + 'px'});
      newTop = $('.airtable-list-height-row-' + i).height() + (gutter * 2) + newTop;
    }

    // Set the height of the entire airtable-list.
    $('#airtable-list').height(newTop);
  }

  // debounce so filtering doesn't happen every millisecond
  function debounce( fn, threshold ) {
    var timeout;
    threshold = threshold || 100;
    return function debounced() {
      clearTimeout( timeout );
      var args = arguments;
      var _this = this;
      function delayed() {
        fn.apply( _this, args );
      }
      timeout = setTimeout( delayed, threshold );
    };
  }

})(jQuery, Drupal, drupalSettings);
