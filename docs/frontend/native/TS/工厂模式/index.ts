{
    /**
     * 工厂模式
     * 举例
     *  用工厂来制造敌人，敌人有很多种类
     *  敌人工厂，传入对应的类型，创建不同类型的敌人
     */
    enum EnemyType {
        A,
        B,
        C,
    }

    class Enemy {
        static Create(type: EnemyType) {
            let instance: Enemy
            switch (type) {
                case EnemyType.A:
                    instance = new EnemyA()
                    break;
                case EnemyType.B:
                    instance = new EnemyB()
                    break;
                case EnemyType.C:
                    instance = new EnemyC()
                    break;
            }
            return instance
        }
    }
    class EnemyA extends Enemy {
        constructor() {
            super()
            console.log('enemy A');
        }
    }
    class EnemyB extends Enemy {
        constructor() {
            super()
            console.log('enemy B');
        }
    }
    class EnemyC extends Enemy {
        constructor() {
            super()
            console.log('enemy C');
        }
    }

    const enemy = Enemy.Create(EnemyType.A)
    console.log(enemy);
}