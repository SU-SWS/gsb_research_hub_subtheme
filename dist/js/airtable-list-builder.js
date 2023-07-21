(function ($, Drupal, drupalSettings) {
    $.ajax({
        url:
          "https://api.airtable.com/v0/app5VaRYVafmpL1KB/Training%20&%20Workshop%20Recordings",
        type: "GET",
        contentType: "application/json",
        headers: {
          Authorization:
            "Bearer patI6NlthwRALu68h.454f4e5e1a0bf1a67b1c3a8adfb4a1ecda4d9b41b4ca881e78d9bf64a7c26d6e"
        },
        success: function (result) {
          console.log(result);
    
          var filterOptions = [
            {'airtableField': 'Category', 'name': 'Categories', 'choices': []},
            {'airtableField': 'Series', 'name': 'Series', 'choices': []}
          ];
    
    
          var $contentArea = $(".aritable-list");
    
          for (var key in result.records) {
            var record = result.records[key];
            var fields = record.fields;
            var presenters = fields["Presenters Name and Title"];
    
            var presenterHTML = "";
            for (var index in presenters) {
              var presenter = JSON.parse(presenters[index]);
              presenterHTML +=
                "<strong>" +
                presenter.name +
                "</strong><br>" +
                presenter.title +
                "<br><br>";
            }
    
    
            var links = fields['Link Info'];
            var linkHTML = "";
            for (var index in links) {
              var link = JSON.parse(links[index]);
              linkHTML += '<p><a href="' + link.url + '">' + link.name + '</a></p>'
            }
    
            var classes = 'masonry-item';
            
            for (var filterKey in filterOptions) {
              var filter = filterOptions[filterKey];
              var filterClass = classConvert(fields[filter.airtableField]);
              var filterPrefix = classConvert(filter.airtableField);
              filterOptions[filterKey]['choices'][filterPrefix + '--' + filterClass] = fields[filter.airtableField];
    
              classes += ' ' + filterPrefix + '--' + filterClass;
            }
    
            var card = `<div class="${classes}">
                    <article class="su-card  " style="">
                      <section class="su-card__contents">
                        <span></span>
                        <h2>${fields.Name}</h2>
                        <p><strong>${fields.Series}</strong></p>
                        <p>${presenterHTML}</p>
                        <p>${fields.Description} </p>
                        ${linkHTML}
                      </section>
                    </article>
                  </div>`;
            $contentArea.append(card);
          }
    
          var $filterWrapper = $('<div>');
          $filterWrapper.attr('id', 'filters');
    
          for (var filterKey in filterOptions) {
            var $filterGroupWrapper = $('<div>');
            $filterGroupWrapper.addClass('ui-group');
            $header = $('<h3>');
            $header.text(filterOptions[filterKey].name);
            $filterGroupWrapper.append($header);
            var $filterHTML = buildFilters(filterOptions[filterKey]);
            $filterGroupWrapper.append($filterHTML);
            $filterWrapper.append($filterGroupWrapper);
          }
    
          $('body').prepend($filterWrapper);
    
    
          // store filter for each group
          var filters = {};
    
          $('#filters').on( 'click', '.button', function( event ) {
            var $button = $( event.currentTarget );
            // get group key
            var $buttonGroup = $button.parents('.filter-group');
            var filterGroup = $buttonGroup.attr('data-filter-group');
            // set filter for group
            filters[ filterGroup ] = $button.attr('data-filter');
            // combine filters
            var filterValue = concatValues( filters );
            // set filter for Isotope
            $contentArea.isotope({ filter: filterValue });
          });
    
          // change is-checked class on buttons
          $('.filter-group').each( function( i, buttonGroup ) {
            var $buttonGroup = $( buttonGroup );
            $buttonGroup.on( 'click', 'button', function( event ) {
              $buttonGroup.find('.is-checked').removeClass('is-checked');
              var $button = $( event.currentTarget );
              $button.addClass('is-checked');
            });
          });
    
         
          $contentArea.isotope({
            itemSelector: ".masonry-item",
            layoutMode: "fitRows",
            fitRows: {
              gutter: 10
            }
          });
        },
        error: function (error) {}
      });
})(jQuery, Drupal, drupalSettings);