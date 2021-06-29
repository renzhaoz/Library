# 脚本仓库

## Server

- 功能: 模块通信
- 用法:
```
  class moduleA{
    funName(agr){
      return 'functionName';
    }
    postResult(agr1){}
    // 传递状态 注意有return值
    Service.registerState('funName', this); // 注册
    // 传递fun
    Service.register('postResult', this); // 注册
  }

  class moduleB{
    Service.query('funName', agr); // 调用模块A方法funName
    Service.request('postResult', agr1); // 调用模块A方法agr1
  }
```

- 地址
[模块通信url](./server.js)


## l10n

- 功能:
自动全局资源化

- 用法

```
  <span data-l10n-id={stringId} />
```

- 地址
[全局资源化fileUrl](./server.js)

## lazyLoad

- 功能
  动态加载资源文件

- 用法

```
  const filesList = [
    'dist/app.js'
  ];
  window.LazyLoader.load(filesList);
```

- 地址
[动态加载资源文件fileUrl](./server.js)
