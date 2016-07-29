module.exports={
  path: {
      // 开发环境
      dev: {
        src: '../insight2-web/src/main/resources/static',
        dont_change_src:{
          css:  '/css/kendo/**/*',
          js: '/js/lib/**/*',
          img: '/images/**/**/*'
        },
        app: '../insight2-web/src/main/webapp'
      },
      // 发布环境
      rev: {
        src:  '../insight2-web/src/main/resources/static-rev',
        dont_change_src:{
          css:  '/css/kendo',
          js: '/js/lib',
          img: '/images'
        },
        app:  '../insight2-web/src/main/webapp-rev'
      }
  }
}
