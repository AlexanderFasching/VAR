// Function to fetch country information from the API
export async function fetchCountryInfo(countryName) {
  const url = `https://restcountries.com/v3.1/name/${countryName}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Country not found: ${countryName}`);
    }

    const countryData = await response.json();
    return countryData[0];
  } catch (error) {
    console.error("Error fetching country data:", error);
    return null; // Return null in case of an error
  }
}
