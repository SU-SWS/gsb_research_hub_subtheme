(function ($, Drupal, drupalSettings) {
  Drupal.behaviors.airtableListBuilder = {
    attach: function (context, settings) {

      // Get the content area
      var $contentArea = $("#airtable-list");

      // Grab the airtable variables.
      let table = $contentArea.data('table');
      let view = $contentArea.attr('data-view');
      let filterConfigArray = $contentArea.data('filters').split(',');

      // Build the filter configuration based on what was given.
      let filterConfig = [];
      for (filter of filterConfigArray) {
        let filterInfo = filter.split('|');
        filterConfig[filterInfo['0'].trim()] = {
          "key": filterInfo[0].trim(),
          "name": filterInfo[1].trim(),
          "choices": [{"key": "*", "name": "All"}]
        }
      }

      // Load the airtable data
      $.ajax({
        type: "GET",
        beforeSend: function (xhr) {
          xhr.setRequestHeader('Authorization', 'Bearer patuFfv8kBc0t6KQc.78ae3fb790ef223788cddf2df30144cfcc5bd9c76c64afa8daa5236207e6cbd6');
        },
        dataType: "json",
        url: "https://api.airtable.com/v0/appM3dMpeuaatPlNO/" + table + "?view=" + view,
        success: function(data) {

          // Load the records.
          let records = data.records;
          let $recordWrapper = $('#airtable-list-record-wrapper');

          // Process each record.
          for (recordIndex in records) {
            let record = records[recordIndex];
            //let recordTemplate = $('template#airtable-records-template').html();
            let rowClasses = '';

            let recordTemplate = processTemplate('records', record.fields);

            // Process each field.
            for (fieldKey in record.fields) {
              // Process the filter choices if it's in the config
              if (fieldKey in filterConfig) {
                // See if the choice already exists.
                let existingChoice = filterConfig[fieldKey].choices.filter(row => (row.name === record.fields[fieldKey]));

                // If the choice doesn't exist then add it to the list of choices.
                if (!existingChoice.length) {
                  filterConfig[fieldKey].choices.push(
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

            // Add rowClasses and add the record to the page.
            recordTemplate = replaceToken(recordTemplate, 'rowClasses', rowClasses);
            $recordWrapper.append($(recordTemplate));
          }

          // Add Filters on the page.
          for (filterKey in filterConfig) {
            let filter = filterConfig[filterKey];

            // Build the select filter.
            if (filter.choices.length > 0) {
              let $filterGroup = $('<div>').addClass("airtable-list-filter-group").attr('data-filter-group', stringToCSSClass(filter.key));
              $filterGroup.append('<h2>').addClass('airtable-list-filter-header').text(filter.name);
              let $filterSelect = $('<select>').attr("id", "airtable-list-" + stringToCSSClass(filter.key));
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
  function processTemplate(templateKey, data) {
    var template = $('template#airtable-list-' + templateKey + '-template').html();
    for (var fieldKey in data) {
      // If it's an array then process that array with its template.
      if (fieldKey.endsWith('_json')) {
        var jsonData = JSON.parse(data[fieldKey]);
        var templateHTML = '';
        for (recordVal of jsonData) {
          templateHTML += processTemplate(fieldKey, recordVal);
        }
        template = replaceToken(template, fieldKey, templateHTML);
      }
      else {
        template = replaceToken(template, fieldKey, data[fieldKey]);
      }
    }

    return template;
  }

})(jQuery, Drupal, drupalSettings);
