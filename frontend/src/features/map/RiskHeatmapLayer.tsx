import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

export interface HeatmapPoint {
  lat: number;
  lng: number;
  weight: number; // 0 to 1
}

interface RiskHeatmapLayerProps {
  points: HeatmapPoint[];
  radius?: number;
  blur?: number;
  opacity?: number;
  visible?: boolean;
}

export const RiskHeatmapLayer: React.FC<RiskHeatmapLayerProps> = ({
  points,
  radius = 32,
  blur = 20,
  opacity = 0.65,
  visible = true
}) => {
  const map = useMap();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!visible || !map) {
      if (canvasRef.current && canvasRef.current.parentNode) {
        canvasRef.current.parentNode.removeChild(canvasRef.current);
        canvasRef.current = null;
      }
      return;
    }

    // Create canvas element in map overlay pane
    let canvas = canvasRef.current;
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.className = 'leaflet-heatmap-canvas-layer pointer-events-none transition-opacity duration-300';
      canvas.style.position = 'absolute';
      canvas.style.top = '0';
      canvas.style.left = '0';
      canvas.style.zIndex = '350';
      canvas.style.opacity = `${opacity}`;
      map.getPanes().overlayPane.appendChild(canvas);
      canvasRef.current = canvas;
    } else {
      canvas.style.opacity = `${opacity}`;
    }

    const drawHeatmap = () => {
      if (!canvas || !map) return;

      const size = map.getSize();
      const bounds = map.getBounds();
      const topLeft = map.latLngToLayerPoint(bounds.getNorthWest());

      canvas.width = size.x;
      canvas.height = size.y;
      L.DomUtil.setPosition(canvas, topLeft);

      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, size.x, size.y);

      if (points.length === 0) return;

      // Create an offscreen grayscale intensity canvas
      const offscreen = document.createElement('canvas');
      offscreen.width = size.x;
      offscreen.height = size.y;
      const offCtx = offscreen.getContext('2d');
      if (!offCtx) return;

      // Draw radial alpha blurs for each point
      points.forEach((pt) => {
        if (!bounds.contains([pt.lat, pt.lng])) return;

        const containerPoint = map.latLngToContainerPoint([pt.lat, pt.lng]);
        const ptRadius = Math.max(12, radius * (map.getZoom() / 11));
        const gradient = offCtx.createRadialGradient(
          containerPoint.x,
          containerPoint.y,
          ptRadius * 0.1,
          containerPoint.x,
          containerPoint.y,
          ptRadius
        );

        const intensity = Math.min(1, Math.max(0.15, pt.weight));
        gradient.addColorStop(0, `rgba(0, 0, 0, ${intensity})`);
        gradient.addColorStop(0.5, `rgba(0, 0, 0, ${intensity * 0.5})`);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        offCtx.fillStyle = gradient;
        offCtx.beginPath();
        offCtx.arc(containerPoint.x, containerPoint.y, ptRadius, 0, Math.PI * 2);
        offCtx.fill();
      });

      // Colorize the intensity map
      const imgData = offCtx.getImageData(0, 0, size.x, size.y);
      const data = imgData.data;

      // Color palette ramp:
      // alpha 0-40: Transparent
      // alpha 40-100: Cyan/Blue (Low risk density)
      // alpha 100-180: Yellow/Amber (Medium risk density)
      // alpha 180-255: Vibrant Red/Crimson (Critical fraud hotspot)
      for (let i = 0; i < data.length; i += 4) {
        const a = data[i + 3];
        if (a === 0) continue;

        if (a < 60) {
          // Low - Cyan
          data[i] = 14;      // R
          data[i + 1] = 165;  // G
          data[i + 2] = 233;  // B
          data[i + 3] = Math.floor(a * 0.7);
        } else if (a < 140) {
          // Medium - Yellow/Amber
          data[i] = 245;     // R
          data[i + 1] = 158;  // G
          data[i + 2] = 11;   // B
          data[i + 3] = Math.floor(a * 0.85);
        } else if (a < 200) {
          // High - Bright Orange
          data[i] = 249;     // R
          data[i + 1] = 115;  // G
          data[i + 2] = 22;   // B
          data[i + 3] = Math.floor(a * 0.9);
        } else {
          // Critical - Blazing Hot Crimson
          data[i] = 239;     // R
          data[i + 1] = 68;   // G
          data[i + 2] = 68;   // B
          data[i + 3] = a;
        }
      }

      ctx.putImageData(imgData, 0, 0);
    };

    drawHeatmap();

    map.on('moveend zoomend viewreset resize', drawHeatmap);

    return () => {
      map.off('moveend zoomend viewreset resize', drawHeatmap);
      if (canvas && canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
        canvasRef.current = null;
      }
    };
  }, [map, points, radius, blur, opacity, visible]);

  return null;
};
