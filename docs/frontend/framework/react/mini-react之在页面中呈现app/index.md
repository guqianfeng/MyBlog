---
outline: deep
---
# mini-react之在页面中呈现app

## 实现mini-react

### v0.1

写死dom

```js
const dom = document.createElement('div')
dom.id = 'app'
document.querySelector("#root").append(dom)

const textNode = document.createTextNode('')
textNode.nodeValue = 'app'
dom.append(textNode)
```

### v0.2

基于虚拟dom(js对象)

对象有type，props(包含属性，children)

```js
const el = {
    type: 'div',
    props: {
        id: 'app',
        children: [
            {
                type: 'TEXT_ELEMENT', // 文本节点比较特殊
                props: {
                    nodeValue: 'app',
                    children: []
                }
            }
        ]
    }
}
```
把textEl单独抽离

```js
const textEl = {
    type: 'TEXT_ELEMENT',
    props: {
        nodeValue: 'app',
        children: []
    }
}
const el = {
    type: 'div',
    props: {
        id: 'app',
        children: [
            textEl
        ]
    }
}
```
在根据前面的方式渲染

```js
const dom = document.createElement(el.type)
dom.id = el.props.id
document.querySelector("#root").append(dom)

const textNode = document.createTextNode('')
textNode.nodeValue = textEl.props.nodeValue
dom.append(textNode)
```

但前面的方式还是写死的，能否动态创建虚拟dom
```diff
- // const textEl = {
- //     type: 'TEXT_ELEMENT',
- //     props: {
- //         nodeValue: 'app',
- //         children: []
- //     }
- // }

+ function createTextNode(nodeValue) {
+     return {
+         type: 'TEXT_ELEMENT',
+         props: {
+             nodeValue,
+             children: []
+         }
+     }
+ }

- // const el = {
- //     type: 'div',
- //     props: {
- //         id: 'app',
- //         children: [
- //             textEl
- //         ]
- //     }
- // }


+ function createElement(type, props, ...children) {
+     return {
+         type,
+         props: {
+             ...props,
+             children
+         }
+     }
+ }

+ const textEl = createTextNode('app')
+ const App = createElement('div', { id: 'app' }, textEl)

const dom = document.createElement(App.type)
dom.id = App.props.id
document.querySelector("#root").append(dom)

const textNode = document.createTextNode('')
textNode.nodeValue = textEl.props.nodeValue
dom.append(textNode)
```

接下去就是要动态的创建dom结构，这里就要实现render函数了，分析下来都要实现这么几步
- 创建节点（要区分是文本节点还是元素节点）
- 设置节点属性（遍历设置属性，children属性要单独处理，因为是节点属性）
- 处理children
- 添加节点（给父节点添加）

```diff
- // const dom = document.createElement(App.type)
- // dom.id = App.props.id
- // document.querySelector("#root").append(dom)

- // const textNode = document.createTextNode('')
- // textNode.nodeValue = textEl.props.nodeValue
- // dom.append(textNode)

+ // el是虚拟dom container是父容器
+ function render (el, container) {
+     // 1. 创建节点
+     // 2. 设置非children的属性
+     // 3. 处理children
+     // 4. 添加节点
+     const dom = el.type === 'TEXT_ELEMENT' ? document.createTextNode("") : document.createElement(el.type)
+     Object.keys(el.props).forEach(key => {
+         if (key !== 'children') {
+            dom[key] = el.props[key]
+         }
+     })
+     const children = el.props.children
+     children.forEach(child => {
+         // 递归处理
+         render(child, dom)
+     })
+     container.append(dom)
+ }

+ render(App, document.querySelector('#root'))
```

还有个地方可以优化下，文本节点就传字符串行不行
```diff
- // const textEl = createTextNode('app')
- // const App = createElement('div', { id: 'app' }, textEl)

+ const App = createElement('div', { id: 'app' }, 'app')
```
显然现在是会报错的，我们要对children数组进行处理，是字符串的话手动创建文本节点
```js
function createElement(type, props, ...children) {
    return {
        type,
        props: {
            ...props,
            children: children.map(child => typeof child === 'string' ? createTextNode(child) : child)
        }
    }
}
```

### v0.3

### 重构react api

## 使用jsx

## 使用vitest做单元测试