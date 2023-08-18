(function ($, Drupal, drupalSettings) {
  Drupal.behaviors.airtableListBuilder = {
    attach: function (context, settings) {

      // Get the content area
      var $contentArea = $("#airtable-list");

      // Grab the airtable variables.
      let config = $contentArea.data('config');

      for (filterKey in config.filters) {
        config.filters[filterKey].choices = [{"key": "*", "name": "All"}];
      }

      // Load the airtable data
      $.ajax({
        type: "GET",
        beforeSend: function (xhr) {
          xhr.setRequestHeader('Authorization', 'Bearer patuFfv8kBc0t6KQc.78ae3fb790ef223788cddf2df30144cfcc5bd9c76c64afa8daa5236207e6cbd6');
        },
        dataType: "json",
        url: "https://api.airtable.com/v0/appM3dMpeuaatPlNO/" + config.table + "?view=" + config.view,
        success: function(data) {
          // Load the records.
          let records = data.records;
          let $recordWrapper = $('#airtable-list-record-wrapper');

          // Process each record.
          for (recordIndex in records) {
            let record = records[recordIndex];
            let rowClasses = '';

            // Process each field.
            for (fieldKey in record.fields) {
              // Process the filter choices if it's in the config
              if (fieldKey in config.filters) {
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

            // Build the record html.
            let recordTemplate = processTemplate(config, 'records', record.fields);

            // Add rowClasses and add the record to the page.
            recordTemplate = recordTemplate.replace('[rowClasses]', rowClasses);
            $recordWrapper.append($(recordTemplate));
          }

          // Add Filters on the page.
          for (filterKey in config.filters) {
            let filter = config.filters[filterKey];

            // Build the select filter.
            if (filter.choices.length > 0) {
              let $filterGroup = $('<div>').addClass("airtable-list-filter-group").attr('data-filter-group', stringToCSSClass(filterKey));
              $filterGroup.append('<h2>').addClass('airtable-list-filter-header').text(filter.name);
              let $filterSelect = $('<select>').attr("id", "airtable-list-" + stringToCSSClass(filterKey));
              for (choice of filter.choices) {
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
            var filterValue = concatValues( filters );

            // set filter for Isotope
            $contentArea.isotope({ filter: filterValue });
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
    return template.replace('%' + token + '%', value);
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

      return template;
    }
    else {
      return '';
    }
  }

  // Formats a string into the given type.
  function formatString(type, format, content) {
    switch(type) {
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
