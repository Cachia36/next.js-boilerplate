import { handleApiError } from "./apiErrorHandler";

export function withApiRoute<T extends (req: Request) => Promise<Response>>(handler: T) {
  return async (req: Request): Promise<Response> => {
    try {
      return await handler(req);
    } catch (error) {
      return handleApiError(error);
    }
  };
}
