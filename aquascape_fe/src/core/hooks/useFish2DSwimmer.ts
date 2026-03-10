import * as THREE from 'three';
import type { TankBounds } from "@app/core/interface";

interface Fish2DSwimState {
    currentSpeed: number;
    targetSpeed: number;
    isPaused: boolean;
    nextSpeedChange: number;
    speedMultiplier: number;
}

export class Fish2DSwimmer {
    private fishPlane: THREE.Object3D;
    private bounds: TankBounds;
    private targetPosition: THREE.Vector3;
    private swimDirection: THREE.Vector3 = new THREE.Vector3(1, 0, 0);
    private desiredDirection: THREE.Vector3 = new THREE.Vector3();
    private state: Fish2DSwimState;
    private turnSpeed = 1.5;
    private margin = 3;
    private readonly stepInterval = 1 / 30;
    private accumulatedDelta = 0;
    private forcedTargetUntil = 0;
    private foodTarget: THREE.Vector3 | null = null;
    private obstacles: THREE.Object3D[] = [];
    private raycaster = new THREE.Raycaster();
    private nextObstacleCheck = 0;
    private readonly avoidDistance = 12;
    private readonly obstacleProbe = new THREE.Vector3();
    private readonly obstacleClosestPoint = new THREE.Vector3();
    private readonly obstacleBox = new THREE.Box3();
    private readonly collisionPadding = 0.9;

    constructor(planeMesh: THREE.Object3D, bounds: TankBounds, obstacles: THREE.Object3D[] = []) {
        this.fishPlane = planeMesh;
        this.bounds = bounds;
        this.targetPosition = new THREE.Vector3();
        this.obstacles = obstacles;
        this.raycaster.far = this.avoidDistance;

        this.state = {
            currentSpeed: 6,
            targetSpeed: 6,
            isPaused: false,
            nextSpeedChange: 0,
            speedMultiplier: 1.5
        };

        this.pickNewTarget();
    }

    public setObstacles(obstacles: THREE.Object3D[]): void {
        this.obstacles = obstacles;
    }

    private pickNewTarget(): void {
        this.targetPosition.set(
            THREE.MathUtils.randFloat(
                this.bounds.minX + this.margin,
                this.bounds.maxX - this.margin
            ),
            THREE.MathUtils.randFloat(
                this.bounds.minY + this.margin,
                this.bounds.maxY - this.margin
            ),
            THREE.MathUtils.randFloat(
                this.bounds.minZ + this.margin,
                this.bounds.maxZ - this.margin
            )
        );
    }

    public update(delta: number, elapsed: number): void {
        if (this.state.isPaused) return;
        const hasForcedTarget = this.foodTarget !== null || (performance.now() / 1000) < this.forcedTargetUntil;

        if (this.foodTarget) {
            this.targetPosition.copy(this.foodTarget);
        }
        this.accumulatedDelta += delta;
        if (this.accumulatedDelta < this.stepInterval) {
            return;
        }
        const stepDelta = Math.min(this.accumulatedDelta, 0.05);
        this.accumulatedDelta = 0;

        const currentPos = this.fishPlane.position;

        this.desiredDirection
            .subVectors(this.targetPosition, currentPos)
            .normalize();

        const distance = currentPos.distanceTo(this.targetPosition);

        if (!hasForcedTarget && distance < 5) {
            this.pickNewTarget();
        }

        if (elapsed > this.nextObstacleCheck) {
            this.avoidObstacles();
            this.nextObstacleCheck = elapsed + 0.08;
        }

        const activeTurnSpeed = hasForcedTarget ? this.turnSpeed * 3 : this.turnSpeed;
        this.swimDirection.lerp(this.desiredDirection, stepDelta * activeTurnSpeed);
        this.swimDirection.normalize();

        this.fishPlane.position.addScaledVector(
            this.swimDirection,
            this.state.currentSpeed * this.state.speedMultiplier * stepDelta
        );

        if (elapsed > this.state.nextSpeedChange) {
            this.state.targetSpeed = hasForcedTarget
                ? THREE.MathUtils.randFloat(8, 11)
                : THREE.MathUtils.randFloat(4, 8);
            this.state.nextSpeedChange = elapsed + THREE.MathUtils.randFloat(2, 4);
        }

        this.state.currentSpeed +=
            (this.state.targetSpeed - this.state.currentSpeed) * stepDelta;

        this.fishPlane.position.x = THREE.MathUtils.clamp(
            this.fishPlane.position.x,
            this.bounds.minX + this.margin,
            this.bounds.maxX - this.margin
        );

        this.fishPlane.position.y = THREE.MathUtils.clamp(
            this.fishPlane.position.y,
            hasForcedTarget ? this.bounds.minY + 3 : this.bounds.minY + this.margin,
            hasForcedTarget ? this.bounds.maxY - 1.5 : this.bounds.maxY - this.margin
        );

        this.fishPlane.position.z = THREE.MathUtils.clamp(
            this.fishPlane.position.z,
            this.bounds.minZ + this.margin,
            this.bounds.maxZ - this.margin
        );

        const angleY = Math.atan2(
            this.swimDirection.x,
            this.swimDirection.z
        );

        this.fishPlane.rotation.set(0, angleY, 0);
        this.resolveObstaclePenetration();
    }

