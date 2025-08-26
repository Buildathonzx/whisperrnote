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
  const waveGeometriesRef = useRef<THREE.PlaneGeometry[]>([]);
  const waveMaterialsRef = useRef<THREE.ShaderMaterial[]>([]);
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
    camera.position.z = 8;

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

    // Theme-aware colors with much better visibility
    const getThemeColors = () => {
      if (theme === 'dark') {
        return {
          primary: new THREE.Color(0xfaf8f6),   // brownish white - much brighter
          secondary: new THREE.Color(0xd4c4b0), // warm beige
          accent: new THREE.Color(0xffc700),    // sun yellow
          wave1: new THREE.Color(0x8b7355),     // warm brown
          wave2: new THREE.Color(0xa69080),     // light brown
          opacity: 0.4,  // Much higher opacity for dark mode
          waveOpacity: 0.25
        };
      } else {
        return {
          primary: new THREE.Color(0x0f0a08),   // very dark brown
          secondary: new THREE.Color(0x3d2f26), // dark brown
          accent: new THREE.Color(0xd9a900),    // darker yellow
          wave1: new THREE.Color(0x6b5b4f),     // medium brown
          wave2: new THREE.Color(0x8b7355),     // warm brown
          opacity: 0.25, // Higher opacity for light mode too
          waveOpacity: 0.15
        };
      }
    };

    const colors = getThemeColors();

    // Create flowing wave geometry with more complexity
    const createWaveGeometry = (segments = 64) => {
      return new THREE.PlaneGeometry(20, 20, segments, segments);
    };

    // Advanced wave shader with flowing patterns
    const createWaveMaterial = (colorA: THREE.Color, colorB: THREE.Color, speed: number, complexity: number) => {
      return new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          colorA: { value: colorA },
          colorB: { value: colorB },
          opacity: { value: colors.waveOpacity },
          speed: { value: speed },
          complexity: { value: complexity }
        },
        vertexShader: `
          uniform float time;
          uniform float speed;
          uniform float complexity;
          varying vec2 vUv;
          varying vec3 vPosition;
          varying float vWave;

          void main() {
            vUv = uv;
            vPosition = position;
            
            // Create multiple wave layers for fluid motion
            float wave1 = sin(position.x * 0.5 + time * speed) * 0.8;
            float wave2 = cos(position.y * 0.3 + time * speed * 1.2) * 0.6;
            float wave3 = sin((position.x + position.y) * 0.2 + time * speed * 0.8) * 0.4;
            
            // Add complexity with smaller ripples
            float ripple1 = sin(position.x * 2.0 + time * speed * 2.0) * 0.2;
            float ripple2 = cos(position.y * 1.5 + time * speed * 1.8) * 0.15;
            
            // Combine waves for organic motion
            float combinedWave = wave1 + wave2 + wave3 + ripple1 + ripple2;
            vWave = combinedWave * complexity;
            
            vec3 pos = position;
            pos.z += combinedWave * complexity;
            
            // Add horizontal flow
            pos.x += sin(time * speed * 0.5 + position.y * 0.1) * 0.3;
            pos.y += cos(time * speed * 0.7 + position.x * 0.1) * 0.2;
            
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          }
        `,
        fragmentShader: `
          uniform float time;
          uniform vec3 colorA;
          uniform vec3 colorB;
          uniform float opacity;
          uniform float speed;
          varying vec2 vUv;
          varying vec3 vPosition;
          varying float vWave;

          void main() {
            // Create flowing color patterns
            float colorMix = sin(vUv.x * 3.14159 + time * speed) * 0.5 + 0.5;
            colorMix += cos(vUv.y * 2.0 + time * speed * 1.3) * 0.3;
            colorMix += sin((vUv.x + vUv.y) * 1.5 + time * speed * 0.8) * 0.2;
            
            // Add wave-based color variation
            colorMix += vWave * 0.3;
            colorMix = clamp(colorMix, 0.0, 1.0);
            
            vec3 color = mix(colorA, colorB, colorMix);
            
            // Create soft edges with distance-based falloff
            float distanceFromCenter = distance(vUv, vec2(0.5));
            float edgeFalloff = 1.0 - smoothstep(0.2, 0.8, distanceFromCenter);
            
            // Pulsing effect
            float pulse = sin(time * speed * 2.0 + vPosition.x + vPosition.y) * 0.1 + 0.9;
            
            float finalOpacity = opacity * edgeFalloff * pulse;
            
            gl_FragColor = vec4(color, finalOpacity);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false
      });
    };

    // Create multiple wave layers for rich visual depth
    const waveConfigs = [
      { color1: colors.primary, color2: colors.accent, speed: 1.0, complexity: 0.8, scale: 1.2, rotation: 0 },
      { color1: colors.wave1, color2: colors.wave2, speed: 0.7, complexity: 0.6, scale: 1.5, rotation: Math.PI / 4 },
      { color1: colors.secondary, color2: colors.primary, speed: 1.3, complexity: 0.4, scale: 1.8, rotation: Math.PI / 2 },
      { color1: colors.wave2, color2: colors.accent, speed: 0.5, complexity: 1.0, scale: 2.2, rotation: Math.PI / 3 }
    ];

    const waves: THREE.Mesh[] = [];

    waveConfigs.forEach((config, index) => {
      const geometry = createWaveGeometry(48);
      const material = createWaveMaterial(config.color1, config.color2, config.speed, config.complexity);
      
      waveGeometriesRef.current.push(geometry);
      waveMaterialsRef.current.push(material);
      
      const wave = new THREE.Mesh(geometry, material);
      wave.rotation.z = config.rotation;
      wave.scale.set(config.scale, config.scale, 1);
      wave.position.z = -index * 2; // Layer waves in depth
      
      waves.push(wave);
      scene.add(wave);
    });

    // Add floating particle bubbles for creativity accent
    const particleCount = 80;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleVelocities = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      particlePositions[i3] = (Math.random() - 0.5) * 25;
      particlePositions[i3 + 1] = (Math.random() - 0.5) * 25;
      particlePositions[i3 + 2] = (Math.random() - 0.5) * 10;
      
      particleVelocities[i3] = (Math.random() - 0.5) * 0.02;
      particleVelocities[i3 + 1] = (Math.random() - 0.5) * 0.02;
      particleVelocities[i3 + 2] = (Math.random() - 0.5) * 0.01;
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particleMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        primaryColor: { value: colors.accent },
        opacity: { value: colors.opacity * 0.6 }
      },
      vertexShader: `
        uniform float time;
        varying vec3 vPosition;
        
        void main() {
          vPosition = position;
          
          vec3 pos = position;
          pos.x += sin(time * 0.8 + position.y * 0.1) * 0.5;
          pos.y += cos(time * 1.2 + position.x * 0.1) * 0.3;
          pos.z += sin(time * 0.5 + position.x * 0.05 + position.y * 0.05) * 0.8;
          
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = 3.0 * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 primaryColor;
        uniform float opacity;
        
        void main() {
          vec2 center = gl_PointCoord - vec2(0.5);
          float dist = length(center);
          if (dist > 0.5) discard;
          
          float alpha = 1.0 - smoothstep(0.2, 0.5, dist);
          gl_FragColor = vec4(primaryColor, alpha * opacity);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    let time = 0;

    // Enhanced animation loop with fluid motion
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      time += 0.016;

      // Update all wave materials
      waveMaterialsRef.current.forEach((material) => {
        material.uniforms.time.value = time;
      });

      // Update particle material
      particleMaterial.uniforms.time.value = time;

      // Gentle wave rotations for organic flow
      waves.forEach((wave, index) => {
        wave.rotation.z += 0.001 * (index + 1);
        wave.rotation.x = Math.sin(time * 0.2 + index) * 0.1;
        wave.rotation.y = Math.cos(time * 0.15 + index) * 0.05;
      });

      // Animate particles
      const positions = particleGeometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        positions[i3] += particleVelocities[i3];
        positions[i3 + 1] += particleVelocities[i3 + 1];
        positions[i3 + 2] += particleVelocities[i3 + 2];
        
        // Wrap around boundaries
        if (Math.abs(positions[i3]) > 12) particleVelocities[i3] *= -1;
        if (Math.abs(positions[i3 + 1]) > 12) particleVelocities[i3 + 1] *= -1;
        if (Math.abs(positions[i3 + 2]) > 5) particleVelocities[i3 + 2] *= -1;
      }
      particleGeometry.attributes.position.needsUpdate = true;

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
      
      waveMaterialsRef.current.forEach((material, index) => {
        const config = waveConfigs[index];
        if (config) {
          material.uniforms.colorA.value = config.color1;
          material.uniforms.colorB.value = config.color2;
          material.uniforms.opacity.value = newColors.waveOpacity;
        }
      });
      
      particleMaterial.uniforms.primaryColor.value = newColors.accent;
      particleMaterial.uniforms.opacity.value = newColors.opacity * 0.6;
    };

    updateThemeColors();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      // Cleanup geometries and materials
      waveGeometriesRef.current.forEach(geometry => geometry.dispose());
      waveMaterialsRef.current.forEach(material => material.dispose());
      particleGeometry.dispose();
      particleMaterial.dispose();
      
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