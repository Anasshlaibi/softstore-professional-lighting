import { Product } from '../../App';

/**
 * Fetches products from a published Google Sheets CSV URL
 * @param csvUrl - The published CSV URL from Google Sheets
 * @returns Promise<Product[]> - Array of products parsed from CSV
 */
export async function fetchProductsFromGoogleSheets(
    csvUrl: string
): Promise<Product[]> {
    try {
        const response = await fetch(csvUrl);

        if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.statusText}`);
        }

        const csvText = await response.text();
        return parseCSVToProducts(csvText);
    } catch (error) {
        console.error('Error fetching products from Google Sheets:', error);
        throw error;
    }
}

/**
 * Parses CSV text into Product objects
 * @param csvText - Raw CSV text
 * @returns Product[] - Array of parsed products
 */
function parseCSVToProducts(csvText: string): Product[] {
    const lines = csvText.trim().split('\n');

    if (lines.length < 2) {
        throw new Error('CSV must have at least a header row and one data row');
    }

    // Parse header row
    const headers = parseCSVLine(lines[0]);

    // Parse data rows
    const products: Product[] = [];

    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);

        if (values.length === 0 || values.every(v => !v)) {
            continue; // Skip empty rows
        }

        try {
            const product = rowToProduct(headers, values);
            products.push(product);
        } catch (error) {
            console.warn(`Skipping row ${i + 1} due to error:`, error);
        }
    }

    return products;
}

/**
 * Parses a single CSV line, handling quoted values
 * @param line - CSV line
 * @returns string[] - Array of cell values
 */
function parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];

        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                current += '"';
                i++; // Skip next quote
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }

    result.push(current.trim());
    return result;
}

/**
 * Converts a CSV row to a Product object
 * @param headers - Column headers
 * @param values - Row values
 * @returns Product
 */
function rowToProduct(headers: string[], values: string[]): Product {
    const row: Record<string, string> = {};

    headers.forEach((header, index) => {
        row[header.toLowerCase()] = values[index] || '';
    });

    // Helper to parse JSON arrays from CSV cells
    const parseArray = (value: string): string[] => {
        if (!value || value.trim() === '') return [];
        try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            // Fallback: split by comma if not valid JSON
            return value.split(',').map(s => s.trim()).filter(Boolean);
        }
    };

    // Helper to parse boolean
    const parseBoolean = (value: string): boolean => {
        return value.toLowerCase() === 'true' || value === '1';
    };

    // Build Product object
    return {
        id: parseInt(row.id) || 0,
        name: row.name || '',
        price: parseFloat(row.price) || 0,
        oldPrice: row.oldprice ? parseFloat(row.oldprice) : undefined,
        rentPrice: row.rentprice ? parseFloat(row.rentprice) : undefined,
        category: row.category || 'accessories',
        image: row.image || '',
        gallery: parseArray(row.gallery || '[]'),
        video: row.video || '',
        desc: row.desc || row.description || '',
        stars: parseFloat(row.stars) || 5,
        specs: parseArray(row.specs || '[]'),
        inStock: parseBoolean(row.instock || 'true'),
        promoEligible: parseBoolean(row.promoeligible || 'false'),
    };
}
