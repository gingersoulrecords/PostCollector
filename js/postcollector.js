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
                console.log(results);
                var html = self.parseResultsToHTML(results);
                self.setResults(resultsContainer, html);
            });
        },


        // performQuickScore: function (query, collectionName) {
        //     var originalCollection = this.collections[collectionName];
        //     var strippedCollection = originalCollection.map(function (item) {
        //         return {
        //             ...item,
        //             content: item.content.replace(/<\/?[^>]+(>|$)/g, " ")
        //         };
        //     });

        //     var qs = new quickScore.QuickScore(strippedCollection, ['title', 'content']);

        //     var results = qs.search(query);
        //     return results.filter(function (result) {
        //         return (result.scoreKey === 'content' && result.score >= 0.025) || (result.scoreKey === 'title' && result.score >= 0.5);
        //     });
        // },

        performQuickScore: function (query, collectionName) {
            var originalCollection = this.collections[collectionName];
            var strippedCollection = originalCollection.map(function (item) {
                return {
                    ...item,
                    content: item.content.replace(/<\/?[^>]+(>|$)/g, " ")
                };
            });

            var qs = new quickScore.QuickScore(strippedCollection, ['title', 'content']);

            var results = qs.search(query);
            results = results.map(function (result) {
                // Check if the title or content contains the exact query string (case-insensitive)
                if (result.item.title.toLowerCase().includes(query.toLowerCase()) || result.item.content.toLowerCase().includes(query.toLowerCase())) {
                    // If it does, assign a very high score to promote it to the top of the list
                    result.score = 1;
                }
                // Check if the title or content contains the capitalized version of the query string
                var capitalizedQuery = query.charAt(0).toUpperCase() + query.slice(1);
                if (result.item.title.includes(capitalizedQuery) || result.item.content.includes(capitalizedQuery)) {
                    // If it does, assign a very high score to promote it to the top of the list
                    result.score = 1;
                }
                return result;
            });
            return results.filter(function (result) {
                return (result.scoreKey === 'content' && result.score >= 0.025) || (result.scoreKey === 'title' && result.score >= 0.5);
            });
        },




        parseResultsToHTML: function (results) {
            // Sort results by score in descending order
            results.sort(function (a, b) {
                return b.score - a.score;
            });

            return results.map(function (result) {
                var title = result.item.title;
                var content = result.item.content;
                var scoreKey = result.scoreKey;
                var matches = result.matches[scoreKey];
                var matchedString;
                var substrings = [];
                var previousEnd = 0;
                var wordsAround = 3;

                matches.forEach(function (match) {
                    var start = match[0];
                    var end = match[1];
                    var beforeMatch = scoreKey === 'title' ? title.substring(previousEnd, start) : content.substring(previousEnd, start);
                    matchedString = scoreKey === 'title' ? title.substring(start, end) : content.substring(start, end);
                    var afterMatch = scoreKey === 'title' ? title.substring(end) : content.substring(end, content.length);
                    var prefix = '', suffix = '';
                    if (scoreKey === 'content') {
                        prefix = beforeMatch.split(' ').slice(-wordsAround).join(' ');
                        suffix = afterMatch.split(' ').slice(0, wordsAround).join(' ');
                        if (prefix.length > 0) prefix = '... ' + prefix;
                        if (suffix.length > 0) suffix = suffix + ' ...';
                    }
                    substrings.push(prefix, '<mark>' + matchedString + '</mark>', suffix);
                    previousEnd = end;
                });

                if (scoreKey === 'title') {
                    title = title.substring(0, matches[0][0]) + '<mark>' + title.substring(matches[0][0], matches[0][1]) + '</mark>' + title.substring(matches[0][1]);
                    substrings = [];
                }

                var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="chevron"><path fill-rule="evenodd" d="M6.22 4.22a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 0 1-1.06-1.06L8.94 8 6.22 5.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" /></svg>';

                return '<li><a x-on:click.prevent="jQuery($el).trigger(\'click\');open=false" href="' + result.item.url + '"><span class="title">' + title + '</span>' + (substrings.length > 0 ? '<span class="content">' + substrings.join('') + '</span>' : '') + svg + '</a></li>';
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

        bindArrowKeys: function () {
            var self = this;
            // Listen for keydown event on search input
            $('.pc-search-input').on('keydown', function (event) {
                // If down arrow key is pressed
                if (event.key === 'ArrowDown') {
                    console.log('down');
                    event.preventDefault();
                    // Shift focus to the first anchor in the results container
                    $('.pc-results-container a').first().focus();
                }
            });

            // Listen for keydown event on results container
            $('.pc-results-container').on('keydown', 'a', function (event) {
                var current = $(this);
                // If down arrow key is pressed
                if (event.key === 'ArrowDown') {
                    event.preventDefault();
                    // Shift focus to the next anchor
                    current.parent().next().children('a').focus();
                }
                // If up arrow key is pressed
                else if (event.key === 'ArrowUp') {
                    event.preventDefault();
                    // Shift focus to the previous anchor
                    current.parent().prev().children('a').focus();
                }
            });
        },




        init: function () {
            // Call the watchInput and watchResultClicks methods
            this.watchInput();
            this.bindArrowKeys();

        }
    };

    // Call the init method when the document is ready
    $(window).on('load', function () {
        window.postCollector.init();
    });
})(jQuery);
