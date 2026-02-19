import {Component, ElementRef, EventEmitter, Input, OnChanges, Output, ViewChild, AfterViewInit} from '@angular/core';

@Component({
  selector: 'app-spin-wheel',
  templateUrl: './spin-wheel.component.html',
  styleUrl: './spin-wheel.component.css'
})
export class SpinWheelComponent implements AfterViewInit, OnChanges {
  @Input() segments: string[] = [];
  @Output() spinComplete = new EventEmitter<number>();

  @ViewChild('wheelCanvas') canvasRef: ElementRef<HTMLCanvasElement>;

  isSpinning = false;
  private currentRotation = 0;
  readonly size = 300;
  private readonly colors = [
    '#e06c75', '#61afef', '#98c379', '#e5c07b',
    '#c678dd', '#56b6c2', '#d19a66', '#be5046',
    '#39b1dc', '#f0c674', '#b294bb', '#8abeb7'
  ];

  ngAfterViewInit() {
    this.drawWheel(this.currentRotation);
  }

  ngOnChanges() {
    if (this.canvasRef) {
      this.drawWheel(this.currentRotation);
    }
  }

  spin(winnerIndex: number): void {
    if (this.isSpinning || this.segments.length === 0) return;
    this.isSpinning = true;

    const segmentAngle = (2 * Math.PI) / this.segments.length;
    const TWO_PI = 2 * Math.PI;

    // Pointer is at the top (-PI/2 in canvas coords).
    // Segment i center is drawn at: rotation + (i + 0.5) * segmentAngle
    // We need: rotation + (winnerIndex + 0.5) * segmentAngle ≡ -PI/2 (mod 2PI)
    // So: rotation ≡ -PI/2 - (winnerIndex + 0.5) * segmentAngle (mod 2PI)
    const targetMod = ((-Math.PI / 2 - (winnerIndex + 0.5) * segmentAngle) % TWO_PI + TWO_PI) % TWO_PI;
    const currentMod = ((this.currentRotation % TWO_PI) + TWO_PI) % TWO_PI;

    // How much further we need to rotate to reach the target angle
    let remaining = targetMod - currentMod;
    if (remaining < 0) remaining += TWO_PI;

    // Add full rotations for dramatic spin effect
    const fullRotations = (5 + Math.floor(Math.random() * 3)) * TWO_PI;
    const totalRotation = this.currentRotation + fullRotations + remaining;

    const startRotation = this.currentRotation;
    const rotationDelta = totalRotation - startRotation;
    const duration = 4000;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Cubic ease-out: fast start, slow finish
      const eased = 1 - Math.pow(1 - progress, 3);

      this.currentRotation = startRotation + rotationDelta * eased;
      this.drawWheel(this.currentRotation);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.isSpinning = false;
        this.spinComplete.emit(winnerIndex);
      }
    };

    requestAnimationFrame(animate);
  }

  private drawWheel(rotation: number): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = this.size / 2;
    const centerY = this.size / 2;
    const radius = this.size / 2 - 5;
    const segmentCount = this.segments.length;

    ctx.clearRect(0, 0, this.size, this.size);

    if (segmentCount === 0) {
      // Draw empty wheel
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.fillStyle = '#2c313a';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 2;
      ctx.stroke();
      return;
    }

    const segmentAngle = (2 * Math.PI) / segmentCount;

    for (let i = 0; i < segmentCount; i++) {
      const startAngle = rotation + i * segmentAngle;
      const endAngle = rotation + (i + 1) * segmentAngle;

      // Draw segment
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = this.colors[i % this.colors.length];
      ctx.fill();
      ctx.strokeStyle = '#21252b';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw text
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + segmentAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px Roboto, sans-serif';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 2;
      ctx.fillText(this.segments[i], radius - 10, 5);
      ctx.shadowBlur = 0;
      ctx.restore();
    }

    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 15, 0, 2 * Math.PI);
    ctx.fillStyle = '#21252b';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}
