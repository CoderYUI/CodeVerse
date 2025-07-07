// This file provides fallback type declarations for Leaflet
declare module 'leaflet' {
  export interface LeafletEvent {
    type: string;
    target: any;
  }

  export interface Map {
    setView(center: [number, number] | LatLng, zoom: number, options?: ZoomPanOptions): this;
    remove(): this;
    // Add other Map methods as needed
  }

  export interface Marker {
    addTo(map: Map): this;
    bindPopup(content: string | HTMLElement): this;
    openPopup(): this;
    remove(): this;
    getLatLng(): LatLng;
    // Add other Marker methods as needed
  }

  export interface LatLng {
    lat: number;
    lng: number;
  }

  export interface ZoomPanOptions {
    animate?: boolean;
    duration?: number;
    easeLinearity?: number;
    noMoveStart?: boolean;
  }

  export function map(element: string | HTMLElement, options?: any): Map;
  export function marker(latlng: [number, number] | LatLng, options?: any): Marker;
  export function tileLayer(urlTemplate: string, options?: any): any;
  export function divIcon(options?: any): any;
  export function icon(options?: any): any;
}
