---
outline: deep
---

# 脚本解析

每个组件都是个脚本

## 设置默认脚本编辑器

CocosCreator菜单 -> 设置 -> 程序管理器 -> 默认脚本编辑器 -> 选择vscode

## 新建及挂载脚本

新建脚本，脚本挂载在节点上才会被执行！将脚本挂载到节点上，拖动到节点属性选择器，或在节点属性检查器中添加脚本

思考: 多个节点挂载同一个脚本会怎么样？

## 组件菜单

- 重置
- 删除
- 向上
- 向下
- 复制组件（在其他节点可以在粘贴）

## 打开编写脚本

双击脚本会用vscode打开

```ts
import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Test')
export class Test extends Component {
    start() {

    }

    update(deltaTime: number) {
        
    }
}
```

### 代码分析

- `ccclass`装饰器 - 编辑器才会识别
- `export default` - 默认导出，其他脚本中可以导入并使用该脚本
- `extends Component` - 继承组件这个类，编写的脚本都是组件的子类
- `声明属性并使用@property` - 让这个属性在编辑器面板显示，可以直接在编辑器修改，修改的值会覆盖初始值
  - 基本类型

    ```ts
    @property
    text: string = 'hello'
    ```

  - 复杂类型

    ```ts
    @property(Label)
    label: Label = null
    ```
