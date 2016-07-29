readme
-----
#####1.config.js说明
----
主要用于配置路径，结构如下
```
module.exports={
  path: {
      // 开发环境
      dev: {
		//资源根目录，一切的css，js，images都包含在该目录下。
        src: '../insight2-web/src/main/resources/static',
        //资源目录下不修改的文件夹
		dont_change_src:{
		//路径准确到文件深度
          css:  '/css/kendo/**/*',
          js: '/js/lib/**/*',
          img: '/images/**/**/*'
        },
		//应用根目录，一切的jsp,html..都包含在该目录下。
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

```

#####2.使用说明
----
1.简单使用
双击start.bat，自动运行
gulp clean //清除旧的rev-manifest.json 和src-rev，webapp-rev文件夹
gulp src  //新建版本文件src-rev和rev-manifest.json
gulp rev  //将对应的html等文件中的css，js连接修改版本号
gulp js/css/images //单独产生发布版本的js文件夹/css文件夹.....

运行结果前后：
```
//前
<script type="text/javascript" src="${ctx}/js/core/insight.angular.js"></script>
//后
<script type="text/javascript" src="${ctx}/js/core/insight.angular.73e3076a99.js"></script>

```

2.命令单独使用
cd 到根目录 使用gulp clean，gulp src，gulp rev命令



3.意外处理
*1.webapp-rev文件夹中文件内容没有被替换，但src-rev文件夹产生正确，rev-manifest.文件正确*
- 删除原有wabapp ，单独使用gulp rev重新生成webapp-rev