    private resolveObstaclePenetration(): void {
        const fishPos = this.fishPlane.position;
        const checkableObstacles = this.obstacles.filter((entry) => entry.uuid !== this.fishPlane.uuid);
        if (checkableObstacles.length === 0) return;

        checkableObstacles.forEach((obstacle) => {
            this.obstacleBox.setFromObject(obstacle);
            const min = this.obstacleBox.min;
            const max = this.obstacleBox.max;

            const insideX = fishPos.x > min.x && fishPos.x < max.x;
            const insideY = fishPos.y > min.y && fishPos.y < max.y;
            const insideZ = fishPos.z > min.z && fishPos.z < max.z;
            if (!insideX || !insideY || !insideZ) return;

            const pushLeft = Math.abs(fishPos.x - min.x);
            const pushRight = Math.abs(max.x - fishPos.x);
            const pushDown = Math.abs(fishPos.y - min.y);
            const pushUp = Math.abs(max.y - fishPos.y);
            const pushBack = Math.abs(fishPos.z - min.z);
            const pushFront = Math.abs(max.z - fishPos.z);

            const candidates = [
                { axis: "x", sign: -1, dist: pushLeft },
                { axis: "x", sign: 1, dist: pushRight },
                { axis: "y", sign: -1, dist: pushDown },
                { axis: "y", sign: 1, dist: pushUp },
                { axis: "z", sign: -1, dist: pushBack },
                { axis: "z", sign: 1, dist: pushFront },
            ].sort((a, b) => a.dist - b.dist);

            const best = candidates[0];
            if (!best) return;

            if (best.axis === "x") {
                fishPos.x += best.sign * (best.dist + this.collisionPadding);
            } else if (best.axis === "y") {
                fishPos.y += best.sign * (best.dist + this.collisionPadding);
            } else {
                fishPos.z += best.sign * (best.dist + this.collisionPadding);
            }
        });

        fishPos.x = THREE.MathUtils.clamp(fishPos.x, this.bounds.minX + this.margin, this.bounds.maxX - this.margin);
        fishPos.y = THREE.MathUtils.clamp(fishPos.y, this.bounds.minY + this.margin, this.bounds.maxY - this.margin);
        fishPos.z = THREE.MathUtils.clamp(fishPos.z, this.bounds.minZ + this.margin, this.bounds.maxZ - this.margin);
    }

