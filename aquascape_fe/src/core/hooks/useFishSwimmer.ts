import * as THREE from 'three';
import type { TankBounds } from "@app/core/interface";

interface SwimState {
    isTurning: boolean;
    turnStartTime: number;
    turnDuration: number;
    currentSpeed: number;
    targetSpeed: number;
    isPaused: boolean;
    nextWanderUpdate: number;
    speedMultiplier: number;
}

export class FishSwimmer {
    public fishGroup: THREE.Object3D;
    private bounds: TankBounds;
    private targetPosition: THREE.Vector3;
    private state: SwimState;
    private targetRotation: THREE.Matrix4;
    private targetQuaternion: THREE.Quaternion;
    private obstacles: THREE.Object3D[] = [];
    private raycaster: THREE.Raycaster;
    private nextObstacleCheck = 0;
    private readonly avoidDistance = 18;
    private readonly wanderMargin = 2.5;
    private forcedTargetUntil = 0;
    private readonly obstacleProbe = new THREE.Vector3();
    private readonly obstacleClosestPoint = new THREE.Vector3();
    private readonly obstacleBox = new THREE.Box3();

    constructor(
        fishModel: THREE.Object3D,
        bounds: TankBounds,
        fishSize: number = 1.0,
        obstacles: THREE.Object3D[] = []
    ) {
        this.fishGroup = fishModel;
        this.bounds = bounds;
        this.targetPosition = new THREE.Vector3();
        this.targetRotation = new THREE.Matrix4();
        this.targetQuaternion = new THREE.Quaternion();
        this.obstacles = obstacles;
        this.raycaster = new THREE.Raycaster();
        this.raycaster.far = 20;

        this.state = {
            isTurning: false,
            turnStartTime: 0,
            turnDuration: 1.5,
            currentSpeed: 5,
            targetSpeed: 5,
            isPaused: false,
            nextWanderUpdate: 0,
            speedMultiplier: 1
        };

        this.setupFish(fishSize);
        this.initializePosition();
        this.pickSideToSideTarget();
    }

    public setObstacles(obstacles: THREE.Object3D[]): void {
        this.obstacles = obstacles;
    }

    private setupFish(_fishSize: number): void {
        // The fishSize parameter is no longer used for scaling here.
        // Scaling and material setup is now handled consistently in useTankSetup.
        let triangles = 0;
        this.fishGroup.traverse((child: any) => {
            if (child.isMesh) {
                triangles += child.geometry.index
                    ? child.geometry.index.count / 3
                    : child.geometry.attributes.position.count / 3;
            }
        });
        console.log(`🐟 Fish model triangles: ${Math.round(triangles)}`);
    }

    private initializePosition(): void {
        this.fishGroup.position.copy(this.bounds.center);
    }

    private axisPadding(axisSize: number): number {
        return THREE.MathUtils.clamp(axisSize * 0.08, 1.8, 8);
    }

    private pickSideToSideTarget(): void {
        const xPadding = this.axisPadding(this.bounds.maxX - this.bounds.minX);
        const yPadding = this.axisPadding(this.bounds.maxY - this.bounds.minY);
        const zPadding = this.axisPadding(this.bounds.maxZ - this.bounds.minZ);
        const currentX = this.fishGroup.position.x;

        const targetX = (currentX < 0) ? this.bounds.maxX - xPadding : this.bounds.minX + xPadding;

        const randomZ = THREE.MathUtils.randFloat(this.bounds.minZ + zPadding, this.bounds.maxZ - zPadding);
        const randomY = THREE.MathUtils.randFloat(this.bounds.minY + yPadding, this.bounds.maxY - yPadding);

        this.targetPosition.set(targetX, randomY, randomZ);
    }

