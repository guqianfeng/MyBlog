// 先不用dep做测试，只要实例化Watcher 就添加进数组，并且在劫持set的时候，直接更新
// const watchers = []
function defineReactive(obj, key, value) {
    // 实例化管家 管家里有2个方法，一个是addDep 还有一个notify
    const dep = new Dep()
    observe(value)
    Object.defineProperty(obj, key, {
        get() {
            // console.log('get', { key, value });
            if (Dep.target) {
                // dep.addSub(watcher实例)
                dep.addSub(Dep.target)
            }
            return value
        },
        set(newValue) {
            if (newValue !== value) {
                observe(newValue)
                // console.log('set', {key, newValue});
                value = newValue
                // watchers.forEach(item => item.update())
                dep.notify()
            }
        }
    })
}

function observe (obj) {
    // 递归要注意 终止条件 判断不是对象 或者是null 就return 
    if(typeof obj !== 'object' || obj === null) return
    Object.keys(obj).forEach(key => defineReactive(obj, key, obj[key]))
}

// set方法 劫持新的属性
function set(target, key, value) {
    defineReactive(target, key, value)
}


function proxy (vm) {
    // console.log(vm);
    Object.keys(vm.$data).forEach(key => {
        Object.defineProperty(vm, key, {
            get() {
                return vm.$data[key]
            },
            set(val) {
                vm.$data[key] = val
            }
        })
    })
}

class Vue {
    constructor(options) {
        // console.log(options);
        // $options
        this.$options = options
        // $data 判断data是对象还是函数 函数执行取返回值
        this.$data = options.data
        // data数据是响应式的
        observe(options.data)
        // 代理 希望
        // 访问 vm.count => vm.$data.count
        // 修改 vm.count++ => vm.$data.count++
        proxy(this) // this在这里就是实例 就是vm
        new Compile(options.el, this)
    }
}

// 解析模板
class Compile {
    // el（要知道解析哪个模板）和vm实例（要获取里面数据data还有方法methods等）
    constructor(elSelector, vm) {
        // console.log(elSelector, vm);
        // 把vm实例挂载this上，方便后面获取
        this.vm = vm
        // 选择器 获取 对应的元素
        const element = document.querySelector(elSelector)
        // 新写方法compile，参数传入元素，该方法专门处理编译解析
        this.compile(element)
    }
    compile(element) {
        // console.log(element, this.vm);
        // children只能拿到子元素，不能用这个方案，因为除了元素还有文本，文本有双大括号需要解析
        // console.log(element.children);
        // console.log(element.childNodes);
        element.childNodes.forEach(node => {
            // nodeType === 1 元素节点
            // nodeType === 3 文本节点
            // console.log(node, node.nodeType);
            if (this.isElement(node)) {
                // console.log('元素', node);
                const attrs = node.attributes
                // console.log([...attrs]);
                Array.from(attrs).forEach(({name: attrName, value: exp}) => {
                    // console.dir(attr)
                    // name - 属性名 - 键
                    // value - 属性值 - 值
                    // console.log(attrName ,exp);
                    if (this.isDir(attrName)) {
                        // console.log('需要解析指令 指令名',attrName);
                        const dirName = attrName.slice(2)
                        // console.log(dirName);
                        // console.log('需要解析指令 表达式',exp);
                        /**
                         * 每个指令提供一个方法
                         * v-text -> 调用text方法  text(node, exp)
                         * v-html -> 调用html方法 html(node, exp)
                         */
                        // 以下代码不能这么写，因为text写死了
                        // this.text(node, exp)
                        // dirName就动态的
                        this[dirName]?.(node, exp)
                    }
                    if (this.isEvent(attrName)) {
                        // attrName @click 
                        // console.log('事件', node, attrName, exp);
                        const eventName = attrName.slice(1)
                        // console.log(eventName); 
                        this.eventHandler(node, eventName, exp)
                    }
                })
                if (node.childNodes.length > 0) {
                    // 递归处理
                    this.compile(node)
                }
            }
            if (this.isInter(node)) {
                // 能进这个if 说明是文本并且里面有双大括号
                // console.log('文本', node);
                this.compileText(node)
            }
            
        })
    }
    isElement (node) {
        return node.nodeType === 1 
    }
    // 是文本节点，且里面有双大扩号语法 （正则） （node节点里的内容 正则匹配）
    // 判断有双大括号语法的文本
    isInter (node) {
        return node.nodeType === 3 && /\{\{(.*)\}\}/.test(node.textContent)
    }
    // direction isDir - 判断个字符串是否是指令 (指令都是v-开头)
    // 如何判断一个字符串是v-开头呢 startsWith
    isDir (str) {
        return str.startsWith('v-')
    }
    isEvent(str) {
        // console.log(str);
        // return str.startsWith('@')
        return str.indexOf('@') === 0
    }

