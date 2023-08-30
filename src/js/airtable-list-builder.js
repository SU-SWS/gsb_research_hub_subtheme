(function ($, Drupal, drupalSettings) {
  Drupal.behaviors.airtableListBuilder = {
    attach: function (context, settings) {

      // Get the content area
      var $contentArea = $("#airtable-list");

      // Grab the airtable variables.
      let config = $contentArea.data('config');

      var configDefault = {
        "gutter": 10,
        "equalHeight": false
      }
      config = {
        ...configDefault,
        ...config
      }

      for (filterKey in config.filters) {
        config.filters[filterKey].choices = [{"key": "*", "name": "All"}];
      }

      // Load the airtable data
      $.ajax({
        type: "GET",
        beforeSend: function (xhr) {
          xhr.setRequestHeader('Authorization', 'Bearer iQ7GGRoNRcGi8iZf28xSgDgaDDUslteL');
        },
        dataType: "json",
        url: "https://snaplogic-dev.stanford.edu/api/1/rest/feed-master/queue/StanfordDev/GSB/Research%20Hub/airtable-cache-ultra?airtable_table=" + config.table + "&airtable_view=" + config.view,
        success: function(data) {
          $contentArea.find('#airtable-list-loader').remove();
          // Load the records.
          let records = data.records;
          if (records.length) {
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
              let recordTemplate = processTemplate(config, 'records', record.fields);

              // Add rowClasses and add the record to the page.
              recordTemplate = recordTemplate.replace('[rowClasses]', rowClasses);
              $recordWrapper.append($(recordTemplate));
            }

            var defaultFilters = {}
            // Add Filters on the page.
            for (filterKey in config.filters) {
              let filter = config.filters[filterKey];

              // Build the select filter.
              if (filter.choices.length > 0) {
                let $filterGroup = $('<div>').addClass("airtable-list-filter-group").attr('data-filter-group', stringToCSSClass(filterKey));
                $filterGroup.append('<h2>').addClass('airtable-list-filter-header').text(filter.name);
                let $filterSelect = $('<select>').attr("id", "airtable-list-" + stringToCSSClass(filterKey));
                for (choice of filter.choices.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0))) {
                  let $filterOption = $("<option>");
                  $filterOption.val(choice.key).text(choice.name);
                  $filterSelect.append($filterOption);
                }

                // Add the filter to the page.
                $filterGroup.append($filterSelect);
                $('div#airtable-list-filters').append($filterGroup);
              }
            }

            // Handle the changing of the filters.
            // store filter for each group
            var filters = {};
            $('#airtable-list-filters select').on( 'change', function( event ) {

              var $filter = $( event.currentTarget );
              // get group key
              var $filterGroup = $filter.parents('.airtable-list-filter-group');
              var filterGroup = $filterGroup.attr('data-filter-group');

              // set filter for group
              filters[ filterGroup ] = ($filter.val() =='*') ? '' : '.' + filterGroup + '--' + $filter.val();
              // combine filters
              config.filterValue = concatValues( filters );

              // set filter for Isotope
              $contentArea.isotope({ filter: config.filterValue });
            });

            // Allow items to filter.
            $('.airtable-list-filter').on("click", function(e) {
              e.preventDefault();
              var filterName = $(this).data('filter-name');
              var filterKey = $(this).data('filter-key');
              $('#airtable-list-' + filterName).val(filterKey).change();
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

  // flatten object by concatting values
  function concatValues( obj ) {
    var value = '';
    for ( var prop in obj ) {
      value += obj[ prop ];
    }
    return value;
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
  function processTemplate(config, templateKey, data) {
    var template = $('template#airtable-list-' + stringToCSSClass(templateKey) + '-template').html();
    if (template) {
      // Pull all of the tokens from the template.
      var tokens = [];
      template.replace(/\%(.*?)%/g, function(a, b) {
        tokens.push(b);
      });

      // Process each token.
      for (var token of tokens) {
        // If the token exists in the data then process it.
        if (token in data) {
          var content = data[token];
          // If it's an array then process that array with its template.
          if (token.endsWith('_json')) {
            var jsonData = JSON.parse(content);
            var templateHTML = '';
            for (recordVal of jsonData) {
              templateHTML += processTemplate(config, token, recordVal);
            }
            template = replaceToken(template, token, templateHTML);
          }
          else {
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
  function formatString(type, format, content) {
    var newContent = '';
    switch(type) {
      case 'Array':
        var template = $('template#airtable-list-' + stringToCSSClass(format.template_id) + '-template').html();
        var count = 0;
        for (item of content) {
          count++;
          var replacedContent = replaceToken(template, 'value', item);
          replacedContent = replaceToken(replacedContent, 'class', stringToCSSClass(item));
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

})(jQuery, Drupal, drupalSettings);
