module.exports = function(grunt) {

    grunt.initConfig({

        uglify: {
          build: {
            files: {
              'admin/js/git-grunt-test-admin.js': ['src/admin/js/admin.js'],
              'public/js/git-grunt-test-public.js': ['src/public/js/public.js']
            }
          },
          dev: {
            options: {
              beautify: true,
              mangle: false,
              compress: false,
              preserveComments: 'all'
            },
            files: {
              'admin/js/git-grunt-test-admin.js': ['src/admin/js/admin.js'],
              'public/js/git-grunt-test-public.js': ['src/public/js/public.js']
            }
          }
        },

        sass: {                              
          dev: {                           
            options: {                      
              style: 'expanded',
              sourcemap: 'none'
            },
            files: {                        
              'admin/css/git-grunt-test-admin.css': 'src/admin/scss/admin.scss',
              'public/css/git-grunt-test-public.css': 'src/public/scss/public.scss'
            }
          },
          build: {                           
            options: {                      
              style: 'compressed',
              sourcemap: 'none'
            },
            files: {                        
              'admin/css/git-grunt-test-admin.css': 'src/admin/scss/admin.scss',
              'public/css/git-grunt-test-public.css': 'src/public/scss/public.scss'
            }
          }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-sass');

    grunt.registerTask('build', ['uglify:build','sass:build']);
    grunt.registerTask('default', ['uglify:dev','sass:dev']);

};
