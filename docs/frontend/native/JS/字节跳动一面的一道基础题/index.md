---
outline: deep
---
# 字节跳动一面的一道基础题

## 背景概述

大家好，我是梅利奥猪猪，本人属于萌新前端一枚，这是第一次在掘金写文章，写的不好请大家多多关照哈，前一阵子有幸接到了字节跳动的面试邀请，还是很开心的，还是那句话，基础最重要，虽然我二面已经挂了，但还是想分享一下关于基础的一些比较有意思的题目~

## 题目

第一轮面试还是比较轻松的，面试官一开始就说一面还是比较简单基础的，让我放轻松，很nice，大多数面试应该一开始都是聊技术(如果聊的不是很好，估计也到不了下面的直播写代码吧)，然后字节跳动之后就是牛客网直播写代码了，只见面试官悠悠的写下了这么2行代码

```js
let a = new Foo() //a.id -> 1
let b = new Foo() //b.id -> 2
```

## 解答过程

### 使用全局变量

作为萌新的我，看到这个，这么简单，随手一写~

```js
let idIndex = 1;
function Foo () {
  this.id = idIndex++;
}
let a = new Foo();
console.log(a);
let b = new Foo();
console.log(b);
```

很明显实现了效果，对于萌新来说也特别好理解，每次实例化对象的时候，把全局属性后加加，完美达到了面试官的要求，只见面试官悠悠的说，嗯可以，但能不能不用全局变量。。。

### 使用静态属性

这有什么难的，飒！直接把全局改成静态的就行了~

```js
function Foo () {
  this.id = Foo.idIndex++;
}
Foo.idIndex = 1
let a = new Foo();
console.log(a);
let b = new Foo();
console.log(b);
```

面试官一看眉头一皱，这小子还是没有写出我想要的代码啊，"额，能不能不用全局，和静态属性实现这个效果呢"，此时的我也就只能想出，还有闭包的方式，"那用闭包？"，面试官表示那你就show下吧

### 使用闭包

这个对于萌新的我依然还是很简单的，老子写代码就是一把梭

```js
const Foo = (function(){
  let idIndex = 1;
  return function(){
    this.id = idIndex++;
  }
})()
let a = new Foo();
console.log(a);
let b = new Foo();
console.log(b);
```

唰唰唰几下就写完了，面试官就点了点头，嗯看来还是比较满意我的写法吧，"可以，那我们在加深点题目难度吧，原本的题目改成这样

```js
let a = Foo() //a.id -> 1
let b = new Foo() //b.id -> 2
let c = new Foo() //c.id -> 3
let d = Foo() //d.id -> 4
```

### 使用instance of救场

讲道理一开始是把我卡住一会的，主要是要处理这个this的问题，但面试官还是很友善的提示了一句话，如何判断一个方法是直接调用还是使用new调用，有没有用过instanceof，哈哈好在我反应快一下子就写出了代码，当然当中也有这么一段代码调试了下

```js
const Foo = (function(){
  let idIndex = 1;
  return function(){
    // this.id = idIndex++;
    console.log(this instanceof Foo)
  }
})()
let a = new Foo();
// console.log(a);
let b = Foo();
// console.log(b);
let c = Foo();
// console.log(c);
let d = new Foo();
// console.log(d);
```

上述代码很明显，打印出来的结果就是`true`，`false`，`false`，`true`，因为就第一个和最后个使用了new，属于Foo的实例，接着就是根据这个来做判断处理，首先大家其实还要对new要有一定的理解，new会改变this指向，指向实例化的实例，并且会在最后方法执行完，把实例return出去，如果不使用new直接调用函数，函数没有返回值默认返回undefined，知道这些就可以干这个题了

```js
const Foo = (function(){
  let idIndex = 1;
  return function(){
    // console.log(this instanceof Foo)
    if (this instanceof Foo) {
      // 使用了new 会自动返回对象~
      this.id = idIndex++;
    } else {
      // 没有使用new，我们帮它返回~
      return {
        id: idIndex++
      }
    }
  }
})()
let a = new Foo();
console.log(a); // {id: 1}
let b = Foo();
console.log(b); // {id: 2}
let c = Foo();
console.log(c); // {id: 3}
let d = new Foo();
console.log(d); // {id: 4}
```

这样就完成了第一道笔试题~

## 总结

总体来说，第一道题还是比较轻松愉悦的，后面的题目后续我也会慢慢分享，其实一面的题目大多数还是比较基础的，最难的可能就是让你手写个Promise，以及实现Promise的一些静态方法，一面的面试官对我还是比较满意的，于是还增加了自信，然后就被第二轮面试血虐了，这里是萌新前端开发，记录自己的面试经历，以及空了分享一些知识，希望能与大家共同成长，如有错误，希望大佬轻喷，并且能指导前行，谢谢大家支持！
