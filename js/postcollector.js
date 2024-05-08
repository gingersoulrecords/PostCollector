(function ($) {
    // Create the postCollector object and define its methods
    window.postCollector = {
        collections: window.postCollector ? window.postCollector.collections : {},

        watchInput: function () {
            var self = this;
            $('.pc-search-input').on('input', function () {
                var query = $(this).val();
                var collectionName = $(this).data('collections');
                var resultsContainer = $(this).data('results');

                if (query.length > 0) {
                    $(resultsContainer).show();
                } else {
                    $(resultsContainer).hide();
                }

                var results = self.performQuickScore(query, collectionName);
                var html = self.parseResultsToHTML(results);
                self.setResults(resultsContainer, html);
            });
        },

        performQuickScore: function (query, collectionName) {
            var qs = new quickScore.QuickScore(this.collections[collectionName], ['title', 'content']);
            return qs.search(query);
        },

        parseResultsToHTML: function (results) {
            return results.map(function (result) {
                return '<li><a href="' + result.item.url + '">' + result.item.title + '</a></li>';
            }).join('');
        },

        setResults: function (resultsContainer, html) {
            $(resultsContainer).empty().append('<ul>' + html + '</ul>');
        },

        bindKeyboardShortcut: function () {
            $(document).on('keydown', function (event) {
                // Check if Cmd (on Mac) or Ctrl (on other platforms) and K keys are pressed
                if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
                    event.preventDefault();
                    // Clear the search input and focus it
                    $('.pc-search-input').val('').focus();
                }
            });
        },

        watchResultClicks: function () {
            document.addEventListener('click', function (event) {
                var target = $(event.target);
                if (target.is('.pc-results-container a')) {
                    event.preventDefault();
                    var resultsContainer = target.closest('.pc-results-container');
                    $(resultsContainer).hide();
                    return true;
                }
            }, true); // Set useCapture to true
        },


        init: function () {
            // Call the watchInput and watchResultClicks methods
            this.watchInput();
            this.watchResultClicks();
            this.bindKeyboardShortcut();

        }
    };

    // Call the init method when the document is ready
    $(window).on('load', function () {
        window.postCollector.init();
    });
})(jQuery);
