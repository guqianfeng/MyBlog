{
    /**
     * 单例模式，只有一个实例
     * 举例
     *  敌人类，可以实例化各种各样的敌人
     *  敌人管理类，可以控制所有的敌人攻击，停止攻击，增加攻击
     *  管理类只需要一个实例
     */
    class Manager {
        private static instance: Manager // 私有属性不能直接访问
        private constructor() { } // 外部不能 new Manager
        public static Instance() {
            if (!Manager.instance) {
                // 如果instance不存在，实例化
                Manager.instance = new Manager()
            }
            // Manager.instance肯定存在了，返回
            return Manager.instance
        }
    }

    let m1 = Manager.Instance()
    let m2 = Manager.Instance()
    let m3 = Manager.Instance()
    console.log(m1 === m2)
    console.log(m2 === m3)
    console.log(m3 === m1);
}