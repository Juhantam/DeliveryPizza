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
    // The pointer is at the top (12 o'clock = -PI/2 in canvas coords).
    // We want the center of the winner segment to align with the pointer.
    // Segment i spans from i*segmentAngle to (i+1)*segmentAngle (before rotation).
    // The center of segment i is at (i + 0.5) * segmentAngle.
    // After rotation R, the point at angle A appears at angle (A + R).
    // We want (winnerIndex + 0.5) * segmentAngle + R ≡ -PI/2 (mod 2PI)
    // But we draw from the top going clockwise, so pointer at top means angle = -PI/2.
    // Target: R = -PI/2 - (winnerIndex + 0.5) * segmentAngle
    const targetAngleOnWheel = (winnerIndex + 0.5) * segmentAngle;
    const pointerAngle = -Math.PI / 2;
    let targetRotation = pointerAngle - targetAngleOnWheel;

    // Normalize to positive and add full rotations for dramatic effect
    const fullRotations = (5 + Math.random() * 3) * 2 * Math.PI;
    targetRotation = targetRotation - Math.floor(targetRotation / (2 * Math.PI)) * (2 * Math.PI);
    const totalRotation = this.currentRotation + fullRotations + targetRotation -
      (this.currentRotation % (2 * Math.PI));

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