    private checkForObstacles(elapsed: number): void {
        const direction = new THREE.Vector3()
            .subVectors(this.targetPosition, this.fishGroup.position)
            .normalize();

        if (direction.lengthSq() < 0.0001) {
            return;
        }

        this.raycaster.set(this.fishGroup.position, direction);
        this.raycaster.far = this.avoidDistance;

        // Filter out the fish itself from the list of obstacles
        const checkableObstacles = this.obstacles.filter(obj => obj.uuid !== this.fishGroup.uuid);

        if (checkableObstacles.length === 0) return;

        const intersections = this.raycaster.intersectObjects(checkableObstacles, true);

        if (intersections.length > 0 && intersections[0].distance < this.avoidDistance) {
            if (!this.state.isTurning) {
                this.state.isTurning = true;
                this.state.turnStartTime = elapsed;
                this.pickAvoidanceTarget(direction);
            }
            return;
        }

        this.obstacleProbe.set(0, 0, 0);
        checkableObstacles.forEach((obstacle) => {
            this.obstacleBox.setFromObject(obstacle);
            this.obstacleClosestPoint.set(
                THREE.MathUtils.clamp(this.fishGroup.position.x, this.obstacleBox.min.x, this.obstacleBox.max.x),
                THREE.MathUtils.clamp(this.fishGroup.position.y, this.obstacleBox.min.y, this.obstacleBox.max.y),
                THREE.MathUtils.clamp(this.fishGroup.position.z, this.obstacleBox.min.z, this.obstacleBox.max.z)
            );
            const away = this.fishGroup.position.clone().sub(this.obstacleClosestPoint);
            const distanceToObstacle = away.length();
            if (distanceToObstacle > 0.001 && distanceToObstacle < this.avoidDistance) {
                const weight = 1 - (distanceToObstacle / this.avoidDistance);
                this.obstacleProbe.add(away.normalize().multiplyScalar(weight));
            }
        });

        if (this.obstacleProbe.lengthSq() > 0.001) {
            this.targetPosition.add(this.obstacleProbe.normalize().multiplyScalar(8));
            this.targetPosition.x = THREE.MathUtils.clamp(this.targetPosition.x, this.bounds.minX + this.wanderMargin, this.bounds.maxX - this.wanderMargin);
            this.targetPosition.y = THREE.MathUtils.clamp(this.targetPosition.y, this.bounds.minY + this.wanderMargin, this.bounds.maxY - this.wanderMargin);
            this.targetPosition.z = THREE.MathUtils.clamp(this.targetPosition.z, this.bounds.minZ + this.wanderMargin, this.bounds.maxZ - this.wanderMargin);
        }
    }

    private pickAvoidanceTarget(forward: THREE.Vector3): void {
        const fishPos = this.fishGroup.position.clone();
        const lateral = new THREE.Vector3().crossVectors(forward, this.fishGroup.up).normalize();
        const sideSign = Math.random() > 0.5 ? 1 : -1;

        const roomUp = this.bounds.maxY - fishPos.y;
        const roomDown = fishPos.y - this.bounds.minY;
        const preferUp = roomUp >= roomDown;
        const verticalSign = preferUp ? 1 : -1;

        const forwardStep = forward.clone().multiplyScalar(12);
        const sideStep = lateral.multiplyScalar(sideSign * THREE.MathUtils.randFloat(6, 12));
        const verticalStep = new THREE.Vector3(
            0,
            verticalSign * THREE.MathUtils.randFloat(6, 12),
            0
        );

        const candidate = fishPos.add(forwardStep).add(sideStep).add(verticalStep);

        this.targetPosition.set(
            THREE.MathUtils.clamp(candidate.x, this.bounds.minX + this.wanderMargin, this.bounds.maxX - this.wanderMargin),
            THREE.MathUtils.clamp(candidate.y, this.bounds.minY + this.wanderMargin, this.bounds.maxY - this.wanderMargin),
            THREE.MathUtils.clamp(candidate.z, this.bounds.minZ + this.wanderMargin, this.bounds.maxZ - this.wanderMargin),
        );
    }

