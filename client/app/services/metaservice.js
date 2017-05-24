'use strict';

angular
.module('blogotripFullstackApp')
.service('MetaService', MetaService)

function MetaService(){
    // var metaTitle = '';
    var metaDescription = '';
    var metaKeywords = '';
    return {
        set: function(newMetaDescription, newKeywords) {
            // metaTitle = newMetaTitle;
            metaKeywords = newKeywords;
            metaDescription = newMetaDescription;
            
        },
        // metaTitle: function() { return metaTitle; },
        metaDescription: function() { return metaDescription; },
        metaKeywords: function() { return metaKeywords; }
    }
}

