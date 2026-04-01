import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { IRequestData, IResponseData, IKeyValue } from '@proxymity/shared';

/**
 * Converts the IKeyValue array from the frontend to the Record object required by Axios.
 * Filters out disabled headers or empty keys.
 */
const mapHeadersToRecord = (headers: IKeyValue[]): Record<string, string> => {
  return headers
    .filter((h) => h.isEnabled && h.key.trim() !== '')
    .reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {});
};

/**
 * Attempts to parse the body string into a JSON object.
 * Returns the original string if parsing fails (for plain text bodies).
 */
const parseRequestBody = (bodyStr: string): unknown | undefined => {
  if (!bodyStr) return undefined;
  try {
    return JSON.parse(bodyStr);
  } catch {
    return bodyStr; 
  }
};

const calculateResponseSize = (headers: Record<string, any>, data: any): number => {
  if (headers['content-length']) {
    const parsed = parseInt(headers['content-length'], 10);
    if (!isNaN(parsed)) return parsed;
  }

  //  no content-length header, estimate size from data
  if (!data) return 0;

  if (typeof data === 'string') return data.length;

  // If data is an object, stringify and measure length
  try {
    return JSON.stringify(data).length;
  } catch (e) {
    console.warn('[ProxyService] Could not calculate size for response data');
    return 0; 
  }
};

const createSuccessResponse = (
  axiosResp: AxiosResponse, 
  durationMs: number
): IResponseData => ({
  status: axiosResp.status,
  statusText: axiosResp.statusText,
  data: axiosResp.data,
  headers: axiosResp.headers as Record<string, string>,
  time: durationMs,
  size: calculateResponseSize(axiosResp.headers, axiosResp.data),
  timestamp: Date.now(),
});


export const executeRequest = async (requestData: IRequestData): Promise<IResponseData> => {
  const startTime = Date.now();

  // Basic security check to prevent SSRF to localhost
  if (requestData.url.includes('localhost') || requestData.url.includes('127.0.0.1')) {
    throw new Error('Access to local resources is forbidden');
  }

  const config: AxiosRequestConfig = {
    method: requestData.method,
    url: requestData.url,
    headers: mapHeadersToRecord(requestData.headers),
    params: mapHeadersToRecord(requestData.queryParams),
    data: parseRequestBody(requestData.body),
    validateStatus: () => true,
    timeout: 10000,
  };

  const axiosResponse = await axios(config);
  return createSuccessResponse(axiosResponse, Date.now() - startTime);
};