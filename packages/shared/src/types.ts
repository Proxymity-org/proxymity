// /packages/shared/src/types.ts

// 1. Tipos básicos
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// 2. Estructura de un Header/Param (Necesitamos ID para la UI de React)
export interface IKeyValue {
  id: string;      // UUID generado por el front (para keys de React)
  key: string;     // Ej: "Content-Type"
  value: string;   // Ej: "application/json"
  isEnabled: boolean; // Para poder desactivar un header sin borrarlo
}

// 3. El Objeto Principal: La Petición
export interface IRequestData {
  method: HttpMethod;
  url: string;
  headers: IKeyValue[];
  queryParams: IKeyValue[];
  body: string; // Guardamos el JSON como string crudo para el editor
}

// 4. La Respuesta del Servidor (Cuando se ejecuta la request)
export interface IResponseData {
  status: number;    // 200, 404, 500
  statusText: string;// "OK", "Not Found"
  data: unknown;     // El JSON de respuesta
  headers: Record<string, string>;
  time: number;      // Tiempo en ms que tardó
  size: number;      // Tamaño en bytes
  timestamp: number; // Cuándo ocurrió
}

// 5. El Estado Completo de la Sala
export interface IRoomState {
  id: string;           // ID de la sala (ej: "room-abc")
  request: IRequestData;
  response: IResponseData | null; // Null si no se ha ejecutado aún
  activeUsers: number;  // Cuántos devs hay conectados
  isLoading: boolean;   // Si está cargando una petición
}

// 6. Payload del evento server:broadcast_change
export type BroadcastChange =
  | { field: 'method'; value: HttpMethod }
  | { field: 'url' | 'body'; value: string }
  | { field: 'headers' | 'queryParams'; value: IKeyValue[] };