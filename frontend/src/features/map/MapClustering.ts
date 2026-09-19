export interface ClusterablePoint {
  id: string;
  location: {
    lat: number;
    lng: number;
  };
  riskLevel?: string;
  [key: string]: any;
}

export interface MapCluster<T extends ClusterablePoint> {
  id: string;
  lat: number;
  lng: number;
  count: number;
  highestRisk: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  points: T[];
  isCluster: boolean;
}

/**
 * Spatial Grid Clustering for demo data rendering optimization.
 * Groups points that fall into the same coordinate grid cell based on zoom level.
 * When zoom >= 13, returns unclustered points directly for 60fps performance.
 */
export function clusterPoints<T extends ClusterablePoint>(
  points: T[],
  zoom: number,
  clusterThresholdZoom = 13
): MapCluster<T>[] {
  if (zoom >= clusterThresholdZoom || points.length <= 15) {
    return points.map((p) => ({
      id: p.id,
      lat: p.location.lat,
      lng: p.location.lng,
      count: 1,
      highestRisk: (p.riskLevel as any) || 'LOW',
      points: [p],
      isCluster: false
    }));
  }

  // Grid cell size in degrees based on zoom level
  const cellSize = 180 / Math.pow(2, zoom + 1);
  const grid = new Map<string, T[]>();

  points.forEach((point) => {
    const latIndex = Math.floor(point.location.lat / cellSize);
    const lngIndex = Math.floor(point.location.lng / cellSize);
    const key = `${latIndex}:${lngIndex}`;

    const existing = grid.get(key);
    if (existing) {
      existing.push(point);
    } else {
      grid.set(key, [point]);
    }
  });

  const clusters: MapCluster<T>[] = [];

  grid.forEach((clusterPoints, key) => {
    if (clusterPoints.length === 1) {
      const p = clusterPoints[0];
      clusters.push({
        id: p.id,
        lat: p.location.lat,
        lng: p.location.lng,
        count: 1,
        highestRisk: (p.riskLevel as any) || 'LOW',
        points: [p],
        isCluster: false
      });
    } else {
      // Calculate centroid
      const totalLat = clusterPoints.reduce((acc, p) => acc + p.location.lat, 0);
      const totalLng = clusterPoints.reduce((acc, p) => acc + p.location.lng, 0);
      const centerLat = totalLat / clusterPoints.length;
      const centerLng = totalLng / clusterPoints.length;

      // Determine highest risk level in cluster
      let highestRisk: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
      for (const p of clusterPoints) {
        if (p.riskLevel === 'CRITICAL') {
          highestRisk = 'CRITICAL';
          break;
        } else if (p.riskLevel === 'HIGH') {
          highestRisk = 'HIGH';
        } else if (p.riskLevel === 'MEDIUM' && highestRisk === 'LOW') {
          highestRisk = 'MEDIUM';
        }
      }

      clusters.push({
        id: `cluster-${key}`,
        lat: centerLat,
        lng: centerLng,
        count: clusterPoints.length,
        highestRisk,
        points: clusterPoints,
        isCluster: true
      });
    }
  });

  return clusters;
}
