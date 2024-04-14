(function ($) {
    // Assuming 'name' is the name of the collection
    var name = 'postsAndPages';

    // Add the collection to the collections property
    window.postCollector.collections[name] = window.postCollector.collections[name];

    // Add methods to the postCollector object
    window.postCollector.method1 = function () {
        // Method 1 implementation
    };

    window.postCollector.method2 = function () {
        // Method 2 implementation
    };

    window.postCollector.init = function () {
        // Init method implementation
    };

    // Call the init method when the document is ready
    $(document).ready(function () {
        window.postCollector.init();
    });
})(jQuery);
