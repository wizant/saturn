module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        // Define our source and build folders
        js_src_path: 'static/js/src',
        js_build_path: "static/js",
        css_src_path: "static/css/src",
        css_build_path: "static/css",

        // Grunt Tasks
        concat: {
            options:{
                separator: ';'
            },
            js: {
                src: ["static/js/src/angular-mocks-1.1.5.js",
                    "static/js/src/angular-resource-1.1.5.js",
                    "static/js/src/angular-ui.js",
                    "static/js/src/http-auth-interceptor.js",
                    "static/js/src/jquery.cookie.js",
                    "static/js/src/fullcalendar.min.js",
                    "static/js/src/gcal.js",
                    "static/js/src/bootstrap.js",
                    "static/js/src/ui-bootstrap-tpls-0.3.0.js",
                    "static/js/src/bootstrap-timepicker.js",
                    "static/js/src/spectrum.js",
                    "static/js/src/jquery.resizeStop.js",
                    "static/js/src/directives/timepicker.js",
                    "static/js/src/directives/colorpicker.js",
                    "static/js/src/directives/feedback.js",
                    "static/js/src/directives/ngrightclick.js",
                    "static/js/src/intro.js",
                    "static/js/src/application.js",
                    "static/js/src/outro.js"],
                dest: '<%= js_build_path %>/app.js'
            },
            css:{
                src: ["static/css/src/bootstrap.css",
                    "static/css/src/angular-ui.min.css",
                    "static/css/src/fullcalendar.css",
                    "static/css/src/bootstrap-timepicker.css",
                    "static/css/src/font-awesome.css",
                    "static/themes/smoothness/jquery-ui-1.10.2.smoothness.min.css",
                    "static/css/src/spectrum.css",
                    "static/css/src/application.css"],
                dest: '<%= css_build_path %>/app.css'
            }
        },
        uglify: {
            options:{
                mangle: false,
                banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version + "\\n" %>' +
                    '* <%= grunt.template.today("yyyy-mm-dd") + "\\n" %>' +
                    '* <%= pkg.homepage + "\\n" %>' +
                    '* Copyright (c) <%= grunt.template.today("yyyy") %> - <%= pkg.title || pkg.name %> */ <%= "\\n" %>'
            },
            js: {
                src: '<%= concat.js.dest %>',
                dest:'<%= js_build_path %>/app.min.js'
            }
        },
        cssmin: {
            options: {
                keepSpecialComments: 0
            },
            css: {
                src: '<%= concat.css.dest %>',
                dest:'<%= css_build_path %>/app.min.css'
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');

    // Default task.
    grunt.registerTask('default', ['concat', 'uglify', 'cssmin']);
};