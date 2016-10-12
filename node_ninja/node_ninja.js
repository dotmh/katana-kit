(function(){
    "use strict";

    const FOLDER = './components';

    module.exports = {
        Collection: require(FOLDER+'/collection'),
        Eventify: require(FOLDER+'/eventify'),
        FileExt: require(FOLDER+'/file_ext'),
        JsonFile: require(FOLDER+'/json_file'),
        Logger: require(FOLDER+'/logger'),
        Schema: require(FOLDER+'/schema')
    }

})();