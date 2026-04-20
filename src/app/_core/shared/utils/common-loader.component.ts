import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoaderService } from './loader.service';

@Component({
  selector: 'app-common-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loader-overlay" *ngIf="loaderService.loading$ | async">
      <div class="scene">
        <div class="cube">
          <div class="face front"></div>
          <div class="face back"></div>
          <div class="face right"></div>
          <div class="face left"></div>
          <div class="face top"></div>
          <div class="face bottom"></div>
        </div>
      </div>
      <div class="loader-text">Loading...</div>
    </div>
  `,
  styles: [`
    .loader-overlay {
      position: fixed;
      inset: 0;
      background: radial-gradient(circle at center, rgba(25, 118, 210, 0.18), rgba(0, 0, 0, 0.72));
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      z-index: 99999;
      overflow: hidden;
      backdrop-filter: blur(4px);
    }

    .scene {
      width: 120px;
      height: 120px;
      perspective: 800px;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .cube {
      position: relative;
      width: 60px;
      height: 60px;
      transform-style: preserve-3d;
      animation: rotateCube 2.2s infinite linear;
    }

    .face {
      position: absolute;
      width: 60px;
      height: 60px;
      border: 2px solid rgba(255, 255, 255, 0.35);
      border-radius: 12px;
      box-shadow:
        inset 0 0 18px rgba(255, 255, 255, 0.18),
        0 0 18px rgba(25, 118, 210, 0.35);
      background: linear-gradient(135deg, rgba(33, 150, 243, 0.95), rgba(13, 71, 161, 0.95));
    }

    .front  { transform: rotateY(  0deg) translateZ(30px); }
    .back   { transform: rotateY(180deg) translateZ(30px); }
    .right  { transform: rotateY( 90deg) translateZ(30px); }
    .left   { transform: rotateY(-90deg) translateZ(30px); }
    .top    { transform: rotateX( 90deg) translateZ(30px); }
    .bottom { transform: rotateX(-90deg) translateZ(30px); }

    .loader-text {
      margin-top: 18px;
      color: #ffffff;
      font-size: 16px;
      font-weight: 600;
      letter-spacing: 1px;
      text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
      animation: pulseText 1.2s infinite ease-in-out;
    }

    @keyframes rotateCube {
      0%   { transform: rotateX(0deg) rotateY(0deg); }
      25%  { transform: rotateX(90deg) rotateY(90deg); }
      50%  { transform: rotateX(180deg) rotateY(180deg); }
      75%  { transform: rotateX(270deg) rotateY(270deg); }
      100% { transform: rotateX(360deg) rotateY(360deg); }
    }

    @keyframes pulseText {
      0%, 100% { opacity: 0.65; transform: scale(1); }
      50%      { opacity: 1; transform: scale(1.06); }
    }
  `]
})
export class CommonLoaderComponent {
  constructor(public loaderService: LoaderService) {}
}