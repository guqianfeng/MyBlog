/**
 * 工厂模式
 */
{
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

    const enemyC = Enemy.Create(EnemyType.A)
    console.log(enemyC);
}