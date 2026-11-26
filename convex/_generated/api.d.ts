/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as fitness from "../fitness.js";
import type * as http from "../http.js";
import type * as studioAssetHttp from "../studioAssetHttp.js";
import type * as studioProjectHttp from "../studioProjectHttp.js";
import type * as studioProjects from "../studioProjects.js";
import type * as taskRequestHttp from "../taskRequestHttp.js";
import type * as taskRequests from "../taskRequests.js";
import type * as videoReviewHttp from "../videoReviewHttp.js";
import type * as videoReviews from "../videoReviews.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  fitness: typeof fitness;
  http: typeof http;
  studioAssetHttp: typeof studioAssetHttp;
  studioProjectHttp: typeof studioProjectHttp;
  studioProjects: typeof studioProjects;
  taskRequestHttp: typeof taskRequestHttp;
  taskRequests: typeof taskRequests;
  videoReviewHttp: typeof videoReviewHttp;
  videoReviews: typeof videoReviews;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
