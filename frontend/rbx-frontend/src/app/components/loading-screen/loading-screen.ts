import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  Input,
  NgZone
} from '@angular/core';
import * as THREE from 'three';

@Component({
  selector: 'app-loading-screen',
  standalone: true,
  templateUrl: './loading-screen.html',
  styleUrl: './loading-screen.scss'
})
export class LoadingScreenComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvasContainer', { static: true }) container!: ElementRef<HTMLDivElement>;
  @Input() progress = 0;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private sphere!: THREE.LineSegments;
  private points!: THREE.Points;
  private animationId = 0;

  // Positions ORIGINALES des sommets (avant distorsion), utilisées comme
  // référence à chaque frame pour ne jamais accumuler la déformation
  private basePositions!: Float32Array;

  private clock = new THREE.Clock();

  // --- Distorsion permanente avec pics aiguisés ---
  // Durée de morphing variable (aléatoire à chaque cycle) : pas de pause,
  // dès qu'une forme est atteinte on repart aussitôt vers la suivante
  private shapeTransitionMin = 0.4;
  private shapeTransitionMax = 1.1;
  private shapeTransitionDuration = 0.7;
  private shapeTransitionProgress = 0; // 0 = début transition, 1 = terminée

  private currentSeed = Math.random() * 100;
  private targetSeed = Math.random() * 100;
  private currentAmplitude = 0.2;
  private targetAmplitude = 0.2;

  // Netteté des pics : plus haut = pics plus fins et plus prononcés,
  // avec une base de sphère plus "calme" entre les pointes
  private spikePower = 3.5;

  // --- Changement de couleur ---
  private colorPalette = [
    new THREE.Color(0x4da6ff), // bleu
    new THREE.Color(0xff6b9d), // rose
    new THREE.Color(0x7fffa0), // vert menthe
    new THREE.Color(0xffb84d), // orange
    new THREE.Color(0xb388ff)  // violet
  ];
  private currentColor = new THREE.Color();
  private targetColor = new THREE.Color();
  private colorTransitionSpeed = 1.5;
  private colorIntervalSeconds = 3;
  private timeSinceLastColorChange = 0;

  constructor(private ngZone: NgZone) {}

  ngAfterViewInit(): void {
    this.initScene();
    // On sort la boucle d'animation de la zone Angular pour éviter
    // des cycles de détection de changement inutiles à 60fps
    this.ngZone.runOutsideAngular(() => this.animate());
    window.addEventListener('resize', this.onResize);
  }

  private initScene(): void {
    const el = this.container.nativeElement;
    const width = el.clientWidth;
    const height = el.clientHeight;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    this.camera.position.z = 6;

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    el.appendChild(this.renderer.domElement);

    // Sphère "vectorisée" : icosaèdre wireframe (facettes triangulaires nettes)
    const geometry = new THREE.IcosahedronGeometry(2, 4); // rayon 2, detail 4
    const wireframe = new THREE.WireframeGeometry(geometry);

    // Sauvegarde des positions d'origine pour recalculer la distorsion
    // à partir de la forme de base à chaque frame
    this.basePositions = wireframe.attributes['position'].array.slice() as Float32Array;

    this.currentColor.copy(this.colorPalette[0]);
    this.targetColor.copy(this.colorPalette[1]);

    const material = new THREE.LineBasicMaterial({
      color: this.currentColor,
      transparent: true,
      opacity: 0.8
    });

    this.sphere = new THREE.LineSegments(wireframe, material);
    this.scene.add(this.sphere);

    // Points lumineux sur les sommets pour renforcer l'effet vectoriel
    const pointsMaterial = new THREE.PointsMaterial({
      color: this.currentColor,
      size: 0.04,
      transparent: true,
      opacity: 0.9
    });
    this.points = new THREE.Points(geometry.clone(), pointsMaterial);
    this.scene.add(this.points);
  }

  /**
   * Bruit figé : dépend uniquement de la position et d'un "seed".
   * Fréquence plus élevée (x4) pour des variations plus localisées,
   * propices à des pics fins plutôt que de larges bosses.
   */
  private noise(x: number, y: number, z: number, seed: number): number {
    return (
      Math.sin(x * 4 + seed) *
      Math.cos(y * 4 + seed * 1.3) *
      Math.sin(z * 4 + seed * 0.7)
    );
  }

  /**
   * Aiguise un bruit [-1, 1] : les valeurs proches de 0 sont écrasées
   * (surface plus plate) et les valeurs proches de ±1 ressortent en pics
   * nets. Plus `power` est élevé, plus les pics sont fins et contrastés.
   */
  private sharpen(n: number, power: number): number {
    return Math.sign(n) * Math.pow(Math.abs(n), power);
  }

  private updateDistortion(delta: number): void {
    // Transition continue vers la forme cible — jamais de pause statique
    this.shapeTransitionProgress = Math.min(
      1,
      this.shapeTransitionProgress + delta / this.shapeTransitionDuration
    );
    const t = 1 - Math.pow(1 - this.shapeTransitionProgress, 2); // easeOutQuad

    // Dès que la forme cible est atteinte, on enchaîne aussitôt sur une
    // nouvelle cible (pas d'attente => déformation permanente)
    if (this.shapeTransitionProgress >= 1) {
      this.shapeTransitionProgress = 0;
      this.currentSeed = this.targetSeed;
      this.currentAmplitude = this.targetAmplitude;
      this.targetSeed = Math.random() * 100;

      // Distribution biaisée : la plupart des pics restent modérés,
      // mais on obtient parfois (environ 1 fois sur 4) une grosse pointe
      const roll = Math.random();
      this.targetAmplitude = roll > 0.75
        ? 0.6 + Math.random() * 0.5   // gros pic occasionnel
        : 0.15 + Math.random() * 0.3; // variation normale

      // Durée de morphing elle aussi variable pour casser le rythme
      this.shapeTransitionDuration =
        this.shapeTransitionMin +
        Math.random() * (this.shapeTransitionMax - this.shapeTransitionMin);
    }

    const wireframePos = this.sphere.geometry.attributes['position'];
    const pointsPos = this.points.geometry.attributes['position'];

    for (let i = 0; i < wireframePos.count; i++) {
      const ox = this.basePositions[i * 3];
      const oy = this.basePositions[i * 3 + 1];
      const oz = this.basePositions[i * 3 + 2];

      const length = Math.sqrt(ox * ox + oy * oy + oz * oz);
      const nx = ox / length;
      const ny = oy / length;
      const nz = oz / length;

      // Bruit aiguisé en pics, interpolé entre l'ancien et le nouveau pattern
      const oldDisp =
        this.sharpen(this.noise(ox, oy, oz, this.currentSeed), this.spikePower) *
        this.currentAmplitude;
      const newDisp =
        this.sharpen(this.noise(ox, oy, oz, this.targetSeed), this.spikePower) *
        this.targetAmplitude;
      const displacement = oldDisp + (newDisp - oldDisp) * t;

      wireframePos.setXYZ(
        i,
        ox + nx * displacement,
        oy + ny * displacement,
        oz + nz * displacement
      );
    }
    wireframePos.needsUpdate = true;

    // Les points suivent exactement la même déformation
    if (pointsPos.count === wireframePos.count) {
      for (let i = 0; i < pointsPos.count; i++) {
        pointsPos.setXYZ(i, wireframePos.getX(i), wireframePos.getY(i), wireframePos.getZ(i));
      }
      pointsPos.needsUpdate = true;
    }
  }

  private updateColor(delta: number): void {
    this.timeSinceLastColorChange += delta;

    // Interpolation douce vers la couleur cible
    this.currentColor.lerp(this.targetColor, delta * this.colorTransitionSpeed);
    (this.sphere.material as THREE.LineBasicMaterial).color.copy(this.currentColor);
    (this.points.material as THREE.PointsMaterial).color.copy(this.currentColor);

    // Toutes les X secondes, on choisit une nouvelle couleur cible aléatoire
    if (this.timeSinceLastColorChange >= this.colorIntervalSeconds) {
      this.timeSinceLastColorChange = 0;
      const randomIndex = Math.floor(Math.random() * this.colorPalette.length);
      this.targetColor.copy(this.colorPalette[randomIndex]);
    }
  }

  private animate = (): void => {
    this.animationId = requestAnimationFrame(this.animate);

    const delta = this.clock.getDelta();

    this.sphere.rotation.y += 0.004;
    this.sphere.rotation.x += 0.0015;
    this.points.rotation.y += 0.004;
    this.points.rotation.x += 0.0015;

    this.updateDistortion(delta);
    this.updateColor(delta);

    this.renderer.render(this.scene, this.camera);
  };

  private onResize = (): void => {
    const el = this.container.nativeElement;
    const width = el.clientWidth;
    const height = el.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animationId);
    window.removeEventListener('resize', this.onResize);

    // Nettoyage mémoire : essentiel avec Three.js pour éviter les fuites
    this.sphere.geometry.dispose();
    (this.sphere.material as THREE.Material).dispose();
    this.points.geometry.dispose();
    (this.points.material as THREE.Material).dispose();
    this.renderer.dispose();
  }
}