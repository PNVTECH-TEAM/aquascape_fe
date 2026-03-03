import * as THREE from 'three';
import type { TankBounds } from "@app/core/interface";

interface SwimState {
    isTurning: boolean;
    turnStartTime: number;
    turnDuration: number;
    currentSpeed: number;
    targetSpeed: number;
    isPaused: boolean;
}

export class FishSwimmer {
    public fishGroup: THREE.Group;
    private bounds: TankBounds;
    private targetPosition: THREE.Vector3;
    private state: SwimState;
    private targetRotation: THREE.Matrix4;
    private targetQuaternion: THREE.Quaternion;
    private obstacles: THREE.Object3D[] = [];
    private raycaster: THREE.Raycaster;
    private nextObstacleCheck = 0;

    constructor(
        fishModel: THREE.Group,
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
        this.raycaster.far = 20; // Don't detect obstacles that are too far

        this.state = {
            isTurning: false,
            turnStartTime: 0,
            turnDuration: 1.5,
            currentSpeed: 5,
            targetSpeed: 5,
            isPaused: false
        };

        this.setupFish(fishSize);
        this.initializePosition();
        this.pickSideToSideTarget();
    }

    public setObstacles(obstacles: THREE.Object3D[]): void {
        this.obstacles = obstacles;
    }

    private setupFish(fishSize: number): void {
        this.fishGroup.scale.set(fishSize, fishSize, fishSize);

        let triangles = 0;
        this.fishGroup.traverse((child: any) => {
            if (child.isMesh) {
                // --- OPTIMIZATION: Disable shadows ---
                child.castShadow = false;
                child.receiveShadow = false;

                // Log polycount
                triangles += child.geometry.index
                    ? child.geometry.index.count / 3
                    : child.geometry.attributes.position.count / 3;

                child.rotation.y = Math.PI;

                if (child.material) {
                    const mat = child.material as THREE.MeshStandardMaterial;
                    mat.roughness = 0.4;
                    mat.metalness = 0.0;
                    mat.envMapIntensity = 1.0;

                    if (mat.map) {
                        mat.emissiveMap = mat.map;
                        mat.emissive = new THREE.Color(0xffffff);
                        mat.emissiveIntensity = 0.35;
                    } else {
                        mat.emissive = new THREE.Color(0x444444);
                    }

                    mat.needsUpdate = true;
                }
            }
        });
        console.log(`🐟 Fish model triangles: ${Math.round(triangles)}`);
    }

    private initializePosition(): void {
        this.fishGroup.position.copy(this.bounds.center);
    }

    private pickSideToSideTarget(): void {
        const padding = 15;
        const currentX = this.fishGroup.position.x;

        let targetX = (currentX < 0) ? this.bounds.maxX - padding : this.bounds.minX + padding;

        const randomZ = THREE.MathUtils.randFloat(this.bounds.minZ + 10, this.bounds.maxZ - 10);
        const randomY = THREE.MathUtils.randFloat(this.bounds.minY + 10, this.bounds.maxY - 10);

        this.targetPosition.set(targetX, randomY, randomZ);
    }

    private checkForObstacles(elapsed: number): void {
        const direction = new THREE.Vector3();
        this.fishGroup.getWorldDirection(direction);

        this.raycaster.set(this.fishGroup.position, direction);

        // Filter out the fish itself from the list of obstacles
        const checkableObstacles = this.obstacles.filter(obj => obj.uuid !== this.fishGroup.uuid);

        if (checkableObstacles.length === 0) return;

        const intersections = this.raycaster.intersectObjects(checkableObstacles, true);

        if (intersections.length > 0 && intersections[0].distance < 15) {
            if (!this.state.isTurning) {
                this.state.isTurning = true;
                this.state.turnStartTime = elapsed;
                // Simple avoidance: pick a new target
                this.pickSideToSideTarget();
            }
        }
    }

    public update(delta: number, elapsed: number): void {
        if (!this.fishGroup || this.state.isPaused) return;

        // --- OPTIMIZATION: Throttle raycasting ---
        if (elapsed > this.nextObstacleCheck) {
            this.checkForObstacles(elapsed);
            this.nextObstacleCheck = elapsed + 0.2; // Check 5 times per second
        }

        const distToTarget = this.fishGroup.position.distanceTo(this.targetPosition);
        if (distToTarget < 10 && !this.state.isTurning) {
            this.state.isTurning = true;
            this.state.turnStartTime = elapsed;
            this.pickSideToSideTarget();
        }

        this.targetRotation.lookAt(this.targetPosition, this.fishGroup.position, this.fishGroup.up);
        this.targetQuaternion.setFromRotationMatrix(this.targetRotation);

        if (this.state.isTurning) {
            const turnProgress = (elapsed - this.state.turnStartTime) / this.state.turnDuration;
            if (turnProgress >= 1) {
                this.state.isTurning = false;
            } else {
                this.fishGroup.quaternion.slerp(this.targetQuaternion, 3.0 * delta);
                this.fishGroup.translateZ(this.state.currentSpeed * 0.5 * delta);
            }
        } else {
            this.fishGroup.quaternion.slerp(this.targetQuaternion, 2.0 * delta);
            this.fishGroup.translateZ(this.state.currentSpeed * delta);
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