    private applyWander(elapsed: number): void {
        if (this.state.isTurning || elapsed < this.state.nextWanderUpdate) return;

        this.targetPosition.y = THREE.MathUtils.clamp(
            this.targetPosition.y + THREE.MathUtils.randFloat(-6, 6),
            this.bounds.minY + this.wanderMargin,
            this.bounds.maxY - this.wanderMargin
        );

        this.targetPosition.z = THREE.MathUtils.clamp(
            this.targetPosition.z + THREE.MathUtils.randFloat(-6, 6),
            this.bounds.minZ + this.wanderMargin,
            this.bounds.maxZ - this.wanderMargin
        );

        this.state.nextWanderUpdate = elapsed + THREE.MathUtils.randFloat(0.8, 1.5);
    }

    public update(delta: number, elapsed: number): void {
        if (!this.fishGroup || this.state.isPaused) return;
        const hasForcedTarget = (performance.now() / 1000) < this.forcedTargetUntil;

        // --- OPTIMIZATION: Throttle raycasting ---
        if (elapsed > this.nextObstacleCheck) {
            this.checkForObstacles(elapsed);
            this.nextObstacleCheck = elapsed + 0.08;
        }

        const distToTarget = this.fishGroup.position.distanceTo(this.targetPosition);
        if (!hasForcedTarget && distToTarget < 10 && !this.state.isTurning) {
            this.state.isTurning = true;
            this.state.turnStartTime = elapsed;
            this.pickSideToSideTarget();
        }

        if (!hasForcedTarget) {
            this.applyWander(elapsed);
        }

        this.targetRotation.lookAt(this.targetPosition, this.fishGroup.position, this.fishGroup.up);
        this.targetQuaternion.setFromRotationMatrix(this.targetRotation);

        if (this.state.isTurning) {
            const turnProgress = (elapsed - this.state.turnStartTime) / this.state.turnDuration;
            if (turnProgress >= 1) {
                this.state.isTurning = false;
            } else {
                this.fishGroup.quaternion.slerp(this.targetQuaternion, 3.0 * delta);
                this.fishGroup.translateZ(this.state.currentSpeed * this.state.speedMultiplier * 0.5 * delta);
            }
        } else {
            this.fishGroup.quaternion.slerp(this.targetQuaternion, 2.0 * delta);
            this.fishGroup.translateZ(this.state.currentSpeed * this.state.speedMultiplier * delta);
        }

        const pos = this.fishGroup.position;
        pos.x = THREE.MathUtils.clamp(pos.x, this.bounds.minX, this.bounds.maxX);
        pos.y = THREE.MathUtils.clamp(pos.y, this.bounds.minY, this.bounds.maxY);
        pos.z = THREE.MathUtils.clamp(pos.z, this.bounds.minZ, this.bounds.maxZ);
    }


    public setPaused(paused: boolean): void {
        this.state.isPaused = paused;
    }

    public isPaused(): boolean {
        return this.state.isPaused;
    }

    public setSpeedMultiplier(multiplier: number): void {
        this.state.speedMultiplier = THREE.MathUtils.clamp(multiplier, 0.5, 3);
    }

    public steerTowards(target: THREE.Vector3, holdSeconds: number = 0.8): void {
        this.targetPosition.set(
            THREE.MathUtils.clamp(target.x, this.bounds.minX + this.wanderMargin, this.bounds.maxX - this.wanderMargin),
            THREE.MathUtils.clamp(target.y, this.bounds.minY + 2, this.bounds.maxY - 1.2),
            THREE.MathUtils.clamp(target.z, this.bounds.minZ + this.wanderMargin, this.bounds.maxZ - this.wanderMargin),
        );
        this.forcedTargetUntil = (performance.now() / 1000) + Math.max(0.2, holdSeconds);
    }

    public dispose(): void {
        this.fishGroup.traverse((child: any) => {
            if (child.isMesh) {
                if (child.geometry) child.geometry.dispose();
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach((m: THREE.Material) => m.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
            }
        });
    }
}
