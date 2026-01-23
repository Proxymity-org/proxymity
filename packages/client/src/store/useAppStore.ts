import { create } from "zustand";
import { nanoid } from "nanoid";

import { IRequestData, IResponseData, HttpMethod, IKeyValue } from "@proxymity/shared";

interface AppState {
  // State
  request: IRequestData;
  response: IResponseData | null;
  isLoading: boolean;
  activeUsers: number;

  // Basic Actions
  setMethod: (method: HttpMethod) => void;
  setUrl: (url: string) => void;
  setBody: (body: string) => void;
  setResponse: (response: IResponseData | null) => void;
  setLoading: (isLoading: boolean) => void;
  setRequest: (newRequest: IRequestData) => void;
  setActiveUsers: (count: number) => void;
  setHeaders: (headers: IKeyValue[]) => void;
  setQueryParams: (queryParams: IKeyValue[]) => void;

  // Header Actions
  addHeader: () => void;
  removeHeader: (id: string) => void;
  updateHeader: (id: string, field: keyof IKeyValue, value: string | boolean) => void;

  // Query Param Actions
  addQueryParam: () => void;
  removeQueryParam: (id: string) => void;
  updateQueryParam: (id: string, field: keyof IKeyValue, value: string | boolean) => void;
}

export const useAppStore = create<AppState>()((set) => ({
  // Initial State
  request: {
    method: "GET",
    url: "",
    headers: [],
    queryParams: [],
    body: "{}",
  },
  response: null,
  isLoading: false,
  activeUsers: 0,

  setMethod: (method) =>
    set((state) => ({ request: { ...state.request, method } })),

  setUrl: (url) =>
    set((state) => ({ request: { ...state.request, url } })),

  setBody: (body) =>
    set((state) => ({ request: { ...state.request, body } })),

  setResponse: (response) => set({ response }),
  setLoading: (isLoading) => set({ isLoading }),
  setRequest: (newRequest) => set({ request: newRequest }),
  setActiveUsers: (count) => set({ activeUsers: count }),

  setHeaders: (headers) =>
    set((state) => ({ request: { ...state.request, headers } })),

  setQueryParams: (queryParams) =>
    set((state) => ({ request: { ...state.request, queryParams } })),


  addHeader: () => set((state) => ({
    request: { ...state.request,
      headers: [ 
        ...state.request.headers,
        {id: nanoid(), key: "", value: "", isEnabled: true}
      ]
    }  
  })),

  removeHeader: (id) => set((state) => ({
    request: { ...state.request,
      headers: state.request.headers.filter((h) => h.id !== id)
    }
  })),

  updateHeader: (id, field, value) => set((state) => ({
    request: { ...state.request,
      headers: state.request.headers.map((h) =>
        h.id === id ? { ...h, [field]: value } : h
      )
    }
  })),

  addQueryParam: () => set((state) => ({
    request: { ...state.request,
      queryParams: [ 
        ...state.request.queryParams,
        {id: nanoid(), key: "", value: "", isEnabled: true}
      ]
    }
  })),

  removeQueryParam: (id) => set((state) => ({
    request: { ...state.request,
      queryParams: state.request.queryParams.filter((p) => p.id !== id)
    }
  })),

  updateQueryParam: (id, field, value) => set((state) => ({
    request: { ...state.request,
      queryParams: state.request.queryParams.map((p) =>
        p.id === id ? { ...p, [field]: value } : p
      )
    }
  })),
}));