    eventHandler(node, eventName, exp) {
        // 获取handleClick 
        const fn = this.vm.$options.methods?.[exp]
        // console.log(fn);
        fn && node.addEventListener(eventName, fn.bind(this.vm))
    }
    update (node, exp, dir) {
        // this.textUpdater(node, this.vm[exp])
        // 初始化的工作
        this[dir + 'Updater']?.(node, this.vm[exp])
        // 实例化Watcher 做监听，做数据变化之后的一些功能
        new Watcher(this.vm, exp, val => {
            // console.log(this);
            // val指的是最新的值
            this[dir + 'Updater']?.(node, val)
        })
    }
    // xxxUpdater - 处理更新视图
    // yyyUpdater - 处理更新视图
    textUpdater (node, val) {
        node.textContent = val 
    }
    htmlUpdater (node, val) {
        node.innerHTML = val
    }
    modelUpdater (node, val) {
        node.value = val
    }
    // 编译文本
    /**
     * 简易版 直接替换双大扩号语法内容
     * 复杂版的逻辑 本次不考虑 有兴趣的可以自己扩展
     * {{ 1 + count}} 双大括号里复杂的逻辑 本次不考虑
     * {{count}} {{haha}} {{heihei}} 一个文本节点中有多个双大括号 本次也不考虑
     * xxxx {{xxx}} 文案加双大括号 本次也不考虑
     * @param {*} node 
     */
    compileText(node) {
        // (haha) => ( haha )
        // console.log('compileText', node, RegExp.$1, this.vm);
        // node.textContent = this.vm[RegExp.$1.trim()]
        // new Watcher()
        this.update(node, RegExp.$1.trim(), 'text')
    }
    model(node, exp) {
        this.update(node, exp, 'model')
        // 简易版就是input事件
        node.addEventListener('input', e => {
            const val = e.target.value
            this.vm[exp] = val
        })
    }
    text (node, exp) {
        // node.textContent = this.vm[exp]
        // new Watcher()
        this.update(node, exp, 'text')
    }
    html (node, exp) {
        // node.innerHTML = this.vm[exp]
        // new Watcher
        this.update(node, exp, 'html')
    }
}

class Watcher {
    // new Watcher(vm, key, updater函数)
    // new Watcher(vm, key, val => {渲染的逻辑})
    // 有值就能做渲染 node.textContent = vm[key]
    constructor(vm, key, updater) {
        this.vm = vm;
        this.key = key;
        this.updater = updater
        Dep.target = this
        this.vm[this.key]
        Dep.target = null
        // watchers.push(this)
    }
    // dep通知所有对应的watcher 遍历执行update
    update () {
        // 执行updater函数就可以了
        this.updater(this.vm[this.key])
    }
}

class Dep {
    constructor() {
        this.subs = [] // watcher数组
    }
    // 添加watcher
    addSub (sub) {
        this.subs.push(sub)
    }
    // 通知对应的watchers里的每一个观察者做更新
    notify () {
        this.subs.forEach(item => item.update())
    }
}



