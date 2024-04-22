export const BASE_URL = import.meta.env.BASE_URL

export async function fetchJSON() {
    const response = await fetch(`${BASE_URL}data.json`)
    return response.json()
}
