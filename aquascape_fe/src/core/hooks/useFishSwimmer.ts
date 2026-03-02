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
    private fishGroup: THREE.Group;
    private bounds: TankBounds;
    private targetPosition: THREE.Vector3;
    private state: SwimState;
    private shaderMaterial: any = null;
    private originalMaterial: THREE.Material | null = null;

    constructor(fishModel: THREE.Group, bounds: TankBounds, fishSize: number = 1.0) {
        this.fishGroup = fishModel;
        this.bounds = bounds;
        this.targetPosition = new THREE.Vector3();

        this.state = {
            isTurning: false,
            turnStartTime: 0,
            turnDuration: 1.5,
            currentSpeed: 15,
            targetSpeed: 15,
            isPaused: false
        };

        this.setupFish(fishSize);
        this.initializePosition();
        this.pickSideToSideTarget();
    }
    private setupFish(fishSize: number): void {
        this.fishGroup.scale.set(fishSize, fishSize, fishSize);

        this.fishGroup.traverse((child: any) => {
            if (child.isMesh) {
                child.rotation.y = Math.PI;

                child.castShadow = true;
                child.receiveShadow = false;

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

                    // @ts-ignore
                    mat.onBeforeCompile = (shader) => {
                        shader.uniforms.uTime = { value: 0 };
                        shader.vertexShader = `uniform float uTime;\n` + shader.vertexShader;
                        shader.vertexShader = shader.vertexShader.replace(
                            '#include <begin_vertex>',
                            `
                            #include <begin_vertex>
                            float frequency = 0.8;
                            float amplitude = 0.3;
                            float speed = 8.0;
                            float wave = sin(position.x * frequency + uTime * speed);
                            float tailMask = smoothstep(1.0, -3.0, position.x);
                            transformed.y += wave * amplitude * tailMask;
                            transformed.y += sin(uTime * 0.5) * 0.1;
                            `
                        );
                        this.shaderMaterial = shader;
                    };
                    mat.needsUpdate = true;
                }
            }
        });
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

    public update(delta: number, elapsed: number): void {
        if (!this.fishGroup || this.state.isPaused) return;

        if (this.shaderMaterial) {
            this.shaderMaterial.uniforms.uTime.value = elapsed;
        }

        const distToTarget = this.fishGroup.position.distanceTo(this.targetPosition);
        if (distToTarget < 10 && !this.state.isTurning) {
            this.state.isTurning = true;
            this.state.turnStartTime = elapsed;
            this.pickSideToSideTarget();
        }

        if (this.state.isTurning) {
            const turnProgress = (elapsed - this.state.turnStartTime) / this.state.turnDuration;
            if (turnProgress >= 1) {
                this.state.isTurning = false;
            } else {
                const targetRotation = new THREE.Matrix4();
                targetRotation.lookAt(this.targetPosition, this.fishGroup.position, new THREE.Vector3(0, 1, 0));
                const targetQuaternion = new THREE.Quaternion();
                targetQuaternion.setFromRotationMatrix(targetRotation);
                this.fishGroup.quaternion.slerp(targetQuaternion, 3.0 * delta);
                this.fishGroup.translateZ(this.state.currentSpeed * 0.5 * delta);
            }
        } else {
            const targetRotation = new THREE.Matrix4();
            targetRotation.lookAt(this.targetPosition, this.fishGroup.position, new THREE.Vector3(0, 1, 0));
            const targetQuaternion = new THREE.Quaternion();
            targetQuaternion.setFromRotationMatrix(targetRotation);
            this.fishGroup.quaternion.slerp(targetQuaternion, 2.0 * delta);
            this.fishGroup.translateZ(this.state.currentSpeed * delta);
        }

        const pos = this.fishGroup.position;
        pos.x = THREE.MathUtils.clamp(pos.x, this.bounds.minX, this.bounds.maxX);
        pos.y = THREE.MathUtils.clamp(pos.y, this.bounds.minY, this.bounds.maxY);
        pos.z = THREE.MathUtils.clamp(pos.z, this.bounds.minZ, this.bounds.maxZ);
    }

    public getFishGroup(): THREE.Group {
        return this.fishGroup;
    }

    public getPosition(): THREE.Vector3 {
        return this.fishGroup.position.clone();
    }

    public getBounds(): TankBounds {
        return { ...this.bounds };
    }

    public setPaused(paused: boolean): void {
        this.state.isPaused = paused;
    }

    public dispose(): void {
        this.fishGroup.traverse((child: any) => {
            if (child.isMesh) {
                if (this.originalMaterial) {
                    child.material = this.originalMaterial;
                }
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
