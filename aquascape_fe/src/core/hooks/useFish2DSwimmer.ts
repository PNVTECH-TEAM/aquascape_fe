import * as THREE from 'three';
import type { TankBounds } from "@app/core/interface";

interface Fish2DSwimState {
    currentSpeed: number;
    targetSpeed: number;
    isPaused: boolean;
    nextSpeedChange: number;
}

export class Fish2DSwimmer {
    private fishPlane: THREE.Mesh;
    private bounds: TankBounds;
    private targetPosition: THREE.Vector3;
    private swimDirection: THREE.Vector3 = new THREE.Vector3(1, 0, 0);
    private state: Fish2DSwimState;
    private size: THREE.Vector3;
    private turnSpeed = 1.5; // độ mượt khi xoay
    private margin = 12;     // khoảng cách an toàn khỏi kính

    constructor(planeMesh: THREE.Mesh, bounds: TankBounds) {
        this.fishPlane = planeMesh;
        this.bounds = bounds;
        this.targetPosition = new THREE.Vector3();
        this.size = new THREE.Vector3();

        new THREE.Box3().setFromObject(this.fishPlane).getSize(this.size);

        this.state = {
            currentSpeed: 6,
            targetSpeed: 6,
            isPaused: false,
            nextSpeedChange: 0
        };

        this.pickNewTarget();
    }

    // 🎯 Chọn target nằm trong vùng an toàn
    private pickNewTarget(): void {
        this.targetPosition.set(
            THREE.MathUtils.randFloat(
                this.bounds.minX + this.margin,
                this.bounds.maxX - this.margin
            ),
            THREE.MathUtils.randFloat(
                this.bounds.minY + 10,
                this.bounds.maxY - 10
            ),
            THREE.MathUtils.randFloat(
                this.bounds.minZ + this.margin,
                this.bounds.maxZ - this.margin
            )
        );
    }

    public update(delta: number, elapsed: number): void {
        if (this.state.isPaused) return;

        const currentPos = this.fishPlane.position;

        const desiredDirection = new THREE.Vector3()
            .subVectors(this.targetPosition, currentPos)
            .normalize();

        const distance = currentPos.distanceTo(this.targetPosition);

        // 🎯 Gần target → chọn target mới
        if (distance < 5) {
            this.pickNewTarget();
        }

        // 🌊 Smooth turning bằng lerp direction
        this.swimDirection.lerp(desiredDirection, delta * this.turnSpeed);
        this.swimDirection.normalize();

        // 🐟 Di chuyển
        this.fishPlane.position.addScaledVector(
            this.swimDirection,
            this.state.currentSpeed * delta
        );

        // 🎯 Tốc độ thay đổi chậm, không random mỗi frame
        if (elapsed > this.state.nextSpeedChange) {
            this.state.targetSpeed = THREE.MathUtils.randFloat(4, 8);
            this.state.nextSpeedChange = elapsed + THREE.MathUtils.randFloat(2, 4);
        }

        this.state.currentSpeed +=
            (this.state.targetSpeed - this.state.currentSpeed) * delta;

        // 🚧 Clamp trong vùng an toàn
        this.fishPlane.position.x = THREE.MathUtils.clamp(
            this.fishPlane.position.x,
            this.bounds.minX + this.margin,
            this.bounds.maxX - this.margin
        );

        this.fishPlane.position.y = THREE.MathUtils.clamp(
            this.fishPlane.position.y,
            this.bounds.minY + 10,
            this.bounds.maxY - 10
        );

        this.fishPlane.position.z = THREE.MathUtils.clamp(
            this.fishPlane.position.z,
            this.bounds.minZ + this.margin,
            this.bounds.maxZ - this.margin
        );

        // 🐟 Chỉ xoay theo Y-axis (không nghiêng)
        const angleY = Math.atan2(
            this.swimDirection.x,
            this.swimDirection.z
        );

        this.fishPlane.rotation.set(0, angleY, 0);
    }

    public setPaused(paused: boolean): void {
        this.state.isPaused = paused;
    }

    public isPaused(): boolean {
        return this.state.isPaused;
    }

    public dispose(): void { }
}