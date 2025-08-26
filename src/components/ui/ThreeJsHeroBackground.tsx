'use client';

import { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import * as THREE from 'three';

interface ThreeJsHeroBackgroundProps {
  className?: string;
}

export const ThreeJsHeroBackground: React.FC<ThreeJsHeroBackgroundProps> = ({ 
  className = '' 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const { theme } = useTheme();

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 12;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    rendererRef.current = renderer;
    mountRef.current.appendChild(renderer.domElement);

    // Theme-aware colors
    const getThemeColors = () => {
      if (theme === 'dark') {
        return {
          primary: new THREE.Color(0xfaf8f6),   // brownish white
          secondary: new THREE.Color(0xd4c4b0), // warm beige
          accent: new THREE.Color(0xffc700),    // sun yellow
          fluid1: new THREE.Color(0xb8a082),    // light brown
          fluid2: new THREE.Color(0x8b7355),    // medium brown
          opacity: 0.5,
          trailOpacity: 0.3
        };
      } else {
        return {
          primary: new THREE.Color(0x0f0a08),   // very dark brown
          secondary: new THREE.Color(0x3d2f26), // dark brown
          accent: new THREE.Color(0xd9a900),    // darker yellow
          fluid1: new THREE.Color(0x6b5b4f),    // medium brown
          fluid2: new THREE.Color(0x8b7355),    // warm brown
          opacity: 0.35,
          trailOpacity: 0.2
        };
      }
    };

    const colors = getThemeColors();

    // Fluid dynamics simulation
    class FluidBlob {
      position: THREE.Vector3;
      velocity: THREE.Vector3;
      acceleration: THREE.Vector3;
      size: number;
      targetSize: number;
      shape: number[];
      color: THREE.Color;
      trail: THREE.Vector3[];
      angle: number;
      angularVelocity: number;
      lifespan: number;
      maxLifespan: number;
      direction: THREE.Vector3;
      
      constructor(x: number, y: number, color: THREE.Color) {
        this.position = new THREE.Vector3(x, y, 0);
        this.velocity = new THREE.Vector3(
          (Math.random() - 0.5) * 4,
          (Math.random() - 0.5) * 4,
          (Math.random() - 0.5) * 2
        );
        this.acceleration = new THREE.Vector3(0, 0, 0);
        this.size = Math.random() * 2 + 1;
        this.targetSize = this.size;
        this.shape = Array.from({length: 16}, () => Math.random() * 0.5 + 0.5);
        this.color = color.clone();
        this.trail = [];
        this.angle = Math.random() * Math.PI * 2;
        this.angularVelocity = (Math.random() - 0.5) * 0.1;
        this.lifespan = Math.random() * 200 + 100;
        this.maxLifespan = this.lifespan;
        this.direction = new THREE.Vector3(
          Math.cos(this.angle),
          Math.sin(this.angle),
          0
        ).normalize();
      }

      update(time: number, allBlobs: FluidBlob[]) {
        // Store trail positions
        this.trail.push(this.position.clone());
        if (this.trail.length > 15) {
          this.trail.shift();
        }

        // Unpredictable directional changes
        if (Math.random() < 0.02) {
          this.angularVelocity += (Math.random() - 0.5) * 0.2;
          this.direction.applyAxisAngle(new THREE.Vector3(0, 0, 1), this.angularVelocity);
        }

        // Dynamic size changes like liquid splashing
        if (Math.random() < 0.05) {
          this.targetSize = Math.random() * 3 + 0.5;
        }
        this.size += (this.targetSize - this.size) * 0.1;

        // Shape deformation like liquid flow
        for (let i = 0; i < this.shape.length; i++) {
          this.shape[i] += Math.sin(time * 0.01 + i + this.position.x * 0.1) * 0.02;
          this.shape[i] = Math.max(0.2, Math.min(1.5, this.shape[i]));
        }

        // Fluid physics - attraction and repulsion
        this.acceleration.set(0, 0, 0);
        
        allBlobs.forEach(other => {
          if (other === this) return;
          
          const distance = this.position.distanceTo(other.position);
          const force = new THREE.Vector3()
            .subVectors(other.position, this.position)
            .normalize();

          if (distance < 4) {
            // Repulsion when too close (like surface tension)
            force.multiplyScalar(-0.5 / distance);
            this.acceleration.add(force);
          } else if (distance < 8) {
            // Attraction at medium distance (like viscosity)
            force.multiplyScalar(0.1 / distance);
            this.acceleration.add(force);
          }
        });

        // Add unpredictable flow forces
        const flowForce = new THREE.Vector3(
          Math.sin(time * 0.003 + this.position.y * 0.05) * 0.2,
          Math.cos(time * 0.005 + this.position.x * 0.03) * 0.15,
          Math.sin(time * 0.007 + this.position.x * 0.02 + this.position.y * 0.02) * 0.1
        );
        this.acceleration.add(flowForce);

        // Gravity-like directional pull (changes direction)
        const gravityDirection = new THREE.Vector3(
          Math.sin(time * 0.001) * 2,
          Math.cos(time * 0.0008) * 1.5,
          0
        );
        this.acceleration.add(gravityDirection.multiplyScalar(0.01));

        // Update velocity and position
        this.velocity.add(this.acceleration);
        this.velocity.multiplyScalar(0.98); // Fluid drag
        this.position.add(this.velocity);

        // Bounce off screen edges with unpredictability
        const bounds = 15;
        if (Math.abs(this.position.x) > bounds) {
          this.velocity.x *= -0.8;
          this.position.x = Math.sign(this.position.x) * bounds;
          this.angularVelocity += (Math.random() - 0.5) * 0.3;
        }
        if (Math.abs(this.position.y) > bounds) {
          this.velocity.y *= -0.8;
          this.position.y = Math.sign(this.position.y) * bounds;
          this.angularVelocity += (Math.random() - 0.5) * 0.3;
        }

        this.lifespan--;
        if (this.lifespan <= 0) {
          this.reset();
        }
      }

      reset() {
        this.position.set(
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 4
        );
        this.velocity.set(
          (Math.random() - 0.5) * 3,
          (Math.random() - 0.5) * 3,
          (Math.random() - 0.5) * 1
        );
        this.lifespan = this.maxLifespan;
        this.trail = [];
      }
    }

    // Create fluid blob instances
    const fluidBlobs: FluidBlob[] = [];
    for (let i = 0; i < 12; i++) {
      const color = i % 3 === 0 ? colors.accent : 
                   i % 3 === 1 ? colors.fluid1 : colors.fluid2;
      fluidBlobs.push(new FluidBlob(
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20,
        color
      ));
    }

    // Create fluid rendering system
    const createFluidMaterial = (color: THREE.Color, opacity: number) => {
      return new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          color: { value: color },
          opacity: { value: opacity },
          size: { value: 1.0 }
        },
        vertexShader: `
          uniform float time;
          uniform float size;
          attribute float shapeVariation;
          attribute vec3 fluidVelocity;
          varying vec2 vUv;
          varying float vShape;
          varying vec3 vVelocity;

          void main() {
            vUv = uv;
            vShape = shapeVariation;
            vVelocity = fluidVelocity;
            
            vec3 pos = position;
            
            // Fluid deformation based on velocity
            float velocityMagnitude = length(fluidVelocity);
            pos *= size * (1.0 + velocityMagnitude * 0.2);
            
            // Stretch in direction of movement
            vec3 stretchDirection = normalize(fluidVelocity);
            pos += stretchDirection * velocityMagnitude * 0.5;
            
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          }
        `,
        fragmentShader: `
          uniform vec3 color;
          uniform float opacity;
          uniform float time;
          varying vec2 vUv;
          varying float vShape;
          varying vec3 vVelocity;

          void main() {
            vec2 center = vUv - vec2(0.5);
            float dist = length(center);
            
            // Create irregular fluid shape
            float angle = atan(center.y, center.x);
            float shapeNoise = sin(angle * 6.0 + time * 0.01) * 0.1 * vShape;
            float fluidEdge = 0.3 + shapeNoise;
            
            if (dist > fluidEdge) discard;
            
            // Velocity-based color intensity
            float velocityFactor = length(vVelocity) * 0.5 + 0.5;
            
            // Soft edges with velocity distortion
            float alpha = 1.0 - smoothstep(0.1, fluidEdge, dist);
            alpha *= velocityFactor;
            
            gl_FragColor = vec4(color, alpha * opacity);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
    };

    // Create fluid meshes
    const fluidMeshes: THREE.Mesh[] = [];
    const trailMeshes: THREE.Mesh[] = [];

    fluidBlobs.forEach((blob, index) => {
      // Main fluid blob
      const geometry = new THREE.PlaneGeometry(4, 4, 8, 8);
      const positions = geometry.attributes.position.array as Float32Array;
      const shapeVariations = new Float32Array(positions.length / 3);
      const velocities = new Float32Array(positions.length);

      for (let i = 0; i < shapeVariations.length; i++) {
        shapeVariations[i] = Math.random();
      }

      geometry.setAttribute('shapeVariation', new THREE.BufferAttribute(shapeVariations, 1));
      geometry.setAttribute('fluidVelocity', new THREE.BufferAttribute(velocities, 3));

      const material = createFluidMaterial(blob.color, colors.opacity);
      const mesh = new THREE.Mesh(geometry, material);
      
      fluidMeshes.push(mesh);
      scene.add(mesh);

      // Trail system
      const trailGeometry = new THREE.PlaneGeometry(2, 2);
      const trailMaterial = createFluidMaterial(blob.color, colors.trailOpacity * 0.5);
      const trailMesh = new THREE.Mesh(trailGeometry, trailMaterial);
      
      trailMeshes.push(trailMesh);
      scene.add(trailMesh);
    });

    let time = 0;

    // Animation loop with true fluid dynamics
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      time += 1;

      // Update fluid physics
      fluidBlobs.forEach(blob => blob.update(time, fluidBlobs));

      // Update mesh positions and properties
    fluidBlobs.forEach((blob, index) => {
      // Main fluid blob
      const geometry = new THREE.PlaneGeometry(4, 4, 8, 8);
      const positions = geometry.attributes.position.array as Float32Array;
      const shapeVariations = new Float32Array(positions.length / 3);
      const velocities = new Float32Array(positions.length);

      for (let i = 0; i < shapeVariations.length; i++) {
        shapeVariations[i] = Math.random();
      }

      geometry.setAttribute('shapeVariation', new THREE.BufferAttribute(shapeVariations, 1));
      geometry.setAttribute('fluidVelocity', new THREE.BufferAttribute(velocities, 3));

      const material = createFluidMaterial(blob.color, colors.opacity);
      const mesh = new THREE.Mesh(geometry, material);
      
      fluidMeshes.push(mesh);
      scene.add(mesh);

      // Trail system
      const trailGeometry = new THREE.PlaneGeometry(2, 2);
      const trailMaterial = createFluidMaterial(blob.color, colors.trailOpacity * 0.5);
      const trailMesh = new THREE.Mesh(trailGeometry, trailMaterial);
      
      trailMeshes.push(trailMesh);
      scene.add(trailMesh);
    });

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current || !renderer) return;
      
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    // Update colors when theme changes
    const updateThemeColors = () => {
      const newColors = getThemeColors();
      
      fluidMeshes.forEach((mesh, index) => {
        const material = mesh.material as THREE.ShaderMaterial;
        material.uniforms.color.value = fluidBlobs[index].color;
        material.uniforms.opacity.value = newColors.opacity;
      });

      trailMeshes.forEach((mesh, index) => {
        const material = mesh.material as THREE.ShaderMaterial;
        material.uniforms.color.value = fluidBlobs[index].color;
        material.uniforms.opacity.value = newColors.trailOpacity;
      });
    };

    updateThemeColors();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      // Cleanup
      fluidMeshes.forEach(mesh => {
        mesh.geometry.dispose();
        (mesh.material as THREE.Material).dispose();
      });
      trailMeshes.forEach(mesh => {
        mesh.geometry.dispose();
        (mesh.material as THREE.Material).dispose();
      });
      
      if (mountRef.current && renderer.domElement && mountRef.current.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [theme]);

  return (
    <div 
      ref={mountRef} 
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{ zIndex: 0 }}
    />
  );
};