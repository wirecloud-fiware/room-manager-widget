/**
 * @file Gruntfile.js
 * @version 0.0.1
 * 
 * @copyright 2014 CoNWeT Lab., Universidad Politécnica de Madrid
 * @license Apache v2 (https://github.com/Wirecloud/room-manager-widget/blob/master/LICENSE)
 */

module.exports = function(grunt) {

  'use strict';

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    banner: ' * @version <%= pkg.version %>\n' +
            ' * \n' +
            ' * @copyright 2014 <%= pkg.author %>\n' +
            ' * @license <%= pkg.license.type %> (<%= pkg.license.url %>)\n' +
            ' */',

    concat: {
      options: {
        stripBanners: true
      },
      dist: {
        options: {
          banner: '/*!\n * @file <%= pkg.name %>.js\n<%= banner %>\n\n'
        },
        src: [
          'widget/js/kws-rpc-builder.js',
          'widget/js/kws-utils.js',
          'widget/js/room-manager.js'
        ],
        dest: 'widget/dist/js/<%= pkg.name %>.js'
      }
    },

    uglify: {
      options: {
        preserveComments: false
      },
      dist: {
        options: {
          banner: '/*!\n * @file <%= pkg.name %>.min.js\n<%= banner %>\n'
        },
        src: '<%= concat.dist.dest %>',
        dest: 'widget/dist/js/<%= pkg.name %>.min.js'
      }
    },

    less: {
      dist: {
        options: {
          banner: '/*!\n * @file <%= pkg.name %>.css\n<%= banner %>\n\n'
        },
        src: [
          'widget/less/widget.less'
        ],
        dest: 'widget/dist/css/<%= pkg.name %>.css'
      }
    },

    cssmin: {
      options: {
        keepSpecialComments: 0
      },
      dist: {
        options: {
          banner: '/*!\n * @file <%= pkg.name %>.min.css\n<%= banner %>\n'
        },
        src: '<%= less.dist.dest %>',
        dest: 'widget/dist/css/<%= pkg.name %>.min.css'
      }
    },

    compress: {
      widget: {
        options: {
          archive: '<%= pkg.name %>.zip'
        },
        files: [
          {expand: true, src: ['**/*'], dest: './', cwd: 'widget'}
        ]
      }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-cssmin');

  grunt.loadNpmTasks('grunt-contrib-compress');

  grunt.registerTask('js', ['concat:dist', 'uglify:dist']);
  grunt.registerTask('css', ['less:dist', 'cssmin:dist']);
  grunt.registerTask('zip', ['compress:widget']);

  grunt.registerTask('default', ['js', 'css', 'zip']);

};
