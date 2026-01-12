import { StrapiResponse, Catalog } from "@/types/strapi";
import qs from "qs";

const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN || "";
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

async function fetchAPI<T>(path: string, urlParamsObject: Record<string, any> = {}, options: RequestInit = {}): Promise<T> {
    // Merge default and user options
    const mergedOptions = {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${STRAPI_API_TOKEN}`,
        },
        ...options,
    };

    // Build request URL
    const queryString = qs.stringify(urlParamsObject, { encodeValuesOnly: true });
    const requestUrl = `${STRAPI_URL}/api${path}${queryString ? `?${queryString}` : ""}`;

    // Trigger API call
    const response = await fetch(requestUrl, mergedOptions);

    // Handle response
    // Handle response
    if (!response.ok) {
        console.error(`API Error: ${response.status} ${response.statusText} at ${requestUrl}`);
        const errorBody = await response.text(); // Try to get more info from body
        console.error(`Error Body: ${errorBody}`);

        throw new Error(`API validation failed: ${response.status}`);
    }
    const data = await response.json();
    return data;
}

export async function getCatalogs(): Promise<Catalog[]> {
    // Fetch Catalogs with related Author and Editorial info
    // Population: authors, revisionHistory (if needed), etc.
    // We need basic info for the card: title, authors, update date (from attributes)

    const response = await fetchAPI<StrapiResponse<Catalog[]>>("/catalogs", {
        populate: {
            authors: true,
            fragments: true
        },
        sort: ["updatedAt:desc"],
    }, {
        cache: 'no-store' // Dynamic fetching for now
    });

    return response.data;
}
