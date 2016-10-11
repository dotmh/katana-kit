module.exports = function (grunt) {

    'use strict';

    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        src: "express_mount",
        spec: "spec",

        notify_hooks: {
            options: {
                enabled: true,
                title: "<%= pkg.name %>"
            }
        },

        notify: {
            autobuild: {
                options: {
                    title: "<%= pkg.name %> : Autobuild",
                    message: "Complete"
                }
            },
            build: {
                options: {
                    title: "<%= pkg.name %> : Build",
                    message: "Complete"
                }
            },
            test: {
                options: {
                    title: "<%= pkg.name %> : Test"
                }
            }
        },

        jshint: {
            all: [
                "<%= src %>/**/*.js",
                "<%= spec %>/**/*.js"
            ],
            options: {
                jshintrc: ".jshintrc"
            }
        },

        mochaTest: {
            test: {
                options: {
                    reporter: 'spec',
                    captureFile: 'result.txt'
                },
                src: ["<%= spec %>/**/*_spec.js"]
            }
        },

        mocha_istanbul: {
            coverage: {
                src: "<%= spec %>/**/*_spec.js", // a folder works nicely
                options: {
                    excludes: ["<%= spec %>/**/*.js"],
                    mask: '*_spec.js'
                }
            }
        },

        watch: {
            jsFiles: {
                files: ['<%= src %>/**/*.js','<%= spec %>/**/*.js'],
                tasks: ['default', 'notify:autobuild']
            },
            gruntFiles: {
                files: ["Gruntfile.js", "*.json", ".jshintrc"],
                tasks: ['default', 'notify:autobuild'],
                options: {
                    reload: true
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-notify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-mocha-istanbul');

    grunt.task.run('notify_hooks');

    grunt.registerTask('validate' , ['jshint:all', 'mocha_istanbul']);
    grunt.registerTask('test' , ['validate']);
    grunt.registerTask('build' , ['validate' , 'notify:build']);
    grunt.registerTask('autobuild' , ['default' , 'build']);
    grunt.registerTask('default' , ['build']);
};