    private avoidObstacles(): void {
        if (this.obstacles.length === 0) return;

        const fishPos = this.fishPlane.position;
        const forward = new THREE.Vector3()
            .subVectors(this.targetPosition, fishPos)
            .normalize();

        if (forward.lengthSq() < 0.0001) return;

        const checkableObstacles = this.obstacles.filter((entry) => entry.uuid !== this.fishPlane.uuid);
        if (checkableObstacles.length === 0) return;

        this.raycaster.set(fishPos, forward);
        const intersections = this.raycaster.intersectObjects(checkableObstacles, true);
        if (intersections.length > 0 && intersections[0].distance < this.avoidDistance) {
            const side = Math.random() > 0.5 ? 1 : -1;
            const lateral = new THREE.Vector3(-forward.z, 0, forward.x).normalize();
            const evasive = fishPos.clone()
                .add(lateral.multiplyScalar(side * 8))
                .add(new THREE.Vector3(0, THREE.MathUtils.randFloat(-3, 4), 0));
            this.targetPosition.set(
                THREE.MathUtils.clamp(evasive.x, this.bounds.minX + this.margin, this.bounds.maxX - this.margin),
                THREE.MathUtils.clamp(evasive.y, this.bounds.minY + this.margin, this.bounds.maxY - this.margin),
                THREE.MathUtils.clamp(evasive.z, this.bounds.minZ + this.margin, this.bounds.maxZ - this.margin)
            );
            return;
        }

        this.obstacleProbe.set(0, 0, 0);
        checkableObstacles.forEach((obstacle) => {
            this.obstacleBox.setFromObject(obstacle);
            this.obstacleClosestPoint.set(
                THREE.MathUtils.clamp(fishPos.x, this.obstacleBox.min.x, this.obstacleBox.max.x),
                THREE.MathUtils.clamp(fishPos.y, this.obstacleBox.min.y, this.obstacleBox.max.y),
                THREE.MathUtils.clamp(fishPos.z, this.obstacleBox.min.z, this.obstacleBox.max.z)
            );
            const away = fishPos.clone().sub(this.obstacleClosestPoint);
            const distanceToObstacle = away.length();
            if (distanceToObstacle > 0.001 && distanceToObstacle < this.avoidDistance) {
                const weight = 1 - (distanceToObstacle / this.avoidDistance);
                this.obstacleProbe.add(away.normalize().multiplyScalar(weight));
            }
        });

        if (this.obstacleProbe.lengthSq() > 0.001) {
            this.targetPosition.add(this.obstacleProbe.normalize().multiplyScalar(6));
            this.targetPosition.x = THREE.MathUtils.clamp(this.targetPosition.x, this.bounds.minX + this.margin, this.bounds.maxX - this.margin);
            this.targetPosition.y = THREE.MathUtils.clamp(this.targetPosition.y, this.bounds.minY + this.margin, this.bounds.maxY - this.margin);
            this.targetPosition.z = THREE.MathUtils.clamp(this.targetPosition.z, this.bounds.minZ + this.margin, this.bounds.maxZ - this.margin);
        }
    }

    public setPaused(paused: boolean): void {
        this.state.isPaused = paused;
    }

    public isPaused(): boolean {
        return this.state.isPaused;
    }

    public setSpeedMultiplier(multiplier: number): void {
        this.state.speedMultiplier = THREE.MathUtils.clamp(multiplier, 0.5, 6);
    }

    public steerTowards(target: THREE.Vector3, holdSeconds: number = 0.8): void {
        this.targetPosition.set(
            THREE.MathUtils.clamp(target.x, this.bounds.minX + this.margin, this.bounds.maxX - this.margin),
            THREE.MathUtils.clamp(target.y, this.bounds.minY + 3, this.bounds.maxY - 1.5),
            THREE.MathUtils.clamp(target.z, this.bounds.minZ + this.margin, this.bounds.maxZ - this.margin)
        );
        this.forcedTargetUntil = (performance.now() / 1000) + Math.max(0.2, holdSeconds);
    }

    public setFoodTarget(target: THREE.Vector3): void {
        this.foodTarget = target.clone();
    }

    public clearFoodTarget(): void {
        this.foodTarget = null;
    }

    public dispose(): void { }
